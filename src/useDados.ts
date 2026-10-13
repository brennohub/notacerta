import { useState } from "react";
import type { ConfigEscola, Materia } from "./types";
import {
  atualizarMateriasComConfig,
  novaMateria,
  validarConfig,
  validarMateria,
  type ResultadoValidacao,
} from "./engine";
import { DADOS_VAZIOS, apagarDados, carregarDados, salvarDados, type DadosApp } from "./storage/dados";
import { gerarId } from "./storage/id";

// Guarda os dados do app e salva no aparelho a cada mudança.
// Toda ação valida pelo engine antes de salvar.
export function useDados() {
  const [inicial] = useState(carregarDados);
  const [dados, setDados] = useState<DadosApp>(inicial.dados);
  const [erroArmazenamento, setErro] = useState<string | null>(inicial.erro ?? null);

  function gravar(novos: DadosApp) {
    setDados(novos);
    setErro(salvarDados(novos));
  }

  function salvarConfig(config: ConfigEscola) {
    const v = validarConfig(config);
    if (v.valido) {
      const materias = atualizarMateriasComConfig(dados.materias, dados.config, config);
      gravar({ ...dados, config, materias });
    }
    return v;
  }

  function adicionarMateria(nome: string): ResultadoValidacao<"nome" | "meta" | "totalPontos"> {
    if (!dados.config) return { valido: false, erros: { nome: "Configure sua escola primeiro." } };
    const materia = novaMateria(nome, dados.config, gerarId());
    const v = validarMateria(materia, dados.config, dados.materias);
    if (v.valido) gravar({ ...dados, materias: [...dados.materias, materia] });
    return v;
  }

  function editarMateria(materia: Materia): ResultadoValidacao<"nome" | "meta" | "totalPontos"> {
    if (!dados.config) return { valido: false, erros: { nome: "Configure sua escola primeiro." } };
    const editada = { ...materia, nome: materia.nome.trim() };
    const v = validarMateria(editada, dados.config, dados.materias);
    if (v.valido) gravar({ ...dados, materias: dados.materias.map((m) => (m.id === editada.id ? editada : m)) });
    return v;
  }

  // Remove a matéria e as avaliações dela.
  function removerMateria(id: string) {
    gravar({
      ...dados,
      materias: dados.materias.filter((m) => m.id !== id),
      avaliacoes: dados.avaliacoes.filter((a) => a.materiaId !== id),
    });
  }

  function apagarTudo() {
    setDados(DADOS_VAZIOS);
    setErro(apagarDados());
  }

  return { dados, erroArmazenamento, salvarConfig, adicionarMateria, editarMateria, removerMateria, apagarTudo };
}
