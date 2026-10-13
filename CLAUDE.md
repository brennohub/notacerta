# NotaCerta — Especificação (versão 2: ano letivo)

> Este arquivo fica na raiz do projeto. O Claude Code lê ele em toda conversa.
> Itens marcados com **[DECISÃO PADRÃO]** foram escolhidos para destravar o projeto. Ajuste se a sua escola funcionar diferente.
> A versão 1 (um período por vez) foi concluída nas etapas 1 a 7. A versão 2 muda o app para acompanhar **o ano inteiro**, a partir da etapa 8.

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
- Se alguma coisa precisar ser feita por mim no site do GitHub, explique passo a passo onde tocar, em linguagem simples.
- Como vou testar no tablet com o dedo, confira se tudo funciona por toque (sem depender de mouse, hover ou atalhos de teclado).
- Antes de abrir o PR, teste as telas em 360px (celular) e 800px (tablet) num navegador headless e confira que nenhuma palavra fica quebrada no meio dentro de botões.

---

## 1. Visão geral

App web responsivo para estudantes do **9º ano do Fundamental até a 3ª série do Ensino Médio** acompanharem as notas **do ano inteiro** e saberem quanto falta para passar de ano em cada matéria.

Ele responde três perguntas:
1. Em quais matérias estou bem?
2. Quais matérias precisam da minha atenção?
3. **Quanto falta para passar** em cada matéria, e quanto preciso tirar nos próximos bimestres/trimestres?

Prioridade: celular (Android e iPhone). Também deve funcionar em tablet e computador.

---

## 2. Escopo

### Dentro desta versão
1. Configuração da escola (manual), com série do 9º ano à 3ª série
2. Matérias do ano
3. Lançamento de notas **por período** (bimestre, trimestre ou semestre), do jeito mais simples possível (seção 6.5)
4. Motor de cálculo do ano, com testes
5. Painel com classificação e "Quanto falta para passar"
6. Simulador simples "E se eu tirar...?"
7. Persistência no aparelho
8. **Depois** (etapa 11): ler a foto do boletim no próprio aparelho (seção 13)

### Fora desta versão (não implementar agora)
- Catálogo de escolas verificadas (a busca continua levando à configuração manual — ver 6.2)
- Gráficos de evolução e histórico de anos anteriores
- Seção "No que eu devo focar?"
- Contas de usuário, login e sincronização
- Notificações, exportação de dados
- IA na nuvem para ler o boletim (ver seção 13: só leitura no aparelho)
- Cálculo de recuperação e prova final (só registramos se existe — ver 7.5)

---

## 3. Stack e arquitetura

- **React + TypeScript + Vite**
- **Tailwind CSS**
- **Vitest** para testes
- Sem back-end

Estrutura de pastas:

```
src/
  engine/       # funções de cálculo PURAS, sem React, 100% testadas
  storage/      # leitura e escrita no localStorage
  types/        # tipos TypeScript (seção 5)
  components/   # componentes reutilizáveis (Card, Botão, BarraProgresso, Campo...)
  screens/      # telas
```

**Regras de arquitetura:**
- Toda fórmula fica em `engine/`. Componentes nunca fazem conta, só chamam funções do engine.
- O engine nunca acessa localStorage nem a interface.

**Publicação (deploy):**
- GitHub Pages com o workflow `.github/workflows/deploy.yml` (testes e build a cada push na `main`; só publica se passar).
- `base` do Vite com o nome do repositório.
- Sem serviços pagos e sem outras contas além do GitHub. **Nunca colocar chave de API no código** (o site é público).

**Persistência [DECISÃO PADRÃO]:**
- Dados no `localStorage`, por meio de uma camada em `storage/`, com `schemaVersion`.
- Esta versão usa `schemaVersion: 2`. Dados da versão 1 não são convertidos: ao abrir, mostrar um aviso "O NotaCerta mudou para acompanhar o ano inteiro. Seus dados de teste antigos foram apagados." e começar do zero.
- Se os dados salvos estiverem corrompidos, **não apagar**: guardar uma cópia em outra chave (`notacerta:backup`) antes de começar do zero.
- `try/catch` em toda leitura/escrita; se falhar, avisar sem quebrar o app.
- Mostrar: "Seus dados ficam salvos só neste aparelho." Não fingir sincronização.

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
- **Nunca quebrar palavras no meio** dentro de botões ("Trimest re"). Se não couber, use menos colunas ou rótulos curtos.
- Português brasileiro, tom jovem e natural, sem exagerar nas gírias.
- Nunca usar mensagens ofensivas, humilhantes ou que façam o estudante se sentir incapaz.

