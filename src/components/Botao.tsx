import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "perigo";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

const estilos: Record<Variante, string> = {
  primario: "bg-destaque text-fundo active:brightness-90",
  secundario: "border border-borda bg-card text-texto active:bg-borda",
  perigo: "bg-reagir text-fundo active:brightness-90",
};

// Botão com altura mínima de 48px (alvo de toque confortável no celular/tablet).
export function Botao({ variante = "primario", className = "", type = "button", ...props }: BotaoProps) {
  return (
    <button
      type={type}
      className={`min-h-12 w-full rounded-xl px-5 py-3 text-base font-semibold transition disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}
