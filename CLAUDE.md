# NotaCerta — Especificação do MVP

> Este arquivo fica na raiz do projeto. O Claude Code lê ele em toda conversa.
> Itens marcados com **[DECISÃO PADRÃO]** foram escolhidos para destravar o MVP. Ajuste se a sua escola funcionar diferente.

---

## 0. Como trabalhar neste projeto

- Trabalhe **uma etapa por vez** (ver seção 12). Só avance quando eu pedir.
- Ao terminar cada etapa: rode os testes (`npm test`), o build (`npm run build`) e corrija todos os erros antes de dizer que terminou.
- Se algo nesta especificação for ambíguo ou contraditório, **pergunte antes** de decidir.
- Nunca apresente uma funcionalidade simulada como se estivesse funcionando. Nada de botão decorativo.
- Nunca invente dados de escolas, notas ou resultados.
- Mantenha o código simples e legível. Sou iniciante: ao final de cada etapa, explique em poucas linhas o que foi feito e como testar.

### Ambiente de desenvolvimento: estou num tablet
- Desenvolvo **só pelo tablet**, usando o Claude Code no app/navegador, conectado a um repositório no GitHub. **Não tenho computador nem terminal.**
- Não me peça para rodar comandos, instalar programas ou editar arquivos manualmente. Você roda `npm install`, `npm test` e `npm run build` no seu ambiente e me mostra o resultado em poucas linhas.
- Não consigo abrir `localhost`. A única forma de eu ver o app é pelo **link publicado no GitHub Pages** (ver seção 3).
- Ao final de cada etapa: faça commit com uma mensagem clara em português, envie o branch e abra um Pull Request. Me explique em uma linha como fazer o merge pelo tablet. O deploy roda quando o merge entra na `main`; depois disso, me diga o link para testar.
- Se alguma coisa precisar ser feita por mim no site do GitHub (ex.: ativar o GitHub Pages), explique passo a passo onde tocar, em linguagem simples.
- Como vou testar no tablet com o dedo, confira se tudo funciona por toque (sem depender de mouse, hover ou atalhos de teclado).

---

## 1. Visão geral

App web responsivo para estudantes do Ensino Médio no Brasil acompanharem notas, entenderem sua situação e planejarem como atingir a meta.

Ele responde três perguntas:
1. Em quais matérias estou bem?
2. Quais matérias precisam da minha atenção?
3. O que preciso fazer para atingir minha meta?

Prioridade: celular (Android e iPhone). Também deve funcionar em tablet e computador.

---

## 2. Escopo

### Dentro do MVP
1. Configuração da escola (manual)
2. Cadastro, edição e remoção de matérias
3. Cadastro, edição e remoção de avaliações
4. Motor de cálculo com testes
5. Dashboard com classificação
6. Simulador "E se eu tirar...?"
7. Persistência no aparelho

### Fora do MVP (não implementar agora)
- Catálogo de escolas verificadas (no MVP a busca sempre leva à configuração manual — ver 6.2)
- Histórico e gráficos de evolução entre períodos
- Seção "No que eu devo focar?"
- Contas de usuário, login e sincronização (Supabase)
- Notificações, exportação de dados, OCR de boletins, IA
- Cálculo de recuperação e prova final (no MVP só registramos se existe — ver 7.5)

O modelo de dados deve **permitir** essas funções no futuro (ex.: guardar `periodoId`), mas sem implementá-las.

---

## 3. Stack e arquitetura

- **React + TypeScript + Vite**
- **Tailwind CSS**
- **Vitest** para testes
- Sem back-end no MVP

Estrutura de pastas:

```
src/
  engine/       # funções de cálculo PURAS, sem React, 100% testadas
  storage/      # leitura e escrita no localStorage
  types/        # tipos TypeScript (seção 5)
  components/   # componentes reutilizáveis (Card, Botão, BarraProgresso, Campo...)
  screens/      # telas (Boas-vindas, Escola, Matérias, Avaliações, Dashboard, Simulador)
```

