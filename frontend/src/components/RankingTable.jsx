import "../styles/ranking.css";

function RankingTable({ players }) {
  const sorted = [...players].sort((a, b) => {
    if (b.wins === a.wins) return a.name.localeCompare(b.name);
    return b.wins - a.wins;
  });

  return (
    <div className="ranking">
      <h3>Histórico de vitórias</h3>
      <table>
        <thead>
          <tr>
            <th>Jogador</th>
            <th>Vitórias</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RankingTable;
