export type AppRole = "ADMIN" | "ANALYST" | "VIEWER";
export type AppSection = "dashboard" | "users" | "reports";

const accessMatrix: Record<AppRole, AppSection[]> = {
  ADMIN: ["dashboard", "users", "reports"],
  ANALYST: ["dashboard", "reports"],
  VIEWER: ["dashboard"],
};

export function getAllowedSections(role: AppRole) {
  return accessMatrix[role];
}

export function canManageUsers(role: AppRole) {
  return role === "ADMIN";
}

export function canManageReports(role: AppRole) {
  return role === "ADMIN" || role === "ANALYST";
}
