import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MediaCard, type MediaType } from "@/components/MediaCard";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useLocation } from "wouter";

//todo: remove mock functionality
const mockMedia = [
  {
    id: "1",
    title: "Vídeo Promocional Produto Premium",
    description: "Apresentação do novo produto da linha premium em 4K",
    type: "video" as MediaType,
    tags: ["produto", "promocional", "premium", "4k"],
  },
  {
    id: "2",
    title: "Banner Principal Homepage",
    description: "Banner hero para página inicial com call to action",
    type: "banner" as MediaType,
    tags: ["homepage", "cta", "hero"],
  },
  {
    id: "3",
    title: "Logo Empresa Principal",
    description: "Logo oficial em alta resolução",
    type: "logo" as MediaType,
    tags: ["logo", "branding", "oficial"],
  },
];

export default function AdminMediaList() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<MediaType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    console.log("Logout");
    //todo: remove mock functionality
    setLocation("/");
  };

  const filteredMedia = mockMedia.filter((media) => {
    const matchesType = selectedType === "all" || media.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">Biblioteca de Mídia</h1>
                  <p className="text-muted-foreground">Gerencie todas as suas mídias</p>
                </div>
                <Link href="/admin/new">
                  <Button data-testid="button-new-media">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Mídia
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <SearchInput value={searchQuery} onChange={setSearchQuery} />
                </div>
              </div>

              <FilterBar selectedType={selectedType} onFilterChange={setSelectedType} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedia.length > 0 ? (
                  filteredMedia.map((media) => (
                    <MediaCard
                      key={media.id}
                      {...media}
                      onView={() => console.log("View", media.id)}
                      onDownload={() => console.log("Download", media.id)}
                      onShare={() => console.log("Share", media.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">Nenhuma mídia encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
