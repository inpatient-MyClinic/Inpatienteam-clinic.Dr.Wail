# خطة التطوير التفصيلية - نظام إدارة الطلبات الطبية

## نظرة عامة على المشروع

### الهدف الاستراتيجي
بناء نظام شامل لإدارة الطلبات الطبية يخدم جميع الأطراف المعنية (الأطباء، المستشفيات، المنسقين، المالية) مع ضمان الأمان والأداء العالي.

### المتطلبات التقنية الأساسية
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand أو React Context
- **Authentication**: Supabase Auth with RLS
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel أو Netlify

---

## المرحلة الأولى: البنية التحتية والمصادقة (أسبوعان)

### الأسبوع الأول: إعداد المشروع والبنية التحتية

#### اليوم 1-2: إعداد المشروع الأساسي
```bash
# إنشاء المشروع
npm create vite@latest medical-system -- --template react-ts
cd medical-system

# تثبيت المكتبات الأساسية
npm install @supabase/supabase-js
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install tailwindcss postcss autoprefixer
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-router-dom
npm install zustand
npm install date-fns

# مكتبات التطوير
npm install -D @types/node
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

#### اليوم 3-4: إعداد قاعدة البيانات
```sql
-- إنشاء الأنواع المخصصة
CREATE TYPE user_role AS ENUM (
  'admin', 
  'doctor', 
  'nurse', 
  'hospital', 
  'case-coordinator', 
  'finance', 
  'customer-care'
);

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');

-- جدول البروفايلات
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'doctor',
  status user_status NOT NULL DEFAULT 'pending',
  hospital_code TEXT,
  specialty TEXT,
  phone TEXT,
  department TEXT,
  permissions JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- دالة فحص الأدوار
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;
```

#### اليوم 5: إعداد الواجهات الأساسية
```typescript
// src/types/index.ts
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  status: UserStatus;
  hospital_code?: string;
  specialty?: string;
  phone?: string;
  department?: string;
  permissions: Record<string, boolean>;
  preferences: Record<string, any>;
}

export type UserRole = 
  | 'admin' 
  | 'doctor' 
  | 'nurse' 
  | 'hospital' 
  | 'case-coordinator' 
  | 'finance' 
  | 'customer-care';

export type UserStatus = 'active' | 'inactive' | 'pending';

// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User as AppUser } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب المستخدم الحالي
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      } else {
        setLoading(false);
      }
    });

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('خطأ في جلب البروفايل:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
  };
};
```

### الأسبوع الثاني: نظام المصادقة والتوجيه

#### اليوم 1-2: صفحة تسجيل الدخول
```typescript
// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (data.user) {
        // إعادة توجيه حسب الدور
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        switch (profile?.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'doctor':
            navigate('/doctor');
            break;
          case 'case-coordinator':
            navigate('/case-coordinator');
            break;
          case 'finance':
            navigate('/finance');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setError(getErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: string) => {
    if (error.includes('Invalid login credentials')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    }
    if (error.includes('Email not confirmed')) {
      return 'يرجى تأكيد البريد الإلكتروني أولاً';
    }
    return 'حدث خطأ أثناء تسجيل الدخول';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">MC</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            نظام إدارة الطلبات الطبية
          </CardTitle>
          <p className="text-gray-600">تسجيل الدخول إلى النظام</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@myclinic.com.sa"
                required
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-right pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:underline">
              نسيت كلمة المرور؟
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### اليوم 3-4: نظام التوجيه والحماية
```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!profile) {
    return <Navigate to="/profile-setup" replace />;
  }

  if (profile.status !== 'active') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { DoctorDashboard } from '@/pages/DoctorDashboard';
import { CaseCoordinatorDashboard } from '@/pages/CaseCoordinatorDashboard';
import { FinanceDashboard } from '@/pages/FinanceDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/case-coordinator/*"
          element={
            <ProtectedRoute allowedRoles={['case-coordinator']}>
              <CaseCoordinatorDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/finance/*"
          element={
            <ProtectedRoute allowedRoles={['finance']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

#### اليوم 5: اختبار النظام الأساسي
```typescript
// src/__tests__/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const MockRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('نظام المصادقة', () => {
  test('عرض نموذج تسجيل الدخول', () => {
    render(
      <MockRouter>
        <LoginForm />
      </MockRouter>
    );
    
    expect(screen.getByText('نظام إدارة الطلبات الطبية')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example@myclinic.com.sa')).toBeInTheDocument();
  });

  test('التحقق من صحة البيانات', async () => {
    render(
      <MockRouter>
        <LoginForm />
      </MockRouter>
    );
    
    const submitButton = screen.getByText('تسجيل الدخول');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('يرجى إدخال بريد إلكتروني صحيح')).toBeInTheDocument();
    });
  });
});
```

---

## المرحلة الثانية: الصفحات الأساسية والتنقل (3 أسابيع)

### الأسبوع الأول: مكونات واجهة المستخدم الأساسية

#### اليوم 1-2: نظام التصميم
```typescript
// src/components/ui/sidebar.tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

export const Sidebar = ({ 
  children, 
  defaultCollapsed = false, 
  className 
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex flex-col bg-white border-l border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900">القائمة</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {children}
      </nav>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  active = false,
  collapsed = false,
  onClick
}: SidebarItemProps) => {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 h-10',
        collapsed && 'justify-center px-2'
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Button>
  );
};

// src/components/layout/AppLayout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Sidebar, SidebarItem } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Bell,
  LogOut 
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { profile, signOut } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/dashboard' },
      { icon: FileText, label: 'الطلبات', href: '/requests' },
    ];

    if (profile?.role === 'admin') {
      baseItems.push(
        { icon: Users, label: 'إدارة المستخدمين', href: '/users' },
        { icon: Settings, label: 'الإعدادات', href: '/settings' }
      );
    }

    return baseItems;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar>
        {getNavigationItems().map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <SidebarItem
            icon={Bell}
            label="الإشعارات"
            href="/notifications"
          />
          <SidebarItem
            icon={LogOut}
            label="تسجيل الخروج"
            onClick={signOut}
          />
        </div>
      </Sidebar>
      
      <div className="mr-64 min-h-screen">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
```

#### اليوم 3-4: مكونات الإحصائيات
```typescript
// src/components/ui/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  loading?: boolean;
}

export const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  className,
  loading = false
}: MetricCardProps) => {
  const isPositiveChange = change ? change.value >= 0 : true;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-r-4 border-r-primary', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
            </p>
            {change && (
              <div className="flex items-center space-x-1">
                {isPositiveChange ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    isPositiveChange ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositiveChange ? '+' : ''}{change.value}% {change.period}
                </span>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// src/components/dashboard/DashboardStats.tsx
import { MetricCard } from '@/components/ui/metric-card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  TrendingUp 
} from 'lucide-react';

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: requests } = await supabase
        .from('medical_requests')
        .select('status, paid_amount, created_at');

      const total = requests?.length || 0;
      const completed = requests?.filter(r => r.status === 'completed').length || 0;
      const pending = requests?.filter(r => r.status === 'pending').length || 0;
      const revenue = requests?.reduce((sum, r) => sum + (r.paid_amount || 0), 0) || 0;

      return {
        total,
        completed,
        pending,
        revenue,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      };
    },
    refetchInterval: 30000 // تحديث كل 30 ثانية
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="إجمالي الطلبات"
        value={stats?.total || 0}
        change={{ value: 12, period: 'هذا الشهر' }}
        icon={FileText}
        loading={isLoading}
      />
      
      <MetricCard
        title="الطلبات المكتملة"
        value={stats?.completed || 0}
        change={{ value: 8, period: 'هذا الشهر' }}
        icon={CheckCircle}
        loading={isLoading}
        className="border-r-green-500"
      />
      
      <MetricCard
        title="الطلبات المعلقة"
        value={stats?.pending || 0}
        change={{ value: -5, period: 'هذا الشهر' }}
        icon={Clock}
        loading={isLoading}
        className="border-r-yellow-500"
      />
      
      <MetricCard
        title="إجمالي الإيرادات"
        value={`${(stats?.revenue || 0).toLocaleString('ar-SA')} ريال`}
        change={{ value: 15, period: 'هذا الشهر' }}
        icon={DollarSign}
        loading={isLoading}
        className="border-r-green-600"
      />
    </div>
  );
};
```

### الأسبوع الثاني: لوحة تحكم الإدارة

#### اليوم 1-3: لوحة تحكم الإدارة الأساسية
```typescript
// src/pages/AdminDashboard.tsx
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RequestsOverview } from '@/components/dashboard/RequestsOverview';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { QuickActions } from '@/components/dashboard/QuickActions';

const AdminDashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* ترحيب */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-r-4 border-r-primary">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          مرحباً، مدير النظام
        </h1>
        <p className="text-gray-600">
          نظرة عامة على أداء النظام والإحصائيات الحديثة
        </p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <DashboardStats />

      {/* الإجراءات السريعة */}
      <QuickActions />

      {/* الرسوم البيانية والتحليلات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCharts />
        <RecentActivities />
      </div>

      {/* نظرة عامة على الطلبات */}
      <RequestsOverview />
    </div>
  );
};

export const AdminDashboard = () => {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<AdminDashboardHome />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="analytics" element={<AdvancedAnalytics />} />
        <Route path="requests" element={<RequestsManagement />} />
      </Routes>
    </AppLayout>
  );
};

// src/components/dashboard/QuickActions.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  Upload, 
  FileText, 
  Settings,
  BarChart3,
  Bell 
} from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      icon: UserPlus,
      label: 'إضافة مستخدم',
      description: 'إضافة مستخدم جديد للنظام',
      href: '/admin/users/new',
      color: 'bg-blue-500'
    },
    {
      icon: Upload,
      label: 'رفع ملف Excel',
      description: 'استيراد بيانات من ملف Excel',
      href: '/admin/upload',
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      label: 'تقرير شامل',
      description: 'إنشاء تقرير تفصيلي',
      href: '/admin/reports',
      color: 'bg-purple-500'
    },
    {
      icon: BarChart3,
      label: 'تحليلات SIA',
      description: 'عرض تحليلات الأداء',
      href: '/admin/sia-analytics',
      color: 'bg-orange-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          الإجراءات السريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
              onClick={() => window.location.href = action.href}
            >
              <div className={`p-3 rounded-full ${action.color} text-white`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-900">{action.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

#### اليوم 4-5: إدارة المستخدمين
```typescript
// src/components/admin/UsersManagement.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Filter, MoreHorizontal } from 'lucide-react';
import type { User, UserRole, UserStatus } from '@/types';

export const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [showAddUser, setShowAddUser] = useState(false);

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as User[];
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800',
      'case-coordinator': 'bg-purple-100 text-purple-800',
      finance: 'bg-yellow-100 text-yellow-800',
      hospital: 'bg-indigo-100 text-indigo-800',
      'customer-care': 'bg-pink-100 text-pink-800'
    };

    const roleLabels = {
      admin: 'مدير',
      doctor: 'طبيب',
      nurse: 'ممرض',
      'case-coordinator': 'منسق حالات',
      finance: 'مالية',
      hospital: 'مستشفى',
      'customer-care': 'خدمة عملاء'
    };

    return (
      <Badge className={roleColors[role]}>
        {roleLabels[role]}
      </Badge>
    );
  };

  const getStatusBadge = (status: UserStatus) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    const statusLabels = {
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'في الانتظار'
    };

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          إضافة مستخدم
        </Button>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالاسم أو البريد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="doctor">طبيب</SelectItem>
                <SelectItem value="nurse">ممرض</SelectItem>
                <SelectItem value="case-coordinator">منسق حالات</SelectItem>
                <SelectItem value="finance">مالية</SelectItem>
                <SelectItem value="hospital">مستشفى</SelectItem>
                <SelectItem value="customer-care">خدمة عملاء</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              تطبيق الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول المستخدمين */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-medium">الاسم</th>
                    <th className="text-right p-3 font-medium">البريد الإلكتروني</th>
                    <th className="text-right p-3 font-medium">الدور</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">المستشفى</th>
                    <th className="text-right p-3 font-medium">تاريخ الإنشاء</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.full_name || 'غير محدد'}
                          </div>
                          <div className="text-xs text-gray-500">{user.phone}</div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3">{getRoleBadge(user.role)}</td>
                      <td className="p-3">{getStatusBadge(user.status)}</td>
                      <td className="p-3 text-gray-600">
                        {user.hospital_code || 'غير محدد'}
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* مودال إضافة مستخدم */}
      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}
    </div>
  );
};
```

### الأسبوع الثالث: صفحات الأدوار الأخرى

#### اليوم 1-2: لوحة تحكم الطبيب
```typescript
// src/pages/DoctorDashboard.tsx
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { MyRequests } from '@/components/doctor/MyRequests';
import { CreateRequestShortcut } from '@/components/doctor/CreateRequestShortcut';
import { useAuth } from '@/hooks/useAuth';

export const DoctorDashboard = () => {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ترحيب شخصي */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            مرحباً، د. {profile?.full_name || 'المستخدم'}
          </h1>
          <p className="text-blue-100">
            التخصص: {profile?.specialty || 'غير محدد'} | 
            المستشفى: {profile?.hospital_code || 'غير محدد'}
          </p>
        </div>

        {/* اختصارات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CreateRequestShortcut />
          <QuickStats />
          <RecentActivity />
        </div>

        {/* طلباتي */}
        <MyRequests />
      </div>
    </AppLayout>
  );
};

// src/components/doctor/CreateRequestShortcut.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateRequestShortcut = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-lg">إنشاء طلب جديد</CardTitle>
        <p className="text-sm text-gray-500">
          إضافة طلب إحالة طبية جديد
        </p>
      </CardHeader>
      <CardContent className="text-center space-y-3">
        <Button 
          onClick={() => navigate('/create-request')}
          className="w-full"
        >
          <FileText className="w-4 h-4 mr-2" />
          بدء طلب جديد
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/templates')}
          className="w-full"
        >
          <Clock className="w-4 h-4 mr-2" />
          استخدام قالب
        </Button>
      </CardContent>
    </Card>
  );
};

// src/components/doctor/MyRequests.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';

export const MyRequests = () => {
  const { user } = useAuth();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('medical_requests')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'معلق', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'موافق', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
      completed: { label: 'مكتمل', color: 'bg-blue-100 text-blue-800' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || 
      { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>طلباتي الحديثة</CardTitle>
        <Button variant="outline" size="sm">
          عرض الكل
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : requests?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد طلبات حتى الآن
          </div>
        ) : (
          <div className="space-y-4">
            {requests?.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {request.patient_name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>التخصص: {request.specialty}</p>
                    <p>المستشفى: {request.hospital_name}</p>
                    <p>التاريخ: {new Date(request.created_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## نصائح التطوير الشاملة

### 1. إدارة الحالة (State Management)
```typescript
// src/store/useRequestStore.ts - استخدام Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RequestState {
  requests: Request[];
  filters: RequestFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  setRequests: (requests: Request[]) => void;
  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  setFilters: (filters: Partial<RequestFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      requests: [],
      filters: {
        status: 'all',
        dateRange: null,
        specialty: 'all'
      },
      loading: false,
      error: null,

      setRequests: (requests) => set({ requests }),
      
      addRequest: (request) => set((state) => ({
        requests: [request, ...state.requests]
      })),
      
      updateRequest: (id, updates) => set((state) => ({
        requests: state.requests.map(req => 
          req.id === id ? { ...req, ...updates } : req
        )
      })),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'request-store',
      partialize: (state) => ({ 
        requests: state.requests,
        filters: state.filters 
      })
    }
  )
);
```

### 2. التعامل مع الأخطاء بشكل احترافي
```typescript
// src/lib/error-handling.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = {
  // معالجة أخطاء Supabase
  supabase: (error: any): AppError => {
    if (error.code === 'PGRST301') {
      return new AppError('غير مصرح لك بالوصول لهذه البيانات', 'UNAUTHORIZED', 401);
    }
    
    if (error.code === '23505') {
      return new AppError('البيانات موجودة مسبقاً', 'DUPLICATE_ENTRY', 409);
    }
    
    return new AppError(error.message || 'حدث خطأ غير متوقع', 'UNKNOWN_ERROR');
  },

  // معالجة أخطاء النموذج
  validation: (errors: Record<string, string[]>): AppError => {
    const messages = Object.values(errors).flat();
    return new AppError(messages.join(', '), 'VALIDATION_ERROR', 400);
  },

  // معالجة أخطاء الشبكة
  network: (error: any): AppError => {
    if (!navigator.onLine) {
      return new AppError('لا يوجد اتصال بالإنترنت', 'NETWORK_ERROR', 0);
    }
    
    return new AppError('خطأ في الاتصال بالخادم', 'NETWORK_ERROR', 500);
  }
};

