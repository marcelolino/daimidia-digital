import { useCallback, useState } from "react";
import { Upload, X, FileVideo, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type UploadZoneProps = {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
};

export function UploadZone({ 
  onFileSelect, 
  accept = "image/*,video/*",
  maxSize = 50 * 1024 * 1024 
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");

  const handleFile = useCallback((file: File) => {
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setFileName(file.name);
    setFileType(file.type);
    onFileSelect(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }, [maxSize, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearPreview = () => {
    setPreview(null);
    setFileName("");
    setFileType("");
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all
          ${isDragging 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-border hover:border-primary hover:bg-primary/5"
          }
        `}
        data-testid="upload-zone"
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          data-testid="input-file"
        />
        
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Arraste um arquivo aqui</p>
            <p className="text-sm text-muted-foreground mt-1">
              ou clique para selecionar
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Imagens ou vídeos até {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative rounded-xl overflow-hidden border bg-card"
            data-testid="upload-preview"
          >
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 z-10"
              onClick={clearPreview}
              data-testid="button-clear-preview"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {fileType.startsWith("image/") ? (
              <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
            ) : fileType.startsWith("video/") ? (
              <video src={preview} controls className="w-full h-auto max-h-96">
                Seu navegador não suporta vídeo.
              </video>
            ) : (
              <div className="p-8 flex items-center gap-4">
                {fileType.startsWith("video/") ? (
                  <FileVideo className="h-12 w-12 text-primary" />
                ) : (
                  <FileImage className="h-12 w-12 text-primary" />
                )}
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{fileType}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
