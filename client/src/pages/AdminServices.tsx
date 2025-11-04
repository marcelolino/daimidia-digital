import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Settings } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service } from "@shared/schema";
import { format } from "date-fns";

export default function AdminServices() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
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

  const { data: allServices = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services/all"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`)) {
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

  const filteredServices = allServices.filter((service) => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.technologies?.some(tech => tech.toLowerCase().includes(query))
    );
  });

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
                  <h1 className="text-3xl font-display font-bold mb-2">
                    <Settings className="inline h-8 w-8 mr-2 text-primary" />
                    Lista de Serviços ({allServices.length})
                  </h1>
                  <p className="text-muted-foreground">Gerencie todos os serviços oferecidos</p>
                </div>
                <Link href="/admin/services/new">
                  <Button data-testid="button-new-service">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Serviço
                  </Button>
                </Link>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviços..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-services"
                />
              </div>

              <div className="bg-card border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Imagem</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tecnologias</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicesLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          {searchQuery ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredServices.map((service, index) => (
                        <TableRow key={service.id} data-testid={`row-service-${index}`}>
                          <TableCell>
                            {service.imageUrl ? (
                              <img 
                                src={service.imageUrl} 
                                alt={service.name}
                                className="w-12 h-12 rounded-md object-cover"
                                data-testid={`img-service-${index}`}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-md gradient-primary flex items-center justify-center">
                                <Settings className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium" data-testid={`text-service-name-${index}`}>
                                {service.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {service.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" data-testid={`badge-category-${index}`}>
                              {service.category}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-price-${index}`}>
                            <span className="font-medium text-primary">{service.price}</span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={service.status === "ativo" ? "default" : "secondary"}
                              data-testid={`badge-status-${index}`}
                            >
                              {service.status === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {service.technologies && service.technologies.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {service.technologies.slice(0, 2).map((tech, techIndex) => (
                                  <Badge 
                                    key={techIndex} 
                                    variant="secondary" 
                                    className="text-xs"
                                    data-testid={`badge-tech-${index}-${techIndex}`}
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                                {service.technologies.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{service.technologies.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(service.createdAt), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/services/${service.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-testid={`button-edit-service-${index}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(service.id, service.name)}
                                data-testid={`button-delete-service-${index}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
