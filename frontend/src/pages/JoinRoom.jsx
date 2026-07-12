import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoom() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const joinRoom = () => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Введите код комнаты");
      return;
    }

    navigate("/room", {
      state: {
        code: normalizedCode,
        quizId: null,
        isHost: false,
      },
    });
  };

  return (
      <div className="page">
        <div className="card">
          <h1>Подключиться</h1>

          <input
              value={code}
              placeholder="Код комнаты"
              maxLength={6}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError("");
              }}
          />

          {error && <p>{error}</p>}

          <button onClick={joinRoom}>
            Войти
          </button>

          <br />
          <br />

          <button onClick={() => navigate("/dashboard")}>
            Назад
          </button>
        </div>
      </div>
  );
}

export default JoinRoom;