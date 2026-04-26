"use client";

import React from "react";
import { CopySlash, LayoutDashboard, Users, Settings, Activity, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();

  // RBAC Enforcement
  if (role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-text-body bg-bg-app relative">
        <div className="bg-bg-card shadow-shadow-elevated max-w-md w-full p-8 rounded-3xl text-center border border-danger/20">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center text-danger font-bold text-2xl">
              403
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-danger">Access Forbidden</h1>
          <p className="text-text-secondary text-sm mb-8">You do not have the required administrative permissions to view this dashboard.</p>
          <button 
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center px-4 py-3 bg-bg-app hover:bg-bg-input text-text-heading border border-border rounded-lg transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Activity", href: "/admin/activity", icon: Activity },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-bg-app text-text-body">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-border flex flex-col fixed h-full z-10 transition-all">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <CopySlash className="text-primary w-8 h-8 font-bold" />
          <span className="ml-3 text-xl font-bold text-text-heading tracking-wider">OMNI<span className="text-primary font-light">NODE</span></span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                href={item.href} 
                key={item.name}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary-ghost text-primary font-medium" 
                    : "text-text-secondary hover:text-text-heading hover:bg-bg-card-hover"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </Link>
            )
          })}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light p-0.5">
              <div className="w-full h-full bg-bg-app rounded-full flex items-center justify-center text-text-heading">
                <span className="text-sm font-bold">AD</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-text-heading">Admin User</div>
              <div className="text-xs text-text-muted">admin@omninode.com</div>
              <button onClick={() => router.push("/")} className="text-xs text-danger hover:underline mt-1">Log out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-bg-card rounded-none">
          <h2 className="text-lg font-semibold text-text-heading">System Overview</h2>
          <div className="flex space-x-4">
            <button className="px-4 py-2 text-sm bg-bg-card-hover hover:bg-bg-input text-text-heading border border-border rounded-lg transition-all">Actions</button>
            <button className="px-4 py-2 text-sm bg-primary hover:bg-primary-mid text-text-on-primary rounded-lg shadow-shadow-btn transition-all">Report Issue</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
