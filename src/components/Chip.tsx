import type { ButtonHTMLAttributes } from "react";

export function Chip({ className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`min-h-11 rounded-full border border-borda bg-card px-4 text-sm font-medium text-texto transition active:border-destaque active:text-destaque ${className}`}
      {...props}
    />
  );
}
