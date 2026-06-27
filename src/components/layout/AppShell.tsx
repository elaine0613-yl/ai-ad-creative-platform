import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
