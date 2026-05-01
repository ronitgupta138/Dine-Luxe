"use client";

import { useAuth } from "./useAuth";
import { ROLES } from "@/lib/constants";
import type { Role } from "@/lib/constants";

const ROLE_HIERARCHY: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.OWNER,
  ROLES.MANAGER,
  ROLES.HOST,
  ROLES.WAITER,
  ROLES.CHEF,
  ROLES.CASHIER,
  ROLES.CUSTOMER,
];

export function useRBAC() {
  const { role } = useAuth();

  const hasRole = (required: Role | Role[]) => {
    if (!role) return false;
    const currentRole = role as Role;
    if (Array.isArray(required)) return required.includes(currentRole);
    return currentRole === required;
  };

  const hasMinRole = (minRole: Role) => {
    if (!role) return false;
    const currentRole = role as Role;
    return ROLE_HIERARCHY.indexOf(currentRole) <= ROLE_HIERARCHY.indexOf(minRole);
  };

  return { hasRole, hasMinRole };
}
