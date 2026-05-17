"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { mainNav, secondaryNav, type NavItem } from "@/lib/nav";

// Modern SaaS sidebar — deep navy fill, light items, hover translates the
// label 2px right and tints it blue. Active item gets the vibrant blue
// background with a pill 16px radius.

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

  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
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
  );
}
