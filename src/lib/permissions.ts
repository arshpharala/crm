import type { Role } from "@prisma/client";

export type Scope = "all" | "team" | "own" | "none";

export type ModulePermissions = {
  leads: Scope;
  contacts: Scope;
  deals: Scope;
  properties: Scope;
  developers: Scope;
  tasks: Scope;
  reports: Scope;
  users: Scope;
};

const ALL: ModulePermissions = {
  leads: "all",
  contacts: "all",
  deals: "all",
  properties: "all",
  developers: "all",
  tasks: "all",
  reports: "all",
  users: "all",
};

const TEAM: ModulePermissions = {
  leads: "team",
  contacts: "team",
  deals: "team",
  properties: "all",
  developers: "all",
  tasks: "team",
  reports: "team",
  users: "none",
};

const OWN: ModulePermissions = {
  leads: "own",
  contacts: "own",
  deals: "own",
  properties: "all",
  developers: "all",
  tasks: "own",
  reports: "own",
  users: "none",
};

const READ_ONLY_ALL: ModulePermissions = {
  leads: "all",
  contacts: "all",
  deals: "all",
  properties: "all",
  developers: "all",
  tasks: "all",
  reports: "all",
  users: "none",
};

export const ROLE_PERMISSIONS: Record<Role, ModulePermissions> = {
  SUPER_ADMIN: ALL,
  MANAGING_DIRECTOR: ALL,
  SALES_DIRECTOR: ALL,
  SALES_MANAGER: TEAM,
  TEAM_LEADER: TEAM,
  AGENT: OWN,
  CRM_ADMIN: { ...ALL, reports: "all" },
  LISTING_ADMIN: { ...OWN, properties: "all", developers: "all", leads: "none", contacts: "none", deals: "none" },
  MARKETING_MANAGER: { ...OWN, leads: "all", reports: "all", contacts: "none", deals: "none", tasks: "none" },
  TELECALLER: { ...OWN, deals: "none" },
  FINANCE: { ...READ_ONLY_ALL, leads: "none", properties: "none" },
  HR_OPERATIONS: { leads: "none", contacts: "none", deals: "none", properties: "none", developers: "none", tasks: "team", reports: "none", users: "all" },
  REFERRAL_PARTNER: { leads: "own", contacts: "none", deals: "own", properties: "all", developers: "none", tasks: "none", reports: "none", users: "none" },
  DEVELOPER_RELATIONSHIP_MANAGER: { ...TEAM, leads: "none", contacts: "none" },
  AUDITOR: READ_ONLY_ALL,
};

export function can(role: Role, module: keyof ModulePermissions): Scope {
  return ROLE_PERMISSIONS[role][module];
}

export function canManageUsers(role: Role): boolean {
  return ROLE_PERMISSIONS[role].users !== "none";
}
