import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);

  const loadQuizzes = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/quizzes/my",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    setQuizzes(data);
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
      alert("Не удалось удалить квиз");
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
  console.log(await response.text());
  alert("Не удалось создать комнату");
  return;
}

    const room = await response.json();

navigate("/room", {
    state: {
        ...room,
        quizId
    }
});

  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      await loadQuizzes();
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h1>Мои квизы</h1>

        {quizzes.length === 0 ? (
          <p>Пока нет квизов</p>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id}>
              <h3>{quiz.title}</h3>

              <p>{quiz.category}</p>

              <button onClick={() => navigate(`/quiz/${quiz.id}`)}>
                Открыть
              </button>

              {" "}

              <button onClick={() => createRoom(quiz.id)}>
                Запустить
              </button>

              {" "}

              <button onClick={() => deleteQuiz(quiz.id)}>
                Удалить
              </button>

              <br />
              <br />
            </div>
          ))
        )}

        <button onClick={() => navigate("/create-quiz")}>
          Создать квиз
        </button>

        <br />
<br />

<button
  onClick={() => navigate("/join-room")}
>
  Подключиться к комнате
</button>

      </div>
    </div>
  );
}

export default Dashboard;