import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { MediaCard, type MediaType } from "@/components/MediaCard";
import { motion } from "framer-motion";

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
  {
    id: "4",
    title: "Campanha Verão 2024",
    description: "Fotografia profissional para campanha de verão",
    type: "image" as MediaType,
    tags: ["campanha", "verão", "2024", "fotografia"],
  },
  {
    id: "5",
    title: "Tutorial do Produto",
    description: "Vídeo explicativo sobre uso do produto",
    type: "video" as MediaType,
    tags: ["tutorial", "educacional", "produto"],
  },
  {
    id: "6",
    title: "Banner Black Friday",
    description: "Banner promocional para Black Friday 2024",
    type: "banner" as MediaType,
    tags: ["black-friday", "promoção", "2024"],
  },
];

export default function HomePage() {
  const [selectedType, setSelectedType] = useState<MediaType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMedia = mockMedia.filter((media) => {
    const matchesType = selectedType === "all" || media.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
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
        </motion.div>
      </main>
    </div>
  );
}
