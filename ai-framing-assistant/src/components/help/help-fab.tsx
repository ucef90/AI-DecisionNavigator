"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Floating Action Button (FAB) d'aide — toujours visible bas-droite.
// Auto-masqué sur /help (sinon doublon) et à l'impression. Le sidebar
// n'étant pas visible sur mobile, ce bouton garantit l'accès au manuel
// depuis n'importe quel écran.
export function HelpFab() {
  const pathname = usePathname();
  if (pathname?.startsWith("/help")) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href="/help"
            aria-label="Manuel utilisateur"
            className="print:hidden fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition hover:scale-105 hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            <HelpCircle className="h-6 w-6" />
          </Link>
        }
      />
      <TooltipContent side="left" className="max-w-xs">
        Manuel utilisateur — comprendre l&apos;app, par où commencer, FAQ.
      </TooltipContent>
    </Tooltip>
  );
}
