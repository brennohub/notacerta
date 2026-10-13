import { describe, expect, it } from "vitest";
import type { Avaliacao, ConfigEscola, Materia, StatusAvaliacao } from "../types";
import { MENSAGENS, descreverSimulacao, notaHipoteticaValida, simular } from "./index";

const pontos: ConfigEscola = {
  serie: "2º ano",
  tipoPeriodo: "trimestre",
  periodoAtual: "1º trimestre",
  modo: "pontos",
  totalPeriodo: 30,
  metaPeriodo: 18,
  temRecuperacao: false,
};
const media: ConfigEscola = { ...pontos, modo: "media", notaMaxima: 10, mediaMeta: 6 };
const materia = (meta: number, totalPontos?: number): Materia => ({ id: "m", nome: "M", periodoId: "p", meta, totalPontos });
const av = (id: string, status: StatusAvaliacao, pontuacaoMaxima: number, nota: number | null, peso?: number): Avaliacao => ({
  id,
  materiaId: "m",
  nome: id,
  tipo: "prova",
  pontuacaoMaxima,
  nota,
  peso,
  status,
});

describe("Nota hipotética", () => {
  it("aceita de 0 até o máximo da avaliação", () => {
    const p = av("p", "pendente", 18, null);
    expect(notaHipoteticaValida(0, p)).toBe(true);
    expect(notaHipoteticaValida(18, p)).toBe(true);
    expect(notaHipoteticaValida(-1, p)).toBe(false);
    expect(notaHipoteticaValida(18.5, p)).toBe(false);
  });
});

describe("Descrição dos cenários", () => {
  const avsPontos = [av("p1", "concluida", 12, 12), av("p2", "pendente", 10, null), av("p3", "pendente", 8, null)];

  it("modo pontos: falta, possível e restantes", () => {
    const d = descreverSimulacao(simular(materia(18, 30), avsPontos, pontos, { p2: 2 }));
    expect(d).toEqual({
      projetado: "14 pontos",
      distancia: "Faltam 4 pontos",
      possivel: "Ainda dá pra chegar na meta",
      restantes: "Nas que ficaram em branco: precisa de 4 dos 8 pontos",
    });
  });

  it("modo pontos: meta atingida e impossível", () => {
    expect(descreverSimulacao(simular(materia(18, 30), avsPontos, pontos, { p2: 10 }))).toMatchObject({
      projetado: "22 pontos",
      distancia: MENSAGENS.metaAtingida,
      possivel: null,
      restantes: null,
    });
    expect(descreverSimulacao(simular(materia(18, 30), avsPontos, pontos, { p2: 0, p3: 0 }))).toMatchObject({
      distancia: "Faltam 6 pontos",
      possivel: "Com essas notas não dá pra chegar na meta",
      restantes: null,
    });
  });

  it("modo média: caso 9.11 com nota 7 na pendente → média 6,2", () => {
    const avs = [av("p1", "concluida", 10, 5, 2), av("p2", "pendente", 10, null, 3)];
    expect(descreverSimulacao(simular(materia(6), avs, media, { p2: 7 }))).toEqual({
      projetado: "Média 6,2",
      distancia: MENSAGENS.metaAtingida,
      possivel: null,
      restantes: null,
    });
    const abaixo = descreverSimulacao(simular(materia(6), avs, media, { p2: 6 }));
    expect(abaixo.projetado).toBe("Média 5,6");
    expect(abaixo.distancia).toBe("Faltam 0,4 pra média 6");
    expect(abaixo.possivel).toBe("Com essas notas não dá pra chegar na meta");
  });

  it("modo média: pendente em branco mostra a nota necessária", () => {
    const avs = [av("p1", "concluida", 10, 5, 2), av("p2", "pendente", 10, null, 3)];
    expect(descreverSimulacao(simular(materia(6), avs, media, {})).restantes).toBe(
      "Nas que ficaram em branco: precisa tirar 6,67",
    );
  });
});
