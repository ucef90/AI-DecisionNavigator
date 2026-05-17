import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

// Modern SaaS input — 16px radius, lavender border, blue focus ring.
// Most of the visual styling lives in globals.css `input` rule ; this
// component just sets sizing.

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 px-4 py-2 text-sm placeholder:text-muted-foreground",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