### Nomes usados na tela (usar exatamente estes)

| Conceito | Nome na tela |
|---|---|
| Meta do ano | **Média total para passar de ano** (modo média) ou **Pontos para passar de ano** (modo pontos) |
| Quanto falta | **Quanto falta para passar** |
| Nota necessária nos períodos que faltam | **Você precisa tirar X em cada bimestre que falta** (trocar "bimestre" pelo tipo de período da escola) |
| Nota de um período | **Nota do 1º bimestre**, **Nota do 2º trimestre**... |
| Prova, trabalho etc. | **Provas e trabalhos** |
| Valor máximo | **Vale quanto?** |
| Painel | **Painel** |
| Configuração da escola | **Ajustes** |

Nunca dizer "aprovado" ou "reprovado". Usar "passar de ano" só como meta ("Quanto falta para passar"), nunca como resultado garantido.

---

## 5. Modelo de dados (schemaVersion 2)

```ts
type ModoCalculo = "media" | "pontos";
type TipoPeriodo = "bimestre" | "trimestre" | "semestre";
type Serie = "9º ano" | "1ª série" | "2ª série" | "3ª série";

interface ConfigEscola {
  nomeEscola?: string;          // opcional
  serie: Serie;
  tipoPeriodo: TipoPeriodo;     // define quantos períodos: 4, 3 ou 2
  modo: ModoCalculo;

  // Quanto vale cada período (a pessoa define; não existe escala fixa).
  valorPeriodo: number;         // > 0. Ex.: 10 (média) ou 25 (pontos)

  // Meta do ano
  // modo "media":  média dos períodos >= metaAno  (ex.: 6 numa escala de 10)
  // modo "pontos": soma dos períodos  >= metaAno  (ex.: 60 de 100)
  metaAno: number;              // > 0

  pesosPeriodos?: number[];     // só modo "media", opcional; padrão = todos 1
  temRecuperacao: boolean;
  observacoesRecuperacao?: string;
}

interface Materia {
  id: string;
  nome: string;
  metaAno?: number;             // se vazio, usa a da escola
}

// Uma linha por matéria × período. Criada só quando a pessoa digita algo.
interface NotaPeriodo {
  materiaId: string;
  periodo: number;              // 1, 2, 3, 4
  nota: number | null;          // modo simples: a nota do período digitada direto. null = ainda não tem
  itens?: ItemNota[];           // modo detalhado: provas e trabalhos do período
}

interface ItemNota {
  id: string;
  nome: string;                 // "Prova 1", "Trabalho"...
  valeQuanto: number;           // > 0, a pessoa define
  nota: number | null;          // null = ainda não aconteceu (nunca é zero)
  data?: string;                // ISO, opcional
}
```

Regras do modelo:
- Se `itens` existir e tiver pelo menos um item, a nota do período é **a soma das notas dos itens com nota**; o campo `nota` é ignorado. **[DECISÃO PADRÃO]**
- Item sem nota (`null`) é "ainda não aconteceu". Zero é zero.
- **Não existe mais o status "não realizada"**: se a pessoa não fez, ela digita 0.

---

## 6. Telas e fluxo

Barra de baixo (nesta ordem): **Painel · Matérias · Simular · Ajustes**. Não existe aba "Avaliações".
Quem já configurou a escola abre direto no **Painel**.

### 6.1 Boas-vindas
- Título: "Bora organizar esse ano? 👀"
- Subtítulo: "Coloque suas notas e veja quanto falta para passar de ano em cada matéria."
- Botões: "Encontrar minha escola" e "Configurar manualmente".

### 6.2 Encontrar minha escola
Sem catálogo. Mostrar: "Sua escola ainda não está cadastrada no NotaCerta. Sem problema: você configura em menos de 2 minutos." + botão "Configurar manualmente". Sem logotipos, sem afirmar parceria.

### 6.3 Ajustes (configurar a escola)
Campos, com explicação curta embaixo de cada um:

1. Nome da escola (opcional)
2. **Série:** 9º ano · 1ª série · 2ª série · 3ª série (do Ensino Médio)
3. **Como o ano é dividido?** Bimestres (4) · Trimestres (3) · Semestres (2)
4. **Como sua escola calcula?**
   - "Fazendo média" — ex.: média 6 para passar → modo `media` **[DECISÃO PADRÃO: vem marcado]**
   - "Somando pontos" — ex.: 60 de 100 pontos no ano → modo `pontos`
