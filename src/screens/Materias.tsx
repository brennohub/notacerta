import { useState } from "react";
import type { ConfigEscola, Materia } from "../types";
import { formatarNumero, lerNumero, numeroParaCampo, type ResultadoValidacao } from "../engine";
import { Botao } from "../components/Botao";
import { Campo } from "../components/Campo";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { Confirmacao } from "../components/Confirmacao";
import { Tela } from "../components/Tela";

type ErrosMateria = ResultadoValidacao<"nome" | "meta" | "totalPontos">;

interface Props {
  config: ConfigEscola | null;
  materias: Materia[];
  aoAdicionar: (nome: string) => ErrosMateria;
  aoEditar: (materia: Materia) => ErrosMateria;
  aoRemover: (id: string) => void;
  aoConfigurarEscola: () => void;
}

const SUGESTOES = [
  "Matemática",
  "Português",
  "Física",
  "Química",
  "Biologia",
  "História",
  "Geografia",
  "Filosofia",
  "Sociologia",
  "Inglês",
  "Redação",
];

const mesmoNome = (a: string, b: string) => a.trim().toLocaleLowerCase("pt-BR") === b.trim().toLocaleLowerCase("pt-BR");

// 6.4 — "Quais são suas matérias?"
export function Materias({ config, materias, aoAdicionar, aoEditar, aoRemover, aoConfigurarEscola }: Props) {
  const [nomeLivre, setNomeLivre] = useState("");
  const [erroNovo, setErroNovo] = useState<string | undefined>();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<Materia | null>(null);

  if (!config) {
    return (
      <Tela titulo="Quais são suas matérias?">
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">Antes das matérias, conta pra gente como sua escola calcula as notas.</p>
          <Botao onClick={aoConfigurarEscola}>Configurar minha escola</Botao>
        </Card>
      </Tela>
    );
  }

  const sugestoes = SUGESTOES.filter((s) => !materias.some((m) => mesmoNome(m.nome, s)));

  function adicionarLivre() {
    const resultado = aoAdicionar(nomeLivre);
    setErroNovo(resultado.erros.nome);
    if (resultado.valido) setNomeLivre("");
  }

  return (
    <Tela
      titulo="Quais são suas matérias?"
      subtitulo="Toque para adicionar. Não precisa cadastrar todas agora."
    >
      {sugestoes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sugestoes.map((nome) => (
            <Chip key={nome} onClick={() => aoAdicionar(nome)}>
              + {nome}
            </Chip>
          ))}
        </div>
      )}

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          adicionarLivre();
        }}
      >
        <Campo
          rotulo="Outra matéria"
          placeholder="Ex.: Artes"
          value={nomeLivre}
          onChange={(e) => {
            setNomeLivre(e.target.value);
            setErroNovo(undefined);
          }}
          erro={erroNovo}
          autoComplete="off"
        />
        <Botao type="submit" variante="secundario" disabled={nomeLivre.trim() === ""}>
          Adicionar
        </Botao>
      </form>

      {materias.length === 0 ? (
        <Card>
          <p className="text-texto-secundario">Adicione sua primeira matéria pra começar.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Suas matérias">
          {materias.map((materia) => (
            <li key={materia.id}>
              {editandoId === materia.id ? (
                <EditarMateria
                  materia={materia}
                  config={config}
                  aoSalvar={(m) => {
                    const r = aoEditar(m);
                    if (r.valido) setEditandoId(null);
                    return r;
                  }}
                  aoCancelar={() => setEditandoId(null)}
                />
              ) : (
                <Card className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{materia.nome}</h2>
                    <p className="text-sm text-texto-secundario">{descreverMeta(materia, config)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Botao variante="secundario" onClick={() => setEditandoId(materia.id)}>
                      Editar
                    </Botao>
                    <Botao variante="secundario" className="text-reagir!" onClick={() => setRemovendo(materia)}>
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
          mensagem="As avaliações dessa matéria também serão apagadas."
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

function descreverMeta(materia: Materia, config: ConfigEscola): string {
  return config.modo === "pontos"
    ? `Meta: ${formatarNumero(materia.meta)} de ${formatarNumero(materia.totalPontos ?? 0)} pontos`
    : `Média meta: ${formatarNumero(materia.meta)} (nota máxima ${formatarNumero(config.notaMaxima ?? 0)})`;
}

interface EditarProps {
  materia: Materia;
  config: ConfigEscola;
  aoSalvar: (materia: Materia) => ErrosMateria;
  aoCancelar: () => void;
}

function EditarMateria({ materia, config, aoSalvar, aoCancelar }: EditarProps) {
  const [nome, setNome] = useState(materia.nome);
  const [meta, setMeta] = useState(numeroParaCampo(materia.meta));
  const [total, setTotal] = useState(numeroParaCampo(materia.totalPontos));
  const [erros, setErros] = useState<ErrosMateria["erros"]>({});
  const pontos = config.modo === "pontos";

  return (
    <Card className="flex flex-col gap-4 border border-destaque">
      <Campo rotulo="Nome da matéria" value={nome} onChange={(e) => setNome(e.target.value)} erro={erros.nome} />
      {pontos && (
        <Campo
          rotulo="Total de pontos da matéria"
          explicacao="Quantos pontos dá pra somar nessa matéria no período."
          inputMode="decimal"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          erro={erros.totalPontos}
        />
      )}
      <Campo
        rotulo={pontos ? "Pontos para a meta" : "Média que você precisa"}
        explicacao="Começa igual à da escola, mas você pode mudar só nessa matéria."
        inputMode="decimal"
        value={meta}
        onChange={(e) => setMeta(e.target.value)}
        erro={erros.meta}
      />
      <div className="grid grid-cols-2 gap-2">
        <Botao variante="secundario" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao
          onClick={() => {
            const r = aoSalvar({
              ...materia,
              nome,
              meta: lerNumero(meta) ?? 0,
              totalPontos: pontos ? (lerNumero(total) ?? 0) : undefined,
            });
            setErros(r.erros);
          }}
        >
          Salvar
        </Botao>
      </div>
    </Card>
  );
}
