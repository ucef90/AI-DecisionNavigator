// Modern SaaS header — white card-like surface that floats above the
// near-white content background. Sits at 72px to balance the 80px sidebar.

export function Header({ title }: { title?: string }) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border/70 bg-card px-8">
      <h1 className="text-base font-medium font-display" style={{ color: "var(--navy)" }}>
        {title ?? "AI Decision Navigator"}
      </h1>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="hidden sm:inline">Plateforme de cadrage et décision IA</span>
        <span className="inline-flex items-center justify-center bg-accent text-primary px-3 py-1 text-xs font-bold rounded-2xl">
          v0.1
        </span>
      </div>
    </header>
  );
}
