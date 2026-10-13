import { useState } from "react";
import { abas, type NomeTela } from "./navegacao";
import { useDados } from "./useDados";
import { AvisoArmazenamento } from "./components/AvisoArmazenamento";
import { BoasVindas } from "./screens/BoasVindas";
import { BuscarEscola } from "./screens/BuscarEscola";
import { Escola } from "./screens/Escola";
import { Materias } from "./screens/Materias";
import { Avaliacoes } from "./screens/Avaliacoes";
import { Dashboard } from "./screens/Dashboard";
import { Simulador } from "./screens/Simulador";

export default function App() {
  const d = useDados();
  // Quem já configurou a escola volta direto para o Painel.
  const [tela, setTela] = useState<NomeTela>(() => (d.dados.config ? "dashboard" : "boasVindas"));
  const [nomeBuscado, setNomeBuscado] = useState("");
  const [materiaAberta, setMateriaAberta] = useState<string | null>(null);

  function irPara(nova: NomeTela) {
    setTela(nova);
    window.scrollTo(0, 0);
  }

  const aviso = d.erroArmazenamento && <AvisoArmazenamento mensagem={d.erroArmazenamento} />;

  if (tela === "boasVindas") {
    return (
      <>
        {aviso}
        <BoasVindas aoEncontrar={() => irPara("buscarEscola")} aoConfigurar={() => irPara("escola")} />
      </>
    );
  }

  function conteudo() {
    switch (tela) {
      case "buscarEscola":
        return (
          <BuscarEscola
            aoConfigurar={(nome) => {
              setNomeBuscado(nome);
              irPara("escola");
            }}
          />
        );
      case "escola":
        return (
          <Escola
            config={d.dados.config}
            nomeSugerido={nomeBuscado}
            temMaterias={d.dados.materias.length > 0}
            aoSalvar={d.salvarConfig}
            aoSalvo={() => irPara("materias")}
            aoApagarTudo={() => {
              d.apagarTudo();
              setNomeBuscado("");
              irPara("boasVindas");
            }}
          />
        );
      case "materias":
        return (
          <Materias
            config={d.dados.config}
            materias={d.dados.materias}
            aoAdicionar={d.adicionarMateria}
            aoEditar={d.editarMateria}
            aoRemover={d.removerMateria}
            aoConfigurarEscola={() => irPara("escola")}
            aoAbrirAvaliacoes={(id) => {
              setMateriaAberta(id);
              irPara("avaliacoes");
            }}
          />
        );
      case "avaliacoes":
        return (
          <Avaliacoes
            config={d.dados.config}
            materias={d.dados.materias}
            avaliacoes={d.dados.avaliacoes}
            materiaId={materiaAberta}
            aoAbrirMateria={(id) => {
              setMateriaAberta(id);
              window.scrollTo(0, 0);
            }}
            aoAdicionar={d.adicionarAvaliacao}
            aoEditar={d.editarAvaliacao}
            aoRemover={d.removerAvaliacao}
            aoIrParaEscola={() => irPara("escola")}
            aoIrParaMaterias={() => irPara("materias")}
            aoSimular={() => irPara("simulador")}
          />
        );
      case "dashboard":
        return (
          <Dashboard
            config={d.dados.config}
            materias={d.dados.materias}
            avaliacoes={d.dados.avaliacoes}
            aoVerMateria={(id) => {
              setMateriaAberta(id);
              irPara("avaliacoes");
            }}
            aoIrParaEscola={() => irPara("escola")}
            aoIrParaMaterias={() => irPara("materias")}
          />
        );
      case "simulador":
        return (
          <Simulador
            config={d.dados.config}
            materias={d.dados.materias}
            avaliacoes={d.dados.avaliacoes}
            materiaId={materiaAberta}
            aoAbrirMateria={(id) => {
              setMateriaAberta(id);
              window.scrollTo(0, 0);
            }}
            aoIrParaAvaliacoes={(id) => {
              setMateriaAberta(id);
              irPara("avaliacoes");
            }}
            aoIrParaEscola={() => irPara("escola")}
            aoIrParaMaterias={() => irPara("materias")}
          />
        );
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {aviso}
      <header className="sticky top-0 z-10 border-b border-borda bg-fundo/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center px-4">
          <button
            type="button"
            onClick={() => irPara(d.dados.config ? "dashboard" : "boasVindas")}
            className="min-h-12 text-lg font-bold text-destaque"
          >
            NotaCerta
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {conteudo()}
        <p className="px-4 pb-4 text-center text-sm text-texto-secundario">
          🔒 Seus dados ficam salvos só neste aparelho.
        </p>
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