**Regras de arquitetura:**
- Toda fórmula fica em `engine/`. Componentes nunca fazem conta, só chamam funções do engine.
- O engine nunca acessa localStorage nem a interface.

**Publicação (deploy):**
- Publicar no **GitHub Pages** com um workflow do GitHub Actions (`.github/workflows/deploy.yml`) que roda testes e build a cada push na `main` e só publica se os testes passarem.
- Configurar o `base` do Vite com o nome do repositório para os caminhos funcionarem no GitHub Pages.
- Sem serviços pagos e sem outras contas além do GitHub.

**Persistência [DECISÃO PADRÃO]:**
- Dados salvos no `localStorage` do navegador, por meio de uma camada em `storage/`.
- Guardar um número de versão do formato dos dados (`schemaVersion`) para migrações futuras.
- Envolver toda leitura/escrita em `try/catch`. Se falhar, avisar o usuário sem quebrar o app.
- Mostrar no app, de forma clara: "Seus dados ficam salvos só neste aparelho."
- Não fingir sincronização.

---

## 4. Identidade visual e linguagem

**Dark mode como padrão.**

| Uso | Cor |
|---|---|
| Fundo principal | `#101827` |
| Cards | `#1F2937` |
| Destaque (verde-limão) | `#C7F36B` |
| Texto principal | branco |
| Texto secundário | cinza-claro |
| Tá suave | verde |
| Fica de olho | amarelo |
| Precisa reagir | vermelho |

- Cantos arredondados, cards, ícones simples, barras de progresso, animações discretas.
- Bastante espaço entre elementos. Alvos de toque com no mínimo 44px.
- Português brasileiro, tom jovem e natural, sem exagerar nas gírias.
- Nunca usar mensagens ofensivas, humilhantes ou que façam o estudante se sentir incapaz.

Exemplos de tom:
- "Bora organizar esse trimestre?"
- "Você tá bem nessa. Continua assim!"
- "Fica de olho: essa matéria merece atenção."
- "Ainda dá pra recuperar. Vamos calcular o que você precisa."
- "Meta atingida! Boa! 🎉"

---

## 5. Modelo de dados

```ts
type ModoCalculo = "pontos" | "media";
type TipoPeriodo = "bimestre" | "trimestre" | "semestre";

interface ConfigEscola {
  nomeEscola?: string;        // opcional
  serie: string;              // ex.: "2º ano"
  tipoPeriodo: TipoPeriodo;
  periodoAtual: string;       // ex.: "1º trimestre"
  modo: ModoCalculo;

  // modo "pontos"
  totalPeriodo?: number;      // qualquer número > 0
  metaPeriodo?: number;       // > 0 e <= totalPeriodo

  // modo "media"
  notaMaxima?: number;        // escala da escola, qualquer número > 0 (ex.: 10)
  mediaMeta?: number;         // > 0 e <= notaMaxima

  temRecuperacao: boolean;
  observacoesRecuperacao?: string;
}

interface Materia {
  id: string;
  nome: string;
  periodoId: string;
  totalPontos?: number;       // herda de ConfigEscola, editável (modo pontos)
  meta: number;               // herda de ConfigEscola, editável
}

type TipoAvaliacao = "prova" | "trabalho" | "simulado" | "atividade" | "participacao" | "outro";
type StatusAvaliacao = "concluida" | "pendente" | "nao_realizada";

interface Avaliacao {
  id: string;
  materiaId: string;
  nome: string;
  tipo: TipoAvaliacao;
  data?: string;              // ISO, opcional
  pontuacaoMaxima: number;    // > 0
  nota: number | null;        // null = sem nota. NUNCA usar 0 para representar "vazio"
  peso?: number;              // só no modo "media", > 0
  status: StatusAvaliacao;
}
```

---

## 6. Telas e fluxo

Fluxo: Boas-vindas → Escola → Matérias → Avaliações → Dashboard → Simulador.

