import type { Avaliacao, ConfigEscola, Materia } from "../types";
import { formatarData, progressoAteMeta, resumirDashboard } from "../engine";
import { BarraProgresso } from "../components/BarraProgresso";
import { Botao } from "../components/Botao";
import { Card } from "../components/Card";
import { Selo } from "../components/Selo";
import { Tela } from "../components/Tela";

interface Props {
  config: ConfigEscola | null;
  materias: Materia[];
  avaliacoes: Avaliacao[];
  aoVerMateria: (id: string) => void;
  aoIrParaEscola: () => void;
  aoIrParaMaterias: () => void;
}

const TITULO = "Fala! Bora ver como você tá? 👀";

// 6.6 — Dashboard. É calculado a partir dos dados salvos, então atualiza sozinho.
export function Dashboard({ config, materias, avaliacoes, aoVerMateria, aoIrParaEscola, aoIrParaMaterias }: Props) {
  if (!config) {
    return (
      <Tela titulo={TITULO}>
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">Primeiro, conta pra gente como sua escola calcula as notas.</p>
          <Botao onClick={aoIrParaEscola}>Configurar minha escola</Botao>
        </Card>
      </Tela>
    );
  }

  if (materias.length === 0) {
    return (
      <Tela titulo={TITULO}>
        <Card className="flex flex-col gap-4">
          <p className="text-texto-secundario">Adicione sua primeira matéria pra começar.</p>
          <Botao onClick={aoIrParaMaterias}>Adicionar matérias</Botao>
        </Card>
      </Tela>
    );
  }

  const { contagem, itens } = resumirDashboard(materias, avaliacoes, config);

  return (
    <Tela titulo={TITULO}>
      <div className="grid grid-cols-3 gap-2">
        <Contador rotulo="Tá suave" valor={contagem.suave} cor="text-suave" />
        <Contador rotulo="Fica de olho" valor={contagem.olho} cor="text-olho" />
        <Contador rotulo="Precisa reagir" valor={contagem.reagir} cor="text-reagir" />
      </div>

      <ul className="flex flex-col gap-3" aria-label="Situação das matérias">
        {itens.map(({ materia, analise, textos, proxima }) => (
          <li key={materia.id}>
            <Card className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">{materia.nome}</h2>
                <Selo classificacao={analise.classificacao} />
              </div>
              <p>{textos.situacao}</p>
              {analise.classificacao !== "sem_diagnostico" && (
                <BarraProgresso progresso={progressoAteMeta(analise)} rotulo={`Progresso em ${materia.nome}`} />
              )}
              {textos.falta && <p className="text-texto-secundario">{textos.falta}</p>}
              {analise.classificacao === "sem_diagnostico" && (
                <p className="text-texto-secundario">{analise.mensagem}</p>
              )}
              {proxima && (
                <p className="text-sm text-texto-secundario">
                  📅 Próxima avaliação: <span className="text-texto">{proxima.nome}</span> ·{" "}
                  {formatarData(proxima.data ?? "")}
                </p>
              )}
              <Botao variante="secundario" onClick={() => aoVerMateria(materia.id)}>
                Ver minha situação
              </Botao>
            </Card>
          </li>
        ))}
      </ul>
    </Tela>
  );
}

function Contador({ rotulo, valor, cor }: { rotulo: string; valor: number; cor: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-card px-2 py-3 text-center">
      <span className={`text-2xl font-bold ${cor}`} aria-label={`${rotulo}: ${valor}`}>
        {valor}
      </span>
      <span className="text-xs leading-tight text-texto-secundario">{rotulo}</span>
    </div>
  );
}
