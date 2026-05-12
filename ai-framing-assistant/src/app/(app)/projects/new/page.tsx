import { NewProjectForm } from "@/components/projects/new-project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Nouveau projet</h2>
        <p className="text-sm text-muted-foreground">
          Étape 1 — saisis les informations de cadrage initiales. Tu pourras
          enrichir ensuite via le wizard guidé.
        </p>
      </div>

      <NewProjectForm />
    </div>
  );
}
