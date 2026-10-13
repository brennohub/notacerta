import type { ConfigEscola, Materia } from "../types";
import { validarMateria } from "./validacao";

// Meta e total que a matéria herda da configuração da escola.
export function valoresHerdados(config: ConfigEscola): Pick<Materia, "meta" | "totalPontos"> {
  return config.modo === "pontos"
    ? { meta: config.metaPeriodo ?? 0, totalPontos: config.totalPeriodo }
    : { meta: config.mediaMeta ?? 0, totalPontos: undefined };
}

export function novaMateria(nome: string, config: ConfigEscola, id: string): Materia {
  return { id, nome: nome.trim(), periodoId: config.periodoAtual, ...valoresHerdados(config) };
}

// Quando a configuração da escola muda:
// - valores que ainda eram os herdados passam a usar os novos;
// - valores personalizados ficam, desde que continuem válidos;
// - se o modo mudou (pontos ↔ média), tudo volta para os valores novos.
export function atualizarMateriasComConfig(
  materias: Materia[],
  antiga: ConfigEscola | null,
  nova: ConfigEscola,
): Materia[] {
  const novos = valoresHerdados(nova);
  // O MVP tem um período só, então as matérias acompanham o período atual.
  const periodoId = nova.periodoAtual;

  if (!antiga || antiga.modo !== nova.modo) {
    return materias.map((m) => ({ ...m, ...novos, periodoId }));
  }

  const antigos = valoresHerdados(antiga);
  return materias.map((m) => {
    const candidata: Materia = {
      ...m,
      periodoId,
      meta: m.meta === antigos.meta ? novos.meta : m.meta,
      totalPontos: m.totalPontos === antigos.totalPontos ? novos.totalPontos : m.totalPontos,
    };
    const valida = validarMateria(candidata, nova, []).valido;
    return valida ? candidata : { ...m, ...novos, periodoId };
  });
}
