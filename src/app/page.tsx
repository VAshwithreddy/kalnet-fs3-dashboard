"use client";

import React, { useState, useEffect } from "react";
import { CopySlash, Shield, User, Lock, Mail, Loader2, AlertCircle, Check } from "lucide-react";
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

  // Validation & interaction states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

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

  // Email format regex helper
  const isEmailValid = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Real-time validation hook
  useEffect(() => {
    const errors: { email?: string; password?: string } = {};
    if (emailTouched) {
      if (!email) {
        errors.email = "Email address is required.";
      } else if (!isEmailValid(email)) {
        errors.email = "Email must be valid (e.g. user@domain.com).";
      }
    }
    if (passwordTouched) {
      if (!password) {
        errors.password = "Password is required.";
      } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters long.";
      }
    }
    setValidationErrors(errors);
  }, [email, password, emailTouched, passwordTouched]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set all fields to touched to trigger validation visuals
    setEmailTouched(true);
    setPasswordTouched(true);

    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = "Email address is required.";
    } else if (!isEmailValid(email)) {
      errors.email = "Email must be valid (e.g. user@domain.com).";
    }
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Please fix the validation errors below.");
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
    // Reset validation errors
    setEmailTouched(true);
    setPasswordTouched(true);
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

        {/* Validation Errors Summary Box */}
        {Object.keys(validationErrors).length > 0 && (
          <div id="error-summary" className="mb-5 p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2 mb-2 font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Please resolve the following errors:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              {validationErrors.email && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("email-input")?.focus();
                    }}
                    className="underline text-left hover:text-red-700 transition-colors"
                  >
                    {validationErrors.email}
                  </button>
                </li>
              )}
              {validationErrors.password && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("password-input")?.focus();
                    }}
                    className="underline text-left hover:text-red-700 transition-colors"
                  >
                    {validationErrors.password}
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* General/API Error Box */}
        {error && Object.keys(validationErrors).length === 0 && (
          <div className="mb-5 p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-start gap-2.5 animate-in fade-in duration-300">
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
                id="email-input"
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailTouched(true);
                }}
                onBlur={() => setEmailTouched(true)}
                placeholder="name@kalnet.edu"
                className={`w-full bg-bg-app border rounded-lg pl-10 pr-10 py-2.5 text-text-heading focus:outline-none focus:ring-1 text-sm transition-all ${
                  validationErrors.email
                    ? "border-danger focus:border-danger focus:ring-danger/50"
                    : email && isEmailValid(email)
                    ? "border-green focus:border-green focus:ring-green/50"
                    : "border-border focus:border-primary focus:ring-primary/50"
                }`}
              />
              {email && isEmailValid(email) && (
                <Check className="w-4.5 h-4.5 text-green absolute right-3.5 top-3" />
              )}
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-xs text-danger animate-in fade-in duration-200">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
              <input 
                id="password-input"
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordTouched(true);
                }}
                onBlur={() => setPasswordTouched(true)}
                placeholder="••••••••"
                className={`w-full bg-bg-app border rounded-lg pl-10 pr-4 py-2.5 text-text-heading focus:outline-none focus:ring-1 text-sm transition-all ${
                  validationErrors.password
                    ? "border-danger focus:border-danger focus:ring-danger/50"
                    : "border-border focus:border-primary focus:ring-primary/50"
                }`}
              />
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-xs text-danger animate-in fade-in duration-200">{validationErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center px-4 py-2.5 bg-primary text-text-on-primary rounded-xl shadow-shadow-btn hover:bg-primary-mid transition-all font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Authenticating...
              </>
            ) : (
              "Log In"
            )}
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

