import { describe, expect, it } from "vitest";
import type { Avaliacao, ConfigEscola, Materia, StatusAvaliacao } from "../types";
import {
  MENSAGENS,
  analisarMateria,
  avisoSomaAvaliacoes,
  calcularPontos,
  lerNumero,
  simular,
  validarAvaliacao,
  validarConfig,
} from "./index";

// ---------- Ajudantes para montar dados de teste ----------

let proximoId = 1;
function avaliacao(status: StatusAvaliacao, pontuacaoMaxima: number, nota: number | null, peso?: number): Avaliacao {
  return {
    id: `a${proximoId++}`,
    materiaId: "mat",
    nome: "Avaliação",
    tipo: "prova",
    pontuacaoMaxima,
    nota,
    peso,
    status,
  };
}

function materia(meta: number, totalPontos?: number): Materia {
  return { id: "mat", nome: "Matemática", periodoId: "p1", meta, totalPontos };
}

function configPontos(totalPeriodo: number, metaPeriodo: number, temRecuperacao = false): ConfigEscola {
  return {
    serie: "2º ano",
    tipoPeriodo: "trimestre",
    periodoAtual: "1º trimestre",
    modo: "pontos",
    totalPeriodo,
    metaPeriodo,
    temRecuperacao,
  };
}

function configMedia(notaMaxima: number, mediaMeta: number): ConfigEscola {
  return {
    serie: "2º ano",
    tipoPeriodo: "bimestre",
    periodoAtual: "1º bimestre",
    modo: "media",
    notaMaxima,
    mediaMeta,
    temRecuperacao: false,
  };
}

// ---------- Seção 9: modo pontos ----------

