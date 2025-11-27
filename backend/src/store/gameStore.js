const { v4: uuidv4 } = require("uuid");
const Game = require("../game/Game");

class GameStore {
  constructor() {
    this.games = new Map(); // gameId -> Game
  }

  createGame(config = {}) {
    const id = uuidv4().slice(0, 6);
    const game = new Game(id, config);
    this.games.set(id, game);
    return game;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }
}

module.exports = new GameStore();
