
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just go to login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-gray-50 font-sans">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center py-12 px-4 w-full">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-blue-800 text-center mb-2">
            Welcome
          </h2>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={v => setRememberMe(Boolean(v))}
              />
              <label htmlFor="remember" className="text-sm select-none">
                Remember me
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow transition py-2 text-base"
            >
              Sign in
            </button>
          </form>
        </div>
      </main>
      <footer className="mt-auto py-4 w-full text-center text-gray-500 text-sm">
        © inpatient Dr. wail
      </footer>
    </div>
  );
};

export default Index;

