import { redirect } from "next/navigation";

export default function AdminDashboard() {
  // Redirect to admin overview by default
  redirect("/admin/overview");
}