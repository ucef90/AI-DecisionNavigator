"use client";

import { useEffect } from "react";
import { FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";

// Bouton "Télécharger en PDF" générique : renomme document.title pour
// préfiller le nom de fichier proposé par le navigateur, puis appelle
// window.print(). Utilisable pour n'importe quelle page imprimable.

export function PrintPdfButton({ filename, label = "Télécharger en PDF" }: { filename: string; label?: string }) {
  useEffect(() => {
    const original = document.title;
    function before() {
      document.title = filename;
    }
    function after() {
      document.title = original;
    }
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      document.title = original;
    };
  }, [filename]);

  return (
    <Button
      type="button"
      onClick={() => window.print()}
      title='Choisis "Enregistrer en PDF" comme destination dans la boîte de dialogue.'
    >
      <FileDown className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}
