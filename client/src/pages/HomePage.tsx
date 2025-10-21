import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { MediaCard, type MediaType } from "@/components/MediaCard";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { Media, SystemSettings } from "@shared/schema";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<MediaType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allMedia = [], isLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ["/api/settings"],
  });

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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={isAuthenticated}
        isAdmin={user?.role === "admin"}
        userName={user?.firstName || user?.email || undefined}
        onLogout={handleLogout}
        logoUrl={settings?.logoUrl}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">Catálogo de Mídia</h1>
              <p className="text-muted-foreground">
                Explore nossa coleção de vídeos, imagens, logos e banners
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          <FilterBar selectedType={selectedType} onFilterChange={setSelectedType} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
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
                  onDownload={() => {
                    const link = document.createElement("a");
                    link.href = media.fileUrl;
                    link.download = media.fileName;
                    link.click();
                  }}
                  onShare={() => {
                    navigator.clipboard.writeText(window.location.origin + media.fileUrl);
                    alert("Link copiado!");
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhuma mídia encontrada</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
