import { MediaCard } from "../MediaCard";
import { ThemeProvider } from "../ThemeProvider";

export default function MediaCardExample() {
  return (
    <ThemeProvider>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MediaCard
          id="1"
          title="Vídeo Promocional de Produto"
          description="Vídeo de 30 segundos apresentando o novo produto da linha premium"
          type="video"
          tags={["produto", "promocional", "premium"]}
          onView={() => console.log("View video")}
          onDownload={() => console.log("Download video")}
          onShare={() => console.log("Share video")}
        />
        <MediaCard
          id="2"
          title="Banner Principal Homepage"
          description="Banner principal para a página inicial com call to action"
          type="banner"
          tags={["homepage", "cta", "principal"]}
          onView={() => console.log("View banner")}
          onDownload={() => console.log("Download banner")}
          onShare={() => console.log("Share banner")}
        />
        <MediaCard
          id="3"
          title="Logo da Empresa"
          type="logo"
          tags={["logo", "branding"]}
          onView={() => console.log("View logo")}
          onDownload={() => console.log("Download logo")}
          onShare={() => console.log("Share logo")}
        />
        <MediaCard
          id="4"
          title="Imagem de Campanha Verão"
          description="Fotografia para campanha de verão 2024"
          type="image"
          tags={["campanha", "verão", "2024", "fotografia", "marketing"]}
          onView={() => console.log("View image")}
          onDownload={() => console.log("Download image")}
          onShare={() => console.log("Share image")}
        />
      </div>
    </ThemeProvider>
  );
}
