import type { ReactNode } from "react";

interface TelaProps {
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}

// Layout padrão de cada tela: largura máxima confortável e espaçamento generoso.
export function Tela({ titulo, subtitulo, children }: TelaProps) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold leading-tight">{titulo}</h1>
        {subtitulo && <p className="text-texto-secundario">{subtitulo}</p>}
      </header>
      {children}
    </section>
  );
}
