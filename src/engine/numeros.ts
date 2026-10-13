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

// Número para mostrar dentro de um campo de texto: 32.5 → "32,5"; vazio → "".
export function numeroParaCampo(numero: number | undefined | null): string {
  return numero === undefined || numero === null ? "" : String(numero).replace(".", ",");
}

export const ERRO_NAO_NUMERO = "Digite só números (ex.: 32,5).";

// Campo preenchido com algo que não é número (ex.: "abc").
export function naoENumero(texto: string): boolean {
  return texto.trim() !== "" && lerNumero(texto) === null;
}

// Recebe { campo: textoDigitado } e devolve erro só nos campos que não são número.
export function errosDeNumero<Campo extends string>(campos: Partial<Record<Campo, string>>): Partial<Record<Campo, string>> {
  const erros: Partial<Record<Campo, string>> = {};
  for (const campo in campos) {
    const texto = campos[campo];
    if (texto !== undefined && naoENumero(texto)) erros[campo] = ERRO_NAO_NUMERO;
  }
  return erros;
}
