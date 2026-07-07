import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Login() {

  const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const login = async () => {

    const response = await fetch(
      "http://localhost:5000/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );


    const data = await response.json();


    console.log(data);


    if (response.ok) {

      localStorage.setItem(
        "token",
        data.token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      navigate("/dashboard");

    }

  };



  return (

    <div className="page">

      <div className="card">


        <h1>Вход</h1>



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



        <button
          onClick={login}
        >
          Войти
        </button>



        <br />
        <br />


        <button
          onClick={() => navigate("/register")}
        >
          Регистрация
        </button>


      </div>


    </div>

  );

}


export default Login;