O estudante pode parar em qualquer etapa e continuar depois. Nada de formulário gigante.

### 6.1 Boas-vindas
- Título: "Bora organizar esse ano? 👀"
- Subtítulo: "Configure sua escola e suas notas. O NotaCerta te ajuda a entender como você está."
- Botões: "Encontrar minha escola" e "Configurar manualmente".

### 6.2 Encontrar minha escola
No MVP **não existe catálogo**. Ao pesquisar, mostrar:
"Sua escola ainda não está cadastrada no NotaCerta. Sem problema: você configura em menos de 2 minutos."
Botão: "Configurar manualmente".
Não usar logotipos nem afirmar parceria com qualquer instituição.

### 6.3 Configurar manualmente
Campos, cada um com uma explicação curta embaixo:

1. Nome da escola (opcional)
2. Série
3. Período: bimestre, trimestre ou semestre
4. Como sua escola calcula a nota?
   - "Somando pontos" (ex.: você precisa de 18 de 30 pontos) → modo `pontos`
   - "Fazendo média" (ex.: você precisa de média 6 de 10) → modo `media`
5. **Se modo pontos:**
   - "Quantos pontos você pode somar neste período?" — *Some todos os pontos de provas, trabalhos, simulados e outras avaliações.*
   - "Quantos pontos você precisa para atingir a meta?" — *Informe a pontuação mínima exigida pela sua escola.*
6. **Se modo média:**
   - "Qual a nota máxima?" (ex.: 10)
   - "Qual a média que você precisa?" (ex.: 6)
7. Existe recuperação? (sim/não + campo de texto opcional para descrever)

Validações em 7.6. Só permitir avançar com tudo válido.

### 6.4 Matérias — "Quais são suas matérias?"
- Sugestões em chips para adicionar com um toque: Matemática, Português, Física, Química, Biologia, História, Geografia, Filosofia, Sociologia, Inglês, Redação.
- Opção de adicionar matéria com nome livre.
- Editar e remover (remoção pede confirmação, porque apaga as avaliações da matéria).
- Cada matéria herda meta e total da configuração, mas pode ser editada individualmente.
- Não obrigar a cadastrar todas de uma vez.

### 6.5 Avaliações (dentro da matéria)
- Formulário: nome, tipo, data (opcional), pontuação máxima, nota, peso (**só no modo média**), status.
- Se status = pendente, o campo nota fica desabilitado.
- Editar e remover (com confirmação).
- Resumo no topo da matéria:
  - Modo pontos: pontos conquistados, pontos ainda disponíveis, meta, quanto falta.
  - Modo média: média atual, média necessária, nota que precisa tirar nas pendentes.

### 6.6 Dashboard
- Título: "Fala! Bora ver como você tá? 👀"
- Topo: três contadores — Tá suave / Fica de olho / Precisa reagir.
- Um card por matéria:
  - Nome
  - Situação atual (ex.: "Você tem 12 de 18 pontos.")
  - Barra de progresso até a meta
  - Quanto falta (ex.: "Faltam 6 pontos para sua meta.")
  - Próxima avaliação pendente com data, se existir
  - Selo colorido da classificação
  - Botão "Ver minha situação"
- Atualiza imediatamente após qualquer alteração.
- Só mostra dados reais cadastrados. Estado vazio: "Adicione sua primeira matéria pra começar."

---

## 7. Regras de cálculo

Todas as funções em `engine/`, determinísticas e testadas.

### 7.1 Modo pontos
Para cada matéria:

```
obtidos     = soma das notas das avaliações "concluida"
disponiveis = soma da pontuacaoMaxima das avaliações "pendente"
falta       = max(0, meta - obtidos)
possivel    = (obtidos + disponiveis) >= meta
```

- Avaliações `nao_realizada` não somam pontos e não ficam disponíveis.
- Avaliação `pendente` **nunca** conta como zero.

### 7.2 Modo média ponderada
```
mediaAtual = soma(nota × peso das concluídas) / soma(peso das concluídas)
```

