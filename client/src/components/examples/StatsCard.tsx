import { StatsCard } from "../StatsCard";
import { ThemeProvider } from "../ThemeProvider";
import { Video, Image, FileImage, Layout } from "lucide-react";

export default function StatsCardExample() {
  return (
    <ThemeProvider>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total de Mídias" value={247} icon={Image} trend={{ value: 12, isPositive: true }} />
        <StatsCard title="Vídeos" value={89} icon={Video} description="36% do total" />
        <StatsCard title="Imagens" value={102} icon={Image} description="41% do total" />
        <StatsCard title="Logos" value={34} icon={FileImage} />
        <StatsCard title="Banners" value={22} icon={Layout} trend={{ value: -5, isPositive: false }} />
      </div>
    </ThemeProvider>
  );
}
