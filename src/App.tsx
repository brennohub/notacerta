import { useState, type ComponentType } from "react";
import { abas, type NomeTela } from "./navegacao";
import { BoasVindas } from "./screens/BoasVindas";
import { Escola } from "./screens/Escola";
import { Materias } from "./screens/Materias";
import { Avaliacoes } from "./screens/Avaliacoes";
import { Dashboard } from "./screens/Dashboard";
import { Simulador } from "./screens/Simulador";

const telas: Record<Exclude<NomeTela, "boasVindas">, ComponentType> = {
  escola: Escola,
  materias: Materias,
  avaliacoes: Avaliacoes,
  dashboard: Dashboard,
  simulador: Simulador,
};

export default function App() {
  const [tela, setTela] = useState<NomeTela>("boasVindas");

  function irPara(nova: NomeTela) {
    setTela(nova);
    window.scrollTo(0, 0);
  }

  if (tela === "boasVindas") {
    return <BoasVindas aoComecar={() => irPara("escola")} />;
  }

  const TelaAtual = telas[tela];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-borda bg-fundo/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center px-4">
          <button
            type="button"
            onClick={() => irPara("boasVindas")}
            className="min-h-12 text-lg font-bold text-destaque"
          >
            NotaCerta
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <TelaAtual />
      </main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-borda bg-card pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto grid w-full max-w-xl grid-cols-5">
          {abas.map((aba) => {
            const ativa = aba.tela === tela;
            return (
              <li key={aba.tela}>
                <button
                  type="button"
                  onClick={() => irPara(aba.tela)}
                  aria-current={ativa ? "page" : undefined}
                  className={`flex min-h-16 w-full flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                    ativa ? "text-destaque" : "text-texto-secundario"
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {aba.icone}
                  </span>
                  {aba.rotulo}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
