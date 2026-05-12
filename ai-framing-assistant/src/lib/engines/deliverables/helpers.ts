// Shared helpers for deliverable templates.
//
// Each generator is a pure function (EngineReport, ProjectSnapshot) → string.
// Helpers below centralise the bullet/section formatting so all deliverables
// keep a consistent voice.

import { DECISION_LABELS, type Decision } from "@/types";

export function bullets(items: readonly (string | null | undefined)[]): string {
  return items
    .map((s) => (s ?? "").trim())
    .filter((s) => s.length > 0)
    .map((s) => `- ${s}`)
    .join("\n");
}

// Renders a section only when content is non-empty — keeps deliverables free
// of dangling "Section vide" placeholders.
export function section(title: string, body: string | null | undefined): string {
  const content = (body ?? "").trim();
  if (!content) return "";
  return `## ${title}\n\n${content}\n`;
}

export function field(label: string, value: string | null | undefined): string {
  const v = (value ?? "").trim();
  return `- **${label} :** ${v.length > 0 ? v : "—"}`;
}

export function quote(text: string | null | undefined): string {
  const v = (text ?? "").trim();
  if (!v) return "—";
  return v
    .split(/\r?\n/)
    .map((l) => `> ${l}`)
    .join("\n");
}

export function asTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}`;
}

export function decisionBadge(d: Decision): string {
  switch (d) {
    case "GO_IA":
      return "🟢 **GO IA**";
    case "POC_IA":
      return "🔵 **POC IA**";
    case "AUTOMATION":
      return "🟡 **Automatisation simple**";
    case "STUDY":
      return "⚪ **Étude complémentaire**";
    case "NO_GO":
      return "🔴 **NO GO IA**";
    default:
      return `**${DECISION_LABELS[d]}**`;
  }
}

export function isoDate(d?: Date): string {
  return (d ?? new Date()).toISOString().slice(0, 10);
}

export function header(title: string, projectName: string): string {
  return `# ${title}

> Projet : **${projectName}**
> Généré le ${isoDate()} par AI Decision Navigator

---
`;
}

export function footer(): string {
  return `\n---\n\n_Document généré automatiquement à partir du cadrage saisi dans la plateforme. Tous les éléments restent à valider en gouvernance._\n`;
}
