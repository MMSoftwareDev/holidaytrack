import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--brand-text-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-purple)]/20 focus-visible:border-[var(--brand-border-f)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{ borderColor: "var(--brand-border)", fontFamily: "Inter, sans-serif" }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
