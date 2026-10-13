import type { Avaliacao, ConfigEscola, Materia } from "../types";
import { MENSAGENS, analisarMateria, type AnaliseMateria } from "./classificacao";
import { formatarNumero as f } from "./numeros";

// A avaliação pendente com data mais próxima. Pendentes sem data ficam de fora.
export function proximaPendente(avaliacoes: Avaliacao[]): Avaliacao | null {
  const comData = avaliacoes.filter((a) => a.status === "pendente" && a.data);
  if (comData.length === 0) return null;
  return comData.reduce((maisCedo, a) => ((a.data ?? "") < (maisCedo.data ?? "") ? a : maisCedo));
}

export interface TextosMateria {
  situacao: string;
  falta: string | null;
}

// Frases da situação da matéria, usadas no Dashboard e no resumo da matéria.
export function textosMateria(analise: AnaliseMateria): TextosMateria {
  if (analise.classificacao === "sem_diagnostico") {
    return { situacao: "Nenhuma avaliação cadastrada ainda.", falta: null };
  }

  if (analise.modo === "pontos") {
    const situacao = `Você tem ${f(analise.obtidos)} de ${f(analise.meta)} pontos.`;
    if (analise.metaAtingida) return { situacao, falta: MENSAGENS.metaAtingida };
    const falta =
      analise.falta === 1
        ? "Falta 1 ponto para sua meta."
        : `Faltam ${f(analise.falta)} pontos para sua meta.`;
    return { situacao, falta };
  }

  const situacao =
    analise.mediaAtual === null
      ? "Você ainda não tem notas nessa matéria."
      : `Sua média é ${f(analise.mediaAtual)}. Sua meta é ${f(analise.meta)}.`;

  let falta: string;
  if (analise.metaGarantida) falta = MENSAGENS.metaAtingida;
  else if (analise.notaNecessaria === null) falta = "Não há avaliações pendentes cadastradas.";
  else if (!analise.alcancavel)
    falta = `Você precisaria de ${f(analise.notaNecessaria)} nas pendentes, acima da nota máxima (${f(analise.notaMaxima)}).`;
  else falta = `Você precisa tirar ${f(analise.notaNecessaria)} nas avaliações pendentes.`;

  return { situacao, falta };
}

export interface ItemDashboard {
  materia: Materia;
  analise: AnaliseMateria;
  textos: TextosMateria;
  proxima: Avaliacao | null;
}

export interface ResumoDashboard {
  contagem: { suave: number; olho: number; reagir: number };
  itens: ItemDashboard[];
}

export function resumirDashboard(materias: Materia[], avaliacoes: Avaliacao[], config: ConfigEscola): ResumoDashboard {
  const contagem = { suave: 0, olho: 0, reagir: 0 };
  const itens = materias.map((materia) => {
    const daMateria = avaliacoes.filter((a) => a.materiaId === materia.id);
    const analise = analisarMateria(materia, daMateria, config);
    if (analise.classificacao !== "sem_diagnostico") contagem[analise.classificacao]++;
    return { materia, analise, textos: textosMateria(analise), proxima: proximaPendente(daMateria) };
  });
  return { contagem, itens };
}
