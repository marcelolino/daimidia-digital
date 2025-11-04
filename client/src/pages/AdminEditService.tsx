import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

export default function AdminEditService() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/services/:id/edit");
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");
  const [technologies, setTechnologies] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: service, isLoading: serviceLoading } = useQuery<Service>({
    queryKey: [`/api/services/${params?.id}`],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
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
  }, [isAuthenticated, authLoading, user, toast]);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setDescription(service.description);
      setPrice(service.price);
      setStatus(service.status);
      setTechnologies(service.technologies?.join(", ") || "");
      if (service.imageUrl) {
        setImagePreview(service.imageUrl);
      }
    }
  }, [service]);

  const updateServiceMutation = useMutation({
    mutationFn: async () => {
      if (!params?.id) throw new Error("No service ID");

      const techArray = technologies.split(",").map(t => t.trim()).filter(t => t);
      
      const serviceData = {
        name,
        category,
        description,
        price,
        status,
        technologies: techArray,
      };

      await apiRequest("PATCH", `/api/services/${params.id}`, serviceData);

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        
        await fetch(`/api/services/${params.id}/image`, {
          method: "POST",
          body: formData,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services", params?.id] });
      toast({
        title: "Serviço atualizado!",
        description: "O serviço foi atualizado com sucesso.",
      });
      setLocation("/admin/services");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !description || !price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    updateServiceMutation.mutate();
  };

  const handleCancel = () => {
    setLocation("/admin/services");
  };

  if (authLoading || serviceLoading || !isAuthenticated || user?.role !== "admin") {
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
                <h1 className="text-3xl font-display font-bold mb-2">Editar Serviço</h1>
                <p className="text-muted-foreground">Atualize os dados do serviço</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nome do Serviço <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Desenvolvimento Web, Consultoria"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-service-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Categoria <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="category"
                      placeholder="Ex: Desenvolvimento, E-commerce, Mobile"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      data-testid="input-service-category"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Preço <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      placeholder="Ex: R$ 180,00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      data-testid="input-service-price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Status <span className="text-destructive">*</span>
                    </Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as "ativo" | "inativo")}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descrição <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o serviço oferecido..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    data-testid="textarea-service-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technologies">
                    Tecnologias
                  </Label>
                  <Input
                    id="technologies"
                    placeholder="Ex: React, Node.js, TypeScript (separado por vírgulas)"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    data-testid="input-service-technologies"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as tecnologias por vírgulas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Imagem do Serviço</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        data-testid="input-service-image"
                      />
                    </div>
                    {imagePreview && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          data-testid="img-preview"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateServiceMutation.isPending}
                    data-testid="button-update-service"
                  >
                    {updateServiceMutation.isPending ? (
                      <>Salvando...</>
                    ) : (
                      <>Salvar Alterações</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
