import { useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { StatsCard } from "@/components/StatsCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Video, Image, FileImage, Layout, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Media, SystemSettings } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Não autorizado",
        description: isAuthenticated 
          ? "Você precisa ser admin para acessar esta página."
          : "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = isAuthenticated ? "/" : "/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: allMedia = [] } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ["/api/settings"],
  });

  const stats = useMemo(() => {
    const total = allMedia.length;
    const videos = allMedia.filter((m) => m.type === "video").length;
    const images = allMedia.filter((m) => m.type === "image").length;
    const logos = allMedia.filter((m) => m.type === "logo").length;
    const banners = allMedia.filter((m) => m.type === "banner").length;
    return { total, videos, images, logos, banners };
  }, [allMedia]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

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
                  title="Visualizações da Página"
                  value={settings?.pageViews || 0}
                  icon={Eye}
                  description="Total de visitas"
                />
                <StatsCard
                  title="Total de Mídias"
                  value={stats.total}
                  icon={Image}
                />
                <StatsCard
                  title="Vídeos"
                  value={stats.videos}
                  icon={Video}
                  description={stats.total > 0 ? `${Math.round((stats.videos / stats.total) * 100)}% do total` : ""}
                />
                <StatsCard
                  title="Imagens"
                  value={stats.images}
                  icon={Image}
                  description={stats.total > 0 ? `${Math.round((stats.images / stats.total) * 100)}% do total` : ""}
                />
                <StatsCard
                  title="Logos"
                  value={stats.logos}
                  icon={FileImage}
                />
                <StatsCard
                  title="Banners"
                  value={stats.banners}
                  icon={Layout}
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
