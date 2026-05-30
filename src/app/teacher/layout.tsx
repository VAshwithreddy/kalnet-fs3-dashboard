"use client";

import React, { useState } from "react";
import { CopySlash, LayoutDashboard, CalendarOff, ArrowLeft, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // RBAC Enforcement
  if (role !== "TEACHER") {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-text-body bg-bg-app relative">
        <div className="bg-bg-card shadow-shadow-elevated max-w-md w-full p-8 rounded-3xl text-center border border-danger/20 animate-in fade-in zoom-in-95 duration-350">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center text-danger font-bold text-2xl">
              403
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-danger">Access Forbidden</h1>
          <p className="text-text-secondary text-sm mb-8">You do not have the required educator permissions to view this portal.</p>
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
    { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "Student Leaves", href: "/teacher/leaves", icon: CalendarOff },
  ];

  return (
    <div className="flex min-h-screen bg-bg-app text-text-body">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-sidebar/95 backdrop-blur-md border-r border-border flex flex-col fixed h-full z-45 shadow-[4px_0_24px_rgba(15,23,42,0.08)] transition-all duration-300`}>
        <Link href="/teacher/dashboard" className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-border transition-all duration-300 hover:bg-bg-card-hover group`}>
          <CopySlash className="text-primary w-8 h-8 font-bold flex-shrink-0 group-hover:scale-105 transition-transform" />
          {!isCollapsed && <span className="ml-3 text-xl font-bold text-text-heading tracking-wider whitespace-nowrap">OMNI<span className="text-primary font-light">NODE</span></span>}
        </Link>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                href={item.href} 
                key={item.name}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary-ghost text-primary font-medium shadow-sm" 
                    : "text-text-secondary hover:text-text-heading hover:bg-bg-card-hover"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} ${isActive ? "text-primary" : ""}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            )
          })}
        </div>
        <div className="p-4 border-t border-border">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-bg-card rounded-full flex items-center justify-center text-text-heading">
                <span className="text-sm font-bold">TC</span>
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <div className="text-sm font-medium text-text-heading whitespace-nowrap">Teacher User</div>
                <div className="text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">teacher@kalnet.edu</div>
                <button onClick={() => router.push("/")} className="text-xs text-danger hover:underline mt-1 block">Log out</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen relative transition-all duration-300`}>
        <div className="sticky top-6 z-30 px-8 mb-6 pointer-events-none">
          <header className="pointer-events-auto h-20 flex items-center justify-between px-8 bg-bg-card/80 backdrop-blur-xl shadow-shadow-elevated border border-white/60 rounded-3xl relative group">
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {/* Animated 3D background glow (uses violet-tint for teachers vs indigo-tint for admins) */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-violet-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
              {/* Inner top border for 3D bevel effect */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90"></div>
              {/* Inner bottom shadow for 3D depth */}
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/5"></div>
            </div>
            
            <div className="flex items-center relative z-10">
              <button onClick={() => setIsCollapsed(!isCollapsed)} className="mr-6 text-text-secondary hover:text-primary transition-all p-2.5 rounded-xl hover:bg-white/60 backdrop-blur-md shadow-sm border border-transparent hover:border-white/60 hover:shadow-shadow-card">
                <PanelLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                 {/* Decorative 3D Element */}
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(139,92,246,0.3)] flex items-center justify-center transform rotate-3 group-hover:rotate-12 transition-transform duration-500">
                   <div className="w-3.5 h-3.5 bg-white rounded-full opacity-80 blur-[1px] absolute top-1.5 left-1.5"></div>
                 </div>
                 <h2 className="text-xl font-bold text-text-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-heading to-text-secondary">Teacher Portal</h2>
              </div>
            </div>
            <div className="flex space-x-4 relative z-10">
              <div className="relative">
                <button 
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="px-5 py-2.5 text-sm bg-white/60 hover:bg-white text-text-heading border border-white/60 rounded-xl transition-all shadow-sm backdrop-blur-md font-medium hover:shadow-shadow-card flex items-center gap-2"
                >
                  Actions
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isActionsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isActionsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsActionsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-bg-card rounded-xl shadow-shadow-elevated border border-border py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button 
                        onClick={() => { window.location.reload(); setIsActionsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-app hover:text-text-heading transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh Portal
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => setIsReportModalOpen(true)} className="px-5 py-2.5 text-sm bg-gradient-to-b from-violet-400 to-violet-600 hover:from-violet-500 hover:to-violet-700 text-text-on-primary rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(139,92,246,0.4)] transition-all font-medium border border-violet-700 hover:-translate-y-0.5">Report Issue</button>
            </div>
          </header>
        </div>
        {children}
      </main>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-card p-6 rounded-2xl shadow-shadow-elevated w-full max-w-md border border-border animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-semibold text-text-heading mb-2">Report an Issue</h3>
            <p className="text-sm text-text-secondary mb-4">Our support team will look into this as soon as possible.</p>
            <textarea 
              className="w-full h-32 p-3 bg-bg-app border border-border rounded-lg text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none mb-4"
              placeholder="Please describe the issue in detail..."
              autoFocus
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsReportModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-heading transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Report submitted successfully! Thank you for your feedback.");
                  setIsReportModalOpen(false);
                }} 
                className="px-4 py-2 text-sm font-medium bg-primary text-text-on-primary rounded-lg shadow-shadow-btn hover:bg-primary-mid transition-all"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
