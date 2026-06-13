import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!isAdminAuthenticated()) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
