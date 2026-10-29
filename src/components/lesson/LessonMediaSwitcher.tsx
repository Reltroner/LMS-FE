"use client";

import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type HTMLAttributeReferrerPolicy,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { LessonMediaFormat, LessonMediaView } from "@/lib/content/lesson-media";
import {
  BookIcon,
  ExternalLinkIcon,
  HeadphonesIcon,
  ImageIcon,
  LayersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

type Format = "reading" | LessonMediaFormat;

const formatTabs: Record<Format, { label: string; icon: typeof BookIcon }> = {
  reading: { label: "Reading", icon: BookIcon },
  video: { label: "Watch Video", icon: VideoIcon },
  audio: { label: "Listen to Audio", icon: HeadphonesIcon },
  slides: { label: "View Slides", icon: LayersIcon },
  infographic: { label: "View Infographic", icon: ImageIcon },
};

// Least privilege per provider. Autoplay is never delegated: playback needs a click inside the player.
const playerFrames = {
  video: {
    name: "YouTube player",
    linkLabel: "Watch on YouTube",
    className: "aspect-video",
    allow: "clipboard-write; encrypted-media; picture-in-picture",
    sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation",
  },
  audio: {
    name: "Spotify player",
    linkLabel: "Listen on Spotify",
    className: "h-[152px]",
    allow: "clipboard-write; encrypted-media; picture-in-picture",
    sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
  },
};

const focusTargets: Record<string, (index: number, last: number) => number> = {
  ArrowRight: (index, last) => (index === last ? 0 : index + 1),
  ArrowLeft: (index, last) => (index === 0 ? last : index - 1),
  Home: () => 0,
  End: (_index, last) => last,
};

// Reading stays mounted. An external player exists only while its tab is selected, so nothing
// third-party loads during Reading and switching away unmounts (and stops) the previous player.
// Tabs use manual activation: arrow keys move focus without loading media.
export function LessonMediaSwitcher({ media, lessonTitle, children }: {
  media: readonly LessonMediaView[];
  lessonTitle: string;
  children: ReactNode;
}) {
  const id = useId();
  const [selected, setSelected] = useState<Format>("reading");
  if (media.length === 0) return children;
  const tabs: Format[] = ["reading", ...media.map((view) => view.format)];

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const target = focusTargets[event.key]?.(index, tabs.length - 1);
    if (target === undefined) return;
    event.preventDefault();
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[target]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Lesson formats" className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((format, index) => {
          const { label, icon: Icon } = formatTabs[format];
          const isActive = format === selected;
          return (
            <button
              key={format}
              type="button"
              role="tab"
              id={`${id}-tab-${format}`}
              aria-selected={isActive}
              aria-controls={`${id}-panel-${format}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSelected(format)}
              onKeyDown={(event) => moveFocus(event, index)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
              )}
            >
              <Icon width={14} height={14} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-reading`}
        aria-labelledby={`${id}-tab-reading`}
        hidden={selected !== "reading"}
        tabIndex={0}
        className="mt-6"
      >
        {children}
      </div>
      {media.map((view) => (
        <div
          key={view.format}
          role="tabpanel"
          id={`${id}-panel-${view.format}`}
          aria-labelledby={`${id}-tab-${view.format}`}
          hidden={selected !== view.format}
          tabIndex={0}
          className="mt-6"
        >
          {selected === view.format && <LessonMediaPanel view={view} lessonTitle={lessonTitle} />}
        </div>
      ))}
    </div>
  );
}

// Provider adapter for one selected format. Every URL arrives pre-built by lesson-media.ts.
export function LessonMediaPanel({ view, lessonTitle }: { view: LessonMediaView; lessonTitle: string }) {
  switch (view.format) {
    case "video":
    case "audio": {
      const frame = playerFrames[view.format];
      return (
        <MediaFrame
          src={view.embedUrl}
          title={`${view.format === "video" ? "Video" : "Audio"}: ${lessonTitle}`}
          name={frame.name}
          className={frame.className}
          allow={frame.allow}
          sandbox={frame.sandbox}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          link={{ href: view.externalUrl, label: frame.linkLabel }}
        />
      );
    }
    case "slides":
      return <SlidesViewer view={view} title={`Slides: ${lessonTitle}`} />;
    case "infographic":
      return <Infographic view={view} />;
  }
}

const subscribeNever = () => () => {};

function SlidesViewer({ view, title }: { view: Extract<LessonMediaView, { format: "slides" }>; title: string }) {
  // Browsers without a built-in PDF viewer (most mobile ones) get the direct link, not a blank frame.
  // Chromium refuses to render PDFs in sandboxed frames, so this frame is restricted by its fixed CDN origin instead.
  const inline = useSyncExternalStore(subscribeNever, () => navigator.pdfViewerEnabled !== false, () => true);
  const link = { href: view.url, label: "Open slides (PDF) in a new tab" };
  if (!inline) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="m-0 text-sm text-muted-foreground">This browser cannot display PDF slides inside the page.</p>
        <MediaFooter message="" link={link} source={view.source} />
      </div>
    );
  }
  return (
    <MediaFrame
      src={view.url}
      title={title}
      name="slides"
      className="h-[min(80vh,56rem)] min-h-96"
      referrerPolicy="no-referrer"
      link={link}
      source={view.source}
    />
  );
}

