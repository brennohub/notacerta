import type { Avaliacao, ConfigEscola, Materia } from "../types";
import { analisarMateria, type AnaliseMateria } from "./classificacao";

// "E se eu tirar...?" (seção 8).
// Recebe notas hipotéticas para avaliações PENDENTES (id → nota) e devolve a análise projetada.
// Trabalha em cópias: os dados originais nunca são alterados.
// Notas fora do intervalo 0..máximo são ignoradas (a avaliação continua pendente).
export function simular(
  materia: Materia,
  avaliacoes: Avaliacao[],
  config: ConfigEscola,
  notasHipoteticas: Record<string, number>,
): AnaliseMateria {
  const projetadas = avaliacoes.map((a): Avaliacao => {
    const nota = notasHipoteticas[a.id];
    const valida = typeof nota === "number" && Number.isFinite(nota) && nota >= 0 && nota <= a.pontuacaoMaxima;
    return a.status === "pendente" && valida ? { ...a, status: "concluida", nota } : a;
  });
  return analisarMateria(materia, projetadas, config);
}
