import AdminShellLayout from "./admin-shell-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellLayout>{children}</AdminShellLayout>;
}
