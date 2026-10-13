import { EmBreve } from "../components/EmBreve";
import { Tela } from "../components/Tela";

export function Simulador() {
  return (
    <Tela titulo="E se eu tirar...?" subtitulo="Aqui você vai testar notas hipotéticas sem mexer nos seus dados.">
      <EmBreve etapa={6} />
    </Tela>
  );
}
