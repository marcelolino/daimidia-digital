import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { MediaCard, type MediaType } from "@/components/MediaCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { Media, SystemSettings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<MediaType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWhatsappMenu, setShowWhatsappMenu] = useState(false);

  useEffect(() => {
    fetch("/api/analytics/page-view", {
      method: "POST",
      credentials: "include",
    }).catch((error) => {
      console.error("Failed to track page view:", error);
    });
  }, []);

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

  const whatsappNumbers = (settings?.whatsappNumbers as Array<{ label: string; number: string }>) || [];

  const handleWhatsappClick = (number: string) => {
    const whatsappUrl = `https://wa.me/${number}`;
    window.open(whatsappUrl, "_blank");
    setShowWhatsappMenu(false);
  };

  const handleWhatsappButtonClick = () => {
    if (whatsappNumbers.length === 1) {
      handleWhatsappClick(whatsappNumbers[0].number);
    } else {
      setShowWhatsappMenu(!showWhatsappMenu);
    }
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

      {whatsappNumbers.length > 0 && (
        <>
          <AnimatePresence>
            {showWhatsappMenu && whatsappNumbers.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-24 right-6 bg-card border rounded-lg shadow-lg p-3 space-y-2 z-40"
                data-testid="whatsapp-menu"
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b">
                  <p className="text-sm font-medium">Escolha um contato</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowWhatsappMenu(false)}
                    data-testid="button-close-whatsapp-menu"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {whatsappNumbers.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleWhatsappClick(item.number)}
                    data-testid={`button-whatsapp-contact-${index}`}
                  >
                    <SiWhatsapp className="h-5 w-5 text-green-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.number.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, "+$1 ($2) $3-$4")}
                      </p>
                    </div>
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
              onClick={handleWhatsappButtonClick}
              data-testid="button-whatsapp-float"
            >
              <SiWhatsapp className="h-7 w-7 text-white" />
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}
