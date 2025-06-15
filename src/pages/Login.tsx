
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    // Simulate authentication (always success for mock)
    setTimeout(() => {
      setSubmitting(false);
      // redirect to admin dashboard
      navigate("/admin");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg max-w-sm w-full px-6 py-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-blue-800 text-center mb-2">تسجيل الدخول</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>
        )}
        <div>
          <label className="block mb-1 text-gray-700" htmlFor="email">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            className="w-full border rounded px-3 py-2 focus:outline-blue-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700" htmlFor="password">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full border rounded px-3 py-2 focus:outline-blue-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition"
        >
          {submitting ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
};

export default Login;
