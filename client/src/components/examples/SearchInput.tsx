import { useState } from "react";
import { SearchInput } from "../SearchInput";
import { ThemeProvider } from "../ThemeProvider";

export default function SearchInputExample() {
  const [search, setSearch] = useState("");

  return (
    <ThemeProvider>
      <div className="p-8 max-w-2xl">
        <SearchInput value={search} onChange={setSearch} />
        <p className="mt-4 text-sm text-muted-foreground">
          Searching for: {search || "(vazio)"}
        </p>
      </div>
    </ThemeProvider>
  );
}
