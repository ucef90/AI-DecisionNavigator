export default function SettingsPage() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Paramètres</h2>
      <p className="text-sm text-muted-foreground">
        Configuration : utilisateurs, rôles, providers IA, scoring.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Les options de configuration seront ajoutées à l&apos;étape suivante.
      </div>
    </div>
  );
}
