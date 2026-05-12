export function Header({ title }: { title?: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-sm font-medium text-foreground/80">
        {title ?? "AI Project Framing Assistant"}
      </h1>
      <div className="text-xs text-muted-foreground">v0.1.0</div>
    </header>
  );
}