// src/components/ErrorBoundary.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // إرسال الخطأ لخدمة المراقبة
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // إرسال للخادم أو خدمة مراقبة الأخطاء
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                حدث خطأ غير متوقع
              </h2>
              <p className="text-gray-600 mb-4">
                نعتذر عن هذا الخطأ. تم تسجيل المشكلة وسيتم إصلاحها قريباً.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                إعادة تحميل الصفحة
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. الأداء والتحسين
```typescript
// src/hooks/useOptimizedQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface OptimizedQueryOptions<T> extends UseQueryOptions<T> {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  debounceMs?: number;
}

export const useOptimizedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = {}
) => {
  const {
    staleTime = 5 * 60 * 1000, // 5 دقائق
    cacheTime = 10 * 60 * 1000, // 10 دقائق
    refetchOnWindowFocus = false,
    debounceMs = 300,
    ...restOptions
  } = options;

  // تحسين مفتاح الاستعلام
  const optimizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  // تأخير الاستعلام لتجنب الطلبات المتكررة
  const debouncedQueryFn = useCallback(
    debounce(queryFn, debounceMs),
    [queryFn, debounceMs]
  );

  return useQuery({
    queryKey: optimizedQueryKey,
    queryFn: debouncedQueryFn,
    staleTime,
    cacheTime,
    refetchOnWindowFocus,
    retry: (failureCount, error) => {
      // إعادة المحاولة فقط للأخطاء المؤقتة
      if (failureCount >= 3) return false;
      if (error?.statusCode === 401 || error?.statusCode === 403) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...restOptions
  });
};

// دالة التأخير
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resolve(func(...args)), delay);
    });
  };
}

// src/hooks/useVirtualization.ts - لتحسين الجداول الكبيرة
import { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export const useVirtualizedTable = <T>(
  data: T[],
  containerRef: React.RefObject<HTMLDivElement>,
  itemHeight: number = 60
) => {
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => itemHeight,
    overscan: 5
  });

  const virtualItems = virtualizer.getVirtualItems();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom = virtualItems.length > 0
    ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
    : 0;

  const visibleData = useMemo(() => 
    virtualItems.map(item => ({
      index: item.index,
      data: data[item.index],
      style: {
        height: `${item.size}px`,
        transform: `translateY(${item.start}px)`
      }
    })), [virtualItems, data]
  );

  return {
    virtualizer,
    virtualItems,
    visibleData,
    paddingTop,
    paddingBottom,
    totalSize: virtualizer.getTotalSize()
  };
};
```

