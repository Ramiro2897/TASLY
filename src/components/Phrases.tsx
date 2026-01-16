import styles from "../styles/phrases.module.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faListCheck,
  faBullseye,
  faSearch,
  faClock,
  faPen,
  faTrash,
  faTimes,
  faSave,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const phraseMessages = [
  "¿Qué tienes en mente?",
  "Escribe algo que quieras guardar.",
  "Comparte una frase o pensamiento.",
  "¿Quieres escribir algo hoy?",
  "Escribe una frase o idea.",
  "¿Qué idea ronda por tu cabeza ahora?",
  "Escribe eso que no quieres olvidar.",
  "Deja aquí una frase que te represente.",
  "¿Hay algo que quieras decirte a ti mismo?",
  "Escribe una idea rápida.",
  "Guarda un pensamiento antes de que se te vaya.",
  "¿Qué te gustaría recordar más tarde?",
  "Una frase, una idea, lo que quieras.",
  "Escribe algo que tenga sentido para ti.",
  "¿Qué pasa por tu mente en este momento?",
  "Anota una frase que te motive.",
  "Escribe algo solo para ti.",
  "¿Quieres dejar un pensamiento aquí?",
  "Comparte una idea que valga la pena guardar.",
  "Escribe lo primero que se te ocurra."
];

