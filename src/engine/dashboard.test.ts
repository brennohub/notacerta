import { describe, expect, it } from "vitest";
import type { Avaliacao, ConfigEscola, Materia, StatusAvaliacao } from "../types";
import { MENSAGENS, analisarMateria, proximaPendente, resumirDashboard, textosMateria } from "./index";

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

let n = 0;
const av = (
  materiaId: string,
  status: StatusAvaliacao,
  pontuacaoMaxima: number,
  nota: number | null,
  extra: Partial<Avaliacao> = {},
): Avaliacao => ({ id: `a${n++}`, materiaId, nome: `A${n}`, tipo: "prova", pontuacaoMaxima, nota, status, ...extra });
const mat = (id: string, meta: number, totalPontos?: number): Materia => ({
  id,
  nome: id,
  periodoId: "p",
  meta,
  totalPontos,
});

describe("Próxima avaliação pendente", () => {
  it("escolhe a data mais cedo e ignora pendentes sem data e concluídas", () => {
    const lista = [
      av("m", "pendente", 10, null, { nome: "Sem data" }),
      av("m", "pendente", 10, null, { nome: "Depois", data: "2026-05-10" }),
      av("m", "pendente", 10, null, { nome: "Antes", data: "2026-04-02" }),
      av("m", "concluida", 10, 5, { nome: "Feita", data: "2026-01-01" }),
    ];
    expect(proximaPendente(lista)?.nome).toBe("Antes");
    expect(proximaPendente([av("m", "pendente", 10, null)])).toBeNull();
  });
});

describe("Textos da matéria", () => {
  it("modo pontos: situação e quanto falta", () => {
    const a = analisarMateria(mat("m", 18, 30), [av("m", "concluida", 12, 12), av("m", "pendente", 18, null)], pontos);
    expect(textosMateria(a)).toEqual({
      situacao: "Você tem 12 de 18 pontos.",
      falta: "Faltam 6 pontos para sua meta.",
    });
  });

  it("modo pontos: singular e meta atingida", () => {
    const um = analisarMateria(mat("m", 18, 30), [av("m", "concluida", 17, 17), av("m", "pendente", 10, null)], pontos);
    expect(textosMateria(um).falta).toBe("Falta 1 ponto para sua meta.");
    const ok = analisarMateria(mat("m", 18, 30), [av("m", "concluida", 20, 18)], pontos);
    expect(textosMateria(ok).falta).toBe(MENSAGENS.metaAtingida);
  });

  it("modo média: nota necessária, meta garantida e acima da nota máxima", () => {
    const precisa = analisarMateria(
      mat("m", 6),
      [av("m", "concluida", 10, 5, { peso: 2 }), av("m", "pendente", 10, null, { peso: 3 })],
      media,
    );
    expect(textosMateria(precisa)).toEqual({
      situacao: "Sua média é 5. Sua meta é 6.",
      falta: "Você precisa tirar 6,67 nas avaliações pendentes.",
    });
    const garantida = analisarMateria(
      mat("m", 6),
      [av("m", "concluida", 10, 10, { peso: 4 }), av("m", "pendente", 10, null, { peso: 1 })],
      media,
    );
    expect(textosMateria(garantida).falta).toBe(MENSAGENS.metaAtingida);
    const impossivel = analisarMateria(
      mat("m", 6),
      [av("m", "concluida", 10, 2, { peso: 3 }), av("m", "pendente", 10, null, { peso: 1 })],
      media,
    );
    expect(textosMateria(impossivel).falta).toBe("Você precisaria de 18 nas pendentes, acima da nota máxima (10).");
  });

  it("sem avaliações não inventa números", () => {
    const a = analisarMateria(mat("m", 18, 30), [], pontos);
    expect(textosMateria(a)).toEqual({ situacao: "Nenhuma avaliação cadastrada ainda.", falta: null });
  });
});

describe("Resumo do Dashboard", () => {
  it("conta as classificações e ignora matérias sem diagnóstico", () => {
    const materias = [mat("suave", 18, 30), mat("reagir", 18, 30), mat("vazia", 18, 30)];
    const avaliacoes = [
      av("suave", "concluida", 12, 12),
      av("suave", "pendente", 18, null),
      av("reagir", "concluida", 10, 5),
      av("reagir", "pendente", 10, null),
    ];
    const r = resumirDashboard(materias, avaliacoes, pontos);
    expect(r.contagem).toEqual({ suave: 1, olho: 0, reagir: 1 });
    expect(r.itens.map((i) => i.analise.classificacao)).toEqual(["suave", "reagir", "sem_diagnostico"]);
  });
});