function MediaFrame({ src, title, name, className, allow, sandbox, allowFullScreen, referrerPolicy, link, source }: {
  src: string;
  title: string;
  name: string;
  className: string;
  allow?: string;
  sandbox?: string;
  allowFullScreen?: boolean;
  referrerPolicy: HTMLAttributeReferrerPolicy;
  link: { href: string; label: string };
  source?: string;
}) {
  // A load event only proves the frame responded, not that playback works; the direct link always stays.
  const [status, setStatus] = useState<"loading" | "slow" | "ready">("loading");
  useEffect(() => {
    const timer = window.setTimeout(() => setStatus((current) => (current === "loading" ? "slow" : current)), 15_000);
    return () => window.clearTimeout(timer);
  }, []);
  const message = {
    loading: `Loading the ${name}…`,
    slow: `The ${name} is taking longer than expected. You can open it directly instead.`,
    ready: "",
  }[status];
  return (
    <div>
      <div className={cn("relative w-full overflow-hidden rounded-2xl bg-background-elevated ring-1 ring-border", className)}>
        {status !== "ready" && <div aria-hidden className="absolute inset-0 animate-pulse bg-muted-foreground/10" />}
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow={allow}
          sandbox={sandbox}
          allowFullScreen={allowFullScreen}
          referrerPolicy={referrerPolicy}
          onLoad={() => setStatus("ready")}
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <MediaFooter message={message} link={link} source={source} />
    </div>
  );
}

function Infographic({ view }: { view: Extract<LessonMediaView, { format: "infographic" }> }) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const message = {
    loading: "Loading the infographic…",
    ready: "",
    failed: "The infographic could not be loaded here. Open the full-resolution image instead.",
  }[status];
  return (
    <div>
      {status !== "failed" && (
        <div className="relative overflow-hidden rounded-2xl bg-background-elevated ring-1 ring-border">
          {status === "loading" && <div aria-hidden className="absolute inset-0 animate-pulse bg-muted-foreground/10" />}
          {/* eslint-disable-next-line @next/next/no-img-element -- static export disables image optimization; next/image would only add client runtime */}
          <img
            src={view.url}
            alt={view.alt}
            width={view.width}
            height={view.height}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("failed")}
            className="relative h-auto w-full"
          />
        </div>
      )}
      <MediaFooter message={message} link={{ href: view.url, label: "Open full-resolution image" }} source={view.source} />
    </div>
  );
}

function MediaFooter({ message, link, source }: {
  message: string;
  link: { href: string; label: string };
  source?: string;
}) {
  return (
    <div className="mt-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span role="status">{message}</span>
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-6 items-center gap-1.5 font-medium text-primary hover:underline"
        >
          {link.label}
          <ExternalLinkIcon width={14} height={14} aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      {source && <p className="mt-1 text-xs">Source: {source} via jsDelivr</p>}
    </div>
  );
}
