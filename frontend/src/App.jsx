import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GamePage from "./pages/Game";
import "./styles/app.css";

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </div>
  );
}

export default App;
