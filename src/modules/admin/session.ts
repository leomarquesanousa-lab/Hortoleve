import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "./auth";
import { getDatabase } from "./database";
import type { Permission } from "./contracts";
import { hasAdminPermission, type AdminIdentity } from "./authorization";

export async function currentAdmin(): Promise<AdminIdentity | null> {
    const auth = getAdminAuth();
    if (!auth) return null;
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return null;
        const user = await getDatabase().user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true, active: true, permissions: true } });
        return user?.active && ["OWNER", "ADMIN"].includes(user.role) ? user : null;
    } catch { return null; }
}
export async function requireAdmin() {
    const user = await currentAdmin();
    if (!user) redirect("/admin/login");
    return user;
}
export async function requireAdminPermission(permission: Permission) {
    const user = await requireAdmin();
    if (!hasAdminPermission(user, permission)) throw new Error("Operação administrativa não autorizada.");
    return user;
}
