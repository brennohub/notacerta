export function AvisoArmazenamento({ mensagem }: { mensagem: string }) {
  return (
    <div role="alert" className="bg-reagir/15 px-4 py-3 text-center text-sm text-reagir">
      {mensagem}
    </div>
  );
}
