"use client";

import React, { useState, useEffect } from "react";
import { CopySlash, Shield, User, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { login } = useAuth();
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo credentials state
  const [demoCreds, setDemoCreds] = useState<{ admin: string; teacher: string } | null>(null);

  // Fetch demo credentials for quick-fill options
  useEffect(() => {
    async function fetchDemo() {
      try {
        const res = await fetch("/api/auth/demo");
        if (res.ok) {
          const data = await res.json();
          setDemoCreds(data);
        }
      } catch (e) {
        console.error("Failed to load demo accounts", e);
      }
    }
    fetchDemo();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Save user state in AuthContext
      login(data.role, { name: data.name, email: data.email });

      // Redirect to the respective portal
      if (data.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/teacher/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: "ADMIN" | "TEACHER") => {
    if (!demoCreds) return;
    
    if (role === "ADMIN") {
      setEmail(demoCreds.admin);
      setPassword("admin123");
    } else {
      setEmail(demoCreds.teacher);
      setPassword("teacher123");
    }
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-bg-app text-text-body relative">
      <div className="bg-bg-card shadow-shadow-elevated max-w-md w-full p-8 rounded-3xl border border-border animate-in fade-in zoom-in-95 duration-350">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-ghost flex items-center justify-center">
            <CopySlash className="text-primary w-10 h-10 font-bold" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-center mb-2 text-text-heading">
          OMNI<span className="text-primary font-light">NODE</span>
        </h1>
        <p className="text-text-secondary text-sm text-center mb-6">Enter your credentials to access the portal.</p>

        {/* Error Box */}
        {error && (
          <div className="mb-5 p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@kalnet.edu"
                className="w-full bg-bg-app border border-border rounded-lg pl-10 pr-4 py-2.5 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-app border border-border rounded-lg pl-10 pr-4 py-2.5 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm" 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center px-4 py-2.5 bg-primary text-text-on-primary rounded-xl shadow-shadow-btn hover:bg-primary-mid transition-all font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              "Log In"
            )}
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        {/* Quick Fill Helpers */}
        {demoCreds && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Fill Testing Accounts</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickFill("ADMIN")}
                className="flex items-center gap-2 p-2 bg-primary-ghost/40 hover:bg-primary-ghost/60 border border-primary/20 hover:border-primary/40 rounded-xl text-left transition-all text-xs"
              >
                <div className="p-1.5 bg-primary-ghost text-primary rounded-lg">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-text-heading">Admin</div>
                  <div className="text-[10px] text-text-muted truncate">{demoCreds.admin}</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickFill("TEACHER")}
                className="flex items-center gap-2 p-2 bg-bg-app hover:bg-bg-input border border-border rounded-xl text-left transition-all text-xs"
              >
                <div className="p-1.5 bg-primary-pale text-primary-mid rounded-lg">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-text-heading">Teacher</div>
                  <div className="text-[10px] text-text-muted truncate">{demoCreds.teacher}</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