5. **Quanto vale cada bimestre?** (rótulo segue o tipo de período) — a pessoa define. Ex.: 10. *"Qual a maior nota que dá pra tirar em um bimestre."*
6. Modo média: **Média total para passar de ano** — ex.: 6.
   Modo pontos: **Pontos para passar de ano** — mostrar embaixo o total possível calculado (`valorPeriodo × nº de períodos`), ex.: "O ano todo vale 100 pontos."
7. Pesos dos períodos (só modo média, escondido em "Minha escola usa pesos diferentes") — padrão todos 1.
8. Existe recuperação? (sim/não + texto opcional)
9. Card "Seus dados" com "Apagar todos os meus dados" (com confirmação).

Validações na seção 7.6.

### 6.4 Matérias
- Chips para adicionar com um toque: Matemática, Português, Física, Química, Biologia, História, Geografia, Filosofia, Sociologia, Inglês, Redação, Artes, Educação Física. Para o 9º ano, mostrar Ciências no lugar de Física, Química e Biologia.
- Campo "Outra matéria".
- Cada matéria aparece como uma linha simples (nome + resumo curto + toque para abrir). Editar e remover ficam dentro da matéria (remover pede confirmação).
- Quando houver pelo menos 1 matéria, mostrar botão **"Ver meu painel"**.

### 6.5 Dentro da matéria: lançar notas (o mais simples possível)
Topo: **Quanto falta para passar** (frase principal), barra de progresso e o "Por quê?" da classificação.

Depois, **uma linha por período** com um campo grande:

```
1º bimestre   [ 7,5 ]  de 10
2º bimestre   [ 8   ]  de 10
3º bimestre   [     ]  de 10   ← vazio = ainda não tem nota
4º bimestre   [     ]  de 10
```

- Digitou, salvou: **salva sozinho** ao sair do campo (sem botão Salvar, sem formulário).
- Vírgula ou ponto.
- Embaixo de cada período, um link **"Detalhar provas e trabalhos"**. Ao abrir, aparece uma lista onde cada linha tem: nome (já vem "Prova 1", "Trabalho 1"...), **Vale quanto?** e **Nota**. Botões rápidos "+ Prova" e "+ Trabalho". A nota do período passa a ser a soma automática, e o campo do período mostra essa soma (sem poder editar enquanto houver itens).
- Se a soma do "Vale quanto?" dos itens passar do valor do período, **avisar sem bloquear**: "Os itens somam X, mas o bimestre vale Y. Confere?"

### 6.6 Painel
- Título: "Fala! Bora ver como você tá? 👀"
- Topo: três contadores — Tá suave / Fica de olho / Precisa reagir.
- Matérias **ordenadas por urgência**: Precisa reagir, Fica de olho, Tá suave, Sem notas.
- Card de cada matéria:
  - Nome + selo colorido
  - Situação: modo média "Sua média até agora: 7,2 · Precisa de 6" / modo pontos "Você tem 32 de 60 pontos"
  - Barra de progresso até a meta do ano
  - **Quanto falta para passar** (frase da seção 7.4)
  - Toque no card abre a matéria
- Estado vazio: "Adicione sua primeira matéria pra começar."
- Em tablet (≥ 768px), cards em 2 colunas.

### 6.7 Simular — "E se eu tirar...?"
- Escolher a matéria (lista; sempre começa na lista).
- Mostrar só os **períodos sem nota**, um campo para cada: "E se eu tirar ___ no 3º bimestre?"
- Recalcular na hora: média (ou pontos) projetada do ano, quanto falta para passar, selo.
- Botão "Preencher com o que preciso" que coloca em cada campo a nota necessária.
- Nota inválida (vazia é ok; texto, negativa): mostrar o erro no campo e **não esconder em silêncio**.
- Sempre exibir: "Isso é uma simulação com os valores que você digitou, não uma garantia."
- Nunca altera os dados salvos.

---

## 7. Regras de cálculo

Todas em `engine/`, determinísticas e testadas. `N` = número de períodos (4, 3 ou 2). `V` = `valorPeriodo`.

### 7.1 Nota de cada período
- Sem itens: `notaPeriodo = nota` (pode ser `null`).
- Com itens: `notaPeriodo = soma das notas dos itens com nota`; se nenhum item tem nota, `null`.

### 7.2 Modo média (média dos períodos)
```
pesos           = pesosPeriodos ou [1, 1, ...]
comNota         = períodos com notaPeriodo != null
mediaAtual      = soma(nota × peso de comNota) / soma(peso de comNota)      (null se nenhum)
pesoTotal       = soma(todos os pesos)
pesoFaltando    = soma(pesos dos períodos sem nota)
notaNecessaria  = (metaAno × pesoTotal − soma(nota × peso de comNota)) / pesoFaltando
```
- `notaNecessaria` é a nota **igual em cada período que falta** para chegar na média total.
- Se `notaNecessaria <= 0`: meta garantida.
- Se não há períodos faltando: `notaNecessaria = null`; meta atingida se `mediaAtual >= metaAno`.

### 7.3 Modo pontos (soma dos períodos)
```
obtidos         = soma das notas dos períodos com nota
faltando        = nº de períodos sem nota
disponiveis     = faltando × V
falta           = max(0, metaAno − obtidos)
notaNecessaria  = falta / faltando        (nota em cada período que falta; null se faltando = 0)
```

### 7.4 Classificação e "Quanto falta para passar"
Razão de esforço `r = notaNecessaria / V` (o quanto do valor de cada período que falta a pessoa precisa tirar).

| Condição | Selo | Frase "Quanto falta para passar" |
|---|---|---|
| Nenhuma nota na matéria | Sem notas | "Coloque a nota do 1º bimestre pra eu calcular." |
| Meta atingida/garantida | Tá suave | "Você já chegou na meta do ano! 🎉" |
| `r <= 0,6` | Tá suave | "Você precisa tirar **X** em cada bimestre que falta. Tá tranquilo." |
| `0,6 < r <= 0,85` | Fica de olho | "Você precisa tirar **X** em cada bimestre que falta. Fica de olho." |
| `0,85 < r <= 1` | Precisa reagir | "Você precisa tirar **X** em cada bimestre que falta. Bora reagir!" |
| `r > 1`, ou nenhum período faltando e meta não atingida | Precisa reagir | Com recuperação: "Só com os bimestres que faltam não dá pra chegar na meta, mas sua escola tem recuperação. Confere as regras com seu professor." Sem: "Só com os bimestres que faltam não dá pra chegar na meta. Fala com seu professor sobre as opções." |

- "bimestre" na frase segue o tipo de período da escola.
- Limites 0,6 e 0,85 ficam em constantes no `engine/`.
- A tela da matéria mostra o **Por quê?** (ex.: "Sua média até agora é 5,5 em 2 bimestres. Para chegar em 6, os 2 que faltam precisam de 6,5 cada.").
- Como os períodos sem nota contam como "ainda dá", **uma nota boa no 1º bimestre nunca pode virar "Precisa reagir"** (era o erro da versão 1).

### 7.5 Recuperação
Só registrar se existe e usar a mensagem da tabela. Não calcular.

### 7.6 Validações
- `valorPeriodo` > 0 (qualquer número; a pessoa define). `metaAno` > 0.
- Modo média: `metaAno <= valorPeriodo`. Modo pontos: `metaAno <= valorPeriodo × N`. Se passar, bloquear: "Sua meta passou do máximo possível. Confere os valores?"
- Nota do período e nota de item: não pode ser negativa.
- **Nota maior que o valor** (do período ou do item): **avisar sem bloquear** — "Isso passou do valor (X). Foi ponto extra?" e aceitar. **[DECISÃO PADRÃO: a pessoa define o limite]**
- `valeQuanto` de item > 0.
- Aceitar `32,5` e `32.5`. Recusar texto, hexadecimal (`0x10`) e notação científica (`1e2`).
- Mudar o tipo de período (ex.: bimestre → trimestre) com notas lançadas: pedir confirmação e avisar que as notas dos períodos que deixarem de existir serão apagadas.

---

## 8. Leitura de números e textos

- Mostrar números no padrão brasileiro com no máximo 2 casas (`6,67`).
- Datas no formato `dd/mm/aaaa`.
- Plural certo: "Falta 1 ponto", "Faltam 2 pontos".

---

## 9. Testes obrigatórios (Vitest)

**Modo média** (4 bimestres, vale 10, meta 6):
1. Notas 7 e 8, dois sem nota → média atual 7,5; precisa 4,5 em cada; `r = 0,45`; Tá suave.
2. Notas 5 e 5 → precisa 7 em cada; `r = 0,7`; Fica de olho.
3. Notas 2, 2, 2 → precisa 18 no último; `r > 1`; Precisa reagir com mensagem de recuperação conforme config.
4. **Só o 1º bimestre com 8** → Tá suave (nunca "Precisa reagir").
5. Notas 10, 10, 10 → meta garantida.
6. Pesos [1, 1, 2, 2], notas 6 e 6 → precisa 6 nos dois que faltam.
7. Os 4 com nota e média 5,9 → Precisa reagir, sem nota necessária.

