import { describe, expect, it } from "vitest";
import type { ConfigEscola, Materia } from "../types";
import { atualizarMateriasComConfig, novaMateria, opcoesPeriodo, validarMateria } from "./index";

const pontos = (totalPeriodo: number, metaPeriodo: number): ConfigEscola => ({
  serie: "2º ano",
  tipoPeriodo: "trimestre",
  periodoAtual: "1º trimestre",
  modo: "pontos",
  totalPeriodo,
  metaPeriodo,
  temRecuperacao: false,
});

const media = (notaMaxima: number, mediaMeta: number): ConfigEscola => ({
  serie: "2º ano",
  tipoPeriodo: "bimestre",
  periodoAtual: "1º bimestre",
  modo: "media",
  notaMaxima,
  mediaMeta,
  temRecuperacao: false,
});

describe("Períodos", () => {
  it("lista os períodos de cada tipo", () => {
    expect(opcoesPeriodo("bimestre")).toEqual(["1º bimestre", "2º bimestre", "3º bimestre", "4º bimestre"]);
    expect(opcoesPeriodo("trimestre")).toHaveLength(3);
    expect(opcoesPeriodo("semestre")).toEqual(["1º semestre", "2º semestre"]);
  });
});

describe("Matérias", () => {
  it("nova matéria herda meta e total da escola", () => {
    expect(novaMateria("  Física ", pontos(30, 18), "id1")).toEqual({
      id: "id1",
      nome: "Física",
      periodoId: "1º trimestre",
      meta: 18,
      totalPontos: 30,
    });
    expect(novaMateria("Física", media(10, 6), "id2").meta).toBe(6);
  });

  it("valida nome vazio e repetido (sem ligar pra maiúsculas)", () => {
    const config = pontos(30, 18);
    const mat = novaMateria("Matemática", config, "a");
    expect(validarMateria({ ...mat, nome: "  " }, config, []).erros.nome).toBeDefined();
    expect(validarMateria({ ...mat, id: "b", nome: "matemática" }, config, [mat]).erros.nome).toBeDefined();
    // Editar a própria matéria sem mudar o nome não é repetição.
    expect(validarMateria(mat, config, [mat]).valido).toBe(true);
  });

  it("meta da matéria não pode passar do total (pontos) nem da nota máxima (média)", () => {
    const config = pontos(30, 18);
    const mat = novaMateria("Química", config, "a");
    expect(validarMateria({ ...mat, meta: 31 }, config, []).erros.meta).toBe(
      "Sua meta passou do total de pontos possíveis. Confere os valores?",
    );
    expect(validarMateria({ ...mat, totalPontos: 0 }, config, []).erros.totalPontos).toBeDefined();
    const configMedia = media(10, 6);
    const matMedia = novaMateria("Química", configMedia, "b");
    expect(validarMateria({ ...matMedia, meta: 11 }, configMedia, []).valido).toBe(false);
  });
});

describe("Atualizar matérias quando a escola muda", () => {
  const antiga = pontos(30, 18);
  const herdada: Materia = { id: "1", nome: "Física", periodoId: "1º trimestre", meta: 18, totalPontos: 30 };
  const personalizada: Materia = { id: "2", nome: "Artes", periodoId: "1º trimestre", meta: 12, totalPontos: 20 };

  it("valores herdados acompanham a escola; personalizados ficam", () => {
    const [h, p] = atualizarMateriasComConfig([herdada, personalizada], antiga, pontos(40, 24));
    expect(h).toMatchObject({ meta: 24, totalPontos: 40 });
    expect(p).toMatchObject({ meta: 12, totalPontos: 20 });
  });

  it("personalizado que ficaria inválido volta para o padrão", () => {
    const metaAlta: Materia = { ...herdada, meta: 28 }; // meta personalizada, total herdado
    const [m] = atualizarMateriasComConfig([metaAlta], antiga, pontos(25, 15));
    expect(m).toMatchObject({ meta: 15, totalPontos: 25 });
  });

  it("trocar o modo volta tudo para os valores novos", () => {
    const [h, p] = atualizarMateriasComConfig([herdada, personalizada], antiga, media(10, 6));
    expect(h).toMatchObject({ meta: 6, totalPontos: undefined, periodoId: "1º bimestre" });
    expect(p).toMatchObject({ meta: 6, totalPontos: undefined });
  });
});
