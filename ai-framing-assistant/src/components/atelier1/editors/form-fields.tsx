"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpHint } from "@/components/ui/help-hint";
import { getHint } from "@/lib/field-hints";

// Helpers form réutilisés par tous les éditeurs. Évite la
// duplication des composants Field/SelectField/TextareaField.
//
// Chaque label peut afficher un petit "(i)" cliquable au survol —
// soit explicite via la prop `hint`, soit auto-trouvé dans
// FIELD_HINTS via l'attribut `name`.

type Option = { value: string; label: string };

function FieldLabel({ label, name, hint }: { label: string; name: string; hint?: string }) {
  const help = hint ?? getHint(name);
  return (
    <label className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span>{label}</span>
      {help ? <HelpHint hint={help} /> : null}
    </label>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  min,
  max,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <FieldLabel label={label} name={name} hint={hint} />
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Option[];
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <FieldLabel label={label} name={name} hint={hint} />
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextareaField({
  label,
  name,
  defaultValue,
  rows = 2,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <FieldLabel label={label} name={name} hint={hint} />
      <Textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="text-xs"
      />
    </div>
  );
}