### 4. الاختبارات الشاملة
```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// إعداد Supabase للاختبارات
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}));

// src/__tests__/utils/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إعداد موفر الاختبار
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// src/__tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { LoginForm } from '@/components/auth/LoginForm';
import { vi } from 'vitest';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('عرض النموذج بشكل صحيح', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('نظام إدارة الطلبات الطبية')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example@myclinic.com.sa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تسجيل الدخول' })).toBeInTheDocument();
  });

  test('التحقق من صحة البيانات المطلوبة', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: 'تسجيل الدخول' });
    fireEvent.click(submitButton);
    
    // التحقق من أن النموذج لم يُرسل بدون بيانات
    expect(screen.getByPlaceholderText('example@myclinic.com.sa')).toBeInvalid();
  });

  test('إرسال البيانات الصحيحة', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      user: null,
      profile: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      signOut: vi.fn()
    });

    render(<LoginForm />);
    
    const emailInput = screen.getByPlaceholderText('example@myclinic.com.sa');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'تسجيل الدخول' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});

// src/__tests__/integration/user-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { App } from '@/App';

describe('تدفق المستخدم الكامل', () => {
  test('تسجيل الدخول والانتقال للوحة التحكم', async () => {
    // محاكاة تسجيل دخول ناجح
    const mockUser = {
      id: 'test-user',
      email: 'admin@test.com'
    };

    const mockProfile = {
      id: 'test-user',
      email: 'admin@test.com',
      role: 'admin',
      status: 'active'
    };

    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      user: mockUser,
      profile: mockProfile,
      loading: false,
      isAuthenticated: true,
      isAdmin: true,
      signOut: vi.fn()
    });

    render(<App />);
    
    // التحقق من الانتقال للوحة التحكم
    await waitFor(() => {
      expect(screen.getByText('مرحباً، مدير النظام')).toBeInTheDocument();
    });
  });
});
```

