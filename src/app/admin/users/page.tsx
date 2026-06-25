"use client";

import React, { useState, useEffect } from "react";
import { Edit2, ShieldAlert, AlertCircle, Users, Search } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { EditUserModal } from "@/components/EditUserModal";
import { toast } from "sonner";

type Role = "ADMIN" | "TEACHER" | "STAFF";

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
    nextValue: boolean | Role;
    userName: string;
  } | null>(null);

  // Edit User Modal state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchUsers(isSilent = false) {
    if (!isSilent) setLoading(true);
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
          lastLogin: "Just now" // Mock for now since API doesn't track last login
        })));
      } else {
        if (!isSilent) setError("Failed to fetch users list.");
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
      if (!isSilent) setError("A network or server error occurred.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
    // Poll every 5 seconds to pick up changes from Prisma Studio
    const interval = setInterval(() => fetchUsers(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenConfirmStatus = (id: string, name: string, currentActive: boolean) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.role === 'ADMIN') return;
    setConfirmModal({
      isOpen: true,
      userId: id,
      actionType: "toggleStatus",
      nextValue: !currentActive,
      userName: name
    });
  };

  const handleOpenConfirmRole = (id: string, name: string, nextRole: Role) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.role === 'ADMIN') return;
    setConfirmModal({
      isOpen: true,
      userId: id,
      actionType: "changeRole",
      nextValue: nextRole,
      userName: name
    });
  };

  const handleOpenEditModal = (user: User) => {
    if (user.role === 'ADMIN') return;
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (userId: string, updatedData: { name: string; email: string; role: Role }) => {
    // Optimistic update
    setUsers(users.map(u => u.id === userId ? { ...u, ...updatedData } : u));

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        toast.success(`User ${updatedData.name} updated successfully.`);
        // Re-fetch to ensure DB sync
        fetchUsers(true);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update user");
      }
    } catch (e: unknown) {
      // Rollback optimistic update
      fetchUsers(true);
      toast.error(e instanceof Error ? e.message : "Failed to save changes to database.");
      throw e;
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { userId, actionType, nextValue, userName } = confirmModal;
    setConfirmModal(null);

    // Optimistic update
    if (actionType === "toggleStatus") {
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: nextValue as boolean } : u));
    } else if (actionType === "changeRole") {
      setUsers(users.map(u => u.id === userId ? { ...u, role: nextValue as Role } : u));
    }

    // Persist to database via PATCH /api/users/[id]
    try {
      const patchBody = actionType === "toggleStatus"
        ? { status: nextValue ? "ACTIVE" : "INACTIVE" }
        : { role: nextValue as Role };

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody)
      });

      if (res.ok) {
        if (actionType === "toggleStatus") {
          toast.success(`${userName}'s account has been ${nextValue ? "enabled" : "disabled"} successfully.`);
        } else {
          toast.success(`Role for ${userName} updated to ${String(nextValue).toLowerCase()} successfully.`);
        }
        // Re-fetch to ensure DB sync
        fetchUsers(true);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update user");
      }
    } catch (e: unknown) {
      // Roll back optimistic update
      fetchUsers(true);
      toast.error(e instanceof Error ? e.message : "Failed to save changes to database.");
    }
  };

  // handleAddUserDemo removed since unused

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

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">User Management</h1>
          <p className="text-text-secondary mt-2">Manage roles, status, and system access.</p>
        </div>
        {/* Add User button removed */}
      </div>

      <div className="bg-bg-card border border-border shadow-shadow-card rounded-2xl overflow-hidden p-6">
        {loading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Add your first user to start managing systems, permissions, and dashboards."
          />
        ) : (
          <div>
            {/* Search Input */}
            <div className="mb-6 max-w-md relative animate-in fade-in duration-300">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-bg-app border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-heading"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-12 animate-in fade-in duration-300">
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description={`No users match the search term "${searchQuery}".`}
                />
              </div>
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
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-bg-table-row transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-text-heading">{user.name}</div>
                          <div className="text-xs text-text-secondary mt-1">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={user.role}
                            onChange={(e) => handleOpenConfirmRole(user.id, user.name, e.target.value as Role)}
                            disabled={user.role === 'ADMIN'}
                            className="bg-transparent text-sm border-b border-border pb-1 text-text-heading focus:outline-none focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer [&>option]:bg-bg-card"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="STAFF">Staff</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{user.lastLogin}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleOpenConfirmStatus(user.id, user.name, user.isActive)}
                            disabled={user.role === 'ADMIN'}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${user.isActive ? 'bg-primary' : 'bg-border'} ${user.role === 'ADMIN' ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                            <button 
                              onClick={() => handleOpenEditModal(user)}
                              disabled={user.role === 'ADMIN'}
                              className={`p-2 text-text-secondary rounded-lg transition-colors ${
                                user.role === 'ADMIN' 
                                  ? 'opacity-30 cursor-not-allowed' 
                                  : 'hover:text-primary hover:bg-bg-card-hover'
                              }`}
                              title={user.role === 'ADMIN' ? "Admin accounts cannot be edited" : "Edit User"}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.role === 'ADMIN' && (
                              <div 
                                className="p-2 text-danger bg-danger/10 rounded-lg flex items-center justify-center cursor-default" 
                                title="Admin Account Protected"
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </div>
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

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        user={editUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
}

