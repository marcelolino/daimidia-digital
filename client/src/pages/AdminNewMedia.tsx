import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MediaForm, type MediaFormData } from "@/components/MediaForm";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminNewMedia() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    console.log("Logout");
    //todo: remove mock functionality
    setLocation("/");
  };

  const handleSubmit = (data: MediaFormData) => {
    console.log("New media:", data);
    //todo: remove mock functionality - implement real media creation
    toast({
      title: "Mídia cadastrada!",
      description: `${data.title} foi adicionado com sucesso.`,
    });
    setLocation("/admin/media");
  };

  const handleCancel = () => {
    setLocation("/admin/media");
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
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">Adicionar Nova Mídia</h1>
                <p className="text-muted-foreground">Preencha os dados abaixo para cadastrar uma nova mídia</p>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <MediaForm onSubmit={handleSubmit} onCancel={handleCancel} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
