import logoUrl from "@/assets/falcon-logo.png";

interface FalconLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

/**
 * Brand mark — uses the official Falcon logo asset.
 * `showWordmark` true → full logo; false → cropped square mark.
 */
export default function FalconLogo({ className = "", showWordmark = false, size = 32 }: FalconLogoProps) {
  if (showWordmark) {
    return (
      <img
        src={logoUrl}
        alt="Falcon"
        className={className}
        style={{ height: size, width: "auto" }}
      />
    );
  }

  // Square mark: clip the left portion of the wordmark image
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoUrl}
        alt="Falcon"
        className="absolute top-1/2 left-0 -translate-y-1/2"
        style={{ height: size * 1.4, width: "auto", objectFit: "cover", objectPosition: "left center" }}
      />
    </div>
  );
}
