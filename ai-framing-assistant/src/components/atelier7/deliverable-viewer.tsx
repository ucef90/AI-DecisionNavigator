"use client";

import { useState } from "react";
import { Copy, Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  markdown: string;
  projectName: string;
};

export function DeliverableViewer({ markdown, projectName }: Props) {
  const [view, setView] = useState<"preview" | "raw">("preview");
  const [copied, setCopied] = useState(false);

  function download() {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dossier-strategique-IA-${slug}-${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const wordCount = markdown.split(/\s+/).length;
  const lineCount = markdown.split("\n").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2">
        <div className="flex rounded-md border border-border bg-background p-0.5">
          <button
            type="button"
            onClick={() => setView("preview")}
            className={`rounded px-3 py-1 text-xs font-medium transition ${view === "preview" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Eye className="mr-1 inline h-3 w-3" />
            Aperçu
          </button>
          <button
            type="button"
            onClick={() => setView("raw")}
            className={`rounded px-3 py-1 text-xs font-medium transition ${view === "raw" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
          >
            Markdown brut
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {wordCount} mots · {lineCount} lignes
        </span>
        <div className="ml-auto flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={copyToClipboard}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            {copied ? "Copié !" : "Copier"}
          </Button>
          <Button type="button" size="sm" onClick={download}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Télécharger .md
          </Button>
        </div>
      </div>

      {view === "preview" ? (
        <PreviewMarkdown content={markdown} />
      ) : (
        <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-4 text-xs leading-relaxed">
          <code>{markdown}</code>
        </pre>
      )}
    </div>
  );
}

// Rendu markdown extrêmement simple — pas de lib externe. On affiche
// le markdown brut joliment formaté avec un peu de styling sur les
// titres / paragraphes. Suffisant pour l'aperçu visuel ; le téléchargement
// reste fidèle.
function PreviewMarkdown({ content }: { content: string }) {
  // On split par blocs pour appliquer des classes différentes
  const blocks = content.split(/\n\n+/);

  return (
    <article className="prose-styles max-w-none rounded-md border border-border bg-background p-6 text-sm leading-relaxed">
      {blocks.map((block, i) => renderBlock(block, i))}
    </article>
  );
}

function renderBlock(block: string, key: number): React.ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;

  // H1
  if (trimmed.startsWith("# ")) {
    return (
      <h1 key={key} className="mt-6 mb-3 text-2xl font-bold tracking-tight first:mt-0">
        {trimmed.slice(2)}
      </h1>
    );
  }
  // H2
  if (trimmed.startsWith("## ")) {
    return (
      <h2 key={key} className="mt-6 mb-2 border-b border-border pb-1 text-lg font-semibold tracking-tight">
        {trimmed.slice(3)}
      </h2>
    );
  }
  // H3
  if (trimmed.startsWith("### ")) {
    return (
      <h3 key={key} className="mt-4 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {trimmed.slice(4)}
      </h3>
    );
  }
  // Table (markdown)
  if (trimmed.includes("|") && /^\|.*\|$/m.test(trimmed)) {
    return <RenderTable key={key} block={trimmed} />;
  }
  // Quote
  if (trimmed.startsWith("> ")) {
    return (
      <blockquote
        key={key}
        className="my-2 border-l-2 border-amber-500/40 bg-amber-50/40 px-3 py-1 text-xs italic text-amber-900 dark:bg-amber-950/20 dark:text-amber-200"
      >
        {trimmed.slice(2)}
      </blockquote>
    );
  }
  // HR
  if (trimmed === "---") {
    return <hr key={key} className="my-4 border-border" />;
  }
  // List
  if (/^- /m.test(trimmed)) {
    const items = trimmed.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
    return (
      <ul key={key} className="my-2 ml-5 list-disc space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i}>{inlineMd(it)}</li>
        ))}
      </ul>
    );
  }
  // Default paragraph
  return (
    <p key={key} className="my-2 text-sm leading-relaxed">
      {inlineMd(trimmed)}
    </p>
  );
}

// Inline markdown : bold, italic, code
function inlineMd(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/_(.+?)_/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const matches = [
      boldMatch ? { type: "bold", m: boldMatch } : null,
      italicMatch ? { type: "italic", m: italicMatch } : null,
      codeMatch ? { type: "code", m: codeMatch } : null,
    ].filter((x): x is { type: string; m: RegExpMatchArray } => x !== null);
    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }
    matches.sort((a, b) => (a.m.index ?? 0) - (b.m.index ?? 0));
    const first = matches[0];
    const fIdx = first.m.index ?? 0;
    if (fIdx > 0) parts.push(remaining.slice(0, fIdx));
    if (first.type === "bold") parts.push(<strong key={idx++}>{first.m[1]}</strong>);
    else if (first.type === "italic") parts.push(<em key={idx++}>{first.m[1]}</em>);
    else if (first.type === "code") parts.push(<code key={idx++} className="rounded bg-muted px-1 py-0.5 text-[11px]">{first.m[1]}</code>);
    remaining = remaining.slice(fIdx + first.m[0].length);
  }
  return parts;
}

function RenderTable({ block }: { block: string }) {
  const lines = block.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return <pre>{block}</pre>;
  const headers = lines[0].split("|").map((h) => h.trim()).filter(Boolean);
  // Skip separator line (---)
  const bodyRows = lines.slice(2).map((row) => row.split("|").map((c) => c.trim()).filter((c, i, arr) => !(i === 0 && c === "") && !(i === arr.length - 1 && c === "")));

  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {headers.map((h, i) => (
              <th key={i} className="px-2 py-1.5 text-left font-semibold">{inlineMd(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, i) => (
            <tr key={i} className="border-b border-border/60">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1.5">{inlineMd(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
