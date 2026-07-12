import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import socket from "../socket";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [submittedPlayers, setSubmittedPlayers] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [error, setError] = useState("");

  const quiz = location.state?.quiz;
  const answers = useMemo(
      () => location.state?.answers || [],
      [location.state?.answers]
  );

  const user = JSON.parse(
      localStorage.getItem("user") || "null"
  );

  const score = useMemo(() => {
    if (!quiz?.questions) {
      return 0;
    }

    let correctAnswers = 0;

    quiz.questions.forEach((question) => {
      const playerResult = answers.find(
          (answer) =>
              answer.questionId === question.id
      );

      if (!playerResult) {
        return;
      }

      const selectedIds = [
        ...(playerResult.selectedAnswers || []),
      ].sort((firstId, secondId) => firstId - secondId);

      const correctIds = question.answers
          .filter((answer) => answer.isCorrect)
          .map((answer) => answer.id)
          .sort((firstId, secondId) => firstId - secondId);

      const isCorrect =
          selectedIds.length === correctIds.length &&
          selectedIds.every(
              (answerId, index) =>
                  answerId === correctIds[index]
          );

      if (isCorrect) {
        correctAnswers += 1;
      }
    });

    return correctAnswers;
  }, [quiz, answers]);

  useEffect(() => {
    if (!quiz || !user) {
      return;
    }

    const handleResultSubmitted = ({
                                     leaderboard: currentLeaderboard,
                                     submittedPlayers: currentSubmittedPlayers,
                                     totalPlayers: currentTotalPlayers,
                                   }) => {
      setLeaderboard(currentLeaderboard);
      setSubmittedPlayers(currentSubmittedPlayers);
      setTotalPlayers(currentTotalPlayers);
    };

    const handleLeaderboardReady = (
        completedLeaderboard
    ) => {
      setLeaderboard(completedLeaderboard);
      setSubmittedPlayers(completedLeaderboard.length);
      setTotalPlayers(completedLeaderboard.length);
    };

    const handleResultError = (message) => {
      setError(message || "Не удалось отправить результат");
    };

    socket.on(
        "result-submitted",
        handleResultSubmitted
    );

    socket.on(
        "leaderboard-ready",
        handleLeaderboardReady
    );

    socket.on(
        "result-error",
        handleResultError
    );

    socket.emit("submit-result", {
      score,
      totalQuestions: quiz.questions.length,
    });

    return () => {
      socket.off(
          "result-submitted",
          handleResultSubmitted
      );

      socket.off(
          "leaderboard-ready",
          handleLeaderboardReady
      );

      socket.off(
          "result-error",
          handleResultError
      );
    };
  }, [quiz, score, user]);

  if (!quiz) {
    return (
        <div className="page">
          <div className="card">
            <h1>Результаты недоступны</h1>

            <p>
              Данные завершённого квиза не найдены.
            </p>

            <button
                onClick={() => navigate("/dashboard")}
            >
              В личный кабинет
            </button>
          </div>
        </div>
    );
  }

  const myResult = leaderboard.find(
      (result) => result.userId === user?.id
  );

  return (
      <div className="page">
        <div className="card">
          <h1>Итоги квиза</h1>

          <h2>{quiz.title}</h2>

          <p>
            Ваш результат:{" "}
            <strong>
              {score} из {quiz.questions.length}
            </strong>
          </p>

          {myResult && (
              <p>
                Ваше место:{" "}
                <strong>{myResult.place}</strong>
              </p>
          )}

          {error && (
              <p
                  style={{
                    color: "crimson",
                    fontWeight: "bold",
                  }}
              >
                {error}
              </p>
          )}

          <hr />

          <h2>Лидерборд</h2>

          {leaderboard.length === 0 ? (
              <p>Отправляем результаты...</p>
          ) : (
              leaderboard.map((result) => (
                  <div key={result.userId}>
                    <p>
                      <strong>
                        {result.place === 1 && "🥇 "}
                        {result.place === 2 && "🥈 "}
                        {result.place === 3 && "🥉 "}

                        {result.place}. {result.name}
                      </strong>

                      {" — "}

                      {result.score} из{" "}
                      {result.totalQuestions}

                      {result.userId === user?.id
                          ? " — вы"
                          : ""}
                    </p>
                  </div>
              ))
          )}

          {totalPlayers > 0 &&
              submittedPlayers < totalPlayers && (
                  <p>
                    Ожидаем результаты остальных
                    участников: {submittedPlayers} из{" "}
                    {totalPlayers}
                  </p>
              )}

          {totalPlayers > 0 &&
              submittedPlayers >= totalPlayers && (
                  <p>
                    Все участники завершили квиз.
                  </p>
              )}

          <br />

          <button
              onClick={() => navigate("/dashboard")}
          >
            В личный кабинет
          </button>
        </div>
      </div>
  );
}

export default Results;