import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const register = async () => {
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
          "http://localhost:5000/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              password,
              role,
            }),
          }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Не удалось зарегистрироваться");
        return;
      }

      navigate("/login");
    } catch {
      setError("Сервер недоступен");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="page">
        <div className="card">
          <h1>Регистрация</h1>

          <input
              placeholder="Имя"
              value={name}
              onChange={(event) => setName(event.target.value)}
          />

          <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
          />

          <input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
          />

          <p>Тип аккаунта</p>

          <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
          >
            <option value="PLAYER">Участник</option>
            <option value="ORGANIZER">Организатор</option>
          </select>

          {error && <p>{error}</p>}

          <button
              onClick={register}
              disabled={isLoading}
          >
            {isLoading ? "Регистрация..." : "Создать аккаунт"}
          </button>

          <br />
          <br />

          <button onClick={() => navigate("/login")}>
            Уже есть аккаунт
          </button>
        </div>
      </div>
  );
}

export default Register;