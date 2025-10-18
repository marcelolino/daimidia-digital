import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Database, Palette } from "lucide-react";

export default function AdminSettings() {
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
        window.location.href = isAuthenticated ? "/" : "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
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
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">Configurações</h1>
                <p className="text-muted-foreground">Configurações do sistema</p>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      <CardTitle>Informações do Sistema</CardTitle>
                    </div>
                    <CardDescription>
                      Detalhes sobre a plataforma Daimidia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Plataforma</span>
                      <Badge variant="secondary">Daimidia v1.0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Usuário logado</span>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Função</span>
                      <Badge>{user.role === "admin" ? "Administrador" : "Visitante"}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      <CardTitle>Banco de Dados</CardTitle>
                    </div>
                    <CardDescription>
                      Informações sobre o armazenamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tipo</span>
                      <Badge variant="secondary">PostgreSQL</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="default">Conectado</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      <CardTitle>Aparência</CardTitle>
                    </div>
                    <CardDescription>
                      Preferências de interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tema</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Use o botão no canto superior direito</span>
                        <ThemeToggle />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
