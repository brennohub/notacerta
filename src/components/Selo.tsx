import type { Classificacao } from "../types";

const config: Record<Classificacao, { texto: string; classes: string }> = {
  sem_diagnostico: { texto: "Sem diagnóstico", classes: "bg-borda text-texto-secundario" },
  suave: { texto: "Tá suave", classes: "bg-suave/15 text-suave" },
  olho: { texto: "Fica de olho", classes: "bg-olho/15 text-olho" },
  reagir: { texto: "Precisa reagir", classes: "bg-reagir/15 text-reagir" },
};

export function Selo({ classificacao }: { classificacao: Classificacao }) {
  const { texto, classes } = config[classificacao];
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${classes}`}>{texto}</span>;
}
