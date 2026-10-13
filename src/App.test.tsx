import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  // O jsdom não implementa scrollTo; trocamos por uma função vazia nos testes.
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

const tocar = (nome: string | RegExp) => fireEvent.click(screen.getByRole("button", { name: nome }));
const escolher = (nome: string | RegExp) => fireEvent.click(screen.getByRole("radio", { name: nome }));
const digitar = (rotulo: string, valor: string) =>
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });

function preencherEscola(total: string, meta: string) {
  escolher("2º ano");
  escolher("Trimestre");
  escolher(/Somando pontos/);
  digitar("Quantos pontos você pode somar neste período?", total);
  digitar("Quantos pontos você precisa para atingir a meta?", meta);
  escolher("Não");
}

describe("Boas-vindas e navegação", () => {
  it("abre na tela de boas-vindas quando não há dados", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Bora organizar esse ano? 👀" })).toBeTruthy();
  });

  it("Encontrar minha escola: sem catálogo, leva à configuração manual com o nome digitado", () => {
    render(<App />);
    tocar("Encontrar minha escola");
    digitar("Nome da escola", "Colégio Teste");
    tocar("Buscar");
    expect(screen.getByText(/Sua escola ainda não está cadastrada no NotaCerta/)).toBeTruthy();
    tocar("Configurar manualmente");
    expect(screen.getByRole("heading", { name: "Sua escola" })).toBeTruthy();
    expect((screen.getByLabelText("Nome da escola (opcional)") as HTMLInputElement).value).toBe("Colégio Teste");
  });

  it("troca de tela pela barra de navegação", () => {
    render(<App />);
    tocar("Configurar manualmente");
    tocar(/Simular/);
    expect(screen.getByRole("heading", { name: "E se eu tirar...?" })).toBeTruthy();
    tocar("NotaCerta");
    expect(screen.getByRole("heading", { name: "Bora organizar esse ano? 👀" })).toBeTruthy();
  });
});

describe("Configuração da escola", () => {
  it("bloqueia meta maior que o total e deixa corrigir no mesmo lugar", () => {
    render(<App />);
    tocar("Configurar manualmente");
    preencherEscola("10", "18");
    tocar("Salvar e continuar");
    expect(screen.getByText("Sua meta passou do total de pontos possíveis. Confere os valores?")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Sua escola" })).toBeTruthy();

    digitar("Quantos pontos você pode somar neste período?", "32,5");
    tocar("Salvar e continuar");
    expect(screen.getByRole("heading", { name: "Quais são suas matérias?" })).toBeTruthy();
  });

  it("não avança sem escolher as opções obrigatórias", () => {
    render(<App />);
    tocar("Configurar manualmente");
    tocar("Salvar e continuar");
    expect(screen.getByText("Escolha sua série.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Sua escola" })).toBeTruthy();
  });
});

