import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { HelpFab } from "@/components/help/help-fab";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={150}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <HelpFab />
    </TooltipProvider>
  );
}
