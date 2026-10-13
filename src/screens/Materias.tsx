import { EmBreve } from "../components/EmBreve";
import { Tela } from "../components/Tela";

export function Materias() {
  return (
    <Tela titulo="Quais são suas matérias?" subtitulo="Aqui você vai adicionar, editar e remover suas matérias.">
      <EmBreve etapa={3} />
    </Tela>
  );
}
