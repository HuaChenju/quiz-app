import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function QuestionType() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [answerType, setAnswerType] = useState("single");

  const next = () => {
    localStorage.setItem("answerType", answerType);

    navigate(`/quiz/${quizId}/add-question`);
  };

  return (
      <div className="page">
        <div className="card">
          <h1>Тип вопроса</h1>

          <p>Тип вопроса</p>

          <label>
            <input
                type="radio"
                name="questionType"
                defaultChecked
            />
            Текст
          </label>

          <br />

          <label>
            <input
                type="radio"
                name="questionType"
            />
            Изображение
          </label>

          <p>Тип ответа</p>

          <label>
            <input
                type="radio"
                name="answerType"
                checked={answerType === "single"}
                onChange={() => setAnswerType("single")}
            />
            Один вариант
          </label>

          <br />

          <label>
            <input
                type="radio"
                name="answerType"
                checked={answerType === "multiple"}
                onChange={() => setAnswerType("multiple")}
            />
            Несколько вариантов
          </label>

          <br />
          <br />

          <button onClick={next}>
            Далее
          </button>
        </div>
      </div>
  );
}

export default QuestionType;