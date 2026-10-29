"use client";

type SlotImageProps = { src: string; alt: string; loading: "eager" | "lazy"; className: string };

// A plain <img> rendered from a client component, as next/image does. React adds a preload hint
// for every non-lazy <img> in a Server Component's RSC payload, so Next's link prefetching would
// download other pages' hero images; from here an eager image is preloaded only by its own page.
export function SlotImage({ src, alt, loading, className }: SlotImageProps) {
  // Static export: no image optimization; slot sources are validated pinned assets.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={loading} decoding="async" className={className} />;
}
