import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Modern SaaS buttons — vibrant blue primary, 44px touch target, 16px
// radius, bold 14px text. Hover lifts the surface via opacity shift
// rather than translation to keep the layout stable inside tables.

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-sans rounded-2xl transition-all outline-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-bold hover:bg-primary/90 active:bg-primary/95",
        outline:
          "bg-card text-foreground border border-border font-medium hover:border-primary hover:text-primary",
        secondary:
          "bg-secondary text-foreground font-medium hover:bg-accent",
        ghost:
          "bg-transparent text-foreground font-medium hover:bg-secondary hover:text-primary",
        destructive:
          "bg-destructive text-white font-bold hover:opacity-90",
        success:
          "bg-success text-success-foreground font-bold hover:opacity-90",
        link: "text-primary underline-offset-2 hover:underline px-0 py-0 h-auto rounded-none",
      },
      size: {
        default: "h-11 px-6 text-sm gap-2",
        sm: "h-9 px-4 text-sm gap-1.5",
        xs: "h-8 px-3 text-xs gap-1 rounded-xl",
        lg: "h-12 px-7 text-sm gap-2",
        icon: "h-11 w-11 rounded-2xl",
        "icon-sm": "h-9 w-9 rounded-xl",
        "icon-xs": "h-8 w-8 rounded-xl",
        "icon-lg": "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
