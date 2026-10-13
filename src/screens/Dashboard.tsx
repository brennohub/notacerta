import { EmBreve } from "../components/EmBreve";
import { Tela } from "../components/Tela";

export function Dashboard() {
  return (
    <Tela titulo="Fala! Bora ver como você tá? 👀" subtitulo="Aqui vai aparecer a situação de cada matéria.">
      <EmBreve etapa={5} />
    </Tela>
  );
}
