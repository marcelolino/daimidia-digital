import { Button } from "@/components/ui/button";
import { Video, Image as ImageIcon, FileImage, Layout, Grid3x3 } from "lucide-react";
import type { MediaType } from "./MediaCard";

type FilterBarProps = {
  selectedType: MediaType | "all";
  onFilterChange: (type: MediaType | "all") => void;
};

const filters = [
  { value: "all" as const, label: "Todos", icon: Grid3x3 },
  { value: "video" as const, label: "Vídeos", icon: Video },
  { value: "image" as const, label: "Imagens", icon: ImageIcon },
  { value: "logo" as const, label: "Logos", icon: FileImage },
  { value: "banner" as const, label: "Banners", icon: Layout },
];

export function FilterBar({ selectedType, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="filter-bar">
      {filters.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={selectedType === value ? "default" : "outline"}
          onClick={() => onFilterChange(value)}
          className="gap-2"
          data-testid={`button-filter-${value}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
