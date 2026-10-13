import type { Avaliacao, ConfigEscola, Materia } from "../types";
import { MENSAGENS, analisarMateria, type AnaliseMateria } from "./classificacao";
import { formatarNumero as f } from "./numeros";

// Nota hipotética aceita: de 0 até a pontuação máxima da avaliação.
export function notaHipoteticaValida(nota: number, avaliacao: Avaliacao): boolean {
  return Number.isFinite(nota) && nota >= 0 && nota <= avaliacao.pontuacaoMaxima;
}

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
    const valida = typeof nota === "number" && notaHipoteticaValida(nota, a);
    return a.status === "pendente" && valida ? { ...a, status: "concluida", nota } : a;
  });
  return analisarMateria(materia, projetadas, config);
}

export interface DescricaoSimulacao {
  projetado: string;
  distancia: string;
  possivel: string | null; // null quando a meta já foi atingida
  restantes: string | null; // pendentes que ficaram sem nota hipotética
}

// Frases de um cenário simulado.
export function descreverSimulacao(analise: AnaliseMateria): DescricaoSimulacao {
  const atingida = analise.modo === "pontos" ? analise.metaAtingida : analise.metaGarantida;
  const possivel = atingida
    ? null
    : (analise.modo === "pontos" ? analise.possivel : analise.alcancavel)
      ? "Ainda dá pra chegar na meta"
      : "Com essas notas não dá pra chegar na meta";

  if (analise.modo === "pontos") {
    const distancia = atingida
      ? MENSAGENS.metaAtingida
      : analise.falta === 1
        ? "Falta 1 ponto"
        : `Faltam ${f(analise.falta)} pontos`;
    const restantes =
      !atingida && analise.disponiveis > 0
        ? `Nas que ficaram em branco: precisa de ${f(analise.falta)} dos ${f(analise.disponiveis)} pontos`
        : null;
    return { projetado: `${f(analise.obtidos)} pontos`, distancia, possivel, restantes };
  }

  const { mediaAtual, meta, notaNecessaria } = analise;
  let distancia: string;
  if (atingida) distancia = MENSAGENS.metaAtingida;
  else if (mediaAtual === null) distancia = `Sua meta é média ${f(meta)}`;
  else distancia = `Faltam ${f(Math.max(0, meta - mediaAtual))} pra média ${f(meta)}`;

  const restantes =
    !atingida && notaNecessaria !== null ? `Nas que ficaram em branco: precisa tirar ${f(notaNecessaria)}` : null;

  return {
    projetado: mediaAtual === null ? "Sem notas" : `Média ${f(mediaAtual)}`,
    distancia,
    possivel,
    restantes,
  };
}
