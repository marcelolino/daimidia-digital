import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { UploadZone } from "./UploadZone";
import type { MediaType } from "./MediaCard";
import type { Category } from "@shared/schema";

type MediaFormProps = {
  onSubmit: (data: MediaFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<MediaFormData>;
};

export type MediaFormData = {
  title: string;
  description: string;
  type: MediaType;
  categoryId?: string;
  tags: string[];
  file?: File;
};

export function MediaForm({ onSubmit, onCancel, initialData }: MediaFormProps) {
  const [formData, setFormData] = useState<MediaFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "image",
    categoryId: initialData?.categoryId,
    tags: initialData?.tags || [],
    file: initialData?.file,
  });
  const [tagInput, setTagInput] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-media">
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Nome da mídia"
          required
          data-testid="input-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva a mídia..."
          rows={3}
          data-testid="input-description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: MediaType) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger id="type" data-testid="select-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="image">Imagem</SelectItem>
            <SelectItem value="logo">Logo</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={formData.categoryId || "none"}
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value === "none" ? undefined : value })
          }
        >
          <SelectTrigger id="category" data-testid="select-category">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem categoria</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Adicionar tag..."
            data-testid="input-tag"
          />
          <Button type="button" onClick={addTag} data-testid="button-add-tag">
            Adicionar
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Arquivo {!initialData && "*"}</Label>
        <UploadZone
          onFileSelect={(file) => setFormData({ ...formData, file })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" data-testid="button-submit">
          {initialData ? "Atualizar" : "Cadastrar"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
