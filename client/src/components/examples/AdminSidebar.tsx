import { AdminSidebar } from "../AdminSidebar";
import { ThemeProvider } from "../ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <ThemeProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar onLogout={() => console.log("Logout")} />
          <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold">Admin Content Area</h1>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
