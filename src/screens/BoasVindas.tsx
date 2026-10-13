import { Botao } from "../components/Botao";

interface Props {
  // Ainda não existe catálogo de escolas (6.2), então os dois botões levam à configuração.
  // A mensagem "Sua escola ainda não está cadastrada" entra na etapa 3.
  aoComecar: () => void;
}

export function BoasVindas({ aoComecar }: Props) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold text-destaque">NotaCerta</p>
        <h1 className="text-3xl font-bold leading-tight">Bora organizar esse ano? 👀</h1>
        <p className="text-lg text-texto-secundario">
          Configure sua escola e suas notas. O NotaCerta te ajuda a entender como você está.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Botao onClick={aoComecar}>Encontrar minha escola</Botao>
        <Botao variante="secundario" onClick={aoComecar}>
          Configurar manualmente
        </Botao>
      </div>
    </section>
  );
}
