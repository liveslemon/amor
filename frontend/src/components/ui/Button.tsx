"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center shrink-0 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer font-sans",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-white/15 hover:border-white/25 hover:shadow-[0_6px_30px_rgba(0,0,0,0.35)]",

        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-lg",

        outline:
          "bg-transparent border border-white/10 text-white/90 hover:bg-white/5 hover:border-white/20",

        secondary:
          "bg-white text-black hover:bg-white/90 shadow-lg",

        ghost:
          "text-white hover:bg-white/10",

        link:
          "text-white underline-offset-4 hover:underline",

        premium:
          "bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-white border border-pink-400/20 backdrop-blur-md shadow-[0_8px_30px_rgba(236,72,153,0.15)] hover:from-pink-500/30 hover:to-violet-500/30 hover:border-pink-400/40 hover:shadow-[0_12px_40px_rgba(236,72,153,0.25)]",
      },

      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };