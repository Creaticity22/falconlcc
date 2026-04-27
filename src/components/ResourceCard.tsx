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
      className="block card-elevated p-4 md:p-5 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug group-hover:text-gradient-primary transition-colors line-clamp-2">
            {resource.title}
          </p>
          <p className="text-[11px] text-accent mt-1.5 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            {resource.is_video && <PlayCircle className="w-3 h-3 shrink-0" />}
            {resource.source_name}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{resource.description}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>
  );
}
