import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

// O jsdom não implementa scrollTo; trocamos por uma função vazia nos testes.
beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

describe("Navegação", () => {
  it("abre na tela de boas-vindas", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Bora organizar esse ano? 👀" })).toBeTruthy();
  });

  it("vai para a tela da escola ao tocar em Configurar manualmente", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar manualmente" }));
    expect(screen.getByRole("heading", { name: "Sua escola" })).toBeTruthy();
  });

  it("troca de tela pela barra de navegação e volta ao início", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Encontrar minha escola" }));
    fireEvent.click(screen.getByRole("button", { name: /Simular/ }));
    expect(screen.getByRole("heading", { name: "E se eu tirar...?" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Painel/ }));
    expect(screen.getByRole("heading", { name: /Bora ver como você tá/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "NotaCerta" }));
    expect(screen.getByRole("heading", { name: "Bora organizar esse ano? 👀" })).toBeTruthy();
  });
});
