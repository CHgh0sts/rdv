"use client";

import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-light",
    secondary:
      "border border-border bg-surface text-foreground hover:border-brand hover:text-brand",
    ghost: "text-muted hover:text-brand",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
