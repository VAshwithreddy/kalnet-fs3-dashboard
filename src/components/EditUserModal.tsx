"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

type Role = "ADMIN" | "TEACHER" | "STAFF";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, updatedData: { name: string; email: string; role: Role }) => Promise<void>;
}

export function EditUserModal({ isOpen, user, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setErrors({});
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(user.id, { name: name.trim(), email: email.trim(), role });
      onClose();
    } catch (error) {
      console.error("Error saving user details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-bg-card border border-border shadow-shadow-elevated rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Close button */}
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-heading bg-bg-app border border-border hover:bg-bg-input rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-heading mb-4">Edit User Account</h3>

            <div className="space-y-4">
              {/* Name field */}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-text-heading mb-2">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full bg-bg-app border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:ring-1 ${
                    errors.name
                      ? "border-danger focus:border-danger focus:ring-danger"
                      : "border-border focus:border-primary focus:ring-primary"
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name}</p>}
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-text-heading mb-2">
                  Email Address
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full bg-bg-app border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:ring-1 ${
                    errors.email
                      ? "border-danger focus:border-danger focus:ring-danger"
                      : "border-border focus:border-primary focus:ring-primary"
                  }`}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email}</p>}
              </div>

              {/* Role field */}
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-text-heading mb-2">
                  Role
                </label>
                <select
                  id="edit-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  disabled={isSubmitting}
                  className="w-full bg-bg-app border border-border rounded-lg px-4 py-2 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer [&>option]:bg-bg-card"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-bg-card-hover border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-bg-app border border-border rounded-xl text-text-heading hover:bg-bg-input transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white transition-all text-sm font-semibold bg-primary hover:bg-primary-mid shadow-[0_4px_12px_rgba(139,92,246,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
