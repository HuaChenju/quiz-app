import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


function EditQuestion() {

  const { id } = useParams();
  const navigate = useNavigate();


  const [text, setText] = useState("");
  const [answers, setAnswers] = useState([]);



  const loadQuestion = async () => {

  const token = localStorage.getItem("token");


  const quizId = localStorage.getItem("quizId");


  const response = await fetch(
    `http://localhost:5000/api/quizzes/${quizId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );


  const quiz = await response.json();


  const question = quiz.questions.find(
    q => q.id === Number(id)
  );


  setText(question.text);
  setAnswers(question.answers);

};



  useEffect(() => {

    const fetchQuestion = async () => {
      await loadQuestion();
    };


    fetchQuestion();

  }, [id]);



  const updateAnswer = (index, value) => {

    const copy = [...answers];

    copy[index].text = value;

    setAnswers(copy);

  };



  const toggleCorrect = (index) => {

    const copy = [...answers];


    copy[index].isCorrect =
      !copy[index].isCorrect;


    setAnswers(copy);

  };



  const save = async () => {

    const token = localStorage.getItem("token");


    await fetch(
      `http://localhost:5000/api/quizzes/questions/${id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${token}`
        },


        body: JSON.stringify({

          text,

          answers: answers.map(a => ({
            text: a.text,
            isCorrect: a.isCorrect
          }))

        })

      }
    );


    navigate(-1);

  };



  return (

    <div className="page">

      <div className="card">


        <h1>
          Редактирование вопроса
        </h1>



        <input
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
        />



        <h3>
          Ответы
        </h3>



        {
          answers.map((answer, index) => (

            <div key={answer.id}>


              <input
                value={answer.text}
                onChange={(e) =>
                  updateAnswer(
                    index,
                    e.target.value
                  )
                }
              />


              <label>

                <input
                  type="checkbox"
                  checked={answer.isCorrect}
                  onChange={() =>
                    toggleCorrect(index)
                  }
                />

                Правильный

              </label>


            </div>

          ))
        }



        <br />


        <button onClick={save}>
          Сохранить
        </button>



        <br />
        <br />



        <button
          onClick={() => navigate(-1)}
        >
          Назад
        </button>


      </div>

    </div>

  );

}


export default EditQuestion;