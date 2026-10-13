import { useState } from "react";
import type { Avaliacao, ConfigEscola, Materia } from "./types";
import {
  ajustarAvaliacoesComConfig,
  atualizarMateriasComConfig,
  novaMateria,
  validarAvaliacao,
  validarConfig,
  validarMateria,
  validarMudancaConfig,
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

  function salvarConfig(config: ConfigEscola): ResultadoValidacao<string> {
    const erros = { ...validarConfig(config).erros, ...validarMudancaConfig(dados.config, config, dados.avaliacoes) };
    const valido = Object.keys(erros).length === 0;
    if (valido) {
      const materias = atualizarMateriasComConfig(dados.materias, dados.config, config);
      const avaliacoes = ajustarAvaliacoesComConfig(dados.avaliacoes, config);
      gravar({ ...dados, config, materias, avaliacoes });
    }
    return { valido, erros };
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

  function validar(avaliacao: Avaliacao) {
    if (!dados.config) return { valido: false, erros: { nome: "Configure sua escola primeiro." } };
    return validarAvaliacao(avaliacao, dados.config.modo, dados.config.notaMaxima);
  }

  function adicionarAvaliacao(nova: Omit<Avaliacao, "id">): ResultadoValidacao<string> {
    const avaliacao = { ...nova, id: gerarId(), nome: nova.nome.trim() };
    const v = validar(avaliacao);
    if (v.valido) gravar({ ...dados, avaliacoes: [...dados.avaliacoes, avaliacao] });
    return v;
  }

  function editarAvaliacao(editada: Avaliacao): ResultadoValidacao<string> {
    const avaliacao = { ...editada, nome: editada.nome.trim() };
    const v = validar(avaliacao);
    if (v.valido) {
      gravar({ ...dados, avaliacoes: dados.avaliacoes.map((a) => (a.id === avaliacao.id ? avaliacao : a)) });
    }
    return v;
  }

  function removerAvaliacao(id: string) {
    gravar({ ...dados, avaliacoes: dados.avaliacoes.filter((a) => a.id !== id) });
  }

  function apagarTudo() {
    setDados(DADOS_VAZIOS);
    setErro(apagarDados());
  }

  return {
    dados,
    erroArmazenamento,
    salvarConfig,
    adicionarMateria,
    editarMateria,
    removerMateria,
    adicionarAvaliacao,
    editarAvaliacao,
    removerAvaliacao,
    apagarTudo,
  };
}
