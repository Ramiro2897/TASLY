import React, { useState } from "react";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faInstagram,
//   faWhatsapp,
//   faGithub,
// } from "@fortawesome/free-brands-svg-icons";
import {
  validateLoginUsername,
  validateLoginPassword,
} from "../utils/validations";
import axios from "axios";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  const [message, setMessage] = useState<string>(""); // Para mensajes generales de error o éxito

  const navigate = useNavigate(); // Hook para redirección

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // Limpiar mensaje antes de nueva solicitud

    // Validar campos de login
    const usernameError = validateLoginUsername(username);
    const passwordError = validateLoginPassword(password);

    setErrors({
      username: usernameError ? "El usuario no es válido" : "",
      password: passwordError ? "La contraseña no es válida" : "",
    });

    if (usernameError || passwordError) {
      return; // Evita que el formulario se envíe si hay errores
    }

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      // Realizamos la solicitud POST con axios
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      // Si la respuesta es exitosa, guardamos el token en el localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("username", response.data.user.username);

      setMessage("Inicio de sesión exitoso. Redirigiendo...");

      // Redirigir a la página de inicio
      navigate("/Home");
    } catch (error: any) {
      if (error.response?.data.errors) {
        setErrors(error.response.data.errors); // Mostrar errores específicos
      } else {
        setMessage(
          error.response?.data.message || "Error en el inicio de sesión.",
        );
      }
    }
  };

  return (
    <div className={styles["container-all"]}>
      <div className={styles["login-container"]}>
        <form className={styles["login-form"]} onSubmit={handleSubmit}>
          <h2>TASLY</h2>

          {message && <p className={styles["message"]}>{message}</p>}
          {errors.general && (
            <p className={styles["error"]}>{errors.general}</p>
          )}

          <div className={styles["input-group"]}>
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              className={errors.username ? styles["input-error"] : ""}
            />
            {errors.username && (
              <p className={styles["error"]}>{errors.username}</p>
            )}
          </div>

          <div className={styles["input-group"]}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className={errors.password ? styles["input-error"] : ""}
            />
            {errors.password && (
              <p className={styles["error"]}>{errors.password}</p>
            )}
          </div>

          <button type="submit">{"Ingresar"}</button>

          <div className={styles["register-link"]}>
            <p>
              ¿Aún no tienes cuenta? <a href="/register">Crea una</a>
            </p>
          </div>

          {/* <div className={styles["social-icons"]}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://wa.me/573002353297"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a
              href="https://github.com/Ramiro2897"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
