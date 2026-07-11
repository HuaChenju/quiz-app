import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";

function Game() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const loadQuiz = async () => {

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/quizzes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    setQuiz(data);

  };

  useEffect(() => {

 socket.on("question-changed", ({ currentQuestion }) => {

    setCurrentQuestion(currentQuestion);
    setSelectedAnswers([]);
    setTimeLeft(quiz?.timePerQuestion ?? 0);

});

  return () => {

    socket.off("question-changed");

  };

}, [quiz]);

  useEffect(() => {

    const fetchQuiz = async () => {
      await loadQuiz();
    };

    fetchQuiz();

  }, [id]);

  const question = quiz?.questions[currentQuestion];

  const handleAnswerClick = (answerId) => {

    if (question.type === "single") {

      setSelectedAnswers([answerId]);

    } else {

      if (selectedAnswers.includes(answerId)) {

        setSelectedAnswers(
          selectedAnswers.filter(id => id !== answerId)
        );

      } else {

        setSelectedAnswers([
          ...selectedAnswers,
          answerId
        ]);

      }

    }

  };

  const nextQuestion = () => {
    socket.emit("next-question");
    const newResults = [
      ...results,
      {
        questionId: question.id,
        selectedAnswers
      }
    ];

    setResults(newResults);

    if (currentQuestion < quiz.questions.length - 1) {

      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswers([]);
      setTimeLeft(quiz.timePerQuestion);

    } else {

      navigate("/results", {
        state: {
          quiz,
          answers: newResults
        }
      });

    }

  };

  useEffect(() => {

    if (!started || !quiz) {
      return;
    }

    const timer = setInterval(() => {

      setTimeLeft(prev => {

        if (prev <= 1) {

          clearInterval(timer);

          nextQuestion();

          return 0;

        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [currentQuestion, started]);

  if (!quiz) {

    return (
      <div className="page">
        <div className="card">
          Загрузка...
        </div>
      </div>
    );

  }

  if (!started) {

    return (

      <div className="page">

        <div className="card">

          <h1>{quiz.title}</h1>

          <p>
            Категория: {quiz.category}
          </p>

          <p>
            Правила:
          </p>

          <p>
            {quiz.rules || "Правила отсутствуют"}
          </p>

          <p>
            Время на вопрос: {quiz.timePerQuestion} сек.
          </p>

          <p>
            Количество вопросов: {quiz.questions.length}
          </p>

          <button
            onClick={() => {

              setStarted(true);
              setTimeLeft(quiz.timePerQuestion);

            }}
          >
            Начать игру
          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="page">

      <div className="card">

        <h1>{quiz.title}</h1>

        <p>
          Осталось времени: {timeLeft} сек.
        </p>

        <p>
          Вопрос {currentQuestion + 1} из {quiz.questions.length}
        </p>

        <h2>
          {question.text}
        </h2>

        {
          question.answers.map(answer => (

            <button
              key={answer.id}
              onClick={() => handleAnswerClick(answer.id)}
              style={{
                display: "block",
                marginBottom: "10px",
                backgroundColor: selectedAnswers.includes(answer.id)
                  ? "#90caf9"
                  : ""
              }}
            >
              {answer.text}
            </button>

          ))
        }

        <br />

        <button
          onClick={nextQuestion}
          disabled={
            selectedAnswers.length === 0 &&
            timeLeft > 0
          }
        >
          {
            currentQuestion === quiz.questions.length - 1
              ? "Завершить"
              : "Далее"
          }
        </button>

      </div>

    </div>

  );

}

export default Game;