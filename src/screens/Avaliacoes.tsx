import { EmBreve } from "../components/EmBreve";
import { Tela } from "../components/Tela";

export function Avaliacoes() {
  return (
    <Tela titulo="Avaliações" subtitulo="Aqui você vai cadastrar provas, trabalhos e outras avaliações de cada matéria.">
      <EmBreve etapa={4} />
    </Tela>
  );
}