describe("Matérias com dados salvos", () => {
  function configurar() {
    render(<App />);
    tocar("Configurar manualmente");
    preencherEscola("30", "18");
    tocar("Salvar e continuar");
  }

  it("adiciona pelo chip, guarda no aparelho e continua lá ao abrir de novo", () => {
    configurar();
    expect(screen.getByText("Adicione sua primeira matéria pra começar.")).toBeTruthy();
    tocar("+ Matemática");
    const lista = screen.getByRole("list", { name: "Suas matérias" });
    expect(within(lista).getByText("Matemática")).toBeTruthy();
    expect(within(lista).getByText("Meta: 18 de 30 pontos")).toBeTruthy();
    // O chip some depois de adicionado.
    expect(screen.queryByRole("button", { name: "+ Matemática" })).toBeNull();

    // "Fecha e abre o navegador": desmonta e monta o app de novo.
    cleanup();
    render(<App />);
    expect(screen.getByRole("heading", { name: "Quais são suas matérias?" })).toBeTruthy();
    expect(screen.getByText("Matemática")).toBeTruthy();
  });

  it("adiciona matéria com nome livre e não deixa repetir", () => {
    configurar();
    digitar("Outra matéria", "Artes");
    tocar("Adicionar");
    expect(screen.getByText("Artes")).toBeTruthy();
    digitar("Outra matéria", "artes");
    tocar("Adicionar");
    expect(screen.getByText("Você já tem uma matéria com esse nome.")).toBeTruthy();
  });

  it("edita a meta da matéria com validação", () => {
    configurar();
    tocar("+ Física");
    tocar("Editar");
    digitar("Pontos para a meta", "40");
    tocar("Salvar");
    expect(screen.getByText("Sua meta passou do total de pontos possíveis. Confere os valores?")).toBeTruthy();
    digitar("Pontos para a meta", "20");
    tocar("Salvar");
    expect(screen.getByText("Meta: 20 de 30 pontos")).toBeTruthy();
  });

  it("remover pede confirmação antes de apagar", () => {
    configurar();
    tocar("+ Química");
    tocar("Remover");
    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText("Remover Química?")).toBeTruthy();
    fireEvent.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("Química")).toBeTruthy();

    tocar("Remover");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remover" }));
    expect(screen.getByText("Adicione sua primeira matéria pra começar.")).toBeTruthy();
  });

  it("apagar todos os dados volta para o início e limpa o aparelho", () => {
    configurar();
    tocar("+ Biologia");
    tocar(/Escola/);
    tocar("Apagar todos os meus dados");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Apagar tudo" }));
    expect(screen.getByRole("heading", { name: "Bora organizar esse ano? 👀" })).toBeTruthy();
    expect(localStorage.getItem("notacerta:dados")).toBeNull();
  });
});

