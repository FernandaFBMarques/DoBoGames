import "../styles/card.css";

function Card({ card, onClick, disabled }) {
  const isFlipped = card.faceUp || card.found;
  const assetBase = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const frontSrc = card.image.startsWith("http")
    ? card.image
    : `${assetBase}${card.image}`;
  const backSrc = card.backImage.startsWith("http")
    ? card.backImage
    : `${assetBase}${card.backImage}`;

  return (
    <button
      className={`card ${isFlipped ? "card--flipped" : ""} ${
        card.found ? "card--found" : ""
      }`}
      onClick={() => onClick(card.id)}
      disabled={disabled}
      aria-label={card.description}
    >
      <div className="card__inner">
        <div className="card__face card__face--back">
          <img src={backSrc} alt="Verso" />
        </div>
        <div className="card__face card__face--front">
          <img src={frontSrc} alt={card.description} />
        </div>
      </div>
    </button>
  );
}

export default Card;
