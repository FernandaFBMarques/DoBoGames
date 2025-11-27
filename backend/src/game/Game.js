const { v4: uuidv4 } = require("uuid");
const { createDeck, BACK_IMAGE_URL } = require("./deckFactory");

class Game {
  constructor(id, config = {}) {
    this.id = id;
    this.config = {
      pairs: config.pairs || 8,
      shuffle: true,
    };
    this.players = [];
    this.cards = createDeck(this.config.pairs);
    this.currentPlayerIndex = 0;
    this.flippedBuffer = [];
    this.status = "waiting"; // waiting | ongoing | finished | waiting_unflip
    this.message = "Aguardando jogadores";
    this.winnerIds = [];
    this.pendingTimeout = null;
    this.listeners = new Set();
  }

  addListener(fn) {
    this.listeners.add(fn);
  }

  removeListener(fn) {
    this.listeners.delete(fn);
  }

  notify() {
    const state = this.toState();
    this.listeners.forEach((listener) => listener(state));
  }

  addPlayer(name) {
    if (this.players.length >= 2) {
      throw new Error("Sala cheia");
    }
    const player = { id: uuidv4(), name, score: 0, wins: 0 };
    this.players.push(player);
    if (this.players.length === 1) {
      this.currentPlayerIndex = 0;
      this.message = `Aguardando o segundo jogador...`;
    } else {
      this.status = "ongoing";
      this.message = `Partida iniciada! Vez de ${this.currentPlayer().name}.`;
    }
    return player;
  }

  findPlayer(playerId) {
    return this.players.find((p) => p.id === playerId);
  }

  currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  resetScores() {
    this.players.forEach((p) => {
      p.score = 0;
    });
  }

  rematch() {
    this._clearPendingTimeout();
    this.cards = createDeck(this.config.pairs);
    this.resetScores();
    this.flippedBuffer = [];
    this.winnerIds = [];
    this.status = this.players.length === 2 ? "ongoing" : "waiting";
    this.currentPlayerIndex = 0;
    this.message =
      this.players.length === 2
        ? `Nova partida! Vez de ${this.currentPlayer().name}.`
        : "Aguardando jogadores.";
    this.notify();
  }

  resetAll() {
    this._clearPendingTimeout();
    this.cards = createDeck(this.config.pairs);
    this.players.forEach((p) => {
      p.score = 0;
      p.wins = 0;
    });
    this.flippedBuffer = [];
    this.winnerIds = [];
    this.status = this.players.length === 2 ? "ongoing" : "waiting";
    this.currentPlayerIndex = 0;
    this.message =
      this.players.length === 2
        ? `Partida reiniciada. Vez de ${this.currentPlayer().name}.`
        : "Aguardando jogadores.";
    this.notify();
  }

  flipCard(cardId, playerId) {
    if (this.players.length < 2) {
      return { error: "Aguardando jogadores." };
    }
    if (this.status === "finished") {
      return { error: "Partida já encerrada." };
    }
    if (this.pendingTimeout) {
      return { error: "Aguarde as cartas desvirarem." };
    }
    const current = this.currentPlayer();
    if (!current || current.id !== playerId) {
      return { error: "Não é sua vez." };
    }
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) {
      return { error: "Carta inválida." };
    }
    if (card.found || card.faceUp) {
      return { error: "Carta já aberta." };
    }

    card.flip();
    this.flippedBuffer.push(card);
    this.message = `Jogador ${current.name} virou uma carta.`;
    this.notify();

    if (this.flippedBuffer.length === 2) {
      this._resolveAttempt();
    }

    return { ok: true };
  }

  _resolveAttempt() {
    const [first, second] = this.flippedBuffer;
    const current = this.currentPlayer();

    if (first.isPair(second)) {
      first.markFound();
      second.markFound();
      current.score += 1;
      this.flippedBuffer = [];

      if (this._allFound()) {
        this._finishGame();
      } else {
        this.message = `Par encontrado! ${current.name} continua jogando.`;
        this.notify();
      }
    } else {
      this.status = "waiting_unflip";
      this.message = "Não foi dessa vez...";
      const pending = [...this.flippedBuffer];
      this.flippedBuffer = [];
      this.notify(); // mostra cartas abertas

      this.pendingTimeout = setTimeout(() => {
        pending.forEach((card) => card.unflip());
        this._advanceTurn();
        this.status = "ongoing";
        this.message = `Agora é a vez de ${this.currentPlayer().name}.`;
        this.pendingTimeout = null;
        this.notify();
      }, 900);
    }
  }

  _advanceTurn() {
    if (this.players.length === 0) return;
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  _allFound() {
    return this.cards.every((c) => c.found);
  }

  _finishGame() {
    this.status = "finished";
    const maxScore = Math.max(...this.players.map((p) => p.score));
    const winners = this.players.filter((p) => p.score === maxScore);
    this.winnerIds = winners.map((w) => w.id);
    winners.forEach((w) => {
      w.wins += 1;
    });
    this.message =
      winners.length === 1
        ? `${winners[0].name} venceu a partida!`
        : `Empate entre ${winners.map((w) => w.name).join(" e ")}!`;
    this.notify();
  }

  _clearPendingTimeout() {
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
  }

  toState() {
    return {
      gameId: this.id,
      status: this.status,
      message: this.message,
      currentPlayerId: this.players[this.currentPlayerIndex]
        ? this.players[this.currentPlayerIndex].id
        : null,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        wins: p.wins,
      })),
      cards: this.cards.map((c) => ({
        id: c.id,
        pairId: c.pairId,
        image: c.image,
        description: c.description,
        backImage: c.backImage,
        faceUp: c.faceUp,
        found: c.found,
      })),
      winnerIds: this.winnerIds,
      config: {
        pairs: this.config.pairs,
        backImage: BACK_IMAGE_URL,
      },
    };
  }
}

module.exports = Game;
