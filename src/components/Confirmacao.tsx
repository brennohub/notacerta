import { Botao } from "./Botao";

interface ConfirmacaoProps {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

// Janela que pede confirmação antes de uma ação que apaga dados.
export function Confirmacao({ titulo, mensagem, textoConfirmar, aoConfirmar, aoCancelar }: ConfirmacaoProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacao-titulo"
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-card p-5"
      >
        <h2 id="confirmacao-titulo" className="text-lg font-bold">
          {titulo}
        </h2>
        <p className="text-texto-secundario">{mensagem}</p>
        <div className="flex flex-col gap-2">
          <Botao variante="perigo" onClick={aoConfirmar}>
            {textoConfirmar}
          </Botao>
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar
          </Botao>
        </div>
      </div>
    </div>
  );
}
