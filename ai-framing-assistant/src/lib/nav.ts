import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projets", href: "/projects", icon: FolderKanban },
  { label: "Nouveau projet", href: "/projects/new", icon: PlusCircle },
];

export const secondaryNav: NavItem[] = [
  { label: "Manuel", href: "/help", icon: BookOpen },
  { label: "Paramètres", href: "/settings", icon: Settings },
];
