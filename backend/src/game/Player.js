class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.score = 0;
    this.wins = 0;
  }

  addPoints(value) {
    this.score += value;
  }

  addWin() {
    this.wins += 1;
  }

  resetScore() {
    this.score = 0;
  }
}

module.exports = Player;
