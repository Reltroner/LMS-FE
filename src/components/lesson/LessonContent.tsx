"use client";

import { mdxComponents } from "@/components/mdx/MdxComponents";
import { getMDXComponent } from "next-contentlayer/hooks";
import { createElement, useMemo } from "react";

type LessonContentProps = {
  code: string;
};

export function LessonContent({ code }: LessonContentProps) {
  const MDXContent = useMemo(() => getMDXComponent(code), [code]);

  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_-48px_rgba(24,24,27,0.35)] sm:p-8 lg:p-10">
      <div className="prose prose-zinc max-w-none text-zinc-700 sm:prose-lg prose-headings:font-semibold prose-headings:tracking-normal prose-headings:text-zinc-950 prose-h2:mt-14 prose-h2:scroll-mt-28 prose-h2:border-t prose-h2:border-zinc-200 prose-h2:pt-8 prose-h3:mt-10 prose-h3:text-xl prose-p:leading-8 prose-a:font-semibold prose-a:text-zinc-950 prose-a:decoration-zinc-300 prose-a:underline-offset-4 hover:prose-a:text-zinc-700 prose-strong:text-zinc-950 prose-code:rounded-md prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.95em] prose-code:font-medium prose-code:text-zinc-950 prose-code:before:content-none prose-code:after:content-none prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:marker:text-zinc-400 prose-blockquote:border-l-zinc-300 prose-blockquote:text-zinc-700 prose-table:my-10 prose-table:w-full prose-th:border prose-th:border-zinc-200 prose-th:bg-zinc-50 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-zinc-950 prose-td:border prose-td:border-zinc-200 prose-td:px-4 prose-td:py-3 prose-img:rounded-2xl prose-img:border prose-img:border-zinc-200">
        {createElement(MDXContent, { components: mdxComponents })}
      </div>
    </article>
  );
}
