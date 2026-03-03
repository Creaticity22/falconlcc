import { ExternalLink, PlayCircle } from "lucide-react";
import type { Resource } from "@/hooks/useResources";

interface Props {
  resource: Resource;
}

export default function ResourceCard({ resource }: Props) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
            {resource.is_video && <PlayCircle className="w-3 h-3 shrink-0" />}
            {resource.source_name}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
      </div>
    </a>
  );
}
