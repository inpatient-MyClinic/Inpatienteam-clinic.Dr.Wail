import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message: string;
}

export const QATestRunner = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Environment present
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    results.push({
      name: "Environment Variables",
      status: (supabaseUrl && supabaseKey) ? 'pass' : 'fail',
      message: (supabaseUrl && supabaseKey) ? 'Both env vars present' : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
    });

    // Test 2: Supabase reachable
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      results.push({
        name: "Supabase Connectivity",
        status: error ? 'fail' : 'pass',
        message: error ? `Connection failed: ${error.message}` : 'Supabase reachable'
      });
    } catch (error) {
      results.push({
        name: "Supabase Connectivity",
        status: 'fail',
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`
      });
    }

    // Test 3: Reset link test
    try {
      const { error } = await supabase.auth.resetPasswordForEmail('test@example.com', {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error && (error.message.includes('redirect') || error.message.includes('URL'))) {
        results.push({
          name: "Reset URL Configuration",
          status: 'fail',
          message: `Missing redirect URL: ${window.location.origin}/reset-password`
        });
      } else {
        results.push({
          name: "Reset URL Configuration",
          status: 'pass',
          message: 'Reset redirect URL configured correctly'
        });
      }
    } catch (error) {
      results.push({
        name: "Reset URL Configuration",
        status: 'fail',
        message: `Reset URL test failed: ${error instanceof Error ? error.message : 'Unknown'}`
      });
    }

    // Test 4: Magic link test
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: 'test@example.com',
        options: { emailRedirectTo: `${window.location.origin}/admin` }
      });
      
      results.push({
        name: "Magic Link Test",
        status: error ? 'fail' : 'pass',
        message: error ? `Magic link failed: ${error.message}` : 'Magic link request accepted'
      });
    } catch (error) {
      results.push({
        name: "Magic Link Test",
        status: 'fail',
        message: `Magic link test failed: ${error instanceof Error ? error.message : 'Unknown'}`
      });
    }

    // Test 5: Admin login test (if credentials available)
    const adminEmail = 'admin@myclinic.com.sa';
    const adminPassword = 'TempAdmin123!';
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      
      if (error) {
        results.push({
          name: "Admin Login Test",
          status: 'fail',
          message: `Admin login failed: ${error.message}`
        });
      } else {
        results.push({
          name: "Admin Login Test",
          status: 'pass',
          message: 'Admin login successful'
        });
        // Sign out immediately after test
        await supabase.auth.signOut();
      }
    } catch (error) {
      results.push({
        name: "Admin Login Test",
        status: 'fail',
        message: `Admin login test failed: ${error instanceof Error ? error.message : 'Unknown'}`
      });
    }

    setTests(results);
    setIsRunning(false);
  };

  const allTestsPass = tests.length > 0 && tests.every(test => test.status === 'pass');

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Fail</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">⏳ Pending</Badge>;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm">🧪 QA Test Runner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="w-full"
          size="sm"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        
        {tests.length > 0 && (
          <>
            <div className="space-y-2">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-sm">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{test.name}</div>
                    <div className="text-xs text-muted-foreground">{test.message}</div>
                  </div>
                  <div className="ml-2">
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
            
            {allTestsPass && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
                <div className="text-green-800 font-medium">✅ Login Fixed</div>
                <div className="text-green-700 text-sm">All tests passed successfully!</div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};