**Modo pontos** (4 bimestres, vale 25, meta 60):
8. Notas 20 e 15 → falta 25; precisa 12,5 em cada; `r = 0,5`; Tá suave.
9. Notas 25, 25, 10 → obtidos 60 → meta atingida.
10. Metas: 101 com ano valendo 100 → bloqueado.

**Itens (provas e trabalhos):**
11. Itens 7 (vale 7) e 2,5 (vale 3) → nota do período 9,5.
12. Item sem nota não conta e não vira zero; todos sem nota → período `null`.
13. Item com nota 0 conta como 0.
14. Soma de "vale quanto" maior que o valor do período → aviso, sem bloquear.

**Geral:**
15. Nota acima do valor → aviso de ponto extra, aceita e entra na conta.
16. `"7,5"` → 7.5; `"0x10"` e `"1e2"` → inválidos.
17. Matéria sem nenhuma nota → Sem notas.
18. Simulador não altera os dados salvos.
19. Dados da versão 1 no localStorage → app abre do zero com o aviso da seção 3; dados corrompidos → cópia em `notacerta:backup`.

---

## 10. Privacidade

O público inclui menores de idade.
- Coletar só o necessário: série, escola (opcional), matérias e notas.
- Não pedir e-mail, telefone, CPF, data de nascimento ou foto de rosto.
- Nenhum dado sai do aparelho. Nada de analytics de terceiros.
- A foto do boletim (seção 13) é lida no aparelho e **não é guardada**.

---

## 11. Critérios de conclusão da versão 2

- [ ] Série do 9º ano à 3ª série
- [ ] Lançar a nota de um bimestre com 1 toque + digitar, sem formulário
- [ ] Detalhar provas e trabalhos dentro do período, com soma automática
- [ ] "Quanto falta para passar" correto em todas as matérias
- [ ] 1ª nota boa nunca aparece como "Precisa reagir"
- [ ] Todos os testes da seção 9 passando
- [ ] Painel ordenado por urgência e atualizando sozinho
- [ ] Simulador recalcula sem alterar dados
- [ ] Dados continuam lá depois de fechar e abrir o navegador
- [ ] 360px e 800px sem rolagem horizontal e sem palavra quebrada
- [ ] Publicado e testado por mim no tablet, pelo link

---

## 12. Etapas

Etapas 1 a 7: versão 1, **concluídas**.

8. **Novo modelo e engine do ano**: tipos da seção 5, `schemaVersion 2` com o aviso de migração, cálculos da seção 7 e todos os testes da seção 9. Na tela, só a mudança mínima para o app continuar abrindo.
9. **Ajustes e Matérias**: tela de Ajustes nova (6.3), séries 9º–3ª, matérias em lista simples, barra de baixo nova (Painel · Matérias · Simular · Ajustes).
10. **Lançar notas e Painel**: tela da matéria com uma linha por período (6.5), "Detalhar provas e trabalhos", Painel ordenado (6.6).
11. **Simulador simples** (6.7) e revisão geral: textos da seção 4, plural, datas, 360px e 800px, checklist da seção 11.
12. **Foto do boletim** (seção 13).

---

## 13. Foto do boletim (etapa 12)

Objetivo: tirar foto do boletim e já preencher as notas.

Regras:
- A leitura acontece **no próprio aparelho**, com **Tesseract.js** (OCR gratuito em português, roda no navegador). **Não usar IA na nuvem nem chave de API** — o site é público e qualquer chave ficaria exposta, e os dados são de menores.
- A foto não é enviada nem guardada.
- Fluxo: botão "📷 Ler meu boletim" no Painel → escolher/tirar foto → "Lendo seu boletim..." com progresso → **tela de conferência** mostrando uma tabela matéria × período com o que foi lido, cada célula editável → a pessoa confirma → só então salva.
- Matéria lida que não existe: oferecer "Adicionar Química?". Número que não deu pra ler: célula vazia, marcada em amarelo.
- Sempre avisar: "A leitura automática pode errar. Confere os números antes de salvar."
- Se falhar ou não achar nenhuma nota: "Não consegui ler esse boletim. Tenta uma foto mais reta e com boa luz, ou digite as notas." Nunca inventar notas.
- O download do Tesseract é grande: carregar só quando a pessoa tocar no botão.
- Testes: a função que transforma o texto lido em tabela (matéria × período) fica no `engine/` e tem testes com textos de exemplo.
