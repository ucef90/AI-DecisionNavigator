"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Imprimer / PDF" }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer className="mr-2 size-4" />
      {label}
    </Button>
  );
}
