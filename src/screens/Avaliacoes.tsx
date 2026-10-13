import { useState } from "react";
import type { Avaliacao, ConfigEscola, Materia } from "../types";
import {
  analisarMateria,
  avisoSomaAvaliacoes,
  formatarData,
  formatarNumero as f,
  progressoAteMeta,
  type AnaliseMateria,
  type ResultadoValidacao,
} from "../engine";
import { BarraProgresso } from "../components/BarraProgresso";
import { Botao } from "../components/Botao";
import { Card } from "../components/Card";
import { Confirmacao } from "../components/Confirmacao";
import { FormAvaliacao, ROTULO_TIPO } from "../components/FormAvaliacao";
import { Tela } from "../components/Tela";

interface Props {
  config: ConfigEscola | null;
  materias: Materia[];
  avaliacoes: Avaliacao[];
  materiaId: string | null;
  aoAbrirMateria: (id: string | null) => void;
  aoAdicionar: (avaliacao: Omit<Avaliacao, "id">) => ResultadoValidacao<string>;
  aoEditar: (avaliacao: Avaliacao) => ResultadoValidacao<string>;
  aoRemover: (id: string) => void;
  aoIrParaEscola: () => void;
  aoIrParaMaterias: () => void;
}

// 6.5 — Avaliações dentro da matéria.
export function Avaliacoes(props: Props) {
  const { config, materias, materiaId, aoAbrirMateria } = props;

  if (!config) {
    return (
      <Tela titulo="Avaliações">
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">Antes das avaliações, conta pra gente como sua escola calcula as notas.</p>
          <Botao onClick={props.aoIrParaEscola}>Configurar minha escola</Botao>
        </Card>
      </Tela>
    );
  }

  if (materias.length === 0) {
    return (
      <Tela titulo="Avaliações">
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">As avaliações ficam dentro de cada matéria. Adicione uma matéria primeiro.</p>
          <Botao onClick={props.aoIrParaMaterias}>Adicionar matérias</Botao>
        </Card>
      </Tela>
    );
  }

  const materia = materias.find((m) => m.id === materiaId);
  if (!materia) {
    return (
      <Tela titulo="Avaliações" subtitulo="Escolha uma matéria.">
        <div className="flex flex-col gap-2">
          {materias.map((m) => (
            <Botao key={m.id} variante="secundario" className="text-left" onClick={() => aoAbrirMateria(m.id)}>
              {m.nome}
            </Botao>
          ))}
        </div>
      </Tela>
    );
  }

  return <AvaliacoesDaMateria {...props} config={config} materia={materia} />;
}

