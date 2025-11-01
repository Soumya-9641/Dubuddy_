import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);
  const toggleMode = () => setIsLogin(!isLogin);

  const [formData, setFormData] = useState({
    username: "",
    role: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    if (placeholder === "Username") setFormData({ ...formData, username: value });
    else if (placeholder === "Role") setFormData({ ...formData, role: value });
    else if (placeholder === "Email") setFormData({ ...formData, email: value });
    else if (placeholder === "Password") setFormData({ ...formData, password: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      if (isLogin) {
        login(data.token, data.user);
        navigate("/");
      } else {
        alert("✅ Registration successful! Please login to continue.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Auth failed:", err);
      alert("Login/Register failed. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-100 flex justify-center items-center mt-10 px-4 py-16">
      <div
        className={`flex flex-col md:flex-row bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-[0_0_35px_rgba(20,184,166,0.3)] overflow-hidden max-w-5xl w-full border border-slate-700 transition-all duration-500 ${
          isLogin ? "md:flex-row-reverse" : ""
        }`}
      >
      
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center text-teal-400 mb-8 drop-shadow-[0_0_6px_rgba(45,212,191,0.6)]">
            {isLogin ? "🔐 Welcome Back" : "🚀 Create Your Account"}
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  onChange={handleChange}
                  className="w-full md:w-1/2 p-3 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Role"
                  onChange={handleChange}
                  className="w-full md:w-1/2 p-3 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full p-3 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-[0_0_20px_rgba(45,212,191,0.5)] hover:shadow-[0_0_25px_rgba(45,212,191,0.8)] transition-all"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-400">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="text-teal-400 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  onClick={toggleMode}
                  className="text-teal-400 hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>

        <div className="w-full md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1587614203976-365c74645e83?auto=format&fit=crop&w=1000&q=80"
            alt="Auth"
            className={`w-full h-full object-cover ${
              isLogin ? "rounded-l-2xl" : "rounded-r-2xl"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
