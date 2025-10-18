import { UploadZone } from "../UploadZone";
import { ThemeProvider } from "../ThemeProvider";

export default function UploadZoneExample() {
  return (
    <ThemeProvider>
      <div className="p-8 max-w-2xl mx-auto">
        <UploadZone onFileSelect={(file) => console.log("File selected:", file.name)} />
      </div>
    </ThemeProvider>
  );
}
