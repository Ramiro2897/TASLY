import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import styles from "../styles/home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faPlus, faHeartCircleBolt, faClock, faQuestion, faPalette } from "@fortawesome/free-solid-svg-icons";
import { useHomeData } from "../hooks/useHomeData";
import ModalTask from "../components/ModalTask";
import Modalphrases from "../components/Modalphrases";
import ModalGoals from "../components/ModalGoals";
import TaskSkeleton from "../components/TaskSkeleton";
import { useModal } from "../hooks/useBodyModal";
import { useHomeContextMessages } from "../hooks/useHomeMessages";
import { getGreeting, getGreetingIcon } from "../utils/greetings";
import { useMotivation } from "../hooks/useMotivation";
import { useLogout } from "../hooks/useLogout";

type HomeProps = { theme: string; onToggleTheme: () => void; };

const Home: React.FC<HomeProps> = ({ onToggleTheme }) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Hook para redirigir al usuario

  // manejar errores del servidor
  const [errors, setErrors] = useState<{ userId?: string; general?: string }>({});

  // formulario modales
  const taskModal = useModal();
  const phraseModal = useModal();
  const goalsModal = useModal();

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
  const [timeTasks, setTimeTasks] = useState<TimeTask[]>([]);

  useHomeData({
    token,
    setIsLoading,
    setShowSkeleton,
    setTareas,
    setTaskSummary,
    setTimeTasks,
    setFrases,
    setMetas,
    setShowAlert,
    setClosing,
    setErrors,
  });

  // cerrar la sesión del usuario
  const { logout } = useLogout(token);
  if (!token) {
    return;
  }

  // Textos para los botones de agregar tareas, metas y frases
  const getAddButtonTitle = (count: number, emptyText: string, defaultText: string) => {
    return count === 0 ? emptyText : defaultText;
  };
  const getAddGoalButtonTitle = () => getAddButtonTitle(metas.length, "Crea una", "Agregar meta");

  const getAddPhraseButtonTitle = () =>
    getAddButtonTitle(frases.length, "Crea una", "Agregar frase");

  const getAddTaskButtonTitle = () => {
    const { total, completed } = taskSummary;

    if (total === 0) return "Empieza una"; // claro: “Empieza una [tarea]”
    if (completed === total && total > 0) return "¡Añadir más!";
    return "Agregar tarea";
  };

  type TimeTask = {
    id: number;
    taskName: string;
    status: "pending" | "in_progress" | "completed";
    startDateTime: string; // viene como ISO string
    endDateTime: string;
  };

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
    id: number;
    task_name: string;
    status: "pending" | "in_progress" | "completed";
    start_date?: string;
    start_time?: string;
    end_time?: string;
  }) => {
    if (!newTask?.start_date) return;

    const today = new Date().toISOString().split("T")[0];
    const taskDate = new Date(newTask.start_date).toISOString().split("T")[0];

    if (taskDate !== today) return;

    // 🔹 actualizar contadores (LO QUE YA TENÍAS)
    setTaskSummary((prev) => ({
      total: prev.total + 1,
      pending: newTask.status === "pending" ? prev.pending + 1 : prev.pending,
      inProgress: newTask.status === "in_progress" ? prev.inProgress + 1 : prev.inProgress,
      completed: newTask.status === "completed" ? prev.completed + 1 : prev.completed,
    }));

    // 🔹 actualizar tareas con horas
    if (newTask.start_time && newTask.end_time) {
      const startDateTime = `${newTask.start_date}T${newTask.start_time}`;
      const endDateTime = `${newTask.start_date}T${newTask.end_time}`;

      setTimeTasks((prev) => [
        ...prev,
        {
          id: newTask.id,
          taskName: newTask.task_name,
          status: newTask.status,
          startDateTime,
          endDateTime,
        },
      ]);
    }
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

  const currentYear = new Date().getFullYear();

  // ir entre componentes al navegar
  const handleNavigate = (path: string) => {
    if (isLoading) return;
    navigate(path);
  };

  // pasar la fecha en frases
  const formatDateWithoutTimezoneShift = (dateStr: string) => {
    const date = new Date(dateStr); // convierte ISO a hora local del usuario
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    return `${date.getDate()} ${meses[date.getMonth()]} ${date.getFullYear()}`;
  };
  // horas para notificar: buenos dias, tardes o noche
  const greeting = getGreeting();
  // icono por si es de dia, tarde o noche
  const greetingIcon = getGreetingIcon();

  //frases motivadoras para mostrarlas en tareas pendientes
  const { motivation } = useMotivation();

  const { getContextMessage } = useHomeContextMessages(taskSummary, styles);
  const normalMessage = getContextMessage();

  // Convierte "HH:MM:SS" a minutos del día
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const getUpcomingTask = (tasks: TimeTask[], lookaheadMinutes = 10): TimeTask | undefined => {
    if (!tasks.length) return undefined;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    //Filtramos solo tareas pendientes
    const pendingTasks = tasks.filter((t) => t.status === "pending");

    if (!pendingTasks.length) return undefined; 

    //Calculamos la diferencia con la hora de inicio
    const tasksWithDiff = pendingTasks.map((t) => {
      const start = timeToMinutes(t.startDateTime);
      return { task: t, diff: start - nowMinutes };
    });

    //Solo tomamos las que empiezan ahora o dentro del lookahead (ej. 10 min)
    const upcoming = tasksWithDiff
      .filter((t) => t.diff >= 0 && t.diff >= -lookaheadMinutes)
      .sort((a, b) => a.diff - b.diff); // la más próxima primero

    //Retornamos la tarea más cercana a iniciar, o undefined si no hay ninguna
    if (!upcoming.length) return undefined;

    return upcoming[0].task;
  };

  const [nextTask, setNextTask] = useState<TimeTask | undefined>(undefined);
  const [showNextTask, setShowNextTask] = useState(true); 

  useEffect(() => {
    const interval = setInterval(() => {
      const upcoming = getUpcomingTask(timeTasks);
      setNextTask(upcoming);

      setShowNextTask((prev) => !prev);
    }, 20_000);

    return () => clearInterval(interval);
  }, [timeTasks]);

  return (
    <div className={styles["container-home-all"]}>
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
                <FontAwesomeIcon icon={faPalette} color="var(--color-btn)" size="lg" />
              </div>
            </div>
            <div className={styles.header}>
              <div className={styles.welcomeTextContainer}>
                <h1 className={styles["welcome-text"]}>
                  {greeting}, <span className={styles.username}>{username}</span>{" "}
                  <span className={styles.wave}>{greetingIcon}</span>
                </h1>
                <div className={`${styles.messageContainer}`}>
                  {!isLoading && (
                    <p className={styles.contextMessage}>
                      {showNextTask && nextTask ? (
                        <>
                          En{" "}
                          <span className={styles.taskCount}>
                            {timeToMinutes(nextTask.startDateTime) -
                              (new Date().getHours() * 60 + new Date().getMinutes())}
                          </span>{" "}
                          min empieza la tarea{" "}
                          <span className={styles.taskName}>{nextTask.taskName}</span> ⏰
                        </>
                      ) : (
                        normalMessage
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.dashboard}>
              {/* 📌 SECCIÓN DE TAREAS */}
              <div className={styles.card}>
                <h3>Tareas Diarias</h3>
                <div
                  className={`${styles["list-container"]} ${showAlert ? styles["alert-red"] : ""}`}
                  onClick={() => handleNavigate("/tasks")}
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
                          <span className={styles["complete-status"]}>Completada</span>
                        ) : tareas[0].status === "in_progress" ? (
                          <span className={styles["in-progress-status"]}>En progreso</span>
                        ) : (
                          <span className={styles["incomplete-status"]}>Pendiente</span>
                        )}
                      </div>

                      {/* Mostrar la fecha incial de la tarea */}
                      <div className={styles["task-date"]}>
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: "5px" }} />
                        {(() => {
                          // Dividir YYYY-MM-DD
                          const [year, month, day] = tareas[0].start_date.split("T")[0].split("-");
                          const date = new Date(+year, +month - 1, +day); // JS interpreta como local
                          return new Intl.DateTimeFormat("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                            .format(date)
                            .replace(/ de /g, " ");
                        })()}
                      </div>
                    </div>
                  ) : (
                    <p className={styles["empty-text"]}>No hay tareas aún.</p>
                  )}
                </div>

                <button
                  className={styles["add-button"]}
                  onClick={taskModal.open}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faPlus} /> {getAddTaskButtonTitle()}
                </button>
              </div>

              {/* 🎯 SECCIÓN DE FRASES */}
              <div className={styles.card}>
                <h3>Frases o Notas</h3>
                <div
                  className={styles["list-container"]}
                  onClick={() => handleNavigate("/phrases")}
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
                          <span className={styles.author}>{frases[0].author}</span>
                          <span
                            className={`${styles["favorite-icon"]} ${
                              frases[0].favorite ? styles.favorite : styles["not-favorite"]
                            }`}
                          >
                            <FontAwesomeIcon icon={faHeartCircleBolt} />
                          </span>
                        </div>
                        <span className={styles["task-date"]}>
                          <FontAwesomeIcon icon={faClock} style={{ marginRight: "5px" }} />
                          {formatDateWithoutTimezoneShift(frases[0].created_at)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className={styles["empty-text"]}>No hay frases aún.</p>
                  )}
                </div>

                <button
                  className={styles["add-button"]}
                  onClick={phraseModal.open}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faPlus} /> {getAddPhraseButtonTitle()}
                </button>
              </div>

              {/* ✨ SECCIÓN DE METAS */}
              <div className={styles.card}>
                <h3>Metas</h3>
                <div className={styles["list-container"]} onClick={() => handleNavigate("/goals")}>
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
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: "5px" }} />
                        Termina el:{" "}
                        {metas[0].end_date
                          ? (() => {
                              const [year, month, day] = metas[0].end_date.split("T")[0].split("-");
                              const date = new Date(+year, +month - 1, +day);
                              return new Intl.DateTimeFormat("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                                .format(date)
                                .replace(/ de /g, " ");
                            })()
                          : "Fecha no disponible"}
                      </p>
                    </div>
                  ) : (
                    <p className={styles["empty-text"]}>No hay metas aún.</p>
                  )}
                </div>

                <button
                  className={styles["add-button"]}
                  onClick={goalsModal.open}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faPlus} /> {getAddGoalButtonTitle()}
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
                  onClick={() => handleNavigate("/information")}
                >
                  <FontAwesomeIcon icon={faQuestion} />
                </span>
              </p>
              <div className={styles["btn-buttons"]}>
                <button
                  onClick={logout}
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
          isOpen={taskModal.isOpen}
          onClose={taskModal.close}
          onSubmit={() => {}}
          onTaskAdded={handleTaskAdded}
          onTasksLengthUpdated={handleTasksLengthUpdated}
        />

        <Modalphrases
          isOpen={phraseModal.isOpen}
          onClose={phraseModal.close}
          onSubmit={() => {}}
          onPhrasesAdded={handlePhrasesAdded}
        />

        <ModalGoals
          isOpen={goalsModal.isOpen}
          onClose={goalsModal.close}
          onSubmit={() => {}}
          onGoalsAdded={handleGoalsAdded}
        />
      </div>
    </div>
  );
};

export default Home;
