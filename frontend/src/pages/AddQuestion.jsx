import { useState } from "react";
import { useNavigate } from "react-router-dom";


function AddQuestion() {

  const navigate = useNavigate();


  const type =
    localStorage.getItem("answerType") || "single";


  const [question, setQuestion] = useState("");


  const [answers, setAnswers] = useState([
    {
      text: "",
      correct: false
    },
    {
      text: "",
      correct: false
    }
  ]);



  const addAnswer = () => {

    setAnswers([
      ...answers,
      {
        text: "",
        correct: false
      }
    ]);

  };



  const updateAnswer = (index, value) => {

    const copy = [...answers];

    copy[index].text = value;

    setAnswers(copy);

  };



  const chooseCorrect = (index) => {

    const copy = [...answers];


    if (type === "single") {

      copy.forEach((answer, i) => {

        answer.correct = i === index;

      });


    } else {

      copy[index].correct =
        !copy[index].correct;

    }


    setAnswers(copy);

  };


const saveQuestion = async () => {

  const token = localStorage.getItem("token");

  const quizId = localStorage.getItem("quizId");


  const response = await fetch(
    `http://localhost:5000/api/quizzes/${quizId}/questions`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },


      body: JSON.stringify({

        text: question,

        type:
          localStorage.getItem("answerType") || "single",


        answers: answers.map(answer => ({
          text: answer.text,
          isCorrect: answer.correct
        }))

      })

    }
  );


  const data = await response.json();


  console.log(data);


  if (response.ok) {

    navigate(`/quiz/${quizId}`);

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
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />



        <p>Ответы</p>



        {
          answers.map((answer, index) => (

            <div key={index}>


              <input
                placeholder={`Вариант ${index + 1}`}
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
                  type={
                    type === "single"
                      ? "radio"
                      : "checkbox"
                  }

                  checked={answer.correct}

                  onChange={() =>
                    chooseCorrect(index)
                  }

                />


                Правильный ответ


              </label>


            </div>

          ))
        }



        <button
          onClick={addAnswer}
        >
          + добавить вариант
        </button>



        <br />
        <br />



        <button
          onClick={saveQuestion}
        >
          Сохранить вопрос
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


export default AddQuestion;