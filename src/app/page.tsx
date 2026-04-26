"use client";

import React from "react";
import { CopySlash, Shield, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (role: "ADMIN" | "TEACHER") => {
    login(role);
    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard"); // Simulated non-admin route
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-white relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-brand/10 blur-[100px] -z-10 rounded-full transform -translate-y-1/2"></div>
      
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <CopySlash className="text-brand w-10 h-10 font-bold" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to OmniNode</h1>
        <p className="text-gray-400 text-sm mb-10">Select a role to log in and test access controls.</p>

        <div className="space-y-4">
          <button 
            onClick={() => handleLogin("ADMIN")}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-brand hover:bg-white/5 transition-all text-left group"
          >
            <div className="flex items-center">
              <div className="p-2 bg-brand/20 text-brand rounded-lg mr-4 group-hover:bg-brand group-hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-white">Log in as Admin</div>
                <div className="text-xs text-gray-400 mt-1">Full access to users, reports, and settings.</div>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleLogin("TEACHER")}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-accent hover:bg-white/5 transition-all text-left group"
          >
            <div className="flex items-center">
              <div className="p-2 bg-accent/20 text-accent rounded-lg mr-4 group-hover:bg-accent group-hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-white">Log in as Teacher</div>
                <div className="text-xs text-gray-400 mt-1">Restricted access view. Will trigger 403 blocks.</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
