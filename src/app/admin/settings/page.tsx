"use client";

import React, { useState, useRef } from "react";
import { Save, Bell, Shield, Key, User as UserIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile State
  const [firstName, setFirstName] = useState("Admin");
  const [lastName, setLastName] = useState("User");
  const [email, setEmail] = useState("admin@omninode.com");
  const [bio, setBio] = useState("System administrator.");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
      showNotification("success", "Avatar image uploaded successfully.");
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", firstName, lastName, email, bio })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      
      showNotification("success", "Profile information updated successfully.");
    } catch (e: unknown) {
      showNotification("error", e instanceof Error ? e.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      showNotification("error", "Please enter your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      showNotification("error", "New password must be at least 8 characters long.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "security", currentPassword, newPassword, confirmPassword })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      
      showNotification("success", "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      showNotification("error", e instanceof Error ? e.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-xl shadow-shadow-elevated border animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-green/10 border-green/20 text-green' : 'bg-danger/10 border-danger/20 text-danger'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">System Settings</h1>
          <p className="text-text-secondary mt-2">Manage your account and platform preferences.</p>
        </div>
        {activeTab === "profile" && (
          <button 
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-primary text-text-on-primary rounded-lg shadow-shadow-btn hover:bg-primary-mid transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activeTab === "profile" 
                ? "bg-primary-ghost text-primary font-medium" 
                : "text-text-secondary hover:text-text-heading hover:bg-bg-card-hover"
            }`}
          >
            <UserIcon className={`w-5 h-5 mr-3 ${activeTab === "profile" ? "text-primary" : ""}`} />
            Profile
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activeTab === "security" 
                ? "bg-primary-ghost text-primary font-medium" 
                : "text-text-secondary hover:text-text-heading hover:bg-bg-card-hover"
            }`}
          >
            <Shield className={`w-5 h-5 mr-3 ${activeTab === "security" ? "text-primary" : ""}`} />
            Security
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activeTab === "notifications" 
                ? "bg-primary-ghost text-primary font-medium" 
                : "text-text-secondary hover:text-text-heading hover:bg-bg-card-hover"
            }`}
          >
            <Bell className={`w-5 h-5 mr-3 ${activeTab === "notifications" ? "text-primary" : ""}`} />
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activeTab === "api" 
                ? "bg-primary-ghost text-primary font-medium" 
                : "text-text-secondary hover:text-text-heading hover:bg-bg-card-hover"
            }`}
          >
            <Key className={`w-5 h-5 mr-3 ${activeTab === "api" ? "text-primary" : ""}`} />
            API Keys
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-bg-card border border-border shadow-shadow-card rounded-2xl p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-heading border-b border-border pb-4">Profile Information</h2>
              
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-light p-1 flex-shrink-0">
                  <div className="w-full h-full bg-bg-app rounded-full flex items-center justify-center text-text-heading border-2 border-bg-card overflow-hidden">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold">AD</span>
                    )}
                  </div>
                </div>
                <div>
                  <input 
                    type="file" 
                    accept="image/png, image/gif, image/jpeg" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                  />
                  <button 
                    onClick={handleAvatarClick}
                    className="px-4 py-2 bg-bg-card-hover hover:bg-bg-input text-text-heading border border-border rounded-lg transition-all text-sm font-medium"
                  >
                    Change Avatar
                  </button>
                  <p className="text-xs text-text-secondary mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-heading mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-heading mb-2">Bio</label>
                  <textarea 
                    rows={4} 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-heading border-b border-border pb-4">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-2">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full max-w-md bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full max-w-md bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-heading mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full max-w-md bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div className="pt-4">
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-primary text-text-on-primary rounded-lg shadow-shadow-btn hover:bg-primary-mid transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSaving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "notifications" || activeTab === "api") && (
            <div className="py-12 text-center text-text-secondary">
              <p>This section is under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
