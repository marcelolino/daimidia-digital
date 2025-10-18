import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { StatsCard } from "@/components/StatsCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Video, Image, FileImage, Layout } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    console.log("Logout");
    //todo: remove mock functionality - implement real logout
    setLocation("/");
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar onLogout={handleLogout} />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="space-y-8 max-w-7xl mx-auto">
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral da sua biblioteca de mídia</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total de Mídias"
                  value={247}
                  icon={Image}
                  trend={{ value: 12, isPositive: true }}
                />
                <StatsCard
                  title="Vídeos"
                  value={89}
                  icon={Video}
                  description="36% do total"
                />
                <StatsCard
                  title="Imagens"
                  value={102}
                  icon={Image}
                  description="41% do total"
                />
                <StatsCard
                  title="Logos"
                  value={34}
                  icon={FileImage}
                />
                <StatsCard
                  title="Banners"
                  value={22}
                  icon={Layout}
                  trend={{ value: -5, isPositive: false }}
                />
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
                <div className="space-y-3">
                  {[
                    { action: "Upload", item: "Banner Black Friday", time: "Há 2 horas" },
                    { action: "Edição", item: "Logo Principal", time: "Há 5 horas" },
                    { action: "Upload", item: "Vídeo Tutorial", time: "Há 1 dia" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{activity.action}: {activity.item}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
