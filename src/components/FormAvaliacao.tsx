import { useState } from "react";
import type { Avaliacao, ConfigEscola, StatusAvaliacao, TipoAvaliacao } from "../types";
import { formatarNumero, lerNumero, numeroParaCampo, type ResultadoValidacao } from "../engine";
import { Botao } from "./Botao";
import { Campo } from "./Campo";
import { Card } from "./Card";
import { Escolha } from "./Escolha";

export const ROTULO_TIPO: Record<TipoAvaliacao, string> = {
  prova: "Prova",
  trabalho: "Trabalho",
  simulado: "Simulado",
  atividade: "Atividade",
  participacao: "Participação",
  outro: "Outro",
};

interface Props {
  config: ConfigEscola;
  materiaId: string;
  inicial?: Avaliacao;
  aoSalvar: (avaliacao: Omit<Avaliacao, "id">) => ResultadoValidacao<string>;
  aoCancelar: () => void;
}

// Formulário de avaliação (6.5). O mesmo serve para criar e para editar.
export function FormAvaliacao({ config, materiaId, inicial, aoSalvar, aoCancelar }: Props) {
  const media = config.modo === "media";
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [tipo, setTipo] = useState<TipoAvaliacao>(inicial?.tipo ?? "prova");
  const [data, setData] = useState(inicial?.data ?? "");
  const [maxima, setMaxima] = useState(numeroParaCampo(inicial?.pontuacaoMaxima));
  const [nota, setNota] = useState(numeroParaCampo(inicial?.nota));
  const [peso, setPeso] = useState(numeroParaCampo(inicial?.peso ?? 1));
  const [status, setStatus] = useState<StatusAvaliacao | null>(inicial?.status ?? null);
  const [erros, setErros] = useState<Record<string, string | undefined>>({});

  // Nota só existe em avaliação concluída.
  const semNota = status !== null && status !== "concluida";

  function salvar() {
    if (!status) {
      setErros({ status: "Escolha a situação da avaliação." });
      return;
    }
    const resultado = aoSalvar({
      materiaId,
      nome,
      tipo,
      data: data || undefined,
      pontuacaoMaxima: media ? (config.notaMaxima ?? 0) : (lerNumero(maxima) ?? 0),
      nota: status === "concluida" ? lerNumero(nota) : null,
      peso: media ? (lerNumero(peso) ?? 0) : undefined,
      status,
    });
    setErros(resultado.erros);
  }

  return (
    <Card className="flex flex-col gap-5 border border-destaque">
      <h2 className="text-lg font-bold">{inicial ? "Editar avaliação" : "Nova avaliação"}</h2>

      <Campo
        rotulo="Nome da avaliação"
        placeholder="Ex.: Prova 1"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erros.nome}
        autoComplete="off"
      />

      <Escolha
        rotulo="Tipo"
        opcoes={(Object.keys(ROTULO_TIPO) as TipoAvaliacao[]).map((t) => ({ valor: t, rotulo: ROTULO_TIPO[t] }))}
        valor={tipo}
        aoEscolher={setTipo}
      />

      <Campo
        rotulo="Data (opcional)"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <Escolha
        rotulo="Situação"
        opcoes={[
          { valor: "concluida", rotulo: "Concluída", descricao: "Já tenho a nota" },
          { valor: "pendente", rotulo: "Pendente", descricao: "Ainda vai acontecer" },
          { valor: "nao_realizada", rotulo: "Não realizada", descricao: "Já passou e não fiz" },
        ]}
        valor={status}
        aoEscolher={(s) => {
          setStatus(s);
          if (s !== "concluida") setNota("");
        }}
        erro={erros.status}
      />

      {media ? (
        <p className="text-sm text-texto-secundario">
          Notas de 0 a {formatarNumero(config.notaMaxima ?? 0)}, a escala da sua escola.
        </p>
      ) : (
        <Campo
          rotulo="Quanto vale (pontuação máxima)"
          explicacao="Quantos pontos dá pra tirar nessa avaliação."
          inputMode="decimal"
          value={maxima}
          onChange={(e) => setMaxima(e.target.value)}
          erro={erros.pontuacaoMaxima}
        />
      )}
      {media && erros.pontuacaoMaxima && <p className="text-sm text-reagir">{erros.pontuacaoMaxima}</p>}

      <Campo
        rotulo="Nota"
        explicacao={
          status === "pendente"
            ? "A nota fica liberada quando a avaliação estiver concluída."
            : status === "nao_realizada"
              ? "Avaliação não realizada não tem nota."
              : undefined
        }
        inputMode="decimal"
        disabled={semNota}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        erro={erros.nota}
      />

      {media && (
        <Campo
          rotulo="Peso"
          explicacao="Quanto essa avaliação conta na média. Se todas contam igual, deixe 1."
          inputMode="decimal"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          erro={erros.peso}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <Botao variante="secundario" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao onClick={salvar}>Salvar</Botao>
      </div>
    </Card>
  );
}
