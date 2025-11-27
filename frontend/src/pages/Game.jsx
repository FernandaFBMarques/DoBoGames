import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useGameSocket } from "../hooks/useGameSocket";
import StatusBar from "../components/StatusBar";
import Scoreboard from "../components/Scoreboard";
import RankingTable from "../components/RankingTable";
import Board from "../components/Board";
import "../styles/game.css";

function GamePage() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const storedPlayerId =
    (gameId && localStorage.getItem(`memory-${gameId}-playerId`)) || null;
  const playerId = location.state?.playerId || storedPlayerId;

  useEffect(() => {
    if (playerId && gameId) {
      localStorage.setItem(`memory-${gameId}-playerId`, playerId);
    }
  }, [gameId, playerId]);

  const { state, error, connected, sendPlayCard, sendRematch, sendReset } =
    useGameSocket(gameId, playerId);

  const canPlay = useMemo(() => {
    if (!state || !playerId) return false;
    if (state.status === "waiting_unflip") return false;
    return state.currentPlayerId === playerId;
  }, [state, playerId]);

  if (!playerId) {
    return (
      <div className="game-page">
        <p>Identificação do jogador não encontrada. Volte e entre novamente.</p>
        <button className="btn" onClick={() => navigate("/")}>
          Voltar
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="game-page">
        <p>Conectando à sala {gameId}...</p>
        {error && <div className="feedback feedback--error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="game-page">
      <header className="game-header">
        <div>
          <p className="game-id">Sala: {gameId}</p>
          <h1>Partida em andamento</h1>
        </div>
        <div className="actions-inline">
          <button className="btn ghost" onClick={() => navigate("/")}>
            Trocar sala
          </button>
        </div>
      </header>

      <StatusBar
        message={error || state.message}
        status={state.status}
        connected={connected}
        onRematch={sendRematch}
        onReset={sendReset}
        disabled={!connected}
      />

      <div className="game-layout">
        <div className="sidebar">
          <Scoreboard
            players={state.players}
            currentPlayerId={state.currentPlayerId}
          />
          <RankingTable players={state.players} />
        </div>
        <div className="board-area">
          <Board cards={state.cards} onCardClick={sendPlayCard} canPlay={canPlay} />
        </div>
      </div>

      <div className="game-footer">
        {state.winnerIds?.length > 0 && state.status === "finished" && (
          <div className="feedback feedback--success">
            {state.winnerIds.length === 1
              ? "Temos um vencedor! Clique em Revanche para continuar."
              : "Empate! Revanche para desempatar."}
          </div>
        )}
        <p className="hint">
          Dica: as cartas usam as imagens da pasta local DoBoGames/images servidas
          pelo backend.
        </p>
      </div>
    </div>
  );
}

export default GamePage;
