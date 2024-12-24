import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [validMoves, setValidMoves] = useState(Array(9).fill(false));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [matchStatus, setMatchStatus] = useState("InProgress");
  const [message, setMessage] = useState("Player X's turn");

  const handleGameState = (state) => {
    setBoard(state["board"]);
    setValidMoves(state["valid_moves"]);

    const status = state["status"];
    setMatchStatus(status["status"]);
    if (status["status"] === "Draw") {
      setMessage("It's a Draw!");
    } else if (status["status"] === "Won") {
      setMessage(`Player ${status["player"]} won!`)
    } else if (status["status"] === "InProgress") {
      setMessage(`Player ${status["player"]}'s turn`)
      setCurrentPlayer(status["player"])
    }
  }

  const handleNewGame = (data) => {
    console.log(`New game with id: ${data}`);
    setGameId(data);
  } 

  const updateGameState = async () => {
    if (!gameId) {
      console.error("Game ID is not set!");
      return;
    }

    try {
      const response = await fetch(`/api/game/${gameId}`, {
        method: 'GET',
      });

      const data = await response.json();
      handleGameState(data);
    }
    catch (error) {
      console.error("Error getting state: ", error)
    }
  }

  const makeMove = async (x, y) => {
    try {
      const response = await fetch(`/api/game/${gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([x, y]),
      });

      const data = await response.json();
      handleGameState(data);
    }
    catch (error) {
      console.error("Error making move: ", error)
    }
  }

  const newGame = async () => {
    try {
      const response = await fetch("/api/game/new", {
        method: 'GET',
      });

      const data = await response.json();
      handleNewGame(data);
    }
    catch (error) {
      console.error("Error getting new game: ", error)
    }
  }

  const renderCell = (x, y) => {
    const index = x + 3 * y;
    const isValidMove = validMoves[index] && matchStatus === "InProgress";

    return (
      <button
        key={`${x}-${y}`}
        className={`cell ${board[index] ? 'played' : ''}`}
        onMouseDown={() => makeMove(x, y)}
        disabled={!isValidMove}
      >
        <span>{board[index] ?? currentPlayer}</span>
      </button>
    )
  }

  // useEffect(() => {
  //   updateGameState();
  // });

  useEffect(() => {
    if (gameId) {
      updateGameState();
    }
  }, [gameId]);

  return (
    <div className='app-container'>
      <div className="grid-container">
        {[...Array(3)].map((_, y) =>
          [...Array(3)].map((_, x) => renderCell(x, y))
        )}
      </div>
      <span className='message'>{message}</span>
      <button onClick={() => newGame()} className='new-game'>New game</button>
    </div>
  )
}

export default App
