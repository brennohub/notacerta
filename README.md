# NotaCerta

App para estudantes do Ensino Médio acompanharem as notas, entenderem como estão em cada matéria e planejarem como chegar na meta.

**Abrir o app:** https://brennohub.github.io/notacerta/

## O que dá pra fazer
- Configurar como a sua escola calcula a nota (somando pontos ou fazendo média).
- Cadastrar matérias e avaliações (provas, trabalhos, simulados…).
- Ver no Painel quais matérias estão **Tá suave**, **Fica de olho** ou **Precisa reagir**, e o porquê.
- Simular "E se eu tirar...?" com três cenários, sem mexer nos dados salvos.

## Privacidade
Os dados ficam salvos **só neste aparelho** (no navegador). Nada é enviado para a internet e não há login.
Dá para apagar tudo em **Escola → Apagar todos os meus dados**.

## Para quem desenvolve
React + TypeScript + Vite, Tailwind CSS e Vitest. A especificação completa está em [`CLAUDE.md`](CLAUDE.md).

```bash
npm install
npm test        # testes (inclui os casos obrigatórios da seção 9)
npm run build   # gera o site em dist/
```

Cada push na `main` roda os testes e, se passarem, publica no GitHub Pages (`.github/workflows/deploy.yml`).
