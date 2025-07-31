import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface UserSearchSelectProps {
  selectedUsers: User[];
  onUsersChange: (users: User[]) => void;
  currentUserRole: string;
}

const UserSearchSelect = ({ selectedUsers, onUsersChange, currentUserRole }: UserSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Role-based recipient options
  const getRoleOptions = () => {
    const baseRoles = [
      { value: 'all', label: 'All Users', role: null },
      { value: 'admin', label: 'Administrators', role: 'admin' },
      { value: 'doctor', label: 'Doctors', role: 'doctor' },
      { value: 'nurse', label: 'Nurses', role: 'nurse' },
      { value: 'hospital', label: 'Hospitals', role: 'hospital' },
      { value: 'case-coordinator', label: 'Case Coordinators', role: 'case-coordinator' },
      { value: 'finance', label: 'Finance Team', role: 'finance' },
      { value: 'customer-care', label: 'Customer Care', role: 'customer-care' },
    ];

    // Filter roles based on current user's permissions
    switch (currentUserRole) {
      case 'admin':
        return baseRoles;
      case 'case-coordinator':
        return baseRoles.filter(r => r.value !== 'admin');
      case 'finance':
        return baseRoles.filter(r => !['admin'].includes(r.value));
      default:
        return baseRoles.filter(r => !['admin', 'all'].includes(r.value));
    }
  };

  const fetchUsers = async (searchTerm = "", role = null) => {
    setIsLoading(true);
    try {
      let query = supabase.rpc('search_users', { search_term: searchTerm || '' });
      
      if (role) {
        query = supabase.rpc('get_users_by_role', { target_role: role });
      } else if (!searchTerm) {
        query = supabase.rpc('get_users_by_role');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const debounce = setTimeout(() => {
        fetchUsers(searchValue);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      fetchUsers();
    }
  }, [searchValue]);

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      onUsersChange([...selectedUsers, user]);
    }
    setOpen(false);
  };

  const handleSelectRole = async (roleOption: { value: string; label: string; role: string | null }) => {
    setIsLoading(true);
    try {
      const { data, error } = roleOption.role 
        ? await supabase.rpc('get_users_by_role', { target_role: roleOption.role as any })
        : await supabase.rpc('get_users_by_role');

      if (error) {
        console.error('Error fetching users by role:', error);
        return;
      }

      // Add all users from the role, avoiding duplicates
      const newUsers = data?.filter(user => 
        !selectedUsers.find(selected => selected.id === user.id)
      ) || [];
      
      onUsersChange([...selectedUsers, ...newUsers]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  const removeUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  const roleOptions = getRoleOptions();

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {selectedUsers.length === 0 
                ? "Select recipients..." 
                : `${selectedUsers.length} recipient${selectedUsers.length > 1 ? 's' : ''} selected`}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search users..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No users found."}
              </CommandEmpty>
              
              {/* Role-based selections */}
              <CommandGroup heading="Select by Role">
                {roleOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelectRole(option)}
                    className="flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Individual users */}
              {users.length > 0 && (
                <CommandGroup heading="Individual Users">
                  {users.map((user) => {
                    const isSelected = selectedUsers.find(u => u.id === user.id);
                    return (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleSelectUser(user)}
                        className="flex items-center space-x-2"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{user.full_name || user.email}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {user.email}
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users display */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
              <span className="max-w-32 truncate">
                {user.full_name || user.email}
              </span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeUser(user.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearchSelect;