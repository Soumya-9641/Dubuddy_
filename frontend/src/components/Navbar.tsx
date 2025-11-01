import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 border-b border-gray-700 
        ${
          scrolled
            ? "bg-gray-900/60 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            : "bg-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        }`}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo / Brand */}
        <a
          href="/"
          className="text-2xl font-bold tracking-wide text-white hover:text-teal-300 transition-colors"
        >
          DUBUDDY
        </a>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Role Label */}
              <span className="text-gray-200 font-medium capitalize">
                Role: {user.role}
              </span>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="mt-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
