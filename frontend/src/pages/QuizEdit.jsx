import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


function QuizEdit() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);



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

const deleteQuestion = async (questionId) => {

  const confirmed = window.confirm(
    "Удалить этот вопрос?"
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:5000/api/quizzes/questions/${questionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.ok) {
    await loadQuiz();
  } else {
    alert("Не удалось удалить вопрос");
  }

};

  useEffect(() => {

    const fetchQuiz = async () => {
      await loadQuiz();
    };

    fetchQuiz();

  }, [id]);



  if (!quiz) {

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


        <h1>
          {quiz.title}
        </h1>


        <p>
          Категория: {quiz.category}
        </p>



        <h2>
          Вопросы
        </h2>



        {
          quiz.questions.length === 0 ? (

            <p>
              Нет вопросов
            </p>

          ) : (


            quiz.questions.map((question, index) => (

              <div key={question.id}>


                <h3>
                  {index + 1}. {question.text}
                </h3>

                {question.imageUrl && (
                    <img
                        src={question.imageUrl}
                        alt={question.text}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "250px",
                          objectFit: "contain",
                          marginBottom: "16px",
                        }}
                    />
                )}


                {
                  question.answers.map(answer => (

                    <p key={answer.id}>

                      {answer.isCorrect ? "✅" : "○"}

                      {" "}

                      {answer.text}

                    </p>

                  ))
                }



                <button
                  onClick={() =>
                    navigate(
                      `/edit-question/${question.id}`
                    )
                  }
                >
                  Редактировать
                </button>

                {" "}

                <button
                  onClick={() => deleteQuestion(question.id)}
                >
                  Удалить
                </button>


                <br />
                <br />


              </div>

            ))

          )
        }



        <button
            onClick={() =>
                navigate(`/quiz/${id}/add-question`)
            }
        >
          Добавить вопрос
        </button>

        <br />
        <br />

        <button
            onClick={() => navigate("/dashboard")}
        >
          Назад к списку квизов
        </button>



      </div>

    </div>

  );

}


export default QuizEdit;