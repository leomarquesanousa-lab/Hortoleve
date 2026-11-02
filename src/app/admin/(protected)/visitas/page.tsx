import { requireAdminPermission } from "@/modules/admin/session";
import VisitManager from "./VisitManager";
export default async function Page() { await requireAdminPermission("leads:read"); return <VisitManager />; }
