import "../styles/scoreboard.css";

function Scoreboard({ players, currentPlayerId }) {
  return (
    <div className="scoreboard">
      <h3>Placar da partida</h3>
      <ul>
        {players.map((player) => (
          <li
            key={player.id}
            className={player.id === currentPlayerId ? "player--active" : ""}
          >
            <span>{player.name}</span>
            <span className="score">{player.score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Scoreboard;
