import { brandEmblemSrc } from "@/lib/media/image-slots";

// Logo lockup shared by the header and footer: the official Reltroner Learning emblem beside the
// wordmark. The wrapping link supplies the accessible name, so the emblem is decorative (alt="").
// A fixed 36px midnight box keeps the header stable while it loads; low fetch priority keeps it
// from competing with a page's hero image (and stops React from preloading it on every route).
export function BrandMark() {
  return (
    <>
      <span className="block h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-midnight">
        {/* Static export: no image optimization; the source is a pinned approved asset. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandEmblemSrc} alt="" width={36} height={36} decoding="async" fetchPriority="low"
          className="block h-full w-full" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">Reltroner</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Learning Academy</span>
      </span>
    </>
  );
}
