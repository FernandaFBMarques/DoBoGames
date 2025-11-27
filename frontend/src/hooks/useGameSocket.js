import { useEffect, useRef, useState, useCallback } from "react";
import { endpoints } from "../services/api";

export function useGameSocket(gameId, playerId) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!gameId || !playerId) return undefined;

    const wsUrl = `${endpoints.WS_BASE}/ws?gameId=${gameId}&playerId=${playerId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "GAME_STATE") {
          setState(msg.state);
        } else if (msg.type === "ERROR") {
          setError(msg.message);
        }
      } catch (err) {
        setError("Mensagem inválida do servidor.");
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [gameId, playerId]);

  const send = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const sendPlayCard = useCallback(
    (cardId) => send({ type: "PLAY_CARD", cardId }),
    [send]
  );
  const sendRematch = useCallback(
    () => send({ type: "REQUEST_REMATCH" }),
    [send]
  );
  const sendReset = useCallback(() => send({ type: "RESET_GAME" }), [send]);

  return { state, error, connected, sendPlayCard, sendRematch, sendReset };
}
