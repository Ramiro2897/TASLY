import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router-dom";

// import { validateUsername, validatePassword } from '../utils/validations';

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate(); // Hook para redirección

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
      });

      setMessage("Registro exitoso. Ahora puedes iniciar sesión.");
      setUsername("");
      setPassword("");
      setErrors({}); // Limpiar los errores después de un registro exitoso
      navigate("/");
    } catch (error: any) {
      if (error.response?.data.errors) {
        setErrors(error.response.data.errors); // Actualizar con los errores específicos
      } else {
        setMessage(error.response?.data.message || "Error en el registro.");
      }
    }
  };

  return (
    <div className={styles["container-all"]}>
      <div className={styles["login-container"]}>
        <form className={styles["login-form"]} onSubmit={handleSubmit}>
          <h2>TASLY</h2>

          {message && <p className={styles.message}>{message}</p>}

          <div className={styles["input-group"]}>
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Crea un usuario"
            />
            {errors.username && (
              <p className={styles.error}>{errors.username}</p>
            )}
          </div>

          <div className={styles["input-group"]}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña"
            />
            {errors.password && (
              <p className={styles.error}>{errors.password}</p>
            )}
          </div>

          <button type="submit">Registrarse</button>

          <div className={styles["register-link"]}>
            <p>
              ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