Para que nota seria necessária nas avaliações pendentes (mesma nota em todas):

```
pesoTotal     = soma(peso de concluídas + pendentes)
pesoPendente  = soma(peso das pendentes)
notaNecessaria = (mediaMeta × pesoTotal - soma(nota × peso das concluídas)) / pesoPendente
```

- Se `notaNecessaria <= 0`: a meta já está garantida, mesmo tirando zero nas pendentes.
- Se `notaNecessaria > notaMaxima`: a meta não é alcançável só com as avaliações restantes.
- Avaliações `nao_realizada` contam com nota 0 e seu peso entra no total **[DECISÃO PADRÃO — confirme com a regra da sua escola]**.
- No modo média, todas as notas usam a mesma escala (`notaMaxima` da escola). Não misturar escalas.

### 7.3 Nunca misturar modos
Uma escola usa um modo só. Nunca somar pontos com médias.

### 7.4 Classificação
Calcular uma **razão de esforço** `r` (quanto do que resta o estudante precisa conquistar):

- Modo pontos: `r = falta / disponiveis`
- Modo média: `r = notaNecessaria / notaMaxima`

| Condição | Classificação | Mensagem |
|---|---|---|
| Nenhuma avaliação cadastrada | Sem diagnóstico | "Adicione suas avaliações para obter um diagnóstico melhor." |
| Meta já atingida (`falta = 0` ou `notaNecessaria <= 0`) | Tá suave | "Meta atingida! Boa! 🎉" |
| `r <= 0,6` | Tá suave | "Você tá bem nessa. Continua nesse ritmo!" |
| `0,6 < r <= 0,85` | Fica de olho | "Fica de olho: vale dedicar um pouco mais de atenção aqui." |
| `r > 0,85` | Precisa reagir | "Essa matéria precisa de atenção agora. Vamos ver suas opções." |
| Sem pendentes e meta não atingida, ou `r > 1` | Precisa reagir | Se `temRecuperacao`: "Com as avaliações restantes não dá pra chegar na meta, mas sua escola tem recuperação. Confere as regras com seu professor." Senão: "Com as avaliações cadastradas não dá pra chegar na meta. Confere se falta cadastrar alguma." |

**[DECISÃO PADRÃO]** Os limites 0,6 e 0,85 ficam em constantes em `engine/`, fáceis de ajustar.

A tela de detalhes da matéria deve explicar **por que** ela recebeu aquela classificação (ex.: "Você precisa de 6 dos 18 pontos que ainda estão disponíveis.").

Nunca dizer "aprovado" ou "reprovado".

### 7.5 Recuperação (MVP)
Só registrar se existe e mostrar a mensagem da tabela acima. **Não calcular** recuperação nem prova final no MVP.

### 7.6 Validações
**Pontos totais e nota máxima:**
- O estudante pode informar **qualquer número**, porque cada escola usa uma escala diferente (10, 30, 40, 100…). Não assumir escala padrão.
- Deve ser maior que zero.
- Aceitar decimais com vírgula ou ponto (ex.: `32,5` ou `32.5`).

**Meta:**
- Maior que zero e menor ou igual ao total (ou à nota máxima).
- Se for maior, bloquear e explicar: "Sua meta passou do total de pontos possíveis. Confere os valores?" Permitir corrigir no mesmo lugar.

**Avaliações:**
- Pontuação máxima > 0.
- Nota entre 0 e a pontuação máxima. Bloquear negativa ou acima do máximo.
- Campo vazio (`null`) é diferente de nota 0.
- Avaliação concluída exige nota.
- Peso > 0 (modo média).
- Se a soma das pontuações máximas das avaliações passar do total da matéria: **avisar sem bloquear** ("A soma das avaliações passou do total da matéria. Confere se digitou certo.").

Validar na interface e de novo no engine/storage antes de salvar.

---

## 8. Simulador — "E se eu tirar...?"