describe("Modo pontos", () => {
  it("9.1 — meta 18, total 30, obtidos 12, disponíveis 18 → falta 6, possível, r = 0,33, Tá suave", () => {
    const avs = [avaliacao("concluida", 12, 12), avaliacao("pendente", 18, null)];
    const r = analisarMateria(materia(18, 30), avs, configPontos(30, 18));
    if (r.modo !== "pontos") throw new Error("modo errado");
    expect(r.obtidos).toBe(12);
    expect(r.disponiveis).toBe(18);
    expect(r.falta).toBe(6);
    expect(r.possivel).toBe(true);
    expect(r.razao).toBeCloseTo(0.33, 2);
    expect(r.classificacao).toBe("suave");
    expect(r.metaAtingida).toBe(false);
    expect(r.mensagem).not.toBe(MENSAGENS.metaAtingida);
    expect(r.motivo).toBe("Você precisa de 6 dos 18 pontos que ainda estão disponíveis.");
  });

  it("9.2 — meta 18 com total 10 → configuração bloqueada com mensagem", () => {
    const v = validarConfig(configPontos(10, 18));
    expect(v.valido).toBe(false);
    expect(v.erros.metaPeriodo).toBe("Sua meta passou do total de pontos possíveis. Confere os valores?");
  });

  it("9.3 — meta 18, obtidos 18 → falta 0, meta atingida", () => {
    const avs = [avaliacao("concluida", 20, 18), avaliacao("pendente", 10, null)];
    const r = analisarMateria(materia(18, 30), avs, configPontos(30, 18));
    if (r.modo !== "pontos") throw new Error("modo errado");
    expect(r.falta).toBe(0);
    expect(r.metaAtingida).toBe(true);
    expect(r.classificacao).toBe("suave");
    expect(r.mensagem).toBe(MENSAGENS.metaAtingida);
  });

  it("9.4 — meta 18, obtidos 5, disponíveis 10 → falta 13, impossível, Precisa reagir", () => {
    const avs = [avaliacao("concluida", 10, 5), avaliacao("pendente", 10, null)];
    const r = analisarMateria(materia(18, 30), avs, configPontos(30, 18));
    if (r.modo !== "pontos") throw new Error("modo errado");
    expect(r.falta).toBe(13);
    expect(r.possivel).toBe(false);
    expect(r.classificacao).toBe("reagir");
    expect(r.mensagem).toBe(MENSAGENS.impossivelSemRecuperacao);
  });

  it("9.4b — mesmo caso com recuperação → mensagem sobre recuperação", () => {
    const avs = [avaliacao("concluida", 10, 5), avaliacao("pendente", 10, null)];
    const r = analisarMateria(materia(18, 30), avs, configPontos(30, 18, true));
    expect(r.classificacao).toBe("reagir");
    expect(r.mensagem).toBe(MENSAGENS.impossivelComRecuperacao);
  });

  it("9.5 — pendente com máximo 10 não altera obtidos e soma 10 em disponíveis", () => {
    const r = calcularPontos([avaliacao("concluida", 10, 7), avaliacao("pendente", 10, null)], 18);
    expect(r.obtidos).toBe(7);
    expect(r.disponiveis).toBe(10);
  });

  it("9.6 — concluída com nota 0 conta como 0; pendente sem nota não conta", () => {
    const zero = avaliacao("concluida", 10, 0);
    const pendente = avaliacao("pendente", 10, null);
    expect(validarAvaliacao(zero, "pontos").valido).toBe(true);
    expect(validarAvaliacao(pendente, "pontos").valido).toBe(true);
    const r = calcularPontos([zero, pendente], 18);
    expect(r.obtidos).toBe(0);
    expect(r.disponiveis).toBe(10);
    // Sem nota ≠ nota zero: concluída sem nota é rejeitada.
    expect(validarAvaliacao(avaliacao("concluida", 10, null), "pontos").erros.nota).toBeDefined();
  });

  it("9.7 — nota 11 em avaliação de máximo 10 é rejeitada; nota -1 é rejeitada", () => {
    expect(validarAvaliacao(avaliacao("concluida", 10, 11), "pontos").valido).toBe(false);
    expect(validarAvaliacao(avaliacao("concluida", 10, -1), "pontos").valido).toBe(false);
    expect(validarAvaliacao(avaliacao("concluida", 10, 10), "pontos").valido).toBe(true);
  });

  it("9.8 — limite: falta 6, disponíveis 10 → r = 0,6 → Tá suave", () => {
    const avs = [avaliacao("concluida", 12, 12), avaliacao("pendente", 10, null)];
    const r = analisarMateria(materia(18, 30), avs, configPontos(30, 18));
    expect(r.razao).toBe(0.6);
    expect(r.classificacao).toBe("suave");
  });

  it("9.9 — avaliação não realizada não soma em obtidos nem em disponíveis", () => {
    const r = calcularPontos([avaliacao("nao_realizada", 10, null), avaliacao("concluida", 10, 4)], 18);
    expect(r.obtidos).toBe(4);
    expect(r.disponiveis).toBe(0);
  });

  it("9.10 — soma das avaliações maior que o total gera aviso, mas não bloqueia", () => {
    const avs = [avaliacao("concluida", 20, 15), avaliacao("pendente", 15, null)];
    expect(avisoSomaAvaliacoes(avs, 30)).toBe(
      "A soma das avaliações passou do total da matéria. Confere se digitou certo.",
    );
    expect(avs.every((a) => validarAvaliacao(a, "pontos").valido)).toBe(true);
    expect(avisoSomaAvaliacoes(avs, 35)).toBeNull();
  });
});

// ---------- Seção 9: modo média ----------

