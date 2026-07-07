import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function Dashboard() {

  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);



  useEffect(() => {

    loadQuizzes();

  }, []);



  const loadQuizzes = async () => {

    const token = localStorage.getItem("token");


    const response = await fetch(
      "http://localhost:5000/api/quizzes/my",
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );


    const data = await response.json();


    setQuizzes(data);

  };



  return (

    <div className="page">

      <div className="card">


        <h1>Мои квизы</h1>



        {
          quizzes.length === 0 ? (

            <p>
              Пока нет квизов
            </p>

          ) : (


            quizzes.map((quiz) => (

              <div key={quiz.id}>


                <h3>
                  {quiz.title}
                </h3>


                <p>
                  {quiz.category}
                </p>


                <button
                  onClick={() =>
                    navigate(`/quiz/${quiz.id}`)
                  }
                >
                  Открыть
                </button>


                <br />
                <br />


              </div>

            ))

          )
        }



        <button
          onClick={() =>
            navigate("/create-quiz")
          }
        >
          Создать квиз
        </button>


      </div>

    </div>

  );

}


export default Dashboard;