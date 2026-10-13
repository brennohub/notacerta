import { Card } from "./Card";

// Aviso honesto para telas que ainda não foram construídas (nada de botão de mentira).
export function EmBreve({ etapa }: { etapa: number }) {
  return (
    <Card className="border border-dashed border-borda">
      <p className="text-texto-secundario">
        🚧 Essa parte ainda está em construção e chega na <strong className="text-texto">etapa {etapa}</strong>.
      </p>
    </Card>
  );
}
