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
