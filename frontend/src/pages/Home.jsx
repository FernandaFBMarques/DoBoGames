import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame } from "../services/api";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [pairs, setPairs] = useState(8);
  const [joinGameId, setJoinGameId] = useState("");
  const [joinName, setJoinName] = useState("");
  const [feedback, setFeedback] = useState(null);

  const persistPlayer = (gameId, playerId) => {
    localStorage.setItem(`memory-${gameId}-playerId`, playerId);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const { gameId, playerId } = await createGame({
        playerName: playerName || "Jogador 1",
        pairs,
      });
      persistPlayer(gameId, playerId);
      navigate(`/game/${gameId}`, { state: { playerId } });
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const { gameId, playerId } = await joinGame({
        gameId: joinGameId.trim(),
        playerName: joinName || "Jogador 2",
      });
      persistPlayer(gameId, playerId);
      navigate(`/game/${gameId}`, { state: { playerId } });
    } catch (err) {
      setFeedback(err.message);
    }
  };

  return (
    <div className="home">
      <header className="home__header">
        <h1>DoBo Games – Jogo da Memória de Pets</h1>
        <p>Crie uma sala ou entre com um gameId para jogar a dois.</p>
      </header>

      <div className="home__panels">
        <section className="panel">
          <h2>Criar sala</h2>
          <form onSubmit={handleCreate} className="form">
            <label>
              Nome do Jogador 1
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex.: Alice"
              />
            </label>
            <label>
              Quantidade de pares
              <input
                type="number"
                min={2}
                max={12}
                value={pairs}
                onChange={(e) => setPairs(Number(e.target.value))}
              />
            </label>
            <button type="submit" className="btn primary">
              Iniciar jogo
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Entrar em sala</h2>
          <form onSubmit={handleJoin} className="form">
            <label>
              Game ID
              <input
                type="text"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
                placeholder="Ex.: abc123"
                required
              />
            </label>
            <label>
              Seu nome
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Ex.: Bob"
              />
            </label>
            <button type="submit" className="btn secondary">
              Entrar na sala
            </button>
          </form>
        </section>
      </div>

      {feedback && <div className="feedback feedback--error">{feedback}</div>}

      <div className="home__hint">
        <p>
          Dica: abra duas janelas do navegador. Crie a sala na primeira, copie o
          gameId e use “Entrar em sala” na segunda para simular dois
          computadores.
        </p>
      </div>
    </div>
  );
}

export default Home;
