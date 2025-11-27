const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function handleResponse(response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao comunicar com o servidor.");
  }
  return response.json();
}

export async function createGame({ playerName, pairs }) {
  const res = await fetch(`${API_BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, pairs }),
  });
  return handleResponse(res);
}

export async function joinGame({ gameId, playerName }) {
  const res = await fetch(`${API_BASE}/games/${gameId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });
  return handleResponse(res);
}

export async function fetchGame(gameId) {
  const res = await fetch(`${API_BASE}/games/${gameId}`);
  return handleResponse(res);
}

export const endpoints = {
  API_BASE,
  WS_BASE: (import.meta.env.VITE_WS_URL || API_BASE).replace(/^http/, "ws"),
};
