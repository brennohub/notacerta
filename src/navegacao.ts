// Lista de telas do app, na ordem do fluxo (seção 6 do CLAUDE.md).
export type NomeTela = "boasVindas" | "escola" | "materias" | "avaliacoes" | "dashboard" | "simulador";

// Telas que aparecem na barra de navegação de baixo.
export const abas: { tela: NomeTela; rotulo: string; icone: string }[] = [
  { tela: "escola", rotulo: "Escola", icone: "🏫" },
  { tela: "materias", rotulo: "Matérias", icone: "📚" },
  { tela: "avaliacoes", rotulo: "Avaliações", icone: "📝" },
  { tela: "dashboard", rotulo: "Painel", icone: "📊" },
  { tela: "simulador", rotulo: "Simular", icone: "🔮" },
];
