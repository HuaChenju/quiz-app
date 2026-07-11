import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoom() {

  const navigate = useNavigate();

  const [code, setCode] = useState("");

  const joinRoom = () => {

    navigate("/room", {
      state: {
        code,
        quizId: null
      }
    });

  };

  return (

    <div className="page">

      <div className="card">

        <h1>Подключиться</h1>

        <input
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value.toUpperCase()
            )
          }
        />

        <button
          onClick={joinRoom}
        >
          Войти
        </button>

      </div>

    </div>

  );

}

export default JoinRoom;