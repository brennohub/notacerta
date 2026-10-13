import type { Avaliacao, ConfigEscola, Materia } from "../types";

// Versão do formato dos dados. Se um dia o formato mudar, sobe o número e cria uma migração.
export const SCHEMA_VERSION = 1;
const CHAVE = "notacerta:dados";

export interface DadosApp {
  schemaVersion: typeof SCHEMA_VERSION;
  config: ConfigEscola | null;
  materias: Materia[];
  avaliacoes: Avaliacao[];
}

export const DADOS_VAZIOS: DadosApp = {
  schemaVersion: SCHEMA_VERSION,
  config: null,
  materias: [],
  avaliacoes: [],
};

const ERRO_LER = "Não conseguimos ler os dados salvos neste aparelho. O app começou do zero.";
const ERRO_SALVAR =
  "Não conseguimos salvar neste aparelho. Suas mudanças podem se perder ao fechar o navegador.";

const ehTexto = (v: unknown): v is string => typeof v === "string";
const ehNumero = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function configValida(c: unknown): boolean {
  return (
    ehObjeto(c) &&
    ehTexto(c.serie) &&
    ehTexto(c.periodoAtual) &&
    ["bimestre", "trimestre", "semestre"].includes(c.tipoPeriodo as string) &&
    (c.modo === "pontos" || c.modo === "media") &&
    typeof c.temRecuperacao === "boolean"
  );
}

function materiaValida(m: unknown): boolean {
  return ehObjeto(m) && ehTexto(m.id) && ehTexto(m.nome) && ehTexto(m.periodoId) && ehNumero(m.meta);
}

function avaliacaoValida(a: unknown): boolean {
  return (
    ehObjeto(a) &&
    ehTexto(a.id) &&
    ehTexto(a.materiaId) &&
    ehTexto(a.nome) &&
    ehNumero(a.pontuacaoMaxima) &&
    (a.nota === null || ehNumero(a.nota)) &&
    ["concluida", "pendente", "nao_realizada"].includes(a.status as string)
  );
}

// Confere o formato de tudo que foi lido, item por item, para nenhum dado estranho quebrar as telas.
function formatoValido(valor: unknown): valor is DadosApp {
  if (!ehObjeto(valor)) return false;
  return (
    valor.schemaVersion === SCHEMA_VERSION &&
    (valor.config === null || configValida(valor.config)) &&
    Array.isArray(valor.materias) &&
    valor.materias.every(materiaValida) &&
    Array.isArray(valor.avaliacoes) &&
    valor.avaliacoes.every(avaliacaoValida)
  );
}

export function carregarDados(): { dados: DadosApp; erro?: string } {
  try {
    const texto = localStorage.getItem(CHAVE);
    if (texto === null) return { dados: DADOS_VAZIOS };
    const lido: unknown = JSON.parse(texto);
    return formatoValido(lido) ? { dados: lido } : { dados: DADOS_VAZIOS, erro: ERRO_LER };
  } catch {
    return { dados: DADOS_VAZIOS, erro: ERRO_LER };
  }
}

// Devolve uma mensagem de erro, ou null se deu tudo certo.
export function salvarDados(dados: DadosApp): string | null {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    return null;
  } catch {
    return ERRO_SALVAR;
  }
}

export function apagarDados(): string | null {
  try {
    localStorage.removeItem(CHAVE);
    return null;
  } catch {
    return "Não conseguimos apagar os dados deste aparelho. Tenta de novo.";
  }
}
