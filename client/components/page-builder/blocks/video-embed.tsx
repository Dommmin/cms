import type { PageBlock } from "@/types/api";

interface VideoEmbedConfig {
  title?: string;
  url?: string;
  /** youtube | vimeo | custom */
  provider?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspect?: "video" | "square" | "portrait";
}

function getEmbedUrl(url: string, autoplay: boolean, loop: boolean, muted: boolean): string {
  try {
    const parsed = new URL(url);

    // YouTube
    const ytMatch = parsed.hostname.match(/youtube\.com|youtu\.be/);
    if (ytMatch) {
      const videoId =
        parsed.searchParams.get("v") ?? parsed.pathname.split("/").pop() ?? "";
      const params = new URLSearchParams({
        autoplay: autoplay ? "1" : "0",
        loop: loop ? "1" : "0",
        mute: muted ? "1" : "0",
        ...(loop && { playlist: videoId }),
      });
      return `https://www.youtube.com/embed/${videoId}?${params}`;
    }

    // Vimeo
    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").pop() ?? "";
      const params = new URLSearchParams({
        autoplay: autoplay ? "1" : "0",
        loop: loop ? "1" : "0",
        muted: muted ? "1" : "0",
      });
      return `https://player.vimeo.com/video/${videoId}?${params}`;
    }
  } catch {
    // fall through
  }
  return url;
}

interface Props {
  block: PageBlock;
}

export function VideoEmbedBlock({ block }: Props) {
  const cfg = block.configuration as VideoEmbedConfig;
  if (!cfg.url) return null;

  const aspectClass = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[9/16]",
  }[cfg.aspect ?? "video"];

  const embedUrl = getEmbedUrl(
    cfg.url,
    cfg.autoplay ?? false,
    cfg.loop ?? false,
    cfg.muted ?? false,
  );

  return (
    <div className="flex flex-col gap-4">
      {cfg.title && <h2 className="text-2xl font-bold">{cfg.title}</h2>}
      <div className={`overflow-hidden rounded-2xl ${aspectClass}`}>
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          title={cfg.title ?? "Video"}
        />
      </div>
    </div>
  );
}
