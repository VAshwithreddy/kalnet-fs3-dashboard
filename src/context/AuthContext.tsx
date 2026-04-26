"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "ADMIN" | "TEACHER" | null;

interface AuthContextType {
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("omninode_role") as Role;
    if (saved) setRole(saved);
    setMounted(true);
  }, []);

  const login = (newRole: Role) => {
    setRole(newRole);
    if (newRole) localStorage.setItem("omninode_role", newRole);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("omninode_role");
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
