import { EmBreve } from "../components/EmBreve";
import { Tela } from "../components/Tela";

export function Escola() {
  return (
    <Tela titulo="Sua escola" subtitulo="Aqui você vai dizer como sua escola calcula as notas.">
      <EmBreve etapa={3} />
    </Tela>
  );
}
