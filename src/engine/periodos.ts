import type { TipoPeriodo } from "../types";

const quantidade: Record<TipoPeriodo, number> = { bimestre: 4, trimestre: 3, semestre: 2 };

// Lista os períodos do ano para o tipo escolhido: "1º trimestre", "2º trimestre"...
export function opcoesPeriodo(tipo: TipoPeriodo): string[] {
  return Array.from({ length: quantidade[tipo] }, (_, i) => `${i + 1}º ${tipo}`);
}
