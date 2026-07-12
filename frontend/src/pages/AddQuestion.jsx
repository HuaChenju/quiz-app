import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AddQuestion() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const type =
      localStorage.getItem("answerType") || "single";

  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [answers, setAnswers] = useState([
    {
      text: "",
      correct: false,
    },
    {
      text: "",
      correct: false,
    },
  ]);

  const addAnswer = () => {
    setAnswers([
      ...answers,
      {
        text: "",
        correct: false,
      },
    ]);
  };

  const updateAnswer = (index, value) => {
    const copy = [...answers];
    copy[index].text = value;
    setAnswers(copy);
    setError("");
  };

  const chooseCorrect = (index) => {
    const copy = [...answers];

    if (type === "single") {
      copy.forEach((answer, answerIndex) => {
        answer.correct = answerIndex === index;
      });
    } else {
      copy[index].correct = !copy[index].correct;
    }

    setAnswers(copy);
    setError("");
  };

  const saveQuestion = async () => {
    setError("");

    if (!question.trim()) {
      setError("Введите текст вопроса");
      return;
    }

    if (answers.length < 2) {
      setError("Добавьте минимум два варианта ответа");
      return;
    }

    const hasEmptyAnswer = answers.some(
        (answer) => !answer.text.trim()
    );

    if (hasEmptyAnswer) {
      setError("Заполните все варианты ответа");
      return;
    }

    const correctAnswersCount = answers.filter(
        (answer) => answer.correct
    ).length;

    if (correctAnswersCount === 0) {
      setError("Выберите хотя бы один правильный ответ");
      return;
    }

    if (type === "single" && correctAnswersCount !== 1) {
      setError(
          "Для одиночного выбора должен быть один правильный ответ"
      );
      return;
    }

    if (type === "multiple" && correctAnswersCount < 2) {
      setError(
          "Для множественного выбора выберите минимум два правильных ответа"
      );
      return;
    }

    const token = localStorage.getItem("token");

    setIsSaving(true);

    try {
      const response = await fetch(
          `http://localhost:5000/api/quizzes/${quizId}/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text: question,
              type,
              answers: answers.map((answer) => ({
                text: answer.text,
                isCorrect: answer.correct,
              })),
            }),
          }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
            data.message ||
            data.error ||
            "Не удалось сохранить вопрос"
        );
        return;
      }

      navigate(`/quiz/${quizId}`);
    } catch {
      setError("Сервер недоступен");
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <div className="page">
        <div className="card">
          <h1>Добавить вопрос</h1>

          <p>Вопрос</p>

          <input
              placeholder="Введите вопрос"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setError("");
              }}
          />

          <p>Ответы</p>

          {answers.map((answer, index) => (
              <div key={index}>
                <input
                    placeholder={`Вариант ${index + 1}`}
                    value={answer.text}
                    onChange={(event) =>
                        updateAnswer(index, event.target.value)
                    }
                />

                <label>
                  <input
                      type={
                        type === "single"
                            ? "radio"
                            : "checkbox"
                      }
                      name={
                        type === "single"
                            ? "correct-answer"
                            : undefined
                      }
                      checked={answer.correct}
                      onChange={() => chooseCorrect(index)}
                  />

                  Правильный ответ
                </label>
              </div>
          ))}

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

          <button onClick={addAnswer}>
            + добавить вариант
          </button>

          <br />
          <br />

          <button
              onClick={saveQuestion}
              disabled={isSaving}
          >
            {isSaving
                ? "Сохранение..."
                : "Сохранить вопрос"}
          </button>

          <br />
          <br />

          <button
              onClick={() => navigate(`/quiz/${quizId}`)}
          >
            Назад к квизу
          </button>
        </div>
      </div>
  );
}

export default AddQuestion;