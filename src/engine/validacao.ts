import type { Avaliacao, ConfigEscola, Materia, ModoCalculo } from "../types";

export interface ResultadoValidacao<Campo extends string> {
  valido: boolean;
  erros: Partial<Record<Campo, string>>;
}

function resultado<Campo extends string>(erros: Partial<Record<Campo, string>>): ResultadoValidacao<Campo> {
  return { valido: Object.keys(erros).length === 0, erros };
}

function positivo(valor: number | undefined): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0;
}

type CampoConfig = "serie" | "totalPeriodo" | "metaPeriodo" | "notaMaxima" | "mediaMeta";

// Seção 7.6: total/nota máxima podem ser qualquer número > 0; meta > 0 e <= total.
export function validarConfig(config: ConfigEscola): ResultadoValidacao<CampoConfig> {
  const erros: Partial<Record<CampoConfig, string>> = {};

  if (config.serie.trim() === "") erros.serie = "Informe sua série.";

  if (config.modo === "pontos") {
    if (!positivo(config.totalPeriodo)) {
      erros.totalPeriodo = "O total de pontos precisa ser maior que zero.";
    }
    if (!positivo(config.metaPeriodo)) {
      erros.metaPeriodo = "A meta precisa ser maior que zero.";
    } else if (positivo(config.totalPeriodo) && config.metaPeriodo > config.totalPeriodo) {
      erros.metaPeriodo = "Sua meta passou do total de pontos possíveis. Confere os valores?";
    }
  } else {
    if (!positivo(config.notaMaxima)) {
      erros.notaMaxima = "A nota máxima precisa ser maior que zero.";
    }
    if (!positivo(config.mediaMeta)) {
      erros.mediaMeta = "A média precisa ser maior que zero.";
    } else if (positivo(config.notaMaxima) && config.mediaMeta > config.notaMaxima) {
      erros.mediaMeta = "Sua meta passou da nota máxima. Confere os valores?";
    }
  }

  return resultado(erros);
}

type CampoMateria = "nome" | "meta" | "totalPontos";

// "outras" são as demais matérias, para não deixar nome repetido.
export function validarMateria(
  materia: Materia,
  config: ConfigEscola,
  outras: Materia[],
): ResultadoValidacao<CampoMateria> {
  const erros: Partial<Record<CampoMateria, string>> = {};
  const nome = materia.nome.trim().toLocaleLowerCase("pt-BR");

  if (nome === "") {
    erros.nome = "Dê um nome para a matéria.";
  } else if (outras.some((o) => o.id !== materia.id && o.nome.trim().toLocaleLowerCase("pt-BR") === nome)) {
    erros.nome = "Você já tem uma matéria com esse nome.";
  }

  if (config.modo === "pontos") {
    if (!positivo(materia.totalPontos)) {
      erros.totalPontos = "O total de pontos precisa ser maior que zero.";
    }
    if (!positivo(materia.meta)) {
      erros.meta = "A meta precisa ser maior que zero.";
    } else if (positivo(materia.totalPontos) && materia.meta > materia.totalPontos) {
      erros.meta = "Sua meta passou do total de pontos possíveis. Confere os valores?";
    }
  } else if (!positivo(materia.meta)) {
    erros.meta = "A média precisa ser maior que zero.";
  } else if (positivo(config.notaMaxima) && materia.meta > config.notaMaxima) {
    erros.meta = "Sua meta passou da nota máxima. Confere os valores?";
  }

  return resultado(erros);
}

type CampoAvaliacao = "nome" | "pontuacaoMaxima" | "nota" | "peso";

// No modo média, informe a notaMaxima da escola: todas as avaliações usam essa mesma escala (7.2).
export function validarAvaliacao(
  avaliacao: Avaliacao,
  modo: ModoCalculo,
  notaMaxima?: number,
): ResultadoValidacao<CampoAvaliacao> {
  const erros: Partial<Record<CampoAvaliacao, string>> = {};
  const { nota, pontuacaoMaxima, status } = avaliacao;

  if (avaliacao.nome.trim() === "") erros.nome = "Dê um nome para a avaliação.";

  if (!positivo(pontuacaoMaxima)) {
    erros.pontuacaoMaxima = "A pontuação máxima precisa ser maior que zero.";
  } else if (modo === "media" && notaMaxima !== undefined && pontuacaoMaxima !== notaMaxima) {
    erros.pontuacaoMaxima = "No modo média, todas as notas usam a nota máxima da escola.";
  }

  if (status === "concluida" && nota === null) {
    erros.nota = "Avaliação concluída precisa de nota.";
  } else if (status === "pendente" && nota !== null) {
    erros.nota = "Avaliação pendente ainda não tem nota.";
  } else if (nota !== null) {
    if (!Number.isFinite(nota) || nota < 0) {
      erros.nota = "A nota não pode ser negativa.";
    } else if (positivo(pontuacaoMaxima) && nota > pontuacaoMaxima) {
      erros.nota = "A nota passou da pontuação máxima da avaliação.";
    }
  }

  if (modo === "media" && !positivo(avaliacao.peso)) {
    erros.peso = "O peso precisa ser maior que zero.";
  }

  return resultado(erros);
}

// Aviso que NÃO bloqueia: a soma das avaliações passou do total da matéria.
export function avisoSomaAvaliacoes(avaliacoes: Avaliacao[], totalMateria: number): string | null {
  const soma = avaliacoes.reduce((total, a) => total + a.pontuacaoMaxima, 0);
  return soma > totalMateria
    ? "A soma das avaliações passou do total da matéria. Confere se digitou certo."
    : null;
}