const Phrases = () => {
  const [phrases, setPhrases] = useState<
    {
      id: number;
      phrase: string;
      author: string;
      user_id: number;
      created_at: string;
      favorite: boolean;
    }[]
  >([]);
  const [searchResults, setSearchResults] = useState<
    {
      id: number;
      phrase: string;
      author: string;
      user_id: number;
      created_at: string;
      favorite: boolean;
    }[]
  >([]);
  const [errors, setErrors] = useState<{
    userId?: string;
    general?: string;
    message?: string;
    errorUpdate?: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<{
    id: number;
    name: string;
    date: string;
    favorite: boolean;
    author: string;
  } | null>(null);
  const [newDate, setNewDate] = useState("");
  const [editedName, setEditedName] = useState(selectedPhrase?.name || "");

  // permite asignarle el valor a selectedPhrase cuando se abre el modal de editar
  useEffect(() => {
    if (selectedPhrase) {
      if (selectedPhrase.date) {
        const date = new Date(selectedPhrase.date);

        // Convertimos la fecha a la zona horaria de Bogotá y luego al formato YYYY-MM-DD
        const offsetDate = new Date(
          date.toLocaleString("en-US", { timeZone: "America/Bogota" })
        );
        const year = offsetDate.getFullYear();
        const month = String(offsetDate.getMonth() + 1).padStart(2, "0");
        const day = String(offsetDate.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        setNewDate(formattedDate);
      } else {
        setNewDate("");
      }

      setEditedName(selectedPhrase.name || "");
    }
  }, [selectedPhrase]);

  // datos globales del usuario para realizar cualquier accion
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // -----------------------------------------------------

  // obtener las teras del usuario
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/loadPhrases`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.length === 0) {
          setErrors({ message: "Parece que tu lista está vacía" });
        } else {
          setErrors({ general: undefined }); // Si hay tareas, limpiamos el mensaje de error
        }
        setPhrases(response.data);
      } catch (error: any) {
        if (error.response?.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({
            general: "Error inesperado. Comunícalo al programador.",
          });
        }
      }
    };
    loadTasks();
  }, []);

  // funcion para hacer la busqueda de frases
  const handleSearch = async () => {
    try {
      setErrors({});

      const response = await axios.get(`${API_URL}/api/auth/searchPhrases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          query: searchTerm,
        },
      });

      setSearchResults(response.data); // Actualiza las frases con los resultados de la búsqueda
      setIsSearching(response.data.length > 0); // si la busqueda es 0 o no hay no se muestra el boton
    } catch (error: any) {
      setSearchResults([]);
      setIsSearching(false); // no aparece el boton de ir atras cuando se hace una busqueda en caso de error...
      setErrors(
        error.response?.data?.errors || { general: "Error en la búsqueda." }
      );
      setTimeout(() => {
        setErrors(() => {
          // Si aún no hay frases, volvemos a mostrar el mensaje predeterminado
          if (phrases.length === 0 && searchResults.length === 0) {
            return { message: "No se encontraron frases recientes." };
          }
          return {}; // Si hay frases, no mostramos ningún mensaje
        });
      }, 5000);
    }
  };

  // funciona para eliminar una frase
  const handleDeletePhrase = async () => {
    if (!selectedPhrase) return;

    try {
      await axios.delete(`${API_URL}/api/auth/deletePhrase`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Phrase-Id": selectedPhrase.id.toString(),
        },
      });

      // 🔹 Filtrar frases actualizadas
      const updatedPhrase = phrases.filter(
        (phrase) => phrase.id !== selectedPhrase.id
      );
      const updatedSearchResults = searchResults.filter(
        (phrase) => phrase.id !== selectedPhrase.id
      );

      // 🔹 Actualizar el estado con los nuevos valores
      if (updatedSearchResults.length === 0) {
        setIsSearching(false); // Oculta el botón
      }

      // mostrar mensaje cuando se eliminen frases y no haya que mostrar
      if (updatedPhrase.length === 0) {
        setErrors({ message: "No se encontraron frases recientes" });
      } else {
        setErrors({ message: "" });
      }

      setPhrases(updatedPhrase);
      setSearchResults(updatedSearchResults);

      handleCloseModal();
    } catch (error: any) {
      setErrors(
        error.response?.data?.errors || {
          general: "Error al eliminar la frase.",
        }
      );
      setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, general: "" }));
      }, 5000);
    }
  };

  // funcion para actualizar frase
  const handleUpdatePhrase = async () => {
    if (!selectedPhrase) return;
    const localDate = new Date(`${newDate}T00:00:00-05:00`).toISOString();

    try {
      await axios.put(
        `${API_URL}/api/auth/phraseUpdate`,
        {
          phraseId: selectedPhrase.id,
          updatedDate: localDate,
          editedName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar tareas en el estado principal
      const updatedPhrases = phrases.map((phrase) =>
        phrase.id === selectedPhrase.id
          ? { ...phrase, created_at: localDate, phrase: editedName }
          : phrase
      );

      // Actualizar las tareas en los resultados de búsqueda
      const updatedSearchResults = searchResults.map((phrase) =>
        phrase.id === selectedPhrase.id
          ? { ...phrase, created_at: localDate, phrase: editedName }
          : phrase
      );
      // Actualizamos ambos estados
      setSearchResults(updatedSearchResults);
      setPhrases(updatedPhrases);
      handleCloseEditModal(); //cierra el modal
      // noticacion de audio
      const playSound = () => {
        const audio = new Audio("/OpenClose.mp3");
        audio.volume = 0.3;
        audio.play();
      };
      playSound();
    } catch (error: any) {
      setErrors(
        error.response?.data?.errors || {
          general: "Error al actualizar la tarea.",
        }
      );
      setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, general: "" }));
      }, 5000);
    }
  };

  // funcion para actualizar las frases a favorita o viceversa
  const handleFavoriteToggle = async (
    phraseId: number,
    isFavorite: boolean
  ) => {
    try {
      // Llamada PUT para actualizar el estado del "favorite"
      await axios.put(
        `${API_URL}/api/auth/updateFavorite`,
        { favorite: isFavorite }, // Enviamos el nuevo estado de "favorite"
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Phrase-Id": phraseId,
            Favorite: isFavorite.toString(), // Enviamos como string para facilitar la interpretación
          },
        }
      );
      setPhrases((prevPhrase) =>
        prevPhrase.map((phrases) =>
          phrases.id === phraseId
            ? { ...phrases, favorite: isFavorite }
            : phrases
        )
      );
      // Actualización del estado en la interfaz
      setSearchResults((prevResults) =>
        prevResults.map((phrases) =>
          phrases.id === phraseId
            ? { ...phrases, favorite: isFavorite }
            : phrases
        )
      );
    } catch (error: any) {
      setErrors(
        error.response?.data?.errors || {
          general: "Error al actualizar el favorito.",
        }
      );
      setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, general: "" }));
      }, 5000);
    }
  };

  // contenido para activar el modal al dejar presioanda la pantalla para eliminar
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  const handleMouseDown = (
    phraseId: number,
    phraseName: string,
    date: string,
    favorite: boolean,
    author: string
  ) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }

    pressTimer = setTimeout(() => {
      if ("vibrate" in navigator) {
        navigator.vibrate(100);
      }
      setShowModal(true);
      setSelectedPhrase({
        id: phraseId,
        name: phraseName,
        date: date,
        favorite: favorite,
        author: author,
      });
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    }, 600);
  };

  const handleCloseModal = () => {
    const modal = document.querySelector(`.${styles.modalContent}`);
    if (!modal) return; // si no encuentra el modal, no hacemos nada

    modal.classList.add(styles.modalContentClosing); // aplicamos la animación
    modal.addEventListener(
      "animationend",
      () => {
        setShowModal(false); // cerramos el modal
        document.body.style.overflow = "auto";
        document.body.style.pointerEvents = "auto";
      },
      { once: true }
    );
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  // funcion abrir el modal de actualizar
  const handleOpenEditModal = () => {
    setShowEditModal(true);
    setShowModal(false);
  };

  // funcion para cerrar el modal de editar
  const handleCloseEditModal = () => {
    const modal = document.querySelector(`.${styles.modalContent}`);
    if (!modal) return;

    modal.classList.add(styles.modalContentClosing);
    modal.addEventListener(
      "animationend",
      () => {
        setShowModal(false);
        setShowEditModal(false);
        setErrors({});
        document.body.style.overflow = "auto";
        document.body.style.pointerEvents = "auto";
      },
      { once: true }
    );
  };

  // funcion para ocultar el botón "Ir atrás" cuando se va a lista de frases por defecto del usuario
  const handleBack = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  // funcion para nevegar entre componentes
  const navigate = useNavigate();
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const formatDateWithoutTimezoneShift = (dateStr: string) => {
    const [year, month, day] = dateStr.split("T")[0].split("-");
    const meses = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    return `${parseInt(day)} ${meses[parseInt(month) - 1]} ${year}`;
  };

  const randomMessage =
    phraseMessages[Math.floor(Math.random() * phraseMessages.length)];

  return (
    <div className={styles["phrases-container"]}>
      {/* 🔹 Modal para eliminar o actualizar frase*/}
      {showModal && selectedPhrase && (
        <div className={styles["modalOverlay"]}>
          <div className={styles["modalContent"]}>
            <p className={styles["phraseTitle"]}>
              {selectedPhrase.name.length > 225
                ? selectedPhrase.name.slice(0, 225) + "..."
                : selectedPhrase.name}
            </p>
            <p className={styles["question"]}> ¿Qué quieres hacer?</p>
            <div className={styles["btn-options"]}>
              <button onClick={handleOpenEditModal}>
                <FontAwesomeIcon icon={faPen} /> Editar
              </button>
              <button onClick={handleDeletePhrase}>
                <FontAwesomeIcon icon={faTrash} /> Eliminar
              </button>
              <button onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} /> Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal para editar tarea */}
      {showEditModal && selectedPhrase && (
        <div className={styles["modalOverlay"]}>
          <div className={styles["modalContent"]}>
            <span>Actualizar frase:</span>
            <textarea
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className={styles["textarea-name"]}
            />
            <label className={styles["label-question"]}>
              ¿Modificar la fecha de actualización?
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
              }}
            />
            <div className={styles["btn-options"]}>
              <button onClick={handleUpdatePhrase}>
                Actualizar
                <FontAwesomeIcon icon={faSave} />
              </button>
              <button onClick={handleCloseEditModal}>
                <FontAwesomeIcon icon={faTimes} />
                Cerrar
              </button>
            </div>
            {errors.errorUpdate && (
              <p className={styles["error-search"]}>{errors.errorUpdate}</p>
            )}
          </div>
        </div>
      )}

      <motion.div
        className={styles["phrases_header"]}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles["title"]}>
          <h2>Tasly</h2>
        </div>

        <div className={styles["options"]}>
          <div
            className={styles["button"]}
            onClick={() => handleNavigation("/Home")}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Ir Home
          </div>
          <div
            className={styles["button"]}
            onClick={() => handleNavigation("/tasks")}
          >
            <FontAwesomeIcon icon={faListCheck} /> Tareas
          </div>
          <div
            className={styles["button"]}
            onClick={() => handleNavigation("/goals")}
          >
            <FontAwesomeIcon icon={faBullseye} /> Metas
          </div>
        </div>
      </motion.div>

      {errors.userId && (
        <p className={styles["errorPhrases"]}>{errors.userId}</p>
      )}

      {/* Barra de búsqueda */}
      <motion.div
        className={styles["search_phrases"]}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles["content-search"]}>
          <input
            type="text"
            placeholder="Buscar frase..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </motion.div>
      <div className={styles["error-container"]}>
        {errors.general && (
          <p className={styles["error-search"]}> {errors.general}</p>
        )}
        {errors.message && (
          <p className={styles["noPhrases"]}> {errors.message}</p>
        )}
      </div>

      <div className={styles["message_phrases"]}>
        <motion.p
          key={randomMessage}
          className={styles["messageContext"]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {randomMessage}
        </motion.p>
      </div>

      {/* ir atras cuando se genera una busqueda */}
      <div
        className={`${styles["back"]} ${isSearching ? styles["visible"] : ""}`}
        onClick={handleBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} title="Ir atrás" />
      </div>

      {/* Lista de frases */}
      <motion.div
        className={styles["dashboard_phrase"]}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        {searchResults.length > 0
          ? searchResults.map((phrase) => (
              <div key={phrase.id} className={styles["phrase-item"]}>
                <div
                  className={styles["content-infoPhrase"]}
                  onMouseDown={() =>
                    handleMouseDown(
                      phrase.id,
                      phrase.phrase,
                      phrase.created_at,
                      phrase.favorite,
                      phrase.author
                    )
                  }
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={() =>
                    handleMouseDown(
                      phrase.id,
                      phrase.phrase,
                      phrase.created_at,
                      phrase.favorite,
                      phrase.author
                    )
                  }
                  onTouchEnd={handleMouseUp}
                  onTouchCancel={handleMouseUp}
                >
                  <div className={styles["phrase-name"]}>
                    <p>{phrase.phrase}</p>
                  </div>
                  <div className={styles["author"]}>
                    <p>{phrase.author}</p>
                    <input
                      type="checkbox"
                      id={`favorite-${phrase.id}`}
                      checked={phrase.favorite}
                      onChange={(e) =>
                        handleFavoriteToggle(phrase.id, e.target.checked)
                      }
                      className={styles["favorite-checkbox"]}
                    />
                    <label
                      htmlFor={`favorite-${phrase.id}`}
                      className={`${styles["heart-label"]} ${
                        phrase.favorite ? styles["favorited"] : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </label>
                  </div>
                  <div className={styles["phrase-date"]}>
                    <div className={styles["content-date"]}>
                      <p title="fecha de creación">
                        <FontAwesomeIcon
                          icon={faClock}
                          style={{ marginRight: "5px" }}
                        />
                        {formatDateWithoutTimezoneShift(phrase.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          : phrases.length > 0 &&
            phrases.map((phrase) => (
              <div key={phrase.id} className={styles["phrase-item"]}>
                <div
                  className={styles["content-infoPhrase"]}
                  onMouseDown={() =>
                    handleMouseDown(
                      phrase.id,
                      phrase.phrase,
                      phrase.created_at,
                      phrase.favorite,
                      phrase.author
                    )
                  }
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={() =>
                    handleMouseDown(
                      phrase.id,
                      phrase.phrase,
                      phrase.created_at,
                      phrase.favorite,
                      phrase.author
                    )
                  }
                  onTouchEnd={handleMouseUp}
                  onTouchCancel={handleMouseUp}
                >
                  <div className={styles["phrase-name"]}>
                    <p>{phrase.phrase}</p>
                  </div>
                  <div className={styles["author"]}>
                    <p>{phrase.author}</p>
                    <input
                      type="checkbox"
                      id={`favorite-${phrase.id}`}
                      checked={phrase.favorite}
                      onChange={(e) =>
                        handleFavoriteToggle(phrase.id, e.target.checked)
                      }
                      className={styles["favorite-checkbox"]}
                    />
                    <label
                      htmlFor={`favorite-${phrase.id}`}
                      className={`${styles["heart-label"]} ${
                        phrase.favorite ? styles["favorited"] : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </label>
                  </div>
                  <div className={styles["phrase-date"]}>
                    <div className={styles["content-date"]}>
                      <p title="fecha de creación">
                        <FontAwesomeIcon
                          icon={faClock}
                          style={{ marginRight: "5px" }}
                        />
                        {formatDateWithoutTimezoneShift(phrase.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </motion.div>
    </div>
  );
};

export default Phrases;
