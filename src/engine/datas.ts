// "2026-03-15" → "15/03/2026". Texto fora desse formato volta como veio.
export function formatarData(iso: string): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : iso;
}
