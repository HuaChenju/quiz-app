import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditQuestion() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [question, setQuestion] = useState("");
  const [type, setType] = useState("single");
  const [imageUrl, setImageUrl] = useState("");
  const [answers, setAnswers] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
            `http://localhost:5000/api/quizzes/question/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
              data.message || "Не удалось загрузить вопрос"
          );
          return;
        }

        setQuestion(data.text || "");
        setType(data.type || "single");
        setImageUrl(data.imageUrl || "");
        setQuizId(data.quizId);

        setAnswers(
            data.answers.map((answer) => ({
              id: answer.id,
              text: answer.text,
              correct: answer.isCorrect,
            }))
        );
      } catch {
        setError("Сервер недоступен");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

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

  const addAnswer = () => {
    setAnswers([
      ...answers,
      {
        text: "",
        correct: false,
      },
    ]);
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

    if (answers.some((answer) => !answer.text.trim())) {
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
          `http://localhost:5000/api/quizzes/questions/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text: question,
              type,
              imageUrl,
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
            "Не удалось сохранить изменения"
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

  if (isLoading) {
    return (
        <div className="page">
          <div className="card">
            Загрузка...
          </div>
        </div>
    );
  }

  return (
      <div className="page">
        <div className="card">
          <h1>Редактировать вопрос</h1>

          <p>Вопрос</p>

          <input
              value={question}
              onChange={(event) =>
                  setQuestion(event.target.value)
              }
          />

          <p>Ссылка на изображение</p>

          <input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(event) =>
                  setImageUrl(event.target.value)
              }
          />

          {imageUrl && (
              <img
                  src={imageUrl}
                  alt="Предпросмотр вопроса"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                    marginBottom: "16px",
                  }}
              />
          )}

          <p>Тип ответа</p>

          <select
              value={type}
              onChange={(event) => {
                const nextType = event.target.value;
                setType(nextType);

                if (nextType === "single") {
                  const firstCorrectIndex =
                      answers.findIndex(
                          (answer) => answer.correct
                      );

                  setAnswers(
                      answers.map((answer, index) => ({
                        ...answer,
                        correct:
                            index === firstCorrectIndex &&
                            firstCorrectIndex !== -1,
                      }))
                  );
                }
              }}
          >
            <option value="single">
              Один вариант
            </option>

            <option value="multiple">
              Несколько вариантов
            </option>
          </select>

          <p>Ответы</p>

          {answers.map((answer, index) => (
              <div key={answer.id || index}>
                <input
                    value={answer.text}
                    placeholder={`Вариант ${index + 1}`}
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
                : "Сохранить изменения"}
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

export default EditQuestion;