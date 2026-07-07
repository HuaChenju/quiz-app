import { useState } from "react";
import { useNavigate } from "react-router-dom";


function CreateQuiz() {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [time, setTime] = useState(30);


const createQuiz = async () => {

  const token = localStorage.getItem("token");


  const response = await fetch(
    "http://localhost:5000/api/quizzes",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },


      body: JSON.stringify({
        title,
        category,
        rules: "",
        timePerQuestion: Number(time)
      })

    }
  );


  const data = await response.json();


  console.log(data);


  if (response.ok) {

    localStorage.setItem(
      "quizId",
      data.id
    );


    navigate("/question-type");

  }

};


  return (
    <div className="page">

      <div className="card">

        <h1>Создать квиз</h1>


        <p>Название</p>

        <input
          placeholder="Введите название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />


        <p>Категория</p>

        <input
          placeholder="Категория"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />


        <p>Время на вопрос</p>

        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />


        <button onClick={createQuiz}>
          Далее
        </button>


      </div>

    </div>
  );
}


export default CreateQuiz;