import type { Avaliacao } from "../types";

// ---------- Modo pontos (seção 7.1) ----------

export interface ResultadoPontos {
  obtidos: number; // soma das notas das concluídas
  disponiveis: number; // soma do máximo das pendentes
  falta: number; // quanto falta para a meta (nunca negativo)
  possivel: boolean; // ainda dá pra chegar na meta com as pendentes?
  metaAtingida: boolean;
}

export function calcularPontos(avaliacoes: Avaliacao[], meta: number): ResultadoPontos {
  let obtidos = 0;
  let disponiveis = 0;

  for (const a of avaliacoes) {
    if (a.status === "concluida") obtidos += a.nota ?? 0;
    if (a.status === "pendente") disponiveis += a.pontuacaoMaxima;
    // "nao_realizada" não soma pontos e não fica disponível.
  }

  const falta = Math.max(0, meta - obtidos);
  return {
    obtidos,
    disponiveis,
    falta,
    possivel: obtidos + disponiveis >= meta,
    metaAtingida: falta === 0,
  };
}

// ---------- Modo média ponderada (seção 7.2) ----------

export interface ResultadoMedia {
  mediaAtual: number | null; // null quando ainda não há nenhuma nota
  notaNecessaria: number | null; // nota igual em todas as pendentes; null se não há pendentes
  metaGarantida: boolean;
  alcancavel: boolean; // dá pra chegar na meta sem passar da nota máxima?
}

export function calcularMedia(avaliacoes: Avaliacao[], mediaMeta: number, notaMaxima: number): ResultadoMedia {
  let somaNotaPeso = 0;
  let pesoComNota = 0;
  let pesoPendente = 0;

  for (const a of avaliacoes) {
    const peso = a.peso ?? 1;
    if (a.status === "concluida") {
      somaNotaPeso += (a.nota ?? 0) * peso;
      pesoComNota += peso;
    } else if (a.status === "nao_realizada") {
      // [DECISÃO PADRÃO] conta como nota 0 e o peso entra no total.
      pesoComNota += peso;
    } else {
      pesoPendente += peso;
    }
  }

  const mediaAtual = pesoComNota > 0 ? somaNotaPeso / pesoComNota : null;

  if (pesoPendente === 0) {
    const metaGarantida = mediaAtual !== null && mediaAtual >= mediaMeta;
    return { mediaAtual, notaNecessaria: null, metaGarantida, alcancavel: metaGarantida };
  }

  const pesoTotal = pesoComNota + pesoPendente;
  const notaNecessaria = (mediaMeta * pesoTotal - somaNotaPeso) / pesoPendente;
  return {
    mediaAtual,
    notaNecessaria,
    metaGarantida: notaNecessaria <= 0,
    alcancavel: notaNecessaria <= notaMaxima,
  };
}
