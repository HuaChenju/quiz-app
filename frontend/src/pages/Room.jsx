import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";

function Room() {

  const { state } = useLocation();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);

  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    socket.emit("join-room", {
      code: state.code,
      user
    });

    socket.on("players-update", (players) => {
    setPlayers(players);
});
socket.on("game-start", ({ quizId }) => {

    navigate(`/game/${quizId}`);

});

    return () => {
      socket.off("players-update");
      socket.off("game-start");
    };

  }, []);

  return (

    <div className="page">

      <div className="card">

        <h1>Комната ожидания</h1>

        <h2>{state.code}</h2>

        <h3>Игроки</h3>

        {
          players.map(player => (

            <p key={player.id}>
              {player.name}
            </p>

          ))
        }

        <button
    onClick={() => socket.emit("start-game")}
>
    Начать игру
</button>

      </div>

    </div>

  );

}

export default Room;