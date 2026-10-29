import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { resolveImageSlot, type ImageSlotId, type SlotMotif } from "@/lib/media/image-slots";
import { SlotImage } from "./SlotImage";

type ConceptImageProps = {
  slot: ImageSlotId;
  className?: string;
  caption?: ReactNode;
  priority?: boolean;
  // false inside a card edge (no radius, border or shadow of its own)
  framed?: boolean;
};

// An approved slot image, or a branded placeholder until one exists. Placeholders are hidden
// from assistive technology (they carry no information) and visibly marked as pending artwork.
export function ConceptImage({ slot: id, className, caption, priority = false, framed = true }: ConceptImageProps) {
  const slot = resolveImageSlot(id);
  const frame = cn("relative overflow-hidden", framed && "rounded-3xl border border-cobalt/40 shadow-lg", className);

  if (slot.approved) {
    const contain = slot.fit === "contain";
    return (
      <figure className="space-y-2">
        <div data-image-slot={slot.id} className={cn(frame, contain && "bg-midnight")} style={{ aspectRatio: slot.aspectRatio }}>
          <SlotImage src={slot.src} alt={slot.alt} loading={priority ? "eager" : "lazy"}
            className={cn("h-full w-full", contain ? "object-contain" : "object-cover")} />
        </div>
        {caption && <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className="space-y-2">
      <div aria-hidden="true" data-image-slot={slot.id} data-placeholder="true"
        className={cn(frame, "surface-midnight")} style={{ aspectRatio: slot.aspectRatio }}>
        <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <Motif motif={slot.motif} />
        </svg>
        <span className="absolute bottom-3 left-3 rounded-md border border-cyan/30 bg-midnight/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b8ddff]">
          Illustration pending
        </span>
      </div>
      {caption && <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

const cyan = "#35d9f2";
const violet = "#9b7bff";
const blue = "#5b9bff";

function Motif({ motif }: { motif: SlotMotif }) {
  switch (motif) {
    case "book-world":
      return (
        <g fill="none" strokeLinejoin="round">
          <path d="M90 230 Q300 140 510 230" stroke={cyan} strokeWidth="2" opacity=".6" />
          <path d="M120 300 Q300 225 480 295" stroke={violet} strokeWidth="2" opacity=".55" />
          <g stroke={cyan} strokeWidth="6">
            <path d="M170 290V175h52v-50h50v155" />
            <path d="M282 280V100h64v180" />
            <path d="M360 288V145h52v150" />
          </g>
          <g fill={cyan} opacity=".75">
            <rect x="186" y="195" width="14" height="18" rx="2" />
            <rect x="300" y="125" width="14" height="20" rx="2" />
            <rect x="322" y="165" width="14" height="20" rx="2" />
            <rect x="376" y="180" width="12" height="18" rx="2" />
          </g>
          <path d="M80 285q115-55 220 20q105-75 220-20l-14 58q-104-44-206 30q-102-74-206-30z"
            fill="#0b4a99" stroke="#53def9" strokeWidth="4" />
          <path d="M300 305v62" stroke="#b9ffff" strokeWidth="4" />
        </g>
      );
    case "causal":
      return (
        <g>
          {[110, 300, 490].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy="200" r="62" fill="#0b2550" stroke={[cyan, blue, violet][i]} strokeWidth="5" />
              <circle cx={x} cy="200" r="20" fill={[cyan, blue, violet][i]} opacity=".8" />
            </g>
          ))}
          <g stroke="#b8ddff" strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M182 200h46m-14-14 14 14-14 14" />
            <path d="M372 200h46m-14-14 14 14-14 14" />
          </g>
        </g>
      );
    case "journey":
      return (
        <g>
          <path d="M60 330 C160 330 140 230 240 230 S330 140 420 150 S520 80 560 60" fill="none"
            stroke={cyan} strokeWidth="4" strokeDasharray="10 10" opacity=".8" />
          {[[60, 330], [130, 300], [200, 238], [270, 222], [340, 170], [410, 150], [480, 118], [550, 66]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 0 ? 16 : 11} fill={i === 0 ? cyan : "#0b2550"}
              stroke={i === 0 ? "#b9ffff" : blue} strokeWidth="4" />
          ))}
        </g>
      );
    case "network":
      return (
        <g fill="none" strokeWidth="3">
          {[110, 200, 290].map((y) => (
            <g key={y}>
              <rect x="60" y={y - 28} width="120" height="56" rx="10" fill="#0b2550" stroke={blue} />
              <path d={`M80 ${y - 6}h70M80 ${y + 10}h50`} stroke="#b8ddff" opacity=".7" />
              <path d={`M180 ${y}Q250 ${y} 290 200`} stroke={cyan} opacity=".7" />
            </g>
          ))}
          <circle cx="320" cy="200" r="38" fill="#0b2550" stroke={cyan} strokeWidth="5" />
          <circle cx="320" cy="200" r="12" fill={cyan} />
          <path d="M358 200h62" stroke={cyan} />
          <rect x="420" y="140" width="130" height="120" rx="14" fill="#0b2550" stroke={violet} />
          <path d="M440 170h90M440 192h70M440 214h80" stroke="#e7ddff" opacity=".75" />
          <path d="M440 238h36" stroke={cyan} strokeWidth="4" />
        </g>
      );
    case "seed":
      return (
        <g fill="none" strokeLinecap="round">
          <circle cx="300" cy="240" r="16" fill={cyan} />
          {[[-150, -120], [-80, -170], [0, -190], [90, -165], [160, -110], [-190, -30], [190, -40]].map(([dx, dy], i) => (
            <g key={i}>
              <path d={`M300 240Q${300 + dx / 2} ${240 + dy / 3} ${300 + dx} ${240 + dy}`} stroke={i % 2 ? violet : blue}
                strokeWidth="3" opacity=".8" />
              <circle cx={300 + dx} cy={240 + dy} r="9" fill="#0b2550" stroke={i % 2 ? violet : cyan} strokeWidth="3" />
            </g>
          ))}
          <circle cx="300" cy="240" r="48" stroke={cyan} strokeWidth="2" strokeDasharray="6 8" opacity=".6" />
        </g>
      );
    case "two-worlds":
      return (
        <g fill="none">
          <circle cx="200" cy="200" r="100" fill="#0b2550" stroke={violet} strokeWidth="5" />
          <circle cx="400" cy="200" r="100" fill="#0b2550" stroke={cyan} strokeWidth="5" />
          <path d="M255 170Q300 140 345 170M255 230Q300 260 345 230" stroke="#b8ddff" strokeWidth="4" />
          <path d="M160 215l40-55 40 55z" fill={violet} opacity=".7" />
          <path d="M370 170h60v60h-60z" fill={cyan} opacity=".55" />
        </g>
      );
    case "collaboration":
      return (
        <g fill="none" strokeWidth="3">
          <rect x="120" y="70" width="360" height="230" rx="18" fill="#0b2550" stroke={blue} />
          {[[150, 100], [280, 100], [150, 200], [280, 200]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="110" height="70" rx="10" stroke={i === 1 ? violet : cyan} opacity=".85" />
          ))}
          <path d="M260 135h20M205 170v30M335 170v30" stroke="#b8ddff" />
          <circle cx="210" cy="345" r="22" fill={cyan} opacity=".7" />
          <circle cx="390" cy="345" r="22" fill={violet} opacity=".7" />
        </g>
      );
  }
}
