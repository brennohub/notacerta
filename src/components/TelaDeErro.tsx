import { Component, useState, type ReactNode } from "react";
import { apagarDados } from "../storage/dados";
import { Botao } from "./Botao";

// Se alguma tela der erro inesperado, mostra esta mensagem em vez de uma tela em branco.
export class LimiteDeErro extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false };

  static getDerivedStateFromError() {
    return { erro: true };
  }

  render() {
    return this.state.erro ? <TelaDeErro /> : this.props.children;
  }
}

function TelaDeErro() {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <section role="alert" className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Ops, algo deu errado por aqui.</h1>
        <p className="text-texto-secundario">
          Tenta abrir de novo. Se continuar acontecendo, você pode apagar os dados deste aparelho e começar do zero.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Botao onClick={() => window.location.reload()}>Tentar de novo</Botao>
        {confirmando ? (
          <Botao
            variante="perigo"
            onClick={() => {
              apagarDados();
              window.location.reload();
            }}
          >
            Toque de novo para apagar tudo
          </Botao>
        ) : (
          <Botao variante="secundario" onClick={() => setConfirmando(true)}>
            Apagar todos os meus dados
          </Botao>
        )}
      </div>
    </section>
  );
}
