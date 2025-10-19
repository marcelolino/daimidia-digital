import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Share2, Video, Image as ImageIcon, FileImage, Layout, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export type MediaType = "video" | "image" | "logo" | "banner";

type MediaCardProps = {
  id: string;
  title: string;
  description?: string;
  type: MediaType;
  tags?: string[];
  thumbnailUrl?: string;
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
};

const mediaIcons = {
  video: Video,
  image: ImageIcon,
  logo: FileImage,
  banner: Layout,
};

const mediaColors = {
  video: "bg-primary/10 text-primary border-primary/20",
  image: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  logo: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  banner: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

export function MediaCard({
  id,
  title,
  description,
  type,
  tags = [],
  thumbnailUrl,
  onView,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  showActions = true,
}: MediaCardProps) {
  const Icon = mediaIcons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden group hover-elevate" data-testid={`card-media-${id}`}>
        <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="object-cover w-full h-full" />
          ) : (
            <Icon className="h-16 w-16 text-muted-foreground/30" />
          )}
          {showActions && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={onView}
                data-testid={`button-view-${id}`}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onEdit}
                  data-testid={`button-edit-${id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={onDownload}
                data-testid={`button-download-${id}`}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onShare}
                data-testid={`button-share-${id}`}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  data-testid={`button-delete-${id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-1" data-testid={`text-title-${id}`}>
              {title}
            </h3>
            <Badge className={mediaColors[type]} data-testid={`badge-type-${id}`}>
              {type}
            </Badge>
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-description-${id}`}>
              {description}
            </p>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs"
                  data-testid={`badge-tag-${id}-${index}`}
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
