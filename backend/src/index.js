const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");
const gameStore = require("./store/gameStore");
const { IMAGES_DIR } = require("./game/deckFactory");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

// Servir as imagens originais direto da pasta fornecida
app.use("/assets/pets", express.static(IMAGES_DIR));

app.get("/", (_req, res) => {
  res.send("Memory Game backend on.");
});

app.post("/games", (req, res) => {
  const { playerName = "Jogador 1", pairs = 8 } = req.body || {};
  const game = gameStore.createGame({ pairs: Number(pairs) || 8 });
  const player = game.addPlayer(playerName.trim());
  return res.json({
    gameId: game.id,
    playerId: player.id,
    state: game.toState(),
  });
});

app.post("/games/:gameId/join", (req, res) => {
  const { gameId } = req.params;
  const { playerName = "Jogador 2" } = req.body || {};
  const game = gameStore.getGame(gameId);
  if (!game) {
    return res.status(404).json({ error: "Sala não encontrada." });
  }
  if (game.players.length >= 2) {
    return res.status(400).json({ error: "Sala já tem dois jogadores." });
  }
  const player = game.addPlayer(playerName.trim());
  game.notify();
  return res.json({
    gameId: game.id,
    playerId: player.id,
    state: game.toState(),
  });
});

app.get("/games/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = gameStore.getGame(gameId);
  if (!game) {
    return res.status(404).json({ error: "Sala não encontrada." });
  }
  return res.json({ state: game.toState() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const rooms = new Map(); // gameId -> { game, clients: Map<playerId, ws> }

function ensureRoom(gameId) {
  if (!rooms.has(gameId)) {
    const game = gameStore.getGame(gameId);
    if (!game) return null;
    rooms.set(gameId, { game, clients: new Map() });
  }
  return rooms.get(gameId);
}

function broadcast(gameId, message) {
  const room = rooms.get(gameId);
  if (!room) return;
  room.clients.forEach((socket) => {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  });
}

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/ws?", ""));
  const gameId = params.get("gameId");
  const playerId = params.get("playerId");

  const game = gameStore.getGame(gameId);
  if (!game || !game.findPlayer(playerId)) {
    ws.send(JSON.stringify({ type: "ERROR", message: "Conexão inválida." }));
    ws.close();
    return;
  }

  const room = ensureRoom(gameId);
  room.clients.set(playerId, ws);

  const listener = (state) => broadcast(gameId, { type: "GAME_STATE", state });
  game.addListener(listener);

  ws.send(JSON.stringify({ type: "GAME_STATE", state: game.toState() }));

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      switch (data.type) {
        case "PLAY_CARD": {
          const result = game.flipCard(data.cardId, playerId);
          if (result?.error) {
            ws.send(JSON.stringify({ type: "ERROR", message: result.error }));
          }
          break;
        }
        case "REQUEST_REMATCH": {
          game.rematch();
          break;
        }
        case "RESET_GAME": {
          game.resetAll();
          break;
        }
        default:
          ws.send(
            JSON.stringify({ type: "ERROR", message: "Ação desconhecida." })
          );
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: "ERROR", message: "Mensagem inválida." }));
    }
  });

  ws.on("close", () => {
    game.removeListener(listener);
    room.clients.delete(playerId);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
