import "../styles/status.css";

function StatusBar({
  message,
  status,
  onRematch,
  onReset,
  disabled,
  connected,
}) {
  return (
    <div className={`status status--${status}`}>
      <div className="status__info">
        <span className="dot" data-connected={connected} />
        <p>{message}</p>
      </div>
      <div className="status__actions">
        <button className="btn secondary" onClick={onRematch} disabled={disabled}>
          Revanche
        </button>
        <button className="btn ghost" onClick={onReset} disabled={disabled}>
          Reiniciar
        </button>
      </div>
    </div>
  );
}

export default StatusBar;
