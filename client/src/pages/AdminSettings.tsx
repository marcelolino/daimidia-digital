import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Info, Database, Palette, Image, Upload, Download, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { SystemSettings } from "@shared/schema";

export default function AdminSettings() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ["/api/settings"],
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      return apiRequest("POST", "/api/settings/logo", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Logo atualizada",
        description: "A logo foi atualizada com sucesso!",
      });
      setLogoFile(null);
    },
    onError: () => {
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível atualizar a logo.",
        variant: "destructive",
      });
    },
  });

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

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  const handleLogoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };

  const handleExportSQL = async () => {
    try {
      const response = await fetch("/api/database/export/sql", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Backup SQL criado",
        description: "O backup do banco de dados foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível criar o backup do banco de dados.",
        variant: "destructive",
      });
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await fetch("/api/database/export/json", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Backup JSON criado",
        description: "O backup do banco de dados foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível criar o backup do banco de dados.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreDatabase = async () => {
    if (!backupFile) return;

    setIsRestoring(true);
    setShowRestoreDialog(false);

    try {
      const formData = new FormData();
      formData.append("backup", backupFile);

      const response = await fetch("/api/database/restore", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Restore failed");
      }

      const result = await response.json();

      toast({
        title: "Banco restaurado com sucesso!",
        description: `${result.recordsRestored} registros foram restaurados.`,
      });

      setBackupFile(null);
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Erro ao restaurar",
        description: error.message || "Não foi possível restaurar o banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <>
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
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tipo</span>
                        <Badge variant="secondary">PostgreSQL 16</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="default">Conectado</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t space-y-2">
                      <p className="text-sm font-medium mb-3">Exportar Backup</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={handleExportSQL}
                          className="flex-1"
                          data-testid="button-export-sql"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar SQL
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleExportJSON}
                          className="flex-1"
                          data-testid="button-export-json"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar JSON
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Crie um backup completo do banco de dados em formato SQL ou JSON
                      </p>
                    </div>

                    <div className="pt-3 border-t space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium">Restaurar Backup</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backup-file">
                          Arquivo de Backup (SQL ou JSON)
                        </Label>
                        <Input
                          id="backup-file"
                          type="file"
                          accept=".sql,.json,application/sql,application/json"
                          onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                          disabled={isRestoring}
                          data-testid="input-backup-file"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setShowRestoreDialog(true)}
                        disabled={!backupFile || isRestoring}
                        className="w-full"
                        data-testid="button-restore-backup"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isRestoring ? "Restaurando..." : "Restaurar Banco de Dados"}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        ⚠️ <strong>ATENÇÃO:</strong> Esta ação irá sobrescrever todos os dados atuais!
                      </p>
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

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      <CardTitle>Logo da Empresa</CardTitle>
                    </div>
                    <CardDescription>
                      Configure a logo que aparecerá na página inicial
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {settings?.logoUrl && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={settings.logoUrl} 
                          alt="Logo atual" 
                          className="h-16 w-auto object-contain"
                          data-testid="img-current-logo"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Logo atual</p>
                          <p className="text-xs text-muted-foreground">
                            Esta logo será exibida na página inicial
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handleLogoUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="logo-upload">
                          {settings?.logoUrl ? "Atualizar logo" : "Fazer upload da logo"}
                        </Label>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                          data-testid="input-logo-file"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!logoFile || uploadLogoMutation.isPending}
                        data-testid="button-upload-logo"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadLogoMutation.isPending ? "Enviando..." : "Fazer Upload"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Restauração do Banco de Dados
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-foreground">
                Esta ação irá SUBSTITUIR TODOS os dados atuais!
              </p>
              <p>Isso inclui:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Todos os usuários (exceto senhas no JSON)</li>
                <li>Todas as categorias</li>
                <li>Todas as mídias</li>
                <li>Configurações do sistema</li>
              </ul>
              <p className="text-destructive font-medium mt-3">
                ⚠️ Esta operação NÃO pode ser desfeita!
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Certifique-se de ter um backup dos dados atuais antes de continuar.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-restore">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreDatabase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-restore"
            >
              Sim, Restaurar Agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
