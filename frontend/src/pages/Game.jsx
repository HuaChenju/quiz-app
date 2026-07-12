import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import socket from "../socket";

function Game() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");

  const selectedAnswersRef = useRef([]);
  const resultsRef = useRef([]);
  const currentQuestionRef = useRef(0);
  const quizRef = useRef(null);

  const savedRoom = JSON.parse(
      sessionStorage.getItem("activeRoom") || "null"
  );

  const isHost =
      location.state?.isHost === true ||
      savedRoom?.isHost === true;

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    quizRef.current = quiz;
  }, [quiz]);

  useEffect(() => {
    const loadQuiz = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
            `http://localhost:5000/api/quizzes/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Не удалось загрузить квиз");
          return;
        }

        setQuiz(data);
        setTimeLeft(data.timePerQuestion);
      } catch {
        setError("Сервер недоступен");
      }
    };

    loadQuiz();
  }, [id]);

  useEffect(() => {
    const handleQuestionChanged = ({ currentQuestion: nextIndex }) => {
      const currentQuiz = quizRef.current;

      if (!currentQuiz) {
        return;
      }

      const currentQuestionData =
          currentQuiz.questions[currentQuestionRef.current];

      let updatedResults = resultsRef.current;

      if (currentQuestionData) {
        const existingResult = updatedResults.find(
            (result) =>
                result.questionId === currentQuestionData.id
        );

        if (!existingResult) {
          updatedResults = [
            ...updatedResults,
            {
              questionId: currentQuestionData.id,
              selectedAnswers: selectedAnswersRef.current,
            },
          ];

          setResults(updatedResults);
          resultsRef.current = updatedResults;
        }
      }

      if (nextIndex >= currentQuiz.questions.length) {
        navigate("/results", {
          state: {
            quiz: currentQuiz,
            answers: updatedResults,
          },
        });

        return;
      }

      setCurrentQuestion(nextIndex);
      currentQuestionRef.current = nextIndex;

      setSelectedAnswers([]);
      selectedAnswersRef.current = [];

      setTimeLeft(currentQuiz.timePerQuestion);
    };

    socket.on("question-changed", handleQuestionChanged);

    return () => {
      socket.off("question-changed", handleQuestionChanged);
    };
  }, [navigate]);

  useEffect(() => {
    if (!quiz || !isHost) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          socket.emit("next-question");
          return quiz.timePerQuestion;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [quiz, currentQuestion, isHost]);

  const question = quiz?.questions?.[currentQuestion];

  const handleAnswerClick = (answerId) => {
    if (!question) {
      return;
    }

    if (question.type === "single") {
      setSelectedAnswers([answerId]);
      return;
    }

    setSelectedAnswers((previousAnswers) => {
      if (previousAnswers.includes(answerId)) {
        return previousAnswers.filter(
            (selectedId) => selectedId !== answerId
        );
      }

      return [...previousAnswers, answerId];
    });
  };

  const goToNextQuestion = () => {
    if (!isHost) {
      return;
    }

    socket.emit("next-question");
  };

  if (error) {
    return (
        <div className="page">
          <div className="card">
            <h1>Ошибка</h1>
            <p>{error}</p>

            <button onClick={() => navigate("/dashboard")}>
              В личный кабинет
            </button>
          </div>
        </div>
    );
  }

  if (!quiz) {
    return (
        <div className="page">
          <div className="card">
            Загрузка...
          </div>
        </div>
    );
  }

  if (quiz.questions.length === 0) {
    return (
        <div className="page">
          <div className="card">
            <h1>{quiz.title}</h1>
            <p>В этом квизе пока нет вопросов.</p>

            <button onClick={() => navigate("/dashboard")}>
              В личный кабинет
            </button>
          </div>
        </div>
    );
  }

  if (!question) {
    return (
        <div className="page">
          <div className="card">
            Загрузка вопроса...
          </div>
        </div>
    );
  }

  return (
      <div className="page">
        <div className="card">
          <h1>{quiz.title}</h1>

          <p>
            Вопрос {currentQuestion + 1} из{" "}
            {quiz.questions.length}
          </p>

          <p>
            Осталось времени: {timeLeft} сек.
          </p>

          <h2>{question.text}</h2>

          {question.answers.map((answer) => (
              <button
                  key={answer.id}
                  onClick={() => handleAnswerClick(answer.id)}
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    backgroundColor: selectedAnswers.includes(answer.id)
                        ? "#90caf9"
                        : "",
                  }}
              >
                {answer.text}
              </button>
          ))}

          <br />

          {isHost ? (
              <button onClick={goToNextQuestion}>
                {currentQuestion === quiz.questions.length - 1
                    ? "Завершить квиз"
                    : "Следующий вопрос"}
              </button>
          ) : (
              <p>
                Выберите ответ и ожидайте следующего вопроса.
              </p>
          )}
        </div>
      </div>
  );
}

export default Game;