### 5. نصائح الأمان المتقدمة
```typescript
// src/lib/security.ts
export const securityUtils = {
  // تنظيف المدخلات
  sanitizeInput: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  // التحقق من صحة الملفات المرفوعة
  validateFile: (file: File, allowedTypes: string[], maxSize: number) => {
    const errors: string[] = [];

    if (!allowedTypes.includes(file.type)) {
      errors.push('نوع الملف غير مسموح');
    }

    if (file.size > maxSize) {
      errors.push(`حجم الملف يجب أن يكون أقل من ${maxSize / 1024 / 1024}MB`);
    }

    // فحص إضافي للملفات التنفيذية
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push('نوع الملف خطير وغير مسموح');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // تشفير البيانات الحساسة محلياً
  encryptSensitiveData: (data: string, key: string): string => {
    // استخدام Web Crypto API للتشفير
    return btoa(data); // تشفير بسيط - استخدم مكتبة أقوى في الإنتاج
  },

  // إخفاء البيانات الحساسة
  maskSensitiveData: (data: string, type: 'email' | 'phone' | 'id'): string => {
    switch (type) {
      case 'email':
        const [username, domain] = data.split('@');
        return `${username.charAt(0)}***@${domain}`;
      
      case 'phone':
        return data.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
      
      case 'id':
        return data.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
      
      default:
        return data;
    }
  },

  // فحص قوة كلمة المرور
  checkPasswordStrength: (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    return {
      score,
      strength: score < 3 ? 'ضعيف' : score < 4 ? 'متوسط' : 'قوي',
      checks
    };
  }
};

// src/hooks/useSecureStorage.ts
export const useSecureStorage = (key: string) => {
  const setSecureItem = (value: any) => {
    try {
      const encrypted = securityUtils.encryptSensitiveData(
        JSON.stringify(value),
        'your-encryption-key'
      );
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  };

  const getSecureItem = () => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = atob(encrypted); // فك التشفير البسيط
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('خطأ في قراءة البيانات:', error);
      return null;
    }
  };

  const removeSecureItem = () => {
    localStorage.removeItem(key);
  };

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem
  };
};
```

