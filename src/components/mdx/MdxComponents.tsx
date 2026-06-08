import { type ComponentPropsWithoutRef } from "react";

import { AudioEmbed } from "@/components/resource/AudioEmbed";
import { ExternalImage } from "@/components/resource/ExternalImage";
import { PdfEmbed } from "@/components/resource/PdfEmbed";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { ResourceLink } from "@/components/resource/ResourceLink";
import { VideoEmbed } from "@/components/resource/VideoEmbed";

import { Callout } from "./Callout";
import { CheckpointBlock } from "./CheckpointBlock";
import { ExerciseBlock } from "./ExerciseBlock";
import { TemplateBlock } from "./TemplateBlock";

export const mdxComponents = {
  a: ({ className, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a
      className={`${className ?? ""} rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
      {...props}
    />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => {
    const isCodeBlock = className?.includes("language-");

    return (
      <code
        className={
          isCodeBlock
            ? className
            : `${className ?? ""} rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-foreground`
        }
        {...props}
      />
    );
  },
  pre: ({ className, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className={`${className ?? ""} not-prose overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-sm leading-7 text-slate-100 shadow-[0_16px_50px_-24px_rgba(0,0,0,0.45)]`}
      {...props}
    />
  ),
  AudioEmbed,
  Callout,
  CheckpointBlock,
  ExerciseBlock,
  ExternalImage,
  PdfEmbed,
  ResourceCard,
  ResourceLink,
  TemplateBlock,
  VideoEmbed,
};
