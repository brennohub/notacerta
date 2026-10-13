// Converte o texto digitado em número. Aceita vírgula ou ponto ("32,5" ou "32.5").
// Campo vazio ou inválido vira null — nunca 0, porque "sem nota" é diferente de nota zero.
export function lerNumero(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

// Mostra um número no jeito brasileiro, com no máximo 2 casas: 6.666 → "6,67".
export function formatarNumero(numero: number): string {
  return numero.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
