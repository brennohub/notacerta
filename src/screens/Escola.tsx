import { useState } from "react";
import type { ConfigEscola, ModoCalculo, TipoPeriodo } from "../types";
import { errosDeNumero, lerNumero, numeroParaCampo, opcoesPeriodo, type ResultadoValidacao } from "../engine";
import { Botao } from "../components/Botao";
import { Campo } from "../components/Campo";
import { Card } from "../components/Card";
import { Confirmacao } from "../components/Confirmacao";
import { Escolha } from "../components/Escolha";
import { Tela } from "../components/Tela";

interface Props {
  config: ConfigEscola | null;
  nomeSugerido: string;
  temMaterias: boolean;
  aoSalvar: (config: ConfigEscola) => ResultadoValidacao<string>;
  aoSalvo: () => void;
  aoApagarTudo: () => void;
}

const SERIES = ["1º ano", "2º ano", "3º ano", "4º ano"];

// 6.3 — Configurar manualmente.
export function Escola({ config, nomeSugerido, temMaterias, aoSalvar, aoSalvo, aoApagarTudo }: Props) {
  const [nomeEscola, setNomeEscola] = useState(config?.nomeEscola ?? nomeSugerido);
  const [serie, setSerie] = useState<string | null>(config?.serie ?? null);
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo | null>(config?.tipoPeriodo ?? null);
  const [periodoAtual, setPeriodoAtual] = useState<string | null>(config?.periodoAtual ?? null);
  const [modo, setModo] = useState<ModoCalculo | null>(config?.modo ?? null);
  const [total, setTotal] = useState(numeroParaCampo(config?.totalPeriodo));
  const [meta, setMeta] = useState(numeroParaCampo(config?.metaPeriodo));
  const [notaMaxima, setNotaMaxima] = useState(numeroParaCampo(config?.notaMaxima));
  const [mediaMeta, setMediaMeta] = useState(numeroParaCampo(config?.mediaMeta));
  const [temRecuperacao, setTemRecuperacao] = useState<"sim" | "nao" | null>(
    config ? (config.temRecuperacao ? "sim" : "nao") : null,
  );
  const [observacoes, setObservacoes] = useState(config?.observacoesRecuperacao ?? "");
  const [erros, setErros] = useState<Record<string, string | undefined>>({});
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  function escolherTipo(tipo: TipoPeriodo) {
    setTipoPeriodo(tipo);
    if (!periodoAtual || !opcoesPeriodo(tipo).includes(periodoAtual)) setPeriodoAtual(opcoesPeriodo(tipo)[0]);
  }

  function salvar() {
    // Campos de escolha que ainda não foram tocados.
    const faltando: Record<string, string> = {};
    if (!serie) faltando.serie = "Escolha sua série.";
    if (!tipoPeriodo || !periodoAtual) faltando.tipoPeriodo = "Escolha o período.";
    if (!modo) faltando.modo = "Escolha como sua escola calcula a nota.";
    if (!temRecuperacao) faltando.temRecuperacao = "Escolha sim ou não.";
    if (!serie || !tipoPeriodo || !periodoAtual || !modo || !temRecuperacao) {
      setErros(faltando);
      return;
    }

    const nova: ConfigEscola = {
      nomeEscola: nomeEscola.trim() || undefined,
      serie,
      tipoPeriodo,
      periodoAtual,
      modo,
      ...(modo === "pontos"
        ? { totalPeriodo: lerNumero(total) ?? undefined, metaPeriodo: lerNumero(meta) ?? undefined }
        : { notaMaxima: lerNumero(notaMaxima) ?? undefined, mediaMeta: lerNumero(mediaMeta) ?? undefined }),
      temRecuperacao: temRecuperacao === "sim",
      observacoesRecuperacao: temRecuperacao === "sim" ? observacoes.trim() || undefined : undefined,
    };

    const resultado = aoSalvar(nova);
    const numeros =
      modo === "pontos"
        ? errosDeNumero({ totalPeriodo: total, metaPeriodo: meta })
        : errosDeNumero({ notaMaxima, mediaMeta });
    setErros({ ...resultado.erros, ...numeros });
    if (resultado.valido) aoSalvo();
  }

  const temErros = Object.values(erros).some(Boolean);
  const mudouModo = config !== null && modo !== null && modo !== config.modo && temMaterias;

  return (
    <Tela titulo="Sua escola" subtitulo="Conta pra gente como sua escola calcula as notas.">
      <Card className="flex flex-col gap-6">
        <Campo
          rotulo="Nome da escola (opcional)"
          explicacao="Só pra você reconhecer. Não é obrigatório."
          value={nomeEscola}
          maxLength={80}
          onChange={(e) => setNomeEscola(e.target.value)}
          autoComplete="off"
        />

        <Escolha
          rotulo="Série"
          opcoes={SERIES.map((s) => ({ valor: s, rotulo: s }))}
          valor={serie}
          aoEscolher={setSerie}
          erro={erros.serie}
        />

        <Escolha
          rotulo="Período"
          explicacao="Como o ano da sua escola é dividido."
          opcoes={[
            { valor: "bimestre", rotulo: "Bimestre" },
            { valor: "trimestre", rotulo: "Trimestre" },
            { valor: "semestre", rotulo: "Semestre" },
          ]}
          valor={tipoPeriodo}
          aoEscolher={escolherTipo}
          erro={erros.tipoPeriodo}
        />

        {tipoPeriodo && (
          <Escolha
            rotulo="Em qual período você está?"
            opcoes={opcoesPeriodo(tipoPeriodo).map((p) => ({ valor: p, rotulo: p }))}
            valor={periodoAtual}
            aoEscolher={setPeriodoAtual}
          />
        )}

        <Escolha
          rotulo="Como sua escola calcula a nota?"
          opcoes={[
            { valor: "pontos", rotulo: "Somando pontos", descricao: "Ex.: você precisa de 18 de 30 pontos" },
            { valor: "media", rotulo: "Fazendo média", descricao: "Ex.: você precisa de média 6 de 10" },
          ]}
          valor={modo}
          aoEscolher={setModo}
          erro={erros.modo}
        />
        {mudouModo && (
          <p className="text-sm text-olho">
            Ao trocar o jeito de calcular, as metas das suas matérias voltam para o padrão da escola.
          </p>
        )}

        {modo === "pontos" && (
          <>
            <Campo
              rotulo="Quantos pontos você pode somar neste período?"
              explicacao="Some todos os pontos de provas, trabalhos, simulados e outras avaliações."
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              erro={erros.totalPeriodo}
            />
            <Campo
              rotulo="Quantos pontos você precisa para atingir a meta?"
              explicacao="Informe a pontuação mínima exigida pela sua escola."
              inputMode="decimal"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              erro={erros.metaPeriodo}
            />
          </>
        )}

        {modo === "media" && (
          <>
            <Campo
              rotulo="Qual a nota máxima?"
              explicacao="A maior nota possível numa avaliação. Ex.: 10"
              inputMode="decimal"
              value={notaMaxima}
              onChange={(e) => setNotaMaxima(e.target.value)}
              erro={erros.notaMaxima}
            />
            <Campo
              rotulo="Qual a média que você precisa?"
              explicacao="A média mínima exigida pela sua escola. Ex.: 6"
              inputMode="decimal"
              value={mediaMeta}
              onChange={(e) => setMediaMeta(e.target.value)}
              erro={erros.mediaMeta}
            />
          </>
        )}

        <Escolha
          rotulo="Existe recuperação?"
          explicacao="Se a sua escola dá outra chance quando a nota não chega na meta."
          opcoes={[
            { valor: "sim", rotulo: "Sim" },
            { valor: "nao", rotulo: "Não" },
          ]}
          valor={temRecuperacao}
          aoEscolher={setTemRecuperacao}
          erro={erros.temRecuperacao}
        />
        {temRecuperacao === "sim" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="observacoes" className="font-medium">
              Como funciona a recuperação? (opcional)
            </label>
            <textarea
              id="observacoes"
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full rounded-xl border border-borda bg-fundo px-4 py-3 text-base text-texto outline-none focus:border-destaque"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {temErros && <p className="text-sm text-reagir">Confere os campos marcados em vermelho.</p>}
          <Botao onClick={salvar}>Salvar e continuar</Botao>
        </div>
      </Card>

      {config && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Seus dados</h2>
          <p className="text-sm text-texto-secundario">
            Apaga a configuração da escola, as matérias e as avaliações deste aparelho.
          </p>
          <Botao variante="perigo" onClick={() => setConfirmarApagar(true)}>
            Apagar todos os meus dados
          </Botao>
        </Card>
      )}

      {confirmarApagar && (
        <Confirmacao
          titulo="Apagar todos os seus dados?"
          mensagem="Isso apaga a escola, as matérias e as avaliações deste aparelho. Não dá pra desfazer."
          textoConfirmar="Apagar tudo"
          aoConfirmar={() => {
            setConfirmarApagar(false);
            aoApagarTudo();
          }}
          aoCancelar={() => setConfirmarApagar(false)}
        />
      )}
    </Tela>
  );
}
