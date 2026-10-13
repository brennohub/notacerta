import { describe, expect, it } from "vitest";
import type { Avaliacao, ConfigEscola } from "../types";
import { ajustarAvaliacoesComConfig, formatarData, validarAvaliacao, validarMudancaConfig } from "./index";

const pontos: ConfigEscola = {
  serie: "2º ano",
  tipoPeriodo: "trimestre",
  periodoAtual: "1º trimestre",
  modo: "pontos",
  totalPeriodo: 30,
  metaPeriodo: 18,
  temRecuperacao: false,
};
const media = (notaMaxima: number): ConfigEscola => ({
  ...pontos,
  modo: "media",
  totalPeriodo: undefined,
  metaPeriodo: undefined,
  notaMaxima,
  mediaMeta: 6,
});

const av = (nota: number | null, pontuacaoMaxima = 10): Avaliacao => ({
  id: "a1",
  materiaId: "m1",
  nome: "P1",
  tipo: "prova",
  pontuacaoMaxima,
  nota,
  peso: 1,
  status: nota === null ? "pendente" : "concluida",
});

describe("Datas", () => {
  it("mostra a data no formato brasileiro", () => {
    expect(formatarData("2026-03-15")).toBe("15/03/2026");
    expect(formatarData("qualquer")).toBe("qualquer");
  });
});

describe("Mudança na configuração da escola com avaliações cadastradas", () => {
  it("sem avaliações, pode mudar tudo", () => {
    expect(validarMudancaConfig(pontos, media(10), [])).toEqual({});
  });

  it("trocar o modo com avaliações cadastradas é bloqueado", () => {
    expect(validarMudancaConfig(pontos, media(10), [av(5)]).modo).toBeDefined();
  });

  it("no modo média, nota máxima menor que uma nota já lançada é bloqueada", () => {
    expect(validarMudancaConfig(media(10), media(5), [av(8)]).notaMaxima).toBeDefined();
    expect(validarMudancaConfig(media(10), media(20), [av(8)])).toEqual({});
  });

  it("no modo média, as avaliações passam a usar a nota máxima da escola", () => {
    const [a] = ajustarAvaliacoesComConfig([av(8, 10)], media(20));
    expect(a.pontuacaoMaxima).toBe(20);
    const lista = [av(8, 10)];
    expect(ajustarAvaliacoesComConfig(lista, pontos)).toBe(lista);
  });

  it("no modo média, avaliação com escala diferente da escola é rejeitada", () => {
    expect(validarAvaliacao(av(5, 100), "media", 10).erros.pontuacaoMaxima).toBeDefined();
    expect(validarAvaliacao(av(5, 10), "media", 10).valido).toBe(true);
  });
});
