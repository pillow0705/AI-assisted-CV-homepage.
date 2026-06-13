import { getSiteConfig, getHonors, getProjects } from "@/lib/config";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const config = getSiteConfig();
  const honors = getHonors();
  const projects = getProjects();

  return <AdminDashboard initialConfig={config} initialHonors={honors} initialProjects={projects} />;
}
