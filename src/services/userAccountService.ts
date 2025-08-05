import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateUserAccountParams {
  email: string;
  fullName?: string;
  role?: 'admin' | 'doctor' | 'nurse' | 'hospital' | 'case-coordinator' | 'finance' | 'customer-care';
  specialty?: string;
  hospitalCode?: string;
  phone?: string;
}

export const createUserAccount = async (params: CreateUserAccountParams) => {
  try {
    console.log('Creating user account:', params.email);
    
    // Check if user already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', params.email.toLowerCase().trim())
      .maybeSingle();

    if (existingProfile) {
      throw new Error('User with this email already exists');
    }

    // Create auth user via Supabase auth signup - simplified approach
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email.toLowerCase().trim(),
      password: 'TempPassword123!', // Temporary password
      options: {
        data: {
          full_name: params.fullName || params.email.split('@')[0],
          email: params.email.toLowerCase().trim()
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      
      if (authError.message.includes('User already registered')) {
        throw new Error('User with this email already exists');
      } else {
        throw new Error(`Failed to create user account: ${authError.message}`);
      }
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    // Auto-confirm the user to bypass email verification
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Error confirming user:', confirmError);
      // Continue anyway - user can still login with OTP
    }

    if (authError) {
      console.error('Auth signup error:', authError);
      
      if (authError.message.includes('User already registered')) {
        throw new Error('User with this email already exists');
      } else if (authError.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address');
      } else {
        throw new Error(`Failed to create user account: ${authError.message}`);
      }
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('Auth user created:', authData.user.id);

    // The profile should be automatically created by the database trigger
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('User created but profile setup failed');
    }

    if (!profile) {
      throw new Error('Profile was not created automatically');
    }

    console.log('Profile found:', profile);

    // Update profile with additional user information if provided
    const updateData: any = {
      must_change_password: true // Force password change on first login
    };

    if (params.fullName) {
      updateData.full_name = params.fullName;
    }
    
    if (params.role) {
      updateData.role = params.role;
    }
    
    if (params.specialty) {
      updateData.specialty = params.specialty;
    }
    
    if (params.hospitalCode) {
      updateData.hospital_code = params.hospitalCode;
    }
    
    if (params.phone) {
      updateData.phone = params.phone;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw new Error('User created but profile update failed');
    }

    console.log('User account created successfully:', params.email);
    
    return {
      id: authData.user.id,
      email: params.email,
      fullName: params.fullName || params.email.split('@')[0],
      role: params.role || 'doctor',
      status: 'pending',
      mustChangePassword: true
    };

  } catch (error: any) {
    console.error('CreateUserAccount error:', error);
    throw error;
  }
};

export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    
    return !!data;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};