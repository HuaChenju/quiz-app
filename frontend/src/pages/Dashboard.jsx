import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]);

    const [error, setError] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isOrganizer = user?.role === "ORGANIZER";

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("quizId");
        navigate("/login");
    };

    const loadQuizzes = async () => {
        if (!isOrganizer) {
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                "http://localhost:5000/api/quizzes/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Не удалось загрузить квизы");
                return;
            }

            setQuizzes(data);
        } catch {
            setError("Сервер недоступен");
        } finally {
            setIsLoading(false);
        }
    };

    const loadHistory = async () => {
        const token = localStorage.getItem("token");

        const url = isOrganizer
            ? "http://localhost:5000/api/history/organizer"
            : "http://localhost:5000/api/history/player";

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Не удалось загрузить историю");
                return;
            }

            setHistory(data);
        } catch {
            setError("Не удалось загрузить историю");
        } finally {
            setHistoryLoading(false);
        }
    };

    const deleteQuiz = async (quizId) => {
        const confirmed = window.confirm("Удалить этот квиз?");

        if (!confirmed) {
            return;
        }

        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/quizzes/${quizId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.ok) {
            await loadQuizzes();
        } else {
            const data = await response.json();
            alert(data.message || "Не удалось удалить квиз");
        }
    };

    const createRoom = async (quizId) => {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/quizzes/${quizId}/room`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const data = await response.json();
            alert(data.message || "Не удалось создать комнату");
            return;
        }

        const room = await response.json();

        navigate("/room", {
            state: {
                ...room,
                quizId,
                isHost: true,
            },
        });
    };

    useEffect(() => {
        loadQuizzes();
        loadHistory();
    }, []);

    return (
        <div className="page">
            <div className="card">
                <h1>Личный кабинет</h1>

                <p>
                    Пользователь: <strong>{user?.name}</strong>
                </p>

                <p>
                    Роль:{" "}
                    <strong>
                        {isOrganizer ? "Организатор" : "Участник"}
                    </strong>
                </p>

                {error && <p>{error}</p>}

                {isOrganizer ? (
                    <>
                        <h2>Мои квизы</h2>

                        {isLoading ? (
                            <p>Загрузка...</p>
                        ) : quizzes.length === 0 ? (
                            <p>Пока нет квизов</p>
                        ) : (
                            quizzes.map((quiz) => (
                                <div key={quiz.id}>
                                    <h3>{quiz.title}</h3>

                                    <p>{quiz.category}</p>

                                    <button
                                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                                    >
                                        Открыть
                                    </button>

                                    <br />
                                    <br />

                                    <button
                                        onClick={() => createRoom(quiz.id)}
                                    >
                                        Запустить
                                    </button>

                                    <br />
                                    <br />

                                    <button
                                        onClick={() => deleteQuiz(quiz.id)}
                                    >
                                        Удалить
                                    </button>

                                    <hr />
                                </div>
                            ))
                        )}

                        <h2>История проведённых квизов</h2>

                        {historyLoading ? (
                            <p>Загрузка...</p>
                        ) : history.length === 0 ? (
                            <p>История пока пустая</p>
                        ) : (
                            history.map((item) => (
                                <div key={item.sessionId}>
                                    <strong>{item.quizTitle}</strong>

                                    <p>Категория: {item.category}</p>

                                    <p>
                                        Дата:{" "}
                                        {item.finishedAt
                                            ? new Date(item.finishedAt).toLocaleString()
                                            : "Квиз ещё не завершён"}
                                    </p>

                                    <p>
                                        Участников: {item.participants}
                                    </p>

                                    <p>
                                        Победитель: {item.winner || "-"}
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate(`/session/${item.sessionId}`)
                                        }
                                    >
                                        Подробнее
                                    </button>

                                    <br />
                                    <br />

                                    <hr />
                                </div>
                            ))
                        )}

                        <button onClick={() => navigate("/create-quiz")}>
                            Создать квиз
                        </button>

                        <br />
                        <br />
                    </>
                ) : (
                    <>
                        <p>Введите код комнаты, чтобы присоединиться к квизу.</p>

                        <button onClick={() => navigate("/join-room")}>
                            Подключиться к комнате
                        </button>


                        <h2>История участия</h2>

                        {historyLoading ? (
                            <p>Загрузка...</p>
                        ) : history.length === 0 ? (
                            <p>История пока пустая</p>
                        ) : (
                            history.map((item) => (
                                <div key={item.sessionId}>
                                    <strong>{item.quizTitle}</strong>

                                    <p>Категория: {item.category}</p>

                                    <p>
                                        Дата:{" "}
                                        {item.finishedAt
                                            ? new Date(item.finishedAt).toLocaleString()
                                            : "Квиз ещё не завершён"}
                                    </p>

                                    <p>
                                        Баллы: {item.score}/{item.totalQuestions}
                                    </p>

                                    <p>
                                        Место: {item.place}
                                    </p>

                                    <hr />
                                </div>
                            ))
                        )}

                        <br />
                        <br />
                    </>
                )}

                <button onClick={logout}>
                    Выйти
                </button>
            </div>
        </div>
    );
}

export default Dashboard;