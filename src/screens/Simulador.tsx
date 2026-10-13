import { useState } from "react";
import type { Avaliacao, ConfigEscola, Materia } from "../types";
import {
  analisarMateria,
  descreverSimulacao,
  formatarNumero as f,
  lerNumero,
  notaHipoteticaValida,
  progressoAteMeta,
  simular,
  textosMateria,
} from "../engine";
import { BarraProgresso } from "../components/BarraProgresso";
import { Botao } from "../components/Botao";
import { Card } from "../components/Card";
import { Selo } from "../components/Selo";
import { Tela } from "../components/Tela";

interface Props {
  config: ConfigEscola | null;
  materias: Materia[];
  avaliacoes: Avaliacao[];
  materiaId: string | null;
  aoAbrirMateria: (id: string | null) => void;
  aoIrParaAvaliacoes: (id: string) => void;
  aoIrParaEscola: () => void;
  aoIrParaMaterias: () => void;
}

const TITULO = "E se eu tirar...?";
const CENARIOS = ["Conservador", "Provável", "Melhor resultado"] as const;
type Cenario = (typeof CENARIOS)[number];
const AVISO = "Isso é uma simulação com os valores que você digitou, não uma garantia.";

// Seção 8 — Simulador. Tudo aqui fica só na tela: nada é salvo.
export function Simulador(props: Props) {
  const { config, materias, materiaId, aoAbrirMateria } = props;

  if (!config) {
    return (
      <Tela titulo={TITULO}>
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">Primeiro, conta pra gente como sua escola calcula as notas.</p>
          <Botao onClick={props.aoIrParaEscola}>Configurar minha escola</Botao>
        </Card>
      </Tela>
    );
  }

  if (materias.length === 0) {
    return (
      <Tela titulo={TITULO}>
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">Adicione sua primeira matéria pra começar.</p>
          <Botao onClick={props.aoIrParaMaterias}>Adicionar matérias</Botao>
        </Card>
      </Tela>
    );
  }

  const materia = materias.find((m) => m.id === materiaId);
  if (!materia) {
    return (
      <Tela titulo={TITULO} subtitulo="Escolha uma matéria pra simular notas nas avaliações pendentes.">
        <div className="flex flex-col gap-2">
          {materias.map((m) => (
            <Botao key={m.id} variante="secundario" onClick={() => aoAbrirMateria(m.id)}>
              {m.nome}
            </Botao>
          ))}
        </div>
      </Tela>
    );
  }

  // A chave zera os cenários quando a matéria muda.
  return <SimuladorDaMateria key={materia.id} {...props} config={config} materia={materia} />;
}

function SimuladorDaMateria({
  config,
  materia,
  avaliacoes,
  aoAbrirMateria,
  aoIrParaAvaliacoes,
}: Props & { config: ConfigEscola; materia: Materia }) {
  const [notas, setNotas] = useState<Record<Cenario, Record<string, string>>>({
    Conservador: {},
    Provável: {},
    "Melhor resultado": {},
  });

  const daMateria = avaliacoes.filter((a) => a.materiaId === materia.id);
  const pendentes = daMateria.filter((a) => a.status === "pendente");
  const real = analisarMateria(materia, daMateria, config);

  function digitar(cenario: Cenario, id: string, valor: string) {
    setNotas((atual) => ({ ...atual, [cenario]: { ...atual[cenario], [id]: valor } }));
  }

  // Erro de um campo: texto que não é número, ou nota fora de 0..máximo.
  function erroDoCampo(texto: string | undefined, avaliacao: Avaliacao): string | null {
    if (!texto || texto.trim() === "") return null;
    const nota = lerNumero(texto);
    if (nota === null) return "Número inválido";
    if (!notaHipoteticaValida(nota, avaliacao)) return `De 0 a ${f(avaliacao.pontuacaoMaxima)}`;
    return null;
  }

  // Só entram na conta as notas válidas.
  function notasValidas(cenario: Cenario): Record<string, number> {
    const resultado: Record<string, number> = {};
    for (const a of pendentes) {
      const texto = notas[cenario][a.id];
      const nota = texto ? lerNumero(texto) : null;
      if (nota !== null && erroDoCampo(texto, a) === null) resultado[a.id] = nota;
    }
    return resultado;
  }

  return (
    <Tela titulo={TITULO}>
      <Botao variante="secundario" onClick={() => aoAbrirMateria(null)}>
        ← Trocar matéria
      </Botao>

      <Card className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{materia.nome}</h2>
          <Selo classificacao={real.classificacao} />
        </div>
        <p className="text-sm text-texto-secundario">Hoje: {textosMateria(real).situacao}</p>
      </Card>

      {pendentes.length === 0 ? (
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">
            Essa matéria não tem avaliações pendentes pra simular. Cadastre uma avaliação pendente primeiro.
          </p>
          <Botao onClick={() => aoIrParaAvaliacoes(materia.id)}>Ir para avaliações</Botao>
        </Card>
      ) : (
        <>
          <p role="note" className="rounded-xl bg-destaque/10 px-4 py-3 text-sm text-destaque">
            {AVISO}
          </p>

          <Card className="flex flex-col gap-4">
            <p className="text-sm text-texto-secundario">
              Digite as notas que você imagina tirar em cada cenário. Pode deixar em branco.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-texto-secundario">
              {CENARIOS.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            {pendentes.map((a) => (
              <div key={a.id} className="flex flex-col gap-1.5">
                <p className="font-medium">
                  {a.nome} <span className="text-sm font-normal text-texto-secundario">· vale {f(a.pontuacaoMaxima)}</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {CENARIOS.map((c) => {
                    const erro = erroDoCampo(notas[c][a.id], a);
                    return (
                      <div key={c} className="flex flex-col gap-1">
                        <input
                          aria-label={`${c}: nota em ${a.nome}`}
                          aria-invalid={erro ? true : undefined}
                          inputMode="decimal"
                          value={notas[c][a.id] ?? ""}
                          onChange={(e) => digitar(c, a.id, e.target.value)}
                          className={`min-h-12 w-full min-w-0 rounded-xl border bg-fundo px-2 text-center text-base text-texto outline-none focus:border-destaque ${
                            erro ? "border-reagir" : "border-borda"
                          }`}
                        />
                        {erro && <span className="text-xs text-reagir">{erro}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Resultados da simulação">
            {CENARIOS.map((c) => {
              const analise = simular(materia, daMateria, config, notasValidas(c));
              const d = descreverSimulacao(analise);
              return (
                <li key={c}>
                  <Card className="flex h-full flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold">{c}</h3>
                      <Selo classificacao={analise.classificacao} />
                    </div>
                    <p className="text-xl font-bold">{d.projetado}</p>
                    <BarraProgresso progresso={progressoAteMeta(analise)} rotulo={`Progresso no cenário ${c}`} />
                    <p>{d.distancia}</p>
                    {d.possivel && <p className="text-sm text-texto-secundario">{d.possivel}</p>}
                    {d.restantes && <p className="text-sm text-texto-secundario">{d.restantes}</p>}
                  </Card>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Tela>
  );
}
