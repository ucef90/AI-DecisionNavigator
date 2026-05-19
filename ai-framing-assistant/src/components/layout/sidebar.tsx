"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, PanelLeftClose } from "lucide-react";

import { cn } from "@/lib/utils";
import { mainNav, secondaryNav, type NavItem } from "@/lib/nav";

// Sidebar SaaS — fond bleu marine, item actif en pilule bleue.
// Collapsible : un bouton "<<" en haut replie le panneau (largeur 0,
// invisible) ; quand replié, un bouton-burger flottant en haut à gauche
// réouvre la sidebar. L'état est persisté en localStorage.

const STORAGE_KEY = "sidebar:collapsed";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 mx-3 my-0.5 px-3 py-2.5 text-sm rounded-2xl transition-all",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-card"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white hover:translate-x-1 hover:no-underline",
      )}
    >
      <Icon className="size-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Hydratation initiale depuis localStorage — évite le flash de contenu.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "1") setCollapsed(true);
  }, []);

  // Persiste à chaque changement.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    }
  }, [collapsed]);

  return (
    <>
      {/* Bouton "ouvrir" flottant — visible UNIQUEMENT quand replié */}
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Afficher le menu"
          className="print:hidden fixed left-3 top-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md bg-sidebar text-sidebar-foreground shadow-lg hover:bg-sidebar-accent hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : null}

      <aside
        className={cn(
          "print:hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar w-72",
          collapsed ? "hidden" : "hidden md:flex",
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          {/* Logo cliquable — renvoie vers le dashboard (page d'accueil) */}
          <Link
            href="/dashboard"
            className="flex flex-1 items-center gap-3 rounded-md transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary/40"
            aria-label="Retour au dashboard"
          >
            <div className="flex size-10 shrink-0 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground font-display font-medium rounded-2xl text-base">
              AI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-white font-display">
                Decision Navigator
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                Cadrage IA · gouvernance
              </span>
            </div>
          </Link>

          {/* Bouton "réduire" */}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Réduire le menu"
            className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
            title="Réduire le menu"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0 py-4">
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </nav>

        <div className="border-t border-sidebar-border py-4">
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