- O estudante escolhe uma matéria e digita notas hipotéticas para as avaliações **pendentes**.
- Recalcula na hora: pontuação projetada (ou média projetada), distância até a meta, barra de progresso, se ainda é possível atingir a meta e a nota necessária nas restantes.
- Três cenários lado a lado, com notas definidas pelo próprio estudante: **Conservador**, **Provável**, **Melhor resultado**.
- A simulação **nunca altera os dados salvos**.
- Sempre exibir: "Isso é uma simulação com os valores que você digitou, não uma garantia."
- Usa as mesmas funções do engine. Nada de fórmula duplicada.

---

## 9. Testes obrigatórios (Vitest)

**Modo pontos:**
1. Meta 18, total 30, obtidos 12, disponíveis 18 → falta 6, `possivel = true`, `r = 0,33`, Tá suave. Não diz que atingiu a meta.
2. Meta 18, total 10 → configuração bloqueada com mensagem.
3. Meta 18, obtidos 18 → falta 0, meta atingida.
4. Meta 18, obtidos 5, disponíveis 10 → falta 13, `possivel = false`, Precisa reagir.
5. Avaliação pendente com máximo 10 → não altera `obtidos`, soma 10 em `disponiveis`.
6. Avaliação concluída com nota 0 → conta como 0. Pendente sem nota → não conta.
7. Nota 11 em avaliação de máximo 10 → rejeitada. Nota -1 → rejeitada.
8. Limite: falta 6, disponíveis 10 → `r = 0,6` → Tá suave.
9. Avaliação `nao_realizada` → não soma em obtidos nem em disponíveis.
10. Soma das avaliações maior que o total → gera aviso, não bloqueia.

**Modo média:**
11. Meta 6, escala 10. P1 concluída nota 5 peso 2. P2 pendente peso 3 → média atual 5,0, nota necessária 6,67, `r = 0,667`, Fica de olho.
12. Meta 6, P1 nota 10 peso 4, P2 pendente peso 1 → nota necessária ≤ 0 → meta garantida.
13. Nota necessária acima da nota máxima → meta não alcançável.

**Geral:**
14. Matéria sem avaliações → Sem diagnóstico.
15. Entrada `"32,5"` → interpretada como 32.5.
16. Simulador não altera os dados salvos.

---

## 10. Privacidade

O público inclui menores de idade.
- Coletar só o necessário: apelido (opcional), série, escola (opcional), notas.
- Não pedir e-mail, telefone, CPF, data de nascimento ou foto.
- Nenhum dado sai do aparelho no MVP. Nada de analytics de terceiros.
- Botão em Configurações: "Apagar todos os meus dados" (com confirmação).

---

## 11. Critérios de conclusão do MVP

- [ ] Cadastrar, editar e remover matérias
- [ ] Cadastrar, editar e remover avaliações
- [ ] Todos os testes da seção 9 passando
- [ ] Meta e total validados
- [ ] Dashboard atualiza após qualquer alteração
- [ ] Classificação explica o motivo na tela de detalhes
- [ ] Simulador recalcula corretamente sem alterar dados
- [ ] Dados continuam lá depois de fechar e abrir o navegador
- [ ] Layout funciona em 360px (celular) e 768px (tablet), sem rolagem horizontal
- [ ] App publicado no GitHub Pages e testado por mim no tablet, pelo link
- [ ] Nenhum botão ou tela decorativa

---

## 12. Etapas

1. Estrutura do projeto, Tailwind, cores, componentes base, navegação entre telas vazias **e deploy automático no GitHub Pages**, para eu já conseguir abrir o app no tablet.
2. Engine de cálculo + todos os testes da seção 9.
3. Configuração da escola e cadastro de matérias, com persistência.
4. Cadastro de avaliações e resumo da matéria.
5. Dashboard e classificação.
6. Simulador.
7. Revisão final: validações, estados vazios, mensagens de erro, teste em tela de celular e checklist da seção 11.