describe("Modo média", () => {
  it("9.11 — P1 nota 5 peso 2, P2 pendente peso 3, meta 6 → média 5, necessária 6,67, Fica de olho", () => {
    const avs = [avaliacao("concluida", 10, 5, 2), avaliacao("pendente", 10, null, 3)];
    const r = analisarMateria(materia(6), avs, configMedia(10, 6));
    if (r.modo !== "media") throw new Error("modo errado");
    expect(r.mediaAtual).toBe(5);
    expect(r.notaNecessaria).toBeCloseTo(6.67, 2);
    expect(r.razao).toBeCloseTo(0.667, 3);
    expect(r.classificacao).toBe("olho");
    expect(r.motivo).toBe("Você precisa tirar 6,67 de 10 nas avaliações pendentes para chegar na média 6.");
  });

  it("9.12 — P1 nota 10 peso 4, P2 pendente peso 1 → nota necessária ≤ 0, meta garantida", () => {
    const avs = [avaliacao("concluida", 10, 10, 4), avaliacao("pendente", 10, null, 1)];
    const r = analisarMateria(materia(6), avs, configMedia(10, 6));
    if (r.modo !== "media") throw new Error("modo errado");
    expect(r.notaNecessaria).toBeLessThanOrEqual(0);
    expect(r.metaGarantida).toBe(true);
    expect(r.classificacao).toBe("suave");
    expect(r.mensagem).toBe(MENSAGENS.metaAtingida);
  });

  it("9.13 — nota necessária acima da nota máxima → meta não alcançável", () => {
    const avs = [avaliacao("concluida", 10, 2, 3), avaliacao("pendente", 10, null, 1)];
    const r = analisarMateria(materia(6), avs, configMedia(10, 6));
    if (r.modo !== "media") throw new Error("modo errado");
    expect(r.notaNecessaria).toBe(18);
    expect(r.alcancavel).toBe(false);
    expect(r.classificacao).toBe("reagir");
    expect(r.mensagem).toBe(MENSAGENS.impossivelSemRecuperacao);
  });

  it("não realizada conta como 0 e o peso entra no total [DECISÃO PADRÃO]", () => {
    const avs = [avaliacao("concluida", 10, 8, 1), avaliacao("nao_realizada", 10, null, 1)];
    const r = analisarMateria(materia(6), avs, configMedia(10, 6));
    if (r.modo !== "media") throw new Error("modo errado");
    expect(r.mediaAtual).toBe(4);
    expect(r.classificacao).toBe("reagir");
  });

  it("peso é obrigatório no modo média", () => {
    expect(validarAvaliacao(avaliacao("pendente", 10, null), "media").erros.peso).toBeDefined();
  });
});

// ---------- Seção 9: geral ----------

describe("Geral", () => {
  it("9.14 — matéria sem avaliações → Sem diagnóstico", () => {
    const pontos = analisarMateria(materia(18, 30), [], configPontos(30, 18));
    const media = analisarMateria(materia(6), [], configMedia(10, 6));
    expect(pontos.classificacao).toBe("sem_diagnostico");
    expect(media.classificacao).toBe("sem_diagnostico");
    expect(pontos.mensagem).toBe(MENSAGENS.semDiagnostico);
  });

  it('9.15 — entrada "32,5" é interpretada como 32.5', () => {
    expect(lerNumero("32,5")).toBe(32.5);
    expect(lerNumero("32.5")).toBe(32.5);
    expect(lerNumero(" 10 ")).toBe(10);
    expect(lerNumero("0")).toBe(0);
    expect(lerNumero("")).toBeNull();
    expect(lerNumero("abc")).toBeNull();
  });

  it("9.16 — simulador não altera os dados salvos", () => {
    const pendente = avaliacao("pendente", 18, null);
    const avs = [avaliacao("concluida", 12, 12), pendente];
    const mat = materia(18, 30);
    const config = configPontos(30, 18);
    const antes = structuredClone({ avs, mat, config });
    // Congela tudo: se o simulador tentasse mudar algo, daria erro.
    [...avs, mat, config].forEach((o) => Object.freeze(o));
    Object.freeze(avs);

    const projetado = simular(mat, avs, config, { [pendente.id]: 10 });

    expect({ avs, mat, config }).toEqual(antes);
    if (projetado.modo !== "pontos") throw new Error("modo errado");
    expect(projetado.obtidos).toBe(22);
    expect(projetado.metaAtingida).toBe(true);
    // A análise real continua a mesma.
    const real = analisarMateria(mat, avs, config);
    if (real.modo !== "pontos") throw new Error("modo errado");
    expect(real.obtidos).toBe(12);
  });

  it("simulador ignora nota hipotética fora do intervalo", () => {
    const pendente = avaliacao("pendente", 10, null);
    const r = simular(materia(18, 30), [pendente], configPontos(30, 18), { [pendente.id]: 11 });
    if (r.modo !== "pontos") throw new Error("modo errado");
    expect(r.obtidos).toBe(0);
    expect(r.disponiveis).toBe(10);
  });
});
