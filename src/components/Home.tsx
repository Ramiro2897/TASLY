import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import styles from "../styles/home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faPlus,
  faHeartCircleBolt,
  faClock,
  faQuestion,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";
import ModalTask from "../components/ModalTask";
import Modalphrases from "../components/Modalphrases";
import ModalGoals from "../components/ModalGoals";
import TaskSkeleton from "../components/TaskSkeleton";

type HomeProps = {
  theme: string;
  onToggleTheme: () => void;
};

const Home: React.FC<HomeProps> = ({ onToggleTheme }) => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate(); // Hook para redirigir al usuario

  // manejar errores del servidor
  const [errors, setErrors] = useState<{ userId?: string; general?: string }>(
    {},
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhraseModalOpen, setIsPhraseModalOpen] = useState(false);
  const [isModalGoalsOpen, setIsModalGoalsOpen] = useState(false);

  // abrir y cerrar modales
  const openModal = () => {
    document.body.style.overflow = "hidden";
    setIsModalOpen(true);
  };

  const closeModal = () => {
    document.body.style.overflow = "";
    setIsModalOpen(false);
  };

  const openPhraseModal = () => {
    document.body.style.overflow = "hidden";
    setIsPhraseModalOpen(true);
  };

  const closePhraseModal = () => {
    document.body.style.overflow = "";
    setIsPhraseModalOpen(false);
  };

  const openGoalsModal = () => {
    document.body.style.overflow = "hidden";
    setIsModalGoalsOpen(true);
  };

  const closeGoalsModal = () => {
    document.body.style.overflow = "";
    setIsModalGoalsOpen(false);
  };
  // -------------.......-----------

  // Estados para almacenar datos
  const [tareas, setTareas] = useState<
    {
      id: number;
      task_name: string;
      status: string;
      created_at: string;
      start_date: string;
    }[]
  >([]);
  const [metas, setMetas] = useState<
    {
      id: number;
      goal: string;
      description: string;
      start_date: string;
      end_date: string;
      unit: string;
    }[]
  >([]);
  const [frases, setFrases] = useState<
    {
      id: number;
      phrase: string;
      author: string;
      created_at: string;
      favorite: boolean;
    }[]
  >([]);
  // estado para skeleton
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  // obtenemos el momento del dia para saber en que momento cambiar el esta de: taskNotified para que pueda notificar
  const [showAlert, setShowAlert] = useState(false);
  const [closing, setClosing] = useState(false);

  // longitud de tareas
  const [taskSummary, setTaskSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  console.log(taskSummary, "todo lo total, pendiente etc");

  // Manejamos la notificación en otro useEffect independiente
  useEffect(() => {
    const currentDate = new Date();
    const hours = currentDate.getHours();
    let currentPeriod = "";

    if (hours >= 0 && hours < 8) {
      currentPeriod = "morning";
    } else if (hours >= 8 && hours < 18) {
      currentPeriod = "afternoon";
    } else {
      currentPeriod = "night";
    }

    const lastNotifiedPeriod = localStorage.getItem("lastNotifiedPeriod");

    if (lastNotifiedPeriod !== currentPeriod) {
      localStorage.setItem("taskNotified", "true");
      localStorage.setItem("lastNotifiedPeriod", currentPeriod);
    }
  }, []);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    let skeletonTimer: ReturnType<typeof setTimeout>;

    const fetchData = async () => {
      setIsLoading(true); // 👈 empezamos cargando

      skeletonTimer = setTimeout(() => {
        setShowSkeleton(true);
      }, 250);

      try {
        const [tareasRes, tareasLengthRes, frasesRes, metasRes] =
          await Promise.all([
            axios.get(`${API_URL}/api/auth/tasklist`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/api/auth/tasklistAll`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/api/auth/phraseslist`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/api/auth/goallist`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setTareas(tareasRes.data);
        setTaskSummary({
          total: tareasLengthRes.data?.total ?? 0,
          pending: tareasLengthRes.data?.pending ?? 0,
          inProgress: tareasLengthRes.data?.inProgress ?? 0,
          completed: tareasLengthRes.data?.completed ?? 0,
        });
        setFrases(frasesRes.data);
        setMetas(metasRes.data);

        // Manejo de notificación si tiene tareas pendientes
        const taskNotified = localStorage.getItem("taskNotified") === "true";

        if (
          (tareasLengthRes.data?.pending > 0 ||
            tareasLengthRes.data?.inProgress > 0) &&
          taskNotified
        ) {
          setShowAlert(true);
          localStorage.setItem("taskNotified", "false");

          setTimeout(() => {
            setClosing(true); // activa animación de salida

            setTimeout(() => {
              setShowAlert(false); // desmonta después de la animación
              setClosing(false);
            }, 500); // duración de la animación
          }, 30000);
        } else {
          setShowAlert(false); // Aseguramos que la alerta se oculte si no se cumple la condición
        }
      } catch (error: any) {
        setErrors(
          error.response?.data.errors || {
            general: "Error inesperado. Comunícalo al programador.",
          },
        );
      } finally {
        clearTimeout(skeletonTimer);
        setShowSkeleton(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Función para actualizar la tarea en tiempo real
  const handleTaskAdded = (newTask: {
    message: string;
    task: {
      id: number;
      task_name: string;
      status: string;
      created_at: string;
      start_date: string;
    };
  }) => {
    // Extraemos la tarea correctamente
    const task = newTask.task;
    setTareas(() => {
      return [task]; // Actualizamos el estado con la nueva tarea
    });
  };

  // actualiza el numero de tareas pendientes de usuario
  const handleTasksLengthUpdated = (newTask: {
    status: string;
    start_date?: string;
  }) => {
    if (!newTask?.start_date) return;

    const today = new Date().toISOString().split("T")[0];
    const taskDate = new Date(newTask.start_date).toISOString().split("T")[0];

    if (taskDate !== today) return;

    setTaskSummary((prev) => ({
      total: prev.total + 1,
      pending: newTask.status === "completed" ? prev.pending : prev.pending + 1,
      inProgress:
        newTask.status === "in_progress"
          ? prev.inProgress + 1
          : prev.inProgress,
      completed:
        newTask.status === "completed" ? prev.completed + 1 : prev.completed,
    }));
  };

  // funcion para actualizar la frase en tiempo real
  const handlePhrasesAdded = (newPhrases: {
    message: string;
    phrase: {
      id: number;
      phrase: string;
      author: string;
      user_id: number;
      created_at: string;
      favorite: boolean;
    };
  }) => {
    // Extraemos la frase correctamente
    const phrase = newPhrases.phrase;
    setFrases([phrase]); // Actualizamos el estado con solo la nueva frase
  };

  // Función para actualizar la meta en tiempo real
  const handleGoalsAdded = (newGoal: {
    message: string;
    goal: {
      id: number;
      goal: string;
      description: string;
      start_date: string;
      end_date: string;
      unit: string;
    };
  }) => {
    // Extraemos la meta correctamente
    const goal = newGoal.goal;
    setMetas([goal]); // Actualizamos el estado con solo la nueva meta
  };

  // validacion del Home, si no tiene token lo mandamos al login
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No tienes token para iniciar sesion");
        return;
      }
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Eliminar los datos del localStorage al cerrar sesión
      localStorage.clear();
      // Redirigir al login
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const currentYear = new Date().getFullYear();

  // funcion para llevar al componente task
  const handleNavigate = () => {
    if (isLoading) return;
    navigate("/tasks"); // Redirige a "/tasks"
  };

  // funcion que lleva a el modulo de información
  const handleGoInformation = () => {
    if (isLoading) return;
    navigate("/information"); // Navega a la página Home
  };

  // funcion para llevar a frases
  const handleGoPhrases = () => {
    if (isLoading) return;
    navigate("/phrases");
  };

  // funcion para llevar a las metas
  const handleGoGoals = () => {
    if (isLoading) return;
    navigate("/goals");
  };

  // horas para notificar: buenos dias, tardes o noche
  const getDayMoment = () => {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 6) return "sleep";

    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "night";
  };

  const getGreeting = () => {
    const moment = getDayMoment();

    if (moment === "morning") return "Buenos días";
    if (moment === "afternoon") return "Buenas tardes";
    return "Buenas noches";
  };

  // icono por si es de dia, tarde o noche
  const getGreetingIcon = () => {
    const moment = getDayMoment();

    if (moment === "morning") return "☀️";
    if (moment === "afternoon") return "🌤️";
    return "🌚";
  };

  // llamados de una api para traer frases motivadoras y mostrarlas en tareas pendientes
  const [motivation, setMotivation] = useState("");
  const pendingTaskMessages = [
    "Empieza por la tarea más fácil 💡",
    "Haz solo una. El resto vendrá solo ⚡",
    "Una tarea ahora vale más que motivación después 🔥",
    "No rompas la cadena hoy 💪",
    "Pequeños pasos, grandes resultados 🌱",
    "Completar una cambia el resto del día 🚀",
    "Hazla aunque no tengas ganas",
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * pendingTaskMessages.length);

    setMotivation(pendingTaskMessages[randomIndex]);
  }, []);

  const getContextMessage = () => {
    const { total, pending, inProgress, completed } = taskSummary;
    const moment = getDayMoment();

    // 🌙 Sleep time
    if (moment === "sleep") {
      return "Ya es tarde. Descansa un poco 🌙";
    }

    // 🌅 MAÑANA
    if (moment === "morning") {
      if (total === 0) {
        return <>Empieza el día creando una tarea o una meta.</>;
      }

      // Caso: hay pendientes y en progreso
      if (pending > 0 && inProgress > 0) {
        return (
          <>
            Tienes <span className={styles.taskCount}>{pending}</span> tarea(s)
            pendiente(s) y{" "}
            <span className={styles.taskCount}>{inProgress}</span> en progreso.
            ¡Puedes empezar la pendiente o continuar lo que has iniciado! 💪
          </>
        );
      }

      // Caso: solo pendientes
      if (pending > 0) {
        return pending === 1 ? (
          <>
            Tienes <span className={styles.taskCount}>{pending}</span> tarea
            pendiente. ¡Vamos a empezarla! 💪
          </>
        ) : (
          <>
            Tienes <span className={styles.taskCount}>{pending}</span> tareas
            pendientes. ¡Escoge una y arranca con fuerza! 🚀
          </>
        );
      }

      // Caso: solo en progreso
      if (inProgress > 0) {
        return inProgress === 1 ? (
          <>Continúa con la tarea que ya empezaste. 💪</>
        ) : (
          <>
            Continúa con las{" "}
            <span className={styles.taskCount}>{inProgress}</span> tareas que ya
            empezaste. 💪
          </>
        );
      }

      // Caso: todas completadas
      if (completed === total) {
        return <>Buen inicio de día, ya completaste todo 🙌</>;
      }

      // Caso por defecto
      return <>Elige una tarea importante y empieza con calma.</>;
    }

    // 🌇 TARDE
    if (moment === "afternoon") {
      if (total === 0) {
        return "Aún no has creado tareas hoy. Si quieres, puedes empezar ahora.";
      }

      // Primero revisamos si hay tareas pendientes (no iniciadas)
      if (pending > 0) {
        return pending === 1 ? (
          <>
            Tienes <span className={styles.taskCount}>{pending}</span> tarea
            pendiente. ¡Vamos a empezarla! 💪
          </>
        ) : (
          <>
            Tienes <span className={styles.taskCount}>{pending}</span> tareas
            pendientes. ¡Escoge una y arranca con fuerza! 🚀
          </>
        );
      }

      // Si no hay pendientes, vemos si hay tareas en progreso
      if (inProgress > 0) {
        return (
          <>
            Tienes <span className={styles.taskCount}>{inProgress}</span>{" "}
            tarea(s) en proceso. Sigue así 💪
          </>
        );
      }

      // Si no hay pendientes ni en progreso, todas están completas
      return "Buen trabajo hoy, ya completaste todas tus tareas 👏";
    }

    // 🌙 NOCHE
    if (total === 0) {
      return "Hoy fue un día tranquilo. Mañana puedes empezar de nuevo.";
    }

    if (pending > 0 || inProgress > 0) {
      return completed > 0 ? (
        <>
          Completaste <span className={styles.taskCount}>{completed}</span> de{" "}
          <span className={styles.taskCount}>{total}</span> tareas 💪
        </>
      ) : inProgress > 0 ? (
        <>Tienes tareas en progreso. ¡Sigue trabajando! 🔄</>
      ) : (
        <>Hoy no se dio, y está bien. Mañana continúas 🌘</>
      );
    }

    return "Excelente trabajo hoy. Tómate un momento para reconocerlo 🌙";
  };

  return (
    <div className={styles["home-container"]}>
      {/* mostrar que tiene tareas pendientes */}
      {showAlert && (
        <div
          className={`${styles["card-notification"]} ${
            closing ? styles["slide-up"] : styles["slide-down"]
          }`}
        >
          <div className={styles.icon}>🫠</div>
          <div className={styles["modal-content-notification"]}>
            <p className={styles["message-text"]}>Tareas pendientes</p>
            <p className={styles["sub-text"]}>{motivation}</p>
          </div>
        </div>
      )}

      {/* mostrar error aqui */}
      <div className={styles.errors}>
        {errors.userId && <p className={styles.error}>{errors.userId}</p>}
        {errors.general && <p className={styles.error}>{errors.general}</p>}
      </div>

      {username ? (
        <>
          <div className={styles["theme"]}>
            <div title="Cambiar tema" onClick={onToggleTheme}>
              <FontAwesomeIcon
                icon={faPalette}
                color="var(--color-btn)"
                size="lg"
              />
            </div>
          </div>
          <div className={styles.header}>
            <div className={styles.welcomeTextContainer}>
              <h1 className={styles["welcome-text"]}>
                {getGreeting()},{" "}
                <span className={styles.username}>{username}</span>{" "}
                <span className={styles.wave}>{getGreetingIcon()}</span>
              </h1>
              <div className={`${styles.messageContainer}`}>
                {!isLoading && (
                  <p className={styles.contextMessage}>{getContextMessage()}</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.dashboard}>
            {/* 📌 SECCIÓN DE TAREAS */}
            <div className={styles.card}>
              <h3>Tareas Diarias</h3>
              <div
                className={`${styles["list-container"]} ${
                  showAlert ? styles["alert-red"] : ""
                }`}
                onClick={handleNavigate}
              >
                {showSkeleton ? (
                  <TaskSkeleton />
                ) : tareas.length > 0 ? (
                  <div className={styles["task-text"]} title="Ver contenido">
                    {/* Mostrar task_name */}
                    <div className={styles["title-name"]}>
                      {tareas[0].task_name && tareas[0].task_name.length > 25
                        ? `${tareas[0].task_name.substring(0, 25)}...`
                        : tareas[0].task_name}
                    </div>

                    {/* Mostrar si la tarea está completa o en progreso */}
                    <div className={styles["task-status"]}>
                      {tareas[0].status === "completed" ? (
                        <span className={styles["complete-status"]}>
                          Completada
                        </span>
                      ) : tareas[0].status === "in_progress" ? (
                        <span className={styles["in-progress-status"]}>
                          En progreso
                        </span>
                      ) : (
                        <span className={styles["incomplete-status"]}>
                          Pendiente
                        </span>
                      )}
                    </div>

                    {/* Mostrar la fecha de creación de la tarea */}
                    <div className={styles["task-date"]}>
                      <FontAwesomeIcon
                        icon={faClock}
                        style={{ marginRight: "5px" }}
                      />
                      {new Intl.DateTimeFormat("es-ES", {
                        timeZone: "America/Bogota",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                        .format(new Date(tareas[0].start_date))
                        .replace(/ de /g, " ")}
                    </div>
                  </div>
                ) : (
                  <p className={styles["empty-text"]}>No hay tareas aún.</p>
                )}
              </div>

              <button
                className={styles["add-button"]}
                onClick={() => openModal()}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPlus} /> Agregar Tarea
              </button>
            </div>

            {/* 🎯 SECCIÓN DE FRASES */}
            <div className={styles.card}>
              <h3>Frases o Notas</h3>
              <div
                className={styles["list-container"]}
                onClick={handleGoPhrases}
              >
                {showSkeleton ? (
                  <TaskSkeleton />
                ) : frases.length > 0 ? (
                  <div className={styles["task-text"]}>
                    <div className={styles["title-name"]}>
                      {frases[0].phrase && frases[0].phrase.length > 25
                        ? `${frases[0].phrase.substring(0, 25)}...`
                        : frases[0].phrase}
                    </div>
                    <div className={styles["author-info"]}>
                      <div className={styles["content-author"]}>
                        <span className={styles.author}>
                          {frases[0].author}
                        </span>
                        <span
                          className={`${styles["favorite-icon"]} ${
                            frases[0].favorite
                              ? styles.favorite
                              : styles["not-favorite"]
                          }`}
                        >
                          <FontAwesomeIcon icon={faHeartCircleBolt} />
                        </span>
                      </div>
                      <span className={styles["task-date"]}>
                        <FontAwesomeIcon
                          icon={faClock}
                          style={{ marginRight: "5px" }}
                        />
                        {new Intl.DateTimeFormat("es-ES", {
                          timeZone: "America/Bogota",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                          .format(new Date(frases[0].created_at))
                          .replace(/ de /g, " ")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className={styles["empty-text"]}>No hay frases aún.</p>
                )}
              </div>

              <button
                className={styles["add-button"]}
                onClick={openPhraseModal}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPlus} /> Agregar Frase
              </button>
            </div>

            {/* ✨ SECCIÓN DE METAS */}
            <div className={styles.card}>
              <h3>Metas</h3>
              <div className={styles["list-container"]} onClick={handleGoGoals}>
                {showSkeleton ? (
                  <TaskSkeleton />
                ) : metas.length > 0 ? (
                  <div className={styles["task-text"]}>
                    <div className={styles["title-name"]}>
                      <p className={styles.goals}>
                        {metas[0].goal && metas[0].goal.length > 25
                          ? `${metas[0].goal.substring(0, 25)}...`
                          : metas[0].goal}
                      </p>
                    </div>
                    <p className={styles["goals-unit"]}> {metas[0].unit}</p>
                    <p className={styles["task-date"]}>
                      <FontAwesomeIcon
                        icon={faClock}
                        style={{ marginRight: "5px" }}
                      />
                      Termina el:{" "}
                      {metas[0].start_date
                        ? new Intl.DateTimeFormat("es-ES", {
                            timeZone: "America/Bogota",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                            .format(new Date(metas[0].end_date))
                            .replace(/ de /g, " ")
                        : "Fecha no disponible"}
                    </p>
                  </div>
                ) : (
                  <p className={styles["empty-text"]}>No hay metas aún.</p>
                )}
              </div>

              <button
                className={styles["add-button"]}
                onClick={openGoalsModal}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPlus} /> Agregar Meta
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className={styles["footer"]}>
            <p>
              © TASLY - Created by Ramiro {currentYear}{" "}
              <span
                className={styles["span"]}
                title="información"
                onClick={handleGoInformation}
              >
                <FontAwesomeIcon icon={faQuestion} />
              </span>
            </p>
            <div className={styles["btn-buttons"]}>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={styles["logout-button"]}
                title="Cerrar sesión"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          </footer>
        </>
      ) : (
        "Cargando..."
      )}

      {/* modales donde se maneja el actualizar tarea, el cerrar modal, desde ModalTask a Home */}
      <ModalTask
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={() => {}}
        onTaskAdded={handleTaskAdded}
        onTasksLengthUpdated={handleTasksLengthUpdated}
      />

      <Modalphrases
        isOpen={isPhraseModalOpen}
        onClose={closePhraseModal}
        onSubmit={() => {}}
        onPhrasesAdded={handlePhrasesAdded}
      />

      <ModalGoals
        isOpen={isModalGoalsOpen}
        onClose={closeGoalsModal}
        onSubmit={() => {}}
        onGoalsAdded={handleGoalsAdded}
      />
    </div>
  );
};

export default Home;
