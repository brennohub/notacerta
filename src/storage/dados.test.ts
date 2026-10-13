import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DADOS_VAZIOS, SCHEMA_VERSION, apagarDados, carregarDados, salvarDados, type DadosApp } from "./dados";

const exemplo: DadosApp = {
  schemaVersion: SCHEMA_VERSION,
  config: {
    serie: "2º ano",
    tipoPeriodo: "trimestre",
    periodoAtual: "1º trimestre",
    modo: "pontos",
    totalPeriodo: 30,
    metaPeriodo: 18,
    temRecuperacao: true,
  },
  materias: [{ id: "m1", nome: "Matemática", periodoId: "1º trimestre", meta: 18, totalPontos: 30 }],
  avaliacoes: [],
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("Persistência no aparelho", () => {
  it("sem nada salvo, começa vazio e sem erro", () => {
    expect(carregarDados()).toEqual({ dados: DADOS_VAZIOS });
  });

  it("salva e carrega os mesmos dados, com schemaVersion", () => {
    expect(salvarDados(exemplo)).toBeNull();
    expect(carregarDados().dados).toEqual(exemplo);
    expect(JSON.parse(localStorage.getItem("notacerta:dados")!).schemaVersion).toBe(1);
  });

  it("dados corrompidos voltam para vazio com aviso, sem quebrar", () => {
    localStorage.setItem("notacerta:dados", "{isso não é json");
    const r = carregarDados();
    expect(r.dados).toEqual(DADOS_VAZIOS);
    expect(r.erro).toBeDefined();
  });

  it("versão desconhecida volta para vazio com aviso", () => {
    localStorage.setItem("notacerta:dados", JSON.stringify({ ...exemplo, schemaVersion: 99 }));
    expect(carregarDados().erro).toBeDefined();
  });

  it("se o localStorage falhar ao salvar, devolve mensagem em vez de quebrar", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("cheio");
    });
    expect(salvarDados(exemplo)).toMatch(/Não conseguimos salvar/);
  });

  it("se o localStorage falhar ao ler, começa vazio com aviso", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    const r = carregarDados();
    expect(r.dados).toEqual(DADOS_VAZIOS);
    expect(r.erro).toBeDefined();
  });

  it("apagar remove tudo", () => {
    salvarDados(exemplo);
    expect(apagarDados()).toBeNull();
    expect(carregarDados()).toEqual({ dados: DADOS_VAZIOS });
  });
});
