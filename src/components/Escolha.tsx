export interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
  descricao?: string;
}

interface EscolhaProps<T extends string> {
  rotulo: string;
  explicacao?: string;
  opcoes: Opcao<T>[];
  valor: T | null;
  aoEscolher: (valor: T) => void;
  erro?: string;
}

// Grupo de botões grandes para escolher uma opção (funciona bem com o dedo).
export function Escolha<T extends string>({ rotulo, explicacao, opcoes, valor, aoEscolher, erro }: EscolhaProps<T>) {
  const temDescricao = opcoes.some((o) => o.descricao);
  const colunas = temDescricao
    ? "grid-cols-1 sm:grid-cols-2"
    : opcoes.length === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : opcoes.length === 3
        ? "grid-cols-3"
        : "grid-cols-2";

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 font-medium">{rotulo}</legend>
      <div role="radiogroup" aria-label={rotulo} className={`grid gap-2 ${colunas}`}>
        {opcoes.map((opcao) => {
          const marcada = opcao.valor === valor;
          return (
            <button
              key={opcao.valor}
              type="button"
              role="radio"
              aria-checked={marcada}
              onClick={() => aoEscolher(opcao.valor)}
              className={`flex min-h-12 flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition ${
                marcada ? "border-destaque bg-destaque/10 text-destaque" : "border-borda bg-fundo text-texto"
              }`}
            >
              <span className="font-semibold">{opcao.rotulo}</span>
              {opcao.descricao && <span className="text-sm text-texto-secundario">{opcao.descricao}</span>}
            </button>
          );
        })}
      </div>
      {explicacao && <p className="text-sm text-texto-secundario">{explicacao}</p>}
      {erro && <p className="text-sm text-reagir">{erro}</p>}
    </fieldset>
  );
}
