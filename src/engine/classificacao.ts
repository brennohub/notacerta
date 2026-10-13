import type { Avaliacao, Classificacao, ConfigEscola, Materia } from "../types";
import { calcularMedia, calcularPontos, type ResultadoMedia, type ResultadoPontos } from "./calculo";
import { formatarNumero as f } from "./numeros";

// Limites da razão de esforço (seção 7.4). Fáceis de ajustar aqui.
export const LIMITE_SUAVE = 0.6;
export const LIMITE_ATENCAO = 0.85;

export const MENSAGENS = {
  semDiagnostico: "Adicione suas avaliações para obter um diagnóstico melhor.",
  metaAtingida: "Meta atingida! Boa! 🎉",
  suave: "Você tá bem nessa. Continua nesse ritmo!",
  olho: "Fica de olho: vale dedicar um pouco mais de atenção aqui.",
  reagir: "Essa matéria precisa de atenção agora. Vamos ver suas opções.",
  impossivelComRecuperacao:
    "Com as avaliações restantes não dá pra chegar na meta, mas sua escola tem recuperação. Confere as regras com seu professor.",
  impossivelSemRecuperacao:
    "Com as avaliações cadastradas não dá pra chegar na meta. Confere se falta cadastrar alguma.",
};

export interface Diagnostico {
  classificacao: Classificacao;
  razao: number | null; // razão de esforço r (null quando não se aplica)
  mensagem: string;
}

interface EntradaClassificacao {
  semAvaliacoes: boolean;
  metaAtingida: boolean;
  razao: number | null; // null = não há pendentes
  temRecuperacao: boolean;
}

// Tabela da seção 7.4, na ordem em que as condições são checadas.
export function classificar({ semAvaliacoes, metaAtingida, razao, temRecuperacao }: EntradaClassificacao): Diagnostico {
  if (semAvaliacoes) return { classificacao: "sem_diagnostico", razao: null, mensagem: MENSAGENS.semDiagnostico };
  if (metaAtingida) return { classificacao: "suave", razao, mensagem: MENSAGENS.metaAtingida };
  if (razao === null || razao > 1) {
    const mensagem = temRecuperacao ? MENSAGENS.impossivelComRecuperacao : MENSAGENS.impossivelSemRecuperacao;
    return { classificacao: "reagir", razao, mensagem };
  }
  if (razao <= LIMITE_SUAVE) return { classificacao: "suave", razao, mensagem: MENSAGENS.suave };
  if (razao <= LIMITE_ATENCAO) return { classificacao: "olho", razao, mensagem: MENSAGENS.olho };
  return { classificacao: "reagir", razao, mensagem: MENSAGENS.reagir };
}

export type AnaliseMateria = Diagnostico & { motivo: string } & (
    | ({ modo: "pontos"; meta: number } & ResultadoPontos)
    | ({ modo: "media"; meta: number; notaMaxima: number } & ResultadoMedia)
  );

// O que as telas chamam: calcula a matéria no modo da escola, classifica e explica o porquê.
export function analisarMateria(materia: Materia, avaliacoes: Avaliacao[], config: ConfigEscola): AnaliseMateria {
  const daMateria = avaliacoes.filter((a) => a.materiaId === materia.id);
  const semAvaliacoes = daMateria.length === 0;
  const meta = materia.meta;

  if (config.modo === "pontos") {
    const r = calcularPontos(daMateria, meta);
    const razao = r.disponiveis > 0 ? r.falta / r.disponiveis : null;
    const diagnostico = classificar({
      semAvaliacoes,
      metaAtingida: r.metaAtingida,
      razao,
      temRecuperacao: config.temRecuperacao,
    });

    let motivo: string;
    if (semAvaliacoes) motivo = "Você ainda não cadastrou avaliações nessa matéria.";
    else if (r.metaAtingida) motivo = `Você já tem ${f(r.obtidos)} pontos e sua meta é ${f(meta)}.`;
    else if (r.disponiveis === 0)
      motivo = `Você tem ${f(r.obtidos)} de ${f(meta)} pontos e não há avaliações pendentes cadastradas.`;
    else if (!r.possivel)
      motivo = `Faltam ${f(r.falta)} pontos para a meta, mas só ${f(r.disponiveis)} ainda estão disponíveis.`;
    else motivo = `Você precisa de ${f(r.falta)} dos ${f(r.disponiveis)} pontos que ainda estão disponíveis.`;

    return { ...diagnostico, motivo, modo: "pontos", meta, ...r };
  }

  const notaMaxima = config.notaMaxima ?? 0;
  const r = calcularMedia(daMateria, meta, notaMaxima);
  const razao = r.notaNecessaria !== null ? r.notaNecessaria / notaMaxima : null;
  const diagnostico = classificar({
    semAvaliacoes,
    metaAtingida: r.metaGarantida,
    razao,
    temRecuperacao: config.temRecuperacao,
  });

  let motivo: string;
  if (semAvaliacoes) motivo = "Você ainda não cadastrou avaliações nessa matéria.";
  else if (r.notaNecessaria === null)
    motivo = `Sua média é ${f(r.mediaAtual ?? 0)}, sua meta é ${f(meta)} e não há avaliações pendentes cadastradas.`;
  else if (r.metaGarantida) motivo = `Mesmo tirando 0 nas pendentes, sua média fica em ${f(meta)} ou mais.`;
  else if (!r.alcancavel)
    motivo = `Você precisaria tirar ${f(r.notaNecessaria)} nas pendentes para chegar na média ${f(meta)}, mas a nota máxima é ${f(notaMaxima)}.`;
  else
    motivo = `Você precisa tirar ${f(r.notaNecessaria)} de ${f(notaMaxima)} nas avaliações pendentes para chegar na média ${f(meta)}.`;

  return { ...diagnostico, motivo, modo: "media", meta, notaMaxima, ...r };
}

// Quanto do caminho até a meta já foi feito, de 0 a 1 (para a barra de progresso).
export function progressoAteMeta(analise: AnaliseMateria): number {
  if (analise.meta <= 0) return 0;
  const atual = analise.modo === "pontos" ? analise.obtidos : (analise.mediaAtual ?? 0);
  return Math.min(1, Math.max(0, atual / analise.meta));
}
