import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MediaCard, type MediaType } from "@/components/MediaCard";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Media, Category } from "@shared/schema";
import { prepareMediaForExport, downloadCSV, downloadExcel } from "@/lib/exportUtils";

export default function AdminMediaList() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<MediaType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: allMedia = [], isLoading: mediaLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Mídia excluída",
        description: "A mídia foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a mídia.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  const filteredMedia = useMemo(() => {
    return allMedia.filter((media) => {
      const matchesType = selectedType === "all" || media.type === selectedType;
      const matchesSearch =
        searchQuery === "" ||
        media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        media.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [allMedia, selectedType, searchQuery]);

  const handleExportCSV = () => {
    const exportData = prepareMediaForExport(filteredMedia, categories);
    downloadCSV(exportData);
    toast({
      title: "Exportado com sucesso",
      description: `${filteredMedia.length} itens exportados para CSV.`,
    });
  };

  const handleExportExcel = () => {
    const exportData = prepareMediaForExport(filteredMedia, categories);
    downloadExcel(exportData);
    toast({
      title: "Exportado com sucesso",
      description: `${filteredMedia.length} itens exportados para Excel.`,
    });
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
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">Biblioteca de Mídia</h1>
                  <p className="text-muted-foreground">Gerencie todas as suas mídias</p>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" data-testid="button-export">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportCSV} data-testid="menu-export-csv">
                        <FileText className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportExcel} data-testid="menu-export-excel">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Exportar Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/admin/new">
                    <Button data-testid="button-new-media">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Mídia
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <SearchInput value={searchQuery} onChange={setSearchQuery} />
                </div>
              </div>

              <FilterBar selectedType={selectedType} onFilterChange={setSelectedType} />

              {mediaLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMedia.length > 0 ? (
                    filteredMedia.map((media) => (
                      <MediaCard
                        key={media.id}
                        id={media.id}
                        title={media.title}
                        description={media.description || undefined}
                        type={media.type as MediaType}
                        tags={media.tags || []}
                        thumbnailUrl={media.thumbnailUrl || media.fileUrl}
                        onView={() => window.open(media.fileUrl, "_blank")}
                        onEdit={() => {
                          window.location.href = `/admin/edit/${media.id}`;
                        }}
                        onDownload={() => {
                          const link = document.createElement("a");
                          link.href = media.fileUrl;
                          link.download = media.fileName;
                          link.click();
                        }}
                        onShare={() => {
                          navigator.clipboard.writeText(window.location.origin + media.fileUrl);
                          toast({ title: "Link copiado!" });
                        }}
                        onDelete={() => handleDelete(media.id, media.title)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">Nenhuma mídia encontrada</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
