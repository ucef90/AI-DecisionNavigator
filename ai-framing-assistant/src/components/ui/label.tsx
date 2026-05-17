"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Modern SaaS label — 13px navy, sits above the field with 6px margin.

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-foreground select-none mb-1.5 leading-5",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
