import { useState } from "react";
import { Botao } from "../components/Botao";
import { Campo } from "../components/Campo";
import { Card } from "../components/Card";
import { Tela } from "../components/Tela";

interface Props {
  aoConfigurar: (nomeEscola: string) => void;
}

// 6.2 — No MVP não existe catálogo de escolas: a busca sempre leva à configuração manual.
export function BuscarEscola({ aoConfigurar }: Props) {
  const [nome, setNome] = useState("");
  const [buscou, setBuscou] = useState(false);

  return (
    <Tela titulo="Encontrar minha escola">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setBuscou(true);
        }}
      >
        <Campo
          rotulo="Nome da escola"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setBuscou(false);
          }}
          placeholder="Ex.: Escola Estadual..."
          autoComplete="off"
        />
        <Botao type="submit" disabled={nome.trim() === ""}>
          Buscar
        </Botao>
      </form>

      {buscou && (
        <Card className="flex flex-col gap-4">
          <p>
            Sua escola ainda não está cadastrada no NotaCerta. Sem problema: você configura em menos de 2 minutos.
          </p>
          <Botao onClick={() => aoConfigurar(nome.trim())}>Configurar manualmente</Botao>
        </Card>
      )}
    </Tela>
  );
}
