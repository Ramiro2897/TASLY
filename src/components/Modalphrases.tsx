import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "../styles/modalTask.module.css";

interface ModalPhrasesProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phraseData: { phrase: string; author: string }) => void;
  onPhrasesAdded: (phaseData: any) => void;
}

const ModalPhrases: React.FC<ModalPhrasesProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onPhrasesAdded,
}) => {
  const [phrase, setPhrase] = useState("");
  const [author, setAuthor] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ phrase?: string; author?: string }>(
    {},
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phraseData = { phrase, author };

    const token = localStorage.getItem("token");
    if (!token) return;

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/phrase`,
        phraseData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      onPhrasesAdded(response.data);

      onSubmit(phraseData);
      setPhrase("");
      setAuthor("");
      setSuccessMessage("Frase agregada correctamente!");
      setErrors({});
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        timeoutRef.current = null; // limpiar la referencia
      }, 5000);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrorMessage("No se pudo guardar la frase.");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    }
  };
  // cierra el modal y ademas eso limpia los errores etc
  const handleClose = () => {
    // 🔴 cancelar timeout pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setPhrase("");
    setAuthor("");
    setErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);

    const modal = document.querySelector(`.${styles["modal-content"]}`);
    if (!modal) {
      onClose();
      return;
    }

    modal.classList.add(styles.modalContentClosingPowerful);
    modal.addEventListener(
      "animationend",
      () => {
        onClose();
        document.body.style.overflow = "auto";
        document.body.style.pointerEvents = "auto";
      },
      { once: true },
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h2>Agregar Frase</h2>
        {successMessage && (
          <div className={styles["success-message"]}>{successMessage}</div>
        )}
        {errorMessage && (
          <div className={styles["error-message"]}>{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          {errors.phrase && (
            <div className={styles["errorContainer"]}>
              <span className={styles["errorTask"]}>{errors.phrase}</span>
            </div>
          )}
          <textarea
            placeholder="Escribe una frase"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />

          {errors.author && (
            <div className={styles["errorContainer"]}>
              <span className={styles["errorTask"]}>{errors.author}</span>
            </div>
          )}
          <input
            type="text"
            placeholder="Autor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />

          <div className={styles["modal-actions"]}>
            <button type="submit">Guardar</button>
            <button type="button" onClick={handleClose}>
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPhrases;
