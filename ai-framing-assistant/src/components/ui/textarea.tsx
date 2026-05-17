import * as React from "react";

import { cn } from "@/lib/utils";

// Modern SaaS textarea — same treatment as Input (handled by globals.css).
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full px-4 py-2 text-sm placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
