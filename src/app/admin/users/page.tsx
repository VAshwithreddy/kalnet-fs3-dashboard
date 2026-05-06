"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, MoreVertical, Edit2, ShieldAlert } from "lucide-react";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "STAFF";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin: string;
};

const initialUsers: User[] = [
  { id: "USR-001", name: "Alice Johnson", email: "alice.j@school.edu", role: "ADMIN", isActive: true, lastLogin: "2 mins ago" },
  { id: "USR-002", name: "Robert Smith", email: "robert.s@school.edu", role: "TEACHER", isActive: true, lastLogin: "4 hours ago" },
  { id: "USR-003", name: "Mary Williams", email: "mary.w@school.edu", role: "STAFF", isActive: false, lastLogin: "2 days ago" },
  { id: "USR-004", name: "James Brown", email: "james.b@student.edu", role: "STUDENT", isActive: true, lastLogin: "1 day ago" },
  { id: "USR-005", name: "Patricia Taylor", email: "patricia.t@school.edu", role: "TEACHER", isActive: true, lastLogin: "10 mins ago" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          // Map DB schema to UI state
          setUsers(data.users.map((u: any) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.role,
            isActive: u.status === "ACTIVE",
            lastLogin: "Just now" // Mock for now since API doesn't have it
          })));
        }
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
    }
    fetchUsers();
  }, []);

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const changeRole = (id: string, newRole: Role) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">User Management</h1>
          <p className="text-text-secondary mt-2">Manage roles, status, and system access.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary text-text-on-primary rounded-lg shadow-shadow-btn hover:bg-primary-mid transition-all font-medium">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-bg-card border border-border shadow-shadow-card rounded-2xl overflow-hidden">
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
                    onChange={(e) => changeRole(user.id, e.target.value as Role)}
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
                    onClick={() => toggleStatus(user.id)}
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
    </div>
  );
}
