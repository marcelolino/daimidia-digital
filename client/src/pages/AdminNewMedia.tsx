import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MediaForm, type MediaFormData } from "@/components/MediaForm";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function AdminNewMedia() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

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
        window.location.href = isAuthenticated ? "/" : "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const createMediaMutation = useMutation({
    mutationFn: async (data: MediaFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("type", data.type);
      if (data.categoryId) {
        formData.append("categoryId", data.categoryId);
      }
      formData.append("tags", JSON.stringify(data.tags));
      if (data.file) {
        formData.append("file", data.file);
      }
      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create media");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Mídia cadastrada!",
        description: "A mídia foi adicionada com sucesso.",
      });
      setLocation("/admin/media");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar mídia. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSubmit = (data: MediaFormData) => {
    createMediaMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation("/admin/media");
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
