import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function SessionDetails() {
    const navigate = useNavigate();
    const { sessionId } = useParams();

    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSession = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(
                    `http://localhost:5000/api/history/organizer/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ||
                        "Не удалось загрузить результаты"
                    );
                    return;
                }

                setSession(data);
            } catch {
                setError("Сервер недоступен");
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="page">
                <div className="card">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="card">
                    <p>{error}</p>

                    <button onClick={() => navigate("/dashboard")}>
                        Вернуться в личный кабинет
                    </button>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="page">
            <div className="card">
                <h1>Результаты квиза</h1>

                <h2>{session.quizTitle}</h2>

                <p>
                    Категория: <strong>{session.category}</strong>
                </p>

                <p>
                    Код комнаты: <strong>{session.roomCode}</strong>
                </p>

                <p>
                    Дата проведения:{" "}
                    <strong>
                        {session.finishedAt
                            ? new Date(
                                session.finishedAt
                            ).toLocaleString()
                            : new Date(
                                session.startedAt
                            ).toLocaleString()}
                    </strong>
                </p>

                <p>
                    Количество участников:{" "}
                    <strong>{session.participants}</strong>
                </p>

                <h2>Лидерборд</h2>

                {session.results.length === 0 ? (
                    <p>Сохранённых результатов нет</p>
                ) : (
                    session.results.map((result) => (
                        <div key={result.userId}>
                            <h3>
                                {result.place > 0
                                    ? `${result.place} место`
                                    : "Место не определено"}
                            </h3>

                            <p>
                                Участник:{" "}
                                <strong>{result.name}</strong>
                            </p>

                            <p>
                                Баллы:{" "}
                                <strong>
                                    {result.score}/
                                    {result.totalQuestions}
                                </strong>
                            </p>

                            <hr />
                        </div>
                    ))
                )}

                <button onClick={() => navigate("/dashboard")}>
                    Вернуться в личный кабинет
                </button>
            </div>
        </div>
    );
}

export default SessionDetails;