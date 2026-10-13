import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LimiteDeErro } from "./TelaDeErro";

afterEach(cleanup);

function Quebra(): never {
  throw new Error("teste");
}

describe("Tela de erro", () => {
  it("mostra a mensagem em vez de tela em branco e pede dois toques para apagar", () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // o React avisa o erro no console
    render(
      <LimiteDeErro>
        <Quebra />
      </LimiteDeErro>,
    );
    expect(screen.getByText("Ops, algo deu errado por aqui.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Apagar todos os meus dados" }));
    expect(screen.getByRole("button", { name: "Toque de novo para apagar tudo" })).toBeTruthy();
    vi.restoreAllMocks();
  });
});
