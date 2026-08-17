"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

/** The generated README leans on raw HTML for centering and stat cards, so the
 *  preview has to render it. rehype-raw parses it; this schema is what keeps
 *  that safe, since the source text ultimately comes from a GitHub profile. */
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "img", "p", "h1", "h3", "div"],
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "height",
      "width",
      "align",
    ],
    h1: [...(defaultSchema.attributes?.h1 ?? []), "align"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "align"],
    p: [...(defaultSchema.attributes?.p ?? []), "align"],
    div: [...(defaultSchema.attributes?.div ?? []), "align"],
  },
};

export function MarkdownPreview({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return (
      <p className="text-sm text-zinc-500">
        Every section is switched off — enable one to see a preview.
      </p>
    );
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
