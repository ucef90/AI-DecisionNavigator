"use client";

import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Small "i" icon next to a form Label. Hover (or focus / tap on touch
// devices) reveals the explanation. The button is keyboard-accessible.
export function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="Aide"
            className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Info className="size-3.5" />
          </button>
        }
      />
      <TooltipContent className="max-w-sm whitespace-normal text-left leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
