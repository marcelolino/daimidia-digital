import { MediaForm } from "../MediaForm";
import { ThemeProvider } from "../ThemeProvider";

export default function MediaFormExample() {
  return (
    <ThemeProvider>
      <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-display font-bold mb-6">Cadastrar Nova Mídia</h2>
        <MediaForm
          onSubmit={(data) => console.log("Form submitted:", data)}
          onCancel={() => console.log("Form cancelled")}
        />
      </div>
    </ThemeProvider>
  );
}