describe("Avaliações e resumo da matéria", () => {
  function abrirMateria(nome: string) {
    tocar(`+ ${nome}`);
    const lista = screen.getByRole("list", { name: "Suas matérias" });
    fireEvent.click(within(lista).getByRole("button", { name: "Avaliações" }));
    expect(screen.getByRole("heading", { name: nome })).toBeTruthy();
  }

  function novaAvaliacao(nome: string, situacao: RegExp, campos: Record<string, string>) {
    tocar("+ Nova avaliação");
    digitar("Nome da avaliação", nome);
    escolher(situacao);
    for (const [rotulo, valor] of Object.entries(campos)) digitar(rotulo, valor);
    tocar("Salvar");
  }

  function numeroDoResumo(rotulo: string) {
    return screen.getByText(rotulo).nextSibling?.textContent;
  }

  function configurarPontos() {
    render(<App />);
    tocar("Configurar manualmente");
    preencherEscola("30", "18");
    tocar("Salvar e continuar");
  }

  it("modo pontos: cadastra concluída e pendente e mostra o resumo (caso 9.1)", () => {
    configurarPontos();
    abrirMateria("Matemática");
    expect(screen.getByText("Adicione sua primeira avaliação dessa matéria.")).toBeTruthy();

    novaAvaliacao("P1", /Concluída/, { "Quanto vale (pontuação máxima)": "12", Nota: "12" });
    novaAvaliacao("P2", /Pendente/, { "Quanto vale (pontuação máxima)": "18" });

    expect(numeroDoResumo("Pontos conquistados")).toBe("12");
    expect(numeroDoResumo("Ainda disponíveis")).toBe("18");
    expect(numeroDoResumo("Meta")).toBe("18");
    expect(numeroDoResumo("Falta")).toBe("6");
    expect(screen.getByText("Nota 12 de 12")).toBeTruthy();
    expect(screen.getByText("Pendente · vale 18")).toBeTruthy();

    // Continua lá depois de fechar e abrir o app.
    cleanup();
    render(<App />);
    fireEvent.click(within(screen.getByRole("list", { name: "Suas matérias" })).getByRole("button", { name: "Avaliações" }));
    expect(screen.getByText("Nota 12 de 12")).toBeTruthy();
  });

  it("nota fica desabilitada quando a avaliação está pendente", () => {
    configurarPontos();
    abrirMateria("Física");
    tocar("+ Nova avaliação");
    escolher(/Pendente/);
    expect((screen.getByLabelText("Nota") as HTMLInputElement).disabled).toBe(true);
    escolher(/Concluída/);
    expect((screen.getByLabelText("Nota") as HTMLInputElement).disabled).toBe(false);
  });

  it("bloqueia nota acima do máximo e concluída sem nota", () => {
    configurarPontos();
    abrirMateria("Química");
    novaAvaliacao("P1", /Concluída/, { "Quanto vale (pontuação máxima)": "10", Nota: "11" });
    expect(screen.getByText("A nota passou da pontuação máxima da avaliação.")).toBeTruthy();
    digitar("Nota", "");
    tocar("Salvar");
    expect(screen.getByText("Avaliação concluída precisa de nota.")).toBeTruthy();
    digitar("Nota", "9,5");
    tocar("Salvar");
    expect(screen.getByText("Nota 9,5 de 10")).toBeTruthy();
  });

  it("editar atualiza o resumo e remover pede confirmação", () => {
    configurarPontos();
    abrirMateria("Biologia");
    novaAvaliacao("P1", /Pendente/, { "Quanto vale (pontuação máxima)": "10" });
    tocar("Editar");
    escolher(/Concluída/);
    digitar("Nota", "7");
    tocar("Salvar");
    expect(numeroDoResumo("Pontos conquistados")).toBe("7");

    tocar("Remover");
    expect(within(screen.getByRole("dialog")).getByText("Remover P1?")).toBeTruthy();
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remover" }));
    expect(screen.getByText("Adicione sua primeira avaliação dessa matéria.")).toBeTruthy();
  });

  it("soma das avaliações acima do total avisa sem bloquear", () => {
    configurarPontos();
    abrirMateria("História");
    novaAvaliacao("P1", /Concluída/, { "Quanto vale (pontuação máxima)": "20", Nota: "15" });
    novaAvaliacao("P2", /Pendente/, { "Quanto vale (pontuação máxima)": "15" });
    expect(screen.getByText("A soma das avaliações passou do total da matéria. Confere se digitou certo.")).toBeTruthy();
    expect(screen.getByText("Pendente · vale 15")).toBeTruthy();
  });

  it("modo média: mostra média atual e a nota necessária (caso 9.11)", () => {
    render(<App />);
    tocar("Configurar manualmente");
    escolher("2º ano");
    escolher("Bimestre");
    escolher(/Fazendo média/);
    digitar("Qual a nota máxima?", "10");
    digitar("Qual a média que você precisa?", "6");
    escolher("Não");
    tocar("Salvar e continuar");
    abrirMateria("Inglês");

    novaAvaliacao("P1", /Concluída/, { Nota: "5", Peso: "2" });
    novaAvaliacao("P2", /Pendente/, { Peso: "3" });

    expect(numeroDoResumo("Média atual")).toBe("5");
    expect(numeroDoResumo("Média necessária")).toBe("6");
    expect(numeroDoResumo("Precisa tirar nas pendentes")).toBe("6,67");
    expect(screen.getByText("Nota 5 de 10")).toBeTruthy();
  });

  it("não deixa trocar o modo da escola com avaliações cadastradas", () => {
    configurarPontos();
    abrirMateria("Geografia");
    novaAvaliacao("P1", /Concluída/, { "Quanto vale (pontuação máxima)": "10", Nota: "8" });
    tocar(/Escola/);
    escolher(/Fazendo média/);
    digitar("Qual a nota máxima?", "10");
    digitar("Qual a média que você precisa?", "6");
    tocar("Salvar e continuar");
    expect(screen.getByText(/Pra trocar o jeito de calcular, remova antes as avaliações cadastradas/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Sua escola" })).toBeTruthy();
  });
});
