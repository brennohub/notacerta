interface BarraProgressoProps {
  /** Valor entre 0 e 1. Valores fora disso são limitados. */
  progresso: number;
  rotulo: string;
}

export function BarraProgresso({ progresso, rotulo }: BarraProgressoProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progresso)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-3 w-full overflow-hidden rounded-full bg-borda"
    >
      <div className="h-full rounded-full bg-destaque transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
