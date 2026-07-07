import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Register() {

  const navigate = useNavigate();


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const register = async () => {

    const response = await fetch(
      "http://localhost:5000/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );


    const data = await response.json();


    console.log(data);


    if (response.ok) {
      navigate("/login");
    }

  };



  return (

    <div className="page">

      <div className="card">


        <h1>Регистрация</h1>


        <input
          placeholder="Имя"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />


        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />


        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />



        <button onClick={register}>
          Создать аккаунт
        </button>



        <br />
        <br />


        <button
          onClick={() => navigate("/login")}
        >
          Уже есть аккаунт
        </button>


      </div>


    </div>

  );
}


export default Register;