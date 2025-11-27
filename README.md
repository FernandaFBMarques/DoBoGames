# DoBo Games – Jogo da Memória de Pets (React + Node/WebSocket)

Projeto acadêmico que refatora o jogo da memória original (JS puro) para uma arquitetura **frontend React** + **backend Node.js** com tempo real via **WebSocket**, permitindo dois jogadores em computadores diferentes. O backend concentra regras, turno, validações e ranking; o frontend só renderiza o estado e dispara ações.

## Estrutura
```
DoBoGames/
├─ backend/        # Node.js + Express + ws (regras e estado do jogo)
├─ frontend/       # React (Vite) – UI, sem DOM manual
├─ images/         # Assets das cartas (pet-*.png) e verso.png servidos pelo backend
└─ LICENSE
```

## Pré‑requisitos
- Node.js 18+ e npm

## Como rodar
1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev      # porta 3001
   ```
   O backend serve as imagens em `http://localhost:3001/assets/pets`.

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev      # porta padrão Vite (5173)
   ```
   Se o backend estiver em outro host/porta, crie `.env` em `frontend/`:
   ```
   VITE_API_URL=http://seu-backend:3001
   VITE_WS_URL=http://seu-backend:3001
   ```

3. **Testar multiplayer**
   - Abra duas janelas/abas.
   - Na primeira, vá para `http://localhost:5173`, crie sala e anote o `gameId`.
   - Na segunda, use “Entrar em sala” com o mesmo `gameId`.
   - Cada cliente abre WebSocket automático; o backend controla turno e valida jogadas.

## Fluxo resumido
- REST:
  - `POST /games` → cria sala, registra Jogador 1 e devolve `gameId` + `playerId`.
  - `POST /games/:gameId/join` → entra como Jogador 2 (se houver vaga).
  - `GET /games/:gameId` → estado atual.
- WebSocket (`/ws?gameId=...&playerId=...`):
  - Cliente → Servidor: `PLAY_CARD { cardId }`, `REQUEST_REMATCH`, `RESET_GAME`.
  - Servidor → Clientes: `GAME_STATE { state }`, `ERROR { message }`.

## Destaques de implementação
- **Regras no backend**: Game/Player/Card replicam a lógica original (par marca ponto e mantém a vez; erro desvira após ~900ms e passa turno; fim de jogo registra vitórias).
- **Estado único**: `GameState` serializável enviado a todos os clientes da sala; frontend apenas renderiza.
- **UI React**: duas páginas (Home e Game), componentes dinâmicos (`Scoreboard`, `RankingTable`, `Board`/`Card`, `StatusBar`), sem manipulação manual de DOM.
- **Assets locais**: cartas usam `images/pet-*.png` e `images/verso.png` servidos pelo backend.

## Scripts úteis
- Backend: `npm run dev` | `npm start`
- Frontend: `npm run dev` | `npm run build` | `npm run preview`

## Próximos passos sugeridos
- Adicionar testes unitários das regras de Game.
- Melhorar feedback visual (sons/efeitos) e acessibilidade (aria-labels, foco).
- Persistir ranking em storage (arquivo/DB) se desejar histórico entre reinicializações.
