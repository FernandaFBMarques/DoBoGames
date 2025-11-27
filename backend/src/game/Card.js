class Card {
  constructor(id, pairId, image, description, backImage) {
    this.id = id;
    this.pairId = pairId;
    this.image = image;
    this.description = description;
    this.backImage = backImage;
    this.faceUp = false;
    this.found = false;
  }

  flip() {
    if (this.found) return;
    this.faceUp = true;
  }

  unflip() {
    if (this.found) return;
    this.faceUp = false;
  }

  markFound() {
    this.found = true;
    this.faceUp = true;
  }

  reset() {
    this.faceUp = false;
    this.found = false;
  }

  isPair(otherCard) {
    return otherCard && otherCard.id !== this.id && otherCard.pairId === this.pairId;
  }
}

module.exports = Card;
