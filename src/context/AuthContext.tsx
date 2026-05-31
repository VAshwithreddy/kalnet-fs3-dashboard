"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "ADMIN" | "TEACHER" | null;

interface UserProfile {
  name: string;
  email: string;
}

interface AuthContextType {
  role: Role;
  user: UserProfile | null;
  login: (role: Role, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("omninode_role") as Role;
    const savedUser = localStorage.getItem("omninode_user");
    if (savedRole) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(savedRole);
    }
    if (savedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setMounted(true);
  }, []);

  const login = (newRole: Role, profile: UserProfile) => {
    setRole(newRole);
    setUser(profile);
    if (newRole) localStorage.setItem("omninode_role", newRole);
    localStorage.setItem("omninode_user", JSON.stringify(profile));
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem("omninode_role");
    localStorage.removeItem("omninode_user");
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ role, user, login, logout }}>
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
