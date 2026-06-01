"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Edit2, ShieldAlert, AlertCircle, Users } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { toast } from "sonner";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "STAFF";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    actionType: "toggleStatus" | "changeRole";
    nextValue: any;
    userName: string;
  } | null>(null);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        // Map DB schema to UI state
        setUsers(data.users.map((u: { id: number | string; name: string; email: string; role: Role; status: string }) => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.status === "ACTIVE",
          lastLogin: "Just now" // Mock for now since API doesn't have it
        })));
      } else {
        setError("Failed to fetch users list.");
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
      setError("A network or server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenConfirmStatus = (id: string, name: string, currentActive: boolean) => {
    setConfirmModal({
      isOpen: true,
      userId: id,
      actionType: "toggleStatus",
      nextValue: !currentActive,
      userName: name
    });
  };

  const handleOpenConfirmRole = (id: string, name: string, nextRole: Role) => {
    setConfirmModal({
      isOpen: true,
      userId: id,
      actionType: "changeRole",
      nextValue: nextRole,
      userName: name
    });
  };

  const handleConfirmAction = () => {
    if (!confirmModal) return;
    const { userId, actionType, nextValue, userName } = confirmModal;
    setConfirmModal(null);

    if (actionType === "toggleStatus") {
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: nextValue } : u));
      toast.success(`${userName}'s account has been ${nextValue ? "enabled" : "disabled"} successfully.`);
    } else if (actionType === "changeRole") {
      setUsers(users.map(u => u.id === userId ? { ...u, role: nextValue } : u));
      toast.success(`Role for ${userName} updated to ${nextValue.toLowerCase()} successfully.`);
    }
  };

  const handleAddUserDemo = () => {
    // Demonstration action: add a mock user
    const newUser: User = {
      id: String(Date.now()),
      name: "New Teacher",
      email: "new.teacher@omninode.com",
      role: "TEACHER",
      isActive: true,
      lastLogin: "Never"
    };
    setUsers([...users, newUser]);
    toast.success("Demonstration user added successfully!");
  };

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <div className="text-lg font-semibold text-danger mb-2">Error Loading Users</div>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button 
            onClick={() => { setLoading(true); setError(null); fetchUsers(); }}
            className="px-4 py-2 bg-bg-app border border-border rounded-lg text-text-heading hover:bg-bg-input transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">User Management</h1>
          <p className="text-text-secondary mt-2">Manage roles, status, and system access.</p>
        </div>
        <button 
          onClick={handleAddUserDemo}
          className="flex items-center px-4 py-2 bg-primary text-text-on-primary rounded-lg shadow-shadow-btn hover:bg-primary-mid transition-all font-medium cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-bg-card border border-border shadow-shadow-card rounded-2xl overflow-hidden p-6">
        {loading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Add your first user to start managing systems, permissions, and dashboards."
            actionLabel="Add User"
            onAction={handleAddUserDemo}
          />
        ) : (
          <div className="overflow-x-auto animate-in fade-in duration-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-card-hover border-b border-border">
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Name / Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Last Login</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-bg-table-row transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-heading">{user.name}</div>
                      <div className="text-xs text-text-secondary mt-1">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role}
                        onChange={(e) => handleOpenConfirmRole(user.id, user.name, e.target.value as Role)}
                        className="bg-transparent text-sm border-b border-border pb-1 text-text-heading focus:outline-none focus:border-primary cursor-pointer [&>option]:bg-bg-card"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="STAFF">Staff</option>
                        <option value="STUDENT">Student</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleOpenConfirmStatus(user.id, user.name, user.isActive)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${user.isActive ? 'bg-primary' : 'bg-border'}`}
                      >
                        <span className="sr-only">Toggle Status</span>
                        <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.isActive ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                      <span className="ml-3 text-xs text-text-secondary font-medium">
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-bg-card-hover transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.role === 'ADMIN' && (
                          <button className="p-2 text-danger hover:text-white bg-danger/10 hover:bg-danger rounded-lg transition-colors">
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={
            confirmModal.actionType === "toggleStatus" 
              ? `${confirmModal.nextValue ? "Enable" : "Disable"} User Account` 
              : "Change User Role"
          }
          message={
            confirmModal.actionType === "toggleStatus"
              ? `Are you sure you want to ${confirmModal.nextValue ? "enable" : "disable"} access for ${confirmModal.userName}?`
              : `Are you sure you want to change the role of ${confirmModal.userName} to ${confirmModal.nextValue}?`
          }
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          isDestructive={confirmModal.actionType === "toggleStatus" && !confirmModal.nextValue}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

