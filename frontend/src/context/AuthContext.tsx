import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
interface User {
  username: string;
  role: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}
interface JWTPayload {
  exp: number; 
  iat: number;
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);


 useEffect(() => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser) {
    try {
      const decoded: JWTPayload = jwtDecode(storedToken);
      const now = Date.now() / 1000;

      if (decoded.exp > now) {
        
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

      
        const timeLeft = (decoded.exp - now) * 1000;
        const timer = setTimeout(() => {
          alert("⚠️ Session expired. Please log in again.");
          logout();
        }, timeLeft);

        return () => clearTimeout(timer);
      } else {
      
        console.warn("Token expired, logging out");
        logout();
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      logout();
    }
  }
}, []);

  const login = (token: string, user: User) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