### 6. مراقبة الأداء والتحليلات
```typescript
// src/lib/analytics.ts
interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
}

class Analytics {
  private userId: string | null = null;
  private sessionId: string;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession() {
    this.track('session_start', 'system', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', 'user', { userId });
  }

  track(name: string, category: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      name,
      category,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        url: window.location.href,
        referrer: document.referrer
      },
      timestamp: Date.now(),
      userId: this.userId
    };

    this.events.push(event);
    this.sendEvent(event);

    // حفظ محلي للأحداث
    this.saveEventsLocally();
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      } else {
        console.log('📊 Analytics Event:', event);
      }
    } catch (error) {
      console.error('خطأ في إرسال التحليلات:', error);
    }
  }

  private saveEventsLocally() {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const allEvents = [...existingEvents, ...this.events];
      
      // الاحتفاظ بآخر 100 حدث فقط
      const recentEvents = allEvents.slice(-100);
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
      
      this.events = []; // مسح الأحداث المحفوظة
    } catch (error) {
      console.error('خطأ في حفظ الأحداث محلياً:', error);
    }
  }

  // تتبع أداء الصفحات
  trackPageView(pageName: string, additionalData: Record<string, any> = {}) {
    this.track('page_view', 'navigation', {
      pageName,
      loadTime: performance.now(),
      ...additionalData
    });
  }

  // تتبع الأخطاء
  trackError(error: Error, context: string) {
    this.track('error', 'system', {
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent
    });
  }

  // تتبع الأداء
  trackPerformance(metricName: string, duration: number, details: Record<string, any> = {}) {
    this.track('performance', 'system', {
      metricName,
      duration,
      ...details
    });
  }
}

export const analytics = new Analytics();

// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const startTime = performance.now();

    // تتبع عرض الصفحة
    analytics.trackPageView(location.pathname, {
      search: location.search,
      hash: location.hash
    });

    // تتبع وقت الخروج من الصفحة
    return () => {
      const duration = performance.now() - startTime;
      analytics.trackPerformance('page_duration', duration, {
        pageName: location.pathname
      });
    };
  }, [location]);
};

// src/hooks/useErrorTracking.ts
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export const useErrorTracking = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(event.error, 'global_error_handler');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(new Error(event.reason), 'unhandled_promise_rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};
```

## نصائح التطوير النهائية

### 1. **تنظيم الكود والملفات**
- استخدم بنية ملفات واضحة ومنطقية
- اعتمد على التسمية الوصفية للملفات والمتغيرات
- أنشئ مكونات صغيرة وقابلة للإعادة
- استخدم TypeScript لضمان جودة الكود

### 2. **الأداء والتحسين**
- طبق تقنيات التحميل المؤجل (Lazy Loading)
- استخدم التخزين المؤقت بذكاء
- قم بتحسين استعلامات قاعدة البيانات
- راقب استهلاك الذاكرة

### 3. **الأمان والحماية**
- طبق مبدأ الصلاحيات الأدنى
- شفّر البيانات الحساسة
- فحص وتنظيف جميع المدخلات
- استخدم HTTPS في جميع الاتصالات

### 4. **تجربة المستخدم**
- صمم واجهات بديهية وسهلة الاستخدام
- قدم ردود فعل واضحة للمستخدم
- تأكد من الاستجابة على جميع الأجهزة
- اختبر مع مستخدمين حقيقيين

### 5. **الاختبار والجودة**
- اكتب اختبارات شاملة للمكونات
- اختبر سيناريوهات المستخدم الكاملة
- استخدم أدوات التحليل الثابت للكود
- راجع الكود بانتظام

هذا الدليل الشامل يوفر خارطة طريق مفصلة لبناء نظام إدارة الطلبات الطبية من الصفر بأفضل الممارسات والمعايير الحديثة! 🚀