import { Botao } from "../components/Botao";

interface Props {
  aoEncontrar: () => void;
  aoConfigurar: () => void;
}

export function BoasVindas({ aoEncontrar, aoConfigurar }: Props) {
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
        <Botao onClick={aoEncontrar}>Encontrar minha escola</Botao>
        <Botao variante="secundario" onClick={aoConfigurar}>
          Configurar manualmente
        </Botao>
      </div>
    </section>
  );
}
