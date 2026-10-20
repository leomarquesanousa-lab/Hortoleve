import type { Permission, Role } from "./contracts";
import { rolePermissions } from "./contracts";

export interface AdminIdentity { id: string; name: string; email: string; role: Role; active: boolean; permissions: string[] }
export function hasAdminPermission(user: AdminIdentity, permission: Permission) {
    return user.active && (user.role === "OWNER" || (user.role === "ADMIN" && rolePermissions.ADMIN.includes(permission) && user.permissions.includes(permission)));
}