function AvaliacoesDaMateria({
  config,
  materia,
  avaliacoes,
  aoAbrirMateria,
  aoAdicionar,
  aoEditar,
  aoRemover,
}: Props & { config: ConfigEscola; materia: Materia }) {
  // "nova" = formulário de nova avaliação aberto; um id = editando aquela avaliação.
  const [formulario, setFormulario] = useState<"nova" | string | null>(null);
  const [removendo, setRemovendo] = useState<Avaliacao | null>(null);

  const daMateria = avaliacoes.filter((a) => a.materiaId === materia.id);
  const analise = analisarMateria(materia, daMateria, config);
  const aviso = config.modo === "pontos" ? avisoSomaAvaliacoes(daMateria, materia.totalPontos ?? 0) : null;

  function fecharSeValido(r: ResultadoValidacao<string>) {
    if (r.valido) setFormulario(null);
    return r;
  }

  return (
    <Tela titulo={materia.nome}>
      <Botao variante="secundario" onClick={() => aoAbrirMateria(null)}>
        ← Trocar matéria
      </Botao>

      <Resumo analise={analise} />

      {aviso && (
        <p role="status" className="rounded-xl bg-olho/15 px-4 py-3 text-sm text-olho">
          {aviso}
        </p>
      )}

      {formulario === "nova" ? (
        <FormAvaliacao
          config={config}
          materiaId={materia.id}
          aoSalvar={(a) => fecharSeValido(aoAdicionar(a))}
          aoCancelar={() => setFormulario(null)}
        />
      ) : (
        <Botao onClick={() => setFormulario("nova")}>+ Nova avaliação</Botao>
      )}

      {daMateria.length === 0 ? (
        <Card>
          <p className="text-texto-secundario">Adicione sua primeira avaliação dessa matéria.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Avaliações da matéria">
          {daMateria.map((a) => (
            <li key={a.id}>
              {formulario === a.id ? (
                <FormAvaliacao
                  config={config}
                  materiaId={materia.id}
                  inicial={a}
                  aoSalvar={(editada) => fecharSeValido(aoEditar({ ...editada, id: a.id }))}
                  aoCancelar={() => setFormulario(null)}
                />
              ) : (
                <Card className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold">{a.nome}</h2>
                    <p className="text-sm text-texto-secundario">
                      {ROTULO_TIPO[a.tipo]}
                      {a.data && ` · ${formatarData(a.data)}`}
                      {config.modo === "media" && ` · Peso ${f(a.peso ?? 1)}`}
                    </p>
                    <p className={a.status === "concluida" ? "font-semibold" : "text-texto-secundario"}>
                      {descreverNota(a)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Botao variante="secundario" onClick={() => setFormulario(a.id)}>
                      Editar
                    </Botao>
                    <Botao variante="secundario" className="text-reagir!" onClick={() => setRemovendo(a)}>
                      Remover
                    </Botao>
                  </div>
                </Card>
              )}
            </li>
          ))}
        </ul>
      )}

      {removendo && (
        <Confirmacao
          titulo={`Remover ${removendo.nome}?`}
          mensagem="Essa avaliação será apagada deste aparelho."
          textoConfirmar="Remover"
          aoConfirmar={() => {
            aoRemover(removendo.id);
            setRemovendo(null);
          }}
          aoCancelar={() => setRemovendo(null)}
        />
      )}
    </Tela>
  );
}

function descreverNota(a: Avaliacao): string {
  if (a.status === "pendente") return `Pendente · vale ${f(a.pontuacaoMaxima)}`;
  if (a.status === "nao_realizada") return "Não realizada";
  return `Nota ${f(a.nota ?? 0)} de ${f(a.pontuacaoMaxima)}`;
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-fundo p-3">
      <span className="text-xs text-texto-secundario">{rotulo}</span>
      <span className="text-xl font-bold">{valor}</span>
    </div>
  );
}

// Resumo no topo da matéria (6.5).
function Resumo({ analise }: { analise: AnaliseMateria }) {
  let texto: string;
  let numeros: [string, string][];

  if (analise.modo === "pontos") {
    numeros = [
      ["Pontos conquistados", f(analise.obtidos)],
      ["Ainda disponíveis", f(analise.disponiveis)],
      ["Meta", f(analise.meta)],
      ["Falta", f(analise.falta)],
    ];
    texto = `Você tem ${f(analise.obtidos)} de ${f(analise.meta)} pontos.`;
  } else {
    let precisa: string;
    if (analise.notaNecessaria === null) precisa = "Sem pendentes";
    else if (analise.metaGarantida) precisa = "Meta garantida";
    else precisa = f(analise.notaNecessaria);

    numeros = [
      ["Média atual", analise.mediaAtual === null ? "—" : f(analise.mediaAtual)],
      ["Média necessária", f(analise.meta)],
      ["Precisa tirar nas pendentes", precisa],
    ];
    texto =
      analise.notaNecessaria !== null && !analise.alcancavel
        ? `A nota necessária passa da nota máxima (${f(analise.notaMaxima)}).`
        : analise.mediaAtual === null
          ? "Você ainda não tem notas nessa matéria."
          : `Sua média atual é ${f(analise.mediaAtual)} e sua meta é ${f(analise.meta)}.`;
  }

  return (
    <Card className="flex flex-col gap-4">
      <p>{texto}</p>
      <BarraProgresso progresso={progressoAteMeta(analise)} rotulo="Progresso até a meta" />
      <div className={`grid gap-2 ${numeros.length === 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {numeros.map(([rotulo, valor]) => (
          <Numero key={rotulo} rotulo={rotulo} valor={valor} />
        ))}
      </div>
    </Card>
  );
}
