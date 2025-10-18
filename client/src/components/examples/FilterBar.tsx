import { useState } from "react";
import { FilterBar } from "../FilterBar";
import { ThemeProvider } from "../ThemeProvider";
import type { MediaType } from "../MediaCard";

export default function FilterBarExample() {
  const [selected, setSelected] = useState<MediaType | "all">("all");

  return (
    <ThemeProvider>
      <div className="p-8">
        <FilterBar selectedType={selected} onFilterChange={setSelected} />
        <p className="mt-4 text-sm text-muted-foreground">
          Selected: {selected}
        </p>
      </div>
    </ThemeProvider>
  );
}
