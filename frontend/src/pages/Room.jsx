import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";

function Room() {
    const location = useLocation();
    const navigate = useNavigate();

    const roomData = location.state;

    const [players, setPlayers] = useState([]);
    const [error, setError] = useState("");
    const [isStarting, setIsStarting] = useState(false);

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const code = roomData?.code;
    const isHost = roomData?.isHost === true;

    useEffect(() => {
        if (!roomData || !code || !user) {
            navigate("/dashboard");
            return;
        }

        sessionStorage.setItem(
            "activeRoom",
            JSON.stringify({
                code,
                isHost,
            })
        );

        const handlePlayersUpdate = (updatedPlayers) => {
            setPlayers(updatedPlayers);
        };

        const handleRoomNotFound = () => {
            setError("Комната с таким кодом не найдена");
        };

        const handleStartDenied = (message) => {
            setIsStarting(false);
            setError(message || "Запустить квиз может только организатор");
        };

        const handleGameStart = ({ quizId }) => {
            sessionStorage.setItem(
                "activeRoom",
                JSON.stringify({
                    code,
                    isHost,
                    quizId,
                })
            );

            navigate(`/game/${quizId}`, {
                state: {
                    code,
                    isHost,
                },
            });
        };

        socket.on("players-update", handlePlayersUpdate);
        socket.on("room-not-found", handleRoomNotFound);
        socket.on("start-denied", handleStartDenied);
        socket.on("game-start", handleGameStart);

        socket.emit("join-room", {
            code,
            user,
        });

        return () => {
            socket.off("players-update", handlePlayersUpdate);
            socket.off("room-not-found", handleRoomNotFound);
            socket.off("start-denied", handleStartDenied);
            socket.off("game-start", handleGameStart);
        };
    }, [code, isHost, navigate, roomData, user]);

    const startGame = () => {
        setError("");

        if (players.length === 0) {
            setError("Сначала дождитесь подключения участников");
            return;
        }

        setIsStarting(true);
        socket.emit("start-game");
    };

    if (!roomData || !code) {
        return null;
    }

    return (
        <div className="page">
            <div className="card">
                <h1>Комната ожидания</h1>

                <p>Код комнаты</p>

                <h2>{code}</h2>

                <h3>
                    Подключённые пользователи: {players.length}
                </h3>

                {players.length === 0 ? (
                    <p>Пока никто не подключился</p>
                ) : (
                    players.map((player) => (
                        <p key={player.id}>
                            {player.name}
                            {player.id === user?.id ? " — вы" : ""}
                        </p>
                    ))
                )}

                {error && <p>{error}</p>}

                {isHost ? (
                    <>
                        <button
                            onClick={startGame}
                            disabled={isStarting}
                        >
                            {isStarting ? "Запуск..." : "Начать игру"}
                        </button>

                        <br />
                        <br />

                        <p>
                            Передайте код комнаты участникам и дождитесь их подключения.
                        </p>
                    </>
                ) : (
                    <p>
                        Ожидайте, пока организатор запустит квиз.
                    </p>
                )}

                <br />

                <button onClick={() => navigate("/dashboard")}>
                    Выйти из комнаты
                </button>
            </div>
        </div>
    );
}

export default Room;