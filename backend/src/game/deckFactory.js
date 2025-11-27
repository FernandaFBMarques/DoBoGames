const fs = require("fs");
const path = require("path");
const Card = require("./Card");

const IMAGES_DIR = path.join(__dirname, "..", "..", "images");
const BACK_IMAGE_URL = "/assets/pets/verso.png";

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadPetImages() {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  return fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => file.startsWith("pet-") && file.endsWith(".png"))
    .sort();
}

const PET_IMAGES = loadPetImages();

function createDeck(pairs = 8) {
  const available = PET_IMAGES.length;
  const pairCount = Math.max(1, Math.min(pairs, available));
  const selected = shuffle(PET_IMAGES).slice(0, pairCount);
  const cards = [];

  selected.forEach((filename, index) => {
    const pairId = `pair-${index + 1}`;
    const imageUrl = `/assets/pets/${filename}`;
    const description = `Pet ${filename.replace("pet-", "").replace(".png", "")}`;

    cards.push(
      new Card(`card-${pairId}-a`, pairId, imageUrl, description, BACK_IMAGE_URL)
    );
    cards.push(
      new Card(`card-${pairId}-b`, pairId, imageUrl, description, BACK_IMAGE_URL)
    );
  });

  return shuffle(cards);
}

module.exports = {
  createDeck,
  BACK_IMAGE_URL,
  PET_IMAGES,
  IMAGES_DIR,
};
