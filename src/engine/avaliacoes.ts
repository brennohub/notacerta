import type { Avaliacao, ConfigEscola } from "../types";

// Protege as avaliações já cadastradas quando a configuração da escola muda.
// Devolve mensagens por campo; vazio = pode salvar.
export function validarMudancaConfig(
  antiga: ConfigEscola | null,
  nova: ConfigEscola,
  avaliacoes: Avaliacao[],
): Partial<Record<"modo" | "notaMaxima", string>> {
  if (!antiga || avaliacoes.length === 0) return {};

  if (antiga.modo !== nova.modo) {
    return {
      modo: "Pra trocar o jeito de calcular, remova antes as avaliações cadastradas. Os números não valem na outra escala.",
    };
  }

  if (nova.modo === "media" && nova.notaMaxima !== undefined) {
    const maiorNota = Math.max(...avaliacoes.map((a) => a.nota ?? 0));
    if (maiorNota > nova.notaMaxima) {
      return { notaMaxima: "Você já tem nota maior que essa nota máxima. Confere os valores?" };
    }
  }

  return {};
}

// No modo média todas as avaliações usam a nota máxima da escola como escala.
export function ajustarAvaliacoesComConfig(avaliacoes: Avaliacao[], config: ConfigEscola): Avaliacao[] {
  if (config.modo !== "media" || config.notaMaxima === undefined) return avaliacoes;
  const notaMaxima = config.notaMaxima;
  return avaliacoes.map((a) => (a.pontuacaoMaxima === notaMaxima ? a : { ...a, pontuacaoMaxima: notaMaxima }));
}
