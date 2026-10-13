// Tipos do modelo de dados (seção 5 do CLAUDE.md).

export type ModoCalculo = "pontos" | "media";
export type TipoPeriodo = "bimestre" | "trimestre" | "semestre";

export interface ConfigEscola {
  nomeEscola?: string; // opcional
  serie: string; // ex.: "2º ano"
  tipoPeriodo: TipoPeriodo;
  periodoAtual: string; // ex.: "1º trimestre"
  modo: ModoCalculo;

  // modo "pontos"
  totalPeriodo?: number; // qualquer número > 0
  metaPeriodo?: number; // > 0 e <= totalPeriodo

  // modo "media"
  notaMaxima?: number; // escala da escola, qualquer número > 0 (ex.: 10)
  mediaMeta?: number; // > 0 e <= notaMaxima

  temRecuperacao: boolean;
  observacoesRecuperacao?: string;
}

export interface Materia {
  id: string;
  nome: string;
  periodoId: string;
  totalPontos?: number; // herda de ConfigEscola, editável (modo pontos)
  meta: number; // herda de ConfigEscola, editável
}

export type TipoAvaliacao =
  | "prova"
  | "trabalho"
  | "simulado"
  | "atividade"
  | "participacao"
  | "outro";
export type StatusAvaliacao = "concluida" | "pendente" | "nao_realizada";

export interface Avaliacao {
  id: string;
  materiaId: string;
  nome: string;
  tipo: TipoAvaliacao;
  data?: string; // ISO, opcional
  pontuacaoMaxima: number; // > 0
  nota: number | null; // null = sem nota. NUNCA usar 0 para representar "vazio"
  peso?: number; // só no modo "media", > 0
  status: StatusAvaliacao;
}

export type Classificacao = "sem_diagnostico" | "suave" | "olho" | "reagir";
