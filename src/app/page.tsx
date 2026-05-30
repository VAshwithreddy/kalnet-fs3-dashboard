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
      router.push("/teacher/dashboard"); // Redirect to the new teacher dashboard
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-bg-app text-text-body relative">
      <div className="bg-bg-card shadow-shadow-elevated max-w-md w-full p-8 rounded-3xl text-center border border-border">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-ghost flex items-center justify-center">
            <CopySlash className="text-primary w-10 h-10 font-bold" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-text-heading">
          OMNI<span className="text-primary font-light">NODE</span>
        </h1>
        <p className="text-text-secondary text-sm mb-10">Select a role to log in and test access controls.</p>

        <div className="space-y-4">
          <button 
            onClick={() => handleLogin("ADMIN")}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/30 hover:border-primary hover:bg-bg-card-hover transition-all duration-300 text-left group shadow-[0_0_15px_rgba(91,77,153,0.3)] hover:shadow-[0_0_25px_rgba(91,77,153,0.5)]"
          >
            <div className="flex items-center">
              <div className="p-3 bg-primary-ghost text-primary rounded-xl mr-4 group-hover:bg-primary group-hover:text-text-on-primary transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-text-heading">Log in as Admin</div>
                <div className="text-xs text-text-secondary mt-1">Full access to users, reports, and settings.</div>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleLogin("TEACHER")}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary hover:bg-bg-card-hover transition-all text-left group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center">
              <div className="p-3 bg-primary-pale text-primary-mid rounded-xl mr-4 group-hover:bg-primary group-hover:text-text-on-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-text-heading">Log in as Teacher</div>
                <div className="text-xs text-text-secondary mt-1">Restricted access view. Will trigger 403 blocks.</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
