import { mdxComponents } from "@/components/mdx/MdxComponents";
import { getMDXComponent } from "@/lib/content/mdx";
import { createElement } from "react";

type LessonContentProps = {
  code: string;
};

export function LessonContent({ code }: LessonContentProps) {
  const MDXContent = getMDXComponent(code);

  return (
    <article className="rounded-[2rem] border border-border bg-card p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
      <div className="prose prose-slate mx-auto max-w-[76ch] text-slate-700 sm:prose-lg prose-headings:font-semibold prose-headings:tracking-normal prose-headings:text-foreground prose-h2:mt-14 prose-h2:scroll-mt-28 prose-h2:border-t prose-h2:border-border prose-h2:pt-8 prose-h3:mt-10 prose-h3:text-xl prose-p:leading-8 prose-a:font-semibold prose-a:text-primary prose-a:decoration-primary/30 prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-strong:text-foreground prose-code:rounded-md prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.95em] prose-code:font-medium prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:marker:text-muted-foreground prose-blockquote:rounded-r-2xl prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:text-slate-700 prose-table:my-10 prose-table:block prose-table:w-full prose-table:overflow-x-auto prose-th:border prose-th:border-border prose-th:bg-primary/5 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-foreground prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3 prose-img:rounded-2xl prose-img:border prose-img:border-border">
        {createElement(MDXContent, { components: mdxComponents })}
      </div>
    </article>
  );
}
