import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Pill-shaped badge with 16px radius. Semantic variants tap directly into
// the token palette : default = accent / blue, success, warning, destructive.

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap px-3 py-1 text-xs font-bold leading-4 rounded-2xl transition-colors [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-accent text-primary",
        primary: "bg-primary text-primary-foreground",
        outline: "bg-transparent text-primary border border-primary",
        success: "bg-[color-mix(in_oklab,var(--success)_15%,white)] text-success",
        warning: "bg-[color-mix(in_oklab,var(--warning)_18%,white)] text-warning",
        destructive: "bg-[color-mix(in_oklab,var(--destructive)_15%,white)] text-destructive",
        muted: "bg-secondary text-muted-foreground",
        ghost: "bg-transparent text-muted-foreground",
        secondary: "bg-secondary text-foreground border border-border/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
