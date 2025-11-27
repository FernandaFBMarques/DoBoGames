import Card from "./Card";
import "../styles/board.css";

function Board({ cards, onCardClick, canPlay }) {
  return (
    <div className="board">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={onCardClick}
          disabled={!canPlay || card.faceUp || card.found}
        />
      ))}
    </div>
  );
}

export default Board;
