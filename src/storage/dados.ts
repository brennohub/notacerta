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

function formatoValido(valor: unknown): valor is DadosApp {
  if (typeof valor !== "object" || valor === null) return false;
  const d = valor as Record<string, unknown>;
  return (
    d.schemaVersion === SCHEMA_VERSION &&
    (d.config === null || typeof d.config === "object") &&
    Array.isArray(d.materias) &&
    Array.isArray(d.avaliacoes)
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
