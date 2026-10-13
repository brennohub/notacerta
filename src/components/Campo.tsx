import { useId, type InputHTMLAttributes } from "react";

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  explicacao?: string;
  erro?: string;
}

// Campo de formulário com rótulo, explicação curta embaixo e mensagem de erro.
export function Campo({ rotulo, explicacao, erro, className = "", ...props }: CampoProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        className={`min-h-12 w-full rounded-xl border bg-fundo px-4 text-base text-texto outline-none focus:border-destaque disabled:opacity-50 ${
          erro ? "border-reagir" : "border-borda"
        } ${className}`}
        {...props}
      />
      {explicacao && <p className="text-sm text-texto-secundario">{explicacao}</p>}
      {erro && <p className="text-sm text-reagir">{erro}</p>}
    </div>
  );
}
