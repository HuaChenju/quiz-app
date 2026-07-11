import { useLocation, useNavigate } from "react-router-dom";

function Results() {

  const location = useLocation();
  const navigate = useNavigate();

  const { quiz, answers } = location.state || {};

  if (!quiz || !answers) {
    return (
      <div className="page">
        <div className="card">
          <h2>Нет результатов</h2>

          <button
            onClick={() => navigate("/dashboard")}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  let correctAnswers = 0;

  quiz.questions.forEach(question => {

    const userAnswer = answers.find(
      answer => answer.questionId === question.id
    );

    const correctIds = question.answers
      .filter(answer => answer.isCorrect)
      .map(answer => answer.id)
      .sort();

    const selectedIds = (userAnswer?.selectedAnswers || [])
      .sort();

    const isCorrect =
      JSON.stringify(correctIds) === JSON.stringify(selectedIds);

    if (isCorrect) {
      correctAnswers++;
    }

  });

  const percent = Math.round(
    (correctAnswers / quiz.questions.length) * 100
  );

  return (

    <div className="page">

      <div className="card">

        <h1>Результат</h1>

        <p>
          Правильных ответов: {correctAnswers} из {quiz.questions.length}
        </p>

        <p>
          Процент: {percent}%
        </p>

        <button
          onClick={() => navigate("/dashboard")}
        >
          На главную
        </button>

      </div>

    </div>

  );

}

export default Results;