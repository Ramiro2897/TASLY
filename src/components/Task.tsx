import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/task.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowLeft,
  faQuoteLeft,
  faBullseye,
  faClock,
  faPen,
  faTrash,
  faTimes,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";

const Task = () => {
  const [tasks, setTasks] = useState<
    {
      id: number;
      task_name: string;
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      category: string;
      priority: string;
      complete: boolean;
      status: string;
      created_at: string;
      updated_at: string;
      user_id: number;
    }[]
  >([]);
  const [errors, setErrors] = useState<{
    userId?: string;
    general?: string;
    message?: string;
    errorUpdate?: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      id: number;
      task_name: string;
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      category: string;
      priority: string;
      complete: boolean;
      status: string;
      created_at: string;
      updated_at: string;
      user_id: number;
    }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    id: number;
    name: string;
    date: string;
    priority: string;
    start_time?: string;
    end_time?: string;
    status?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [priority, setPriority] = useState(selectedTask?.priority || "low"); // low por defecto si es null o undefined
  const [showStartDate, setShowStartDate] = useState(true);
  const [showEndDate, setShowEndDate] = useState(true);

  // console.log(tasks, "tareas con horas");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1️⃣ Asignar fecha y prioridad si selectedTask cambia
    if (selectedTask) {
      if (selectedTask.date) {
        setNewDate(selectedTask.date.split("T")[0]); // Establece la fecha si está disponible
      }

      if (selectedTask.start_time && selectedTask.end_time) {
        setNewStartTime(selectedTask.start_time);
        setNewEndTime(selectedTask.end_time);
      } else {
        // 🔥 limpiar si la tarea no tiene horas
        setNewStartTime("");
        setNewEndTime("");
      }

      if (selectedTask.priority) {
        const priorityInSpanish =
          selectedTask.priority === "high"
            ? "alta"
            : selectedTask.priority === "medium"
              ? "media"
              : "baja";
        setPriority(priorityInSpanish);
      }
    }

    // 2️⃣ Obtener las tareas del usuario
    const loadTasks = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/auth/loadTasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.length === 0) {
          setErrors({ message: "Parece que tu lista está vacía" });
        } else {
          setErrors({ general: undefined });
        }
        setTasks(response.data);
      } catch (error: any) {
        setErrors(
          error.response?.data.errors || {
            general: "Error inesperado. Comunícalo al programador.",
          },
        );
      }
    };

    loadTasks();
  }, [selectedTask]); // Se ejecuta cada vez que cambia `selectedTask`

  // tareas eb automatico
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const interval = setInterval(() => {
      const nowUser = getUserNow(timeZone); // Hora actual del usuario, TZ correcta
      // console.log("⏰ Hora actual del usuario:", nowUser.toISOString());

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          // Solo tareas pendientes con rango horario
          if (task.status !== "pending" || !task.start_time || !task.end_time) {
            return task;
          }

          // Parseamos la fecha de inicio de la tarea directamente
          const [year, month, day] = task.start_date
            .split("T")[0]
            .split("-")
            .map(Number);
          const [startHour, startMinute] = task.start_time
            .split(":")
            .map(Number);
          const [endHour, endMinute] = task.end_time.split(":").map(Number);

          const taskStart = new Date(
            year,
            month - 1,
            day,
            startHour,
            startMinute,
            0,
          );
          const taskEnd = new Date(year, month - 1, day, endHour, endMinute, 0);

          // console.log("Rango calculado:", {
          //   taskId: task.id,
          //   taskStart: taskStart.toISOString(),
          //   taskEnd: taskEnd.toISOString(),
          //   now: nowUser.toISOString(),
          // });

          // SOLO si ahora está dentro del rango → auto iniciar (una sola vez)
          if (
            task.status === "pending" &&
            nowUser.getTime() >= taskStart.getTime() &&
            nowUser.getTime() <= taskEnd.getTime()
          ) {
            const API_URL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem("token");
            // console.log("⏰ Auto-start detectado para tarea:", task.id);

            axios
              .put(
                `${API_URL}/api/auth/auto-start`,
                { taskId: task.id },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              )
              .then((res) => {
                const updatedTask = res.data.task;

                // Actualizamos SOLO esa tarea en ambas vistas
                setTasks((current) =>
                  current.map((t) =>
                    t.id === updatedTask.id ? updatedTask : t,
                  ),
                );

                setSearchResults((current) =>
                  current.map((t) =>
                    t.id === updatedTask.id ? updatedTask : t,
                  ),
                );
              })
              .catch((err) => {
                console.error("Error al auto-iniciar tarea:", task.id, err);
              });

            return task;
          }

          return task;
        }),
      );
    }, 50_000); // Intervalo de prueba: 50 seg

    return () => clearInterval(interval);
  }, []);

  // funcion para hacer la busqueda de tareas
  const handleSearch = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      setErrors({});

      const response = await axios.get(`${API_URL}/api/auth/searchTasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          query: searchTerm,
        },
      });

      setSearchResults(response.data); // Actualiza las tareas con los resultados de la búsqueda
      setIsSearching(response.data.length > 0); // si la busqueda es 0 o no hay no se muestra el boton
    } catch (error: any) {
      setSearchResults([]);
      setIsSearching(false); // no aparece el boton de ir atras cuando se hace una busqueda en caso de error...
      setErrors(
        error.response?.data?.errors || { general: "Error en la búsqueda." },
      );
      setTimeout(() => {
        setErrors(() => {
          // Si aún no hay frases, volvemos a mostrar el mensaje predeterminado
          if (tasks.length === 0 && searchResults.length === 0) {
            return { message: "Parece que tu lista está vacía." };
          }
          return {}; // Si hay frases, no mostramos ningún mensaje
        });
      }, 5000);
    }
  };

  // objeto que recibe las prioridades para convertirlas al español
  const priorityMap: Record<string, { label: string; className: string }> = {
    high: { label: "Urgente", className: styles.highPriority },
    medium: { label: "Importante", className: styles.mediumPriority },
    low: { label: "Leve", className: styles.lowPriority },
  };

  // Función para obtener los valores de la prioridad
  const getPriorityData = (priority: string) => {
    // Verificamos que el valor de priority sea uno de los válidos
    const validPriority =
      priority === "high" || priority === "medium" || priority === "low"
        ? priority
        : "low";
    return priorityMap[validPriority];
  };

  // funcion para nevegar entre componentes
  const navigate = useNavigate();
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Datos globales del usuario para realizar acciones
  const token = localStorage.getItem("token");

  // funcion para actualizar las tareas a completa o viceversa
  const handleCheckboxChange = async (
    taskId: number,
    currentStatus: string,
  ) => {
    // 🔊 notificación de audio INMEDIATA
    if (currentStatus !== "completed") {
      const audio = new Audio("/complete.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }

    // 🔹 Si ya está completa, no hacemos la llamada a la API
    if (currentStatus === "completed") {
      return; // Detenemos la función aquí
    }

    const getNextStatus = (status: string) => {
      if (status === "pending") return "in_progress";
      if (status === "in_progress") return "completed";
      return "completed";
    };
    const nextStatus = getNextStatus(currentStatus);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.put(
        `${API_URL}/api/auth/updateTask`,
        { status: nextStatus }, // Enviamos el nuevo estado de "complete"
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Task-Id": taskId,
            Status: nextStatus,
          },
        },
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: nextStatus } : task,
        ),
      );

      setSearchResults((prevResults) =>
        prevResults.map((task) =>
          task.id === taskId ? { ...task, status: nextStatus } : task,
        ),
      );
    } catch (error: any) {
      setErrors(
        error.response?.data?.errors || { general: "Error en la búsqueda." },
      );
      setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, general: "" }));
      }, 5000);
    }
  };

  // funciona para eliminar una tarea
  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      await axios.delete(`${API_URL}/api/auth/deleteTask`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Task-Id": selectedTask.id.toString(),
        },
      });

      // 🔹 Filtrar tareas actualizadas
      const updatedTasks = tasks.filter((task) => task.id !== selectedTask.id);
      const updatedSearchResults = searchResults.filter(
        (task) => task.id !== selectedTask.id,
      );

      // 🔹 Actualizar el estado con los nuevos valores
      if (updatedSearchResults.length === 0) {
        setIsSearching(false); // Oculta el botón
      }

      // mostrar mensaje cuando se eliminen tareas y no haya que mostrar
      if (updatedTasks.length === 0) {
        setErrors({ message: "Parece que tu lista está vacía" });
      } else {
        setErrors({ message: "" });
      }

      setTasks(updatedTasks);
      setSearchResults(updatedSearchResults);

      handleCloseModal();
    } catch (error: any) {
      setErrors(
        error.response?.data?.errors || {
          general: "Error al eliminar la tarea.",
        },
      );
      setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, general: "" }));
      }, 5000);
    }
  };

  // convierte la prioridad a ingles como lo espera el servidor
  const convertPriorityToEnglish = (priority: string) => {
    switch (priority) {
      case "alta":
        return "high";
      case "media":
        return "medium";
      case "baja":
        return "low";
      default:
        return "low"; // Valor por defecto
    }
  };

  // funcion para actualizar tarea
  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    const updatedPriority = convertPriorityToEnglish(priority);
    const localDate = new Date(`${newDate}T00:00:00-05:00`).toISOString();
    // console.log('fecha final', localDate);

    // 🔊 notificación de audio inmediata
    const playSound = () => {
      const audio = new Audio("/OpenClose.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    };
    playSound();

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      // 🔹 Llamada al backend
      const response = await axios.put(
        `${API_URL}/api/auth/taskUpdate`,
        {
          taskId: selectedTask.id,
          updatedDate: localDate,
          updatedStartTime: newStartTime || null,
          updatedEndTime: newEndTime || null,
          updatedPriority,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 🔹 Obtenemos los valores reales que devolvió el backend
      const updatedTask = response.data.task;

      // 🔹 Actualizamos el estado principal de tareas
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
      );

      // 🔹 Actualizamos los resultados de búsqueda
      const updatedSearchResults = searchResults.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
      );

      // 🔹 Aplicamos los estados actualizados
      setTasks(updatedTasks);
      setSearchResults(updatedSearchResults);

      handleCloseEditModal(); // 🔹 Cerrar modal
    } catch (error: any) {
      setErrors(
        error.response?.data?.errors || {
          general: "Error al actualizar la tarea.",
        },
      );
      setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, general: "" }));
      }, 5000);
    }
  };

  // contenido para activar el modal al dejar presioanda la pantalla para editar y eliminar
  let pressTimer: ReturnType<typeof setTimeout> | null = null;

  const handleMouseDown = (
    taskId: number,
    taskName: string,
    endDate: string,
    priority: string,
    startTime?: string,
    endTime?: string,
    status?: string,
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
      setSelectedTask({
        id: taskId,
        name: taskName,
        date: endDate,
        start_time: startTime,
        end_time: endTime,
        priority: priority,
        status: status,
      });
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    }, 600);
  };

  const handleCloseModal = () => {
    const modal = document.querySelector(`.${styles.modalContent}`);
    if (!modal) return;

    modal.classList.add(styles.modalContentClosing);
    modal.addEventListener(
      "animationend",
      () => {
        setShowModal(false);
        document.body.style.overflow = "auto";
        document.body.style.pointerEvents = "auto";
      },
      { once: true },
    );
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  // funcion para ocultar el botón "Ir atrás" cuando se va a lista de tareas por defecto del usuario
  const handleBack = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  // funcion abrir el modal de actualizar
  const handleOpenEditModal = () => {
    setShowEditModal(true);
    setShowModal(false);
  };
  // funcion para cerrar el modal de actualizar
  const handleCloseEditModal = () => {
    setNewStartTime("");
    setNewEndTime("");
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
      { once: true },
    );
  };

  // 🔹 Función para obtener la fecha de hoy según la zona horaria del usuario
  const getUserNow = (timeZone: string) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now).reduce(
      (acc, part) => {
        if (part.type !== "literal") acc[part.type] = part.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return new Date(
      `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`,
    );
  };

  // function getTaskDateInUserTZ(taskDateUTC: string, timeZone: string) {
  //   const date = new Date(taskDateUTC);
  //   const formatter = new Intl.DateTimeFormat("en-US", {
  //     timeZone,
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //   });
  //   const parts = formatter.formatToParts(date).reduce(
  //     (acc, part) => {
  //       if (part.type !== "literal") acc[part.type] = part.value;
  //       return acc;
  //     },
  //     {} as Record<string, string>,
  //   );

  //   return `${parts.year}-${parts.month}-${parts.day}`;
  // }

  // funcion para validar si la tarea esta vencida y sin completar
  const isTaskExpired = (
    endDate: string,
    endTime: string | null,
    status: string,
    timeZone: string,
  ): boolean => {
    if (status === "completed") return false;
    // console.log(
    //   endDate,
    //   endTime,
    //   status,
    //   timeZone,
    //   "formatos de fechas y horas",
    // );

    // Hora actual del usuario
    const nowUser = getUserNow(timeZone);
    // console.log("Hora actual del usuario en servidor:", nowUser);

    if (!endTime) {
      const [y, m, d] = endDate.split("T")[0].split("-").map(Number);
      const taskEndDate = new Date(y, m - 1, d, 23, 59, 59); // fin del día en TZ local
      // console.log(taskEndDate, " ", "fecha final tarea");
      // (console.log(taskEndDate.getTime() < nowUser.getTime()),
      //   "esta vencida? ");
      return taskEndDate.getTime() < nowUser.getTime();
    }

    // Si hay hora, comparar fecha y hora completa
    const [y, m, d] = endDate.split("T")[0].split("-").map(Number);
    const [hour, minute] = endTime.split(":").map(Number);
    const taskEndDateTime = new Date(y, m - 1, d, hour, minute, 0);
    // console.log(taskEndDateTime, "valorrrr para horas");
    // console.log("es falso?", taskEndDateTime.getTime() < nowUser.getTime());
    return taskEndDateTime.getTime() < nowUser.getTime();
  };

  // 🔹 Ordenar las tareas según estado y vencimiento
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const nowUser = getUserNow(userTimeZone); // usa la función que respeta TZ
  // const todayStr = getTaskDateInUserTZ(nowUser.toISOString(), userTimeZone);

  const orderedTasks = [...tasks].sort((a, b) => {
    const isExpiredA = isTaskExpired(
      a.end_date,
      a.end_time,
      a.status,
      userTimeZone,
    );
    const isExpiredB = isTaskExpired(
      b.end_date,
      b.end_time,
      b.status,
      userTimeZone,
    );

    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    const todayTime = new Date(nowUser).getTime();

    // 🔹 1. Orden por sección
    const getSectionOrder = (task: any, expired: boolean, date: number) => {
      if (expired) return 3; // Tareas vencidas
      if (date > todayTime) return 2; // Tareas futuras
      if (task.status === "in_progress") return 1; // En progreso
      if (task.status === "pending") return 0; // Tareas de hoy
      if (task.status === "completed") return 4; // Completadas
      return 5;
    };

    const sectionOrderA = getSectionOrder(a, isExpiredA, dateA);
    const sectionOrderB = getSectionOrder(b, isExpiredB, dateB);

    if (sectionOrderA !== sectionOrderB) {
      return sectionOrderA - sectionOrderB;
    }

    // 🔹 2. Si están en la misma sección, ordenar por fecha
    return dateA - dateB;
  });

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

  // Formatea hora en HH:mm a hh:mm AM/PM
  const formatHour = (hourStr: string | null) => {
    if (!hourStr) return "--:--";

    // Separar horas y minutos
    const [hour, minute] = hourStr.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) return "--:--";

    // Calcular AM/PM
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  // 🔄 Toggle cada 10s
  useEffect(() => {
    const startInterval = setInterval(
      () => setShowStartDate((prev) => !prev),
      10000,
    );
    const endInterval = setInterval(
      () => setShowEndDate((prev) => !prev),
      10000,
    );
    return () => {
      clearInterval(startInterval);
      clearInterval(endInterval);
    };
  }, []);

  let lastSection: string | null = null;

  return (
    <div className={styles["task-container-all"]}>
      <div className={styles["task-container"]}>
        {" "}
        {/* Usar estilos del módulo */}
        {/* 🔹 Modal para eliminar o actualizar tarea*/}
        {showModal && selectedTask && (
          <div className={styles["modalOverlay"]}>
            <div className={styles["modalContent"]}>
              <p className={styles["taskTitle"]}>{selectedTask.name}</p>
              <p className={styles["question"]}> ¿Qué quieres hacer?</p>
              <div className={styles["btn-options"]}>
                <button onClick={handleOpenEditModal}>
                  <FontAwesomeIcon icon={faPen} /> Editar
                </button>
                <button onClick={handleDeleteTask}>
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
        {showEditModal && selectedTask && (
          <div className={styles["modalOverlay"]}>
            <div className={styles["modalContent"]}>
              <p className={styles["taskTitle"]}>{selectedTask.name}</p>
              <label>Fecha final:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                }}
                disabled={selectedTask?.status === "completed"}
              />
              {selectedTask &&
                selectedTask.start_time !== null &&
                selectedTask.end_time !== null && (
                  <>
                    <label>Hora de inicio:</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      disabled={
                        selectedTask?.status === "in_progress" ||
                        selectedTask?.status === "completed"
                      }
                    />

                    <label>Hora final:</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      disabled={selectedTask?.status === "completed"}
                    />
                  </>
                )}

              <select
                onChange={(e) => setPriority(e.target.value)}
                value={priority}
                required
                disabled={selectedTask?.status === "completed"}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>

              <div className={styles["btn-options"]}>
                <button onClick={handleUpdateTask}>
                  Actualizar
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button onClick={handleCloseEditModal}>
                  <FontAwesomeIcon icon={faTimes} />
                  Cerrar
                </button>
              </div>
              {errors.errorUpdate && (
                <p className={styles["error-search"]}> {errors.errorUpdate}</p>
              )}
            </div>
          </div>
        )}
        <motion.div
          className={styles["task_header"]}
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
              onClick={() => handleNavigation("/phrases")}
            >
              <FontAwesomeIcon icon={faQuoteLeft} /> Frases
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
          <p className={styles["errorTask"]}>{errors.userId}</p>
        )}
        {/* Barra de búsqueda */}
        <motion.div
          className={styles["search_task"]}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles["content-search"]}>
            <input
              type="text"
              placeholder="Buscar tarea..."
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
            <p className={styles["noTask"]}> {errors.message}</p>
          )}
        </div>
        {/* ir atras cuando se genera una busqueda */}
        <div
          className={`${styles["back"]} ${isSearching ? styles["visible"] : ""}`}
          onClick={handleBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} title="Ir atrás" />
        </div>
        {/* Lista de tareas */}
        <motion.div
          className={styles["dashboard_task"]}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          {searchResults.length > 0
            ? searchResults.map((task) => (
                <div
                  key={task.id}
                  className={`${styles["task-item"]} ${
                    isTaskExpired(
                      task.end_date,
                      task.end_time,
                      task.status,
                      Intl.DateTimeFormat().resolvedOptions().timeZone,
                    )
                      ? styles["expired-task"]
                      : ""
                  }`}
                >
                  <div
                    className={`${styles["checkbox-label"]} ${
                      styles[task.status]
                    }`}
                    onClick={() => handleCheckboxChange(task.id, task.status)}
                  ></div>

                  <div
                    className={styles["content-infoTask"]}
                    onMouseDown={() =>
                      handleMouseDown(
                        task.id,
                        task.task_name,
                        task.end_date,
                        task.priority,
                        task.start_time,
                        task.end_time,
                        task.status,
                      )
                    }
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={() =>
                      handleMouseDown(
                        task.id,
                        task.task_name,
                        task.end_date,
                        task.priority,
                        task.start_time,
                        task.end_time,
                        task.status,
                      )
                    }
                    onTouchEnd={handleMouseUp}
                    onTouchCancel={handleMouseUp}
                  >
                    <div className={styles["task-name"]}>
                      <p>{task.task_name}</p>
                      <div
                        className={`${styles["task-priority"]} ${
                          getPriorityData(task.priority)?.className ||
                          "default-class"
                        }`}
                      >
                        {getPriorityData(task.priority)?.label || "No Priority"}
                      </div>
                    </div>
                    <div className={styles["task-category"]}>
                      <p>{task.category}</p>
                    </div>
                    <div className={styles["task-date"]}>
                      <div className={styles["content-date"]}>
                        <p title="fecha de inicio">
                          <FontAwesomeIcon
                            icon={faClock}
                            style={{ marginRight: "5px" }}
                          />
                          {formatDateWithoutTimezoneShift(task.start_date)}
                        </p>
                        <p title="fecha final">
                          <FontAwesomeIcon
                            icon={faClock}
                            style={{ marginRight: "5px" }}
                          />
                          {formatDateWithoutTimezoneShift(task.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : orderedTasks.map((task) => {
                const taskDateOnly = new Date(task.start_date);
                const todayDate = new Date(nowUser);

                const taskDayStr = taskDateOnly.toISOString().slice(0, 10); // "YYYY-MM-DD"
                const todayDayStr = todayDate.toISOString().slice(0, 10);
                console.log("Task day:", taskDayStr, "Today day:", todayDayStr);
                console.log(taskDateOnly, todayDate, "ver esto");
                console.log(
                  taskDateOnly.getTime(),
                  todayDate.getTime(),
                  " y ver esto",
                );

                let section = "";
                console.log("task.start_date:", task.start_date);
                // console.log(
                //   taskDateOnly,
                //   "fecha de la tarea",
                //   "y fecha de de hoy",
                //   todayStr,
                // );

                // console.log(
                //   "despues de convertir",
                //   taskDateOnly.getTime(),
                //   todayDate.getTime(),
                // );

                // 1️⃣ Primero: vencidas
                if (
                  isTaskExpired(
                    task.end_date,
                    task.end_time,
                    task.status,
                    userTimeZone,
                  )
                ) {
                  section = "Tareas vencidas";
                }
                // 2️⃣ Tareas futuras
                else if (taskDayStr > todayDayStr) {
                  console.log("hay futuras");
                  section = "Tareas futuras";
                }
                // 3️⃣ En progreso
                else if (task.status === "in_progress") {
                  console.log("hay en progreso");
                  section = "En progreso";
                }
                // 4️⃣ Pendientes de hoy
                else if (
                  task.status === "pending" &&
                  taskDayStr <= todayDayStr
                ) {
                  console.log("hay tareas de hoy");
                  section = "Tareas de hoy";
                }
                // 5️⃣ Completadas
                else if (task.status === "completed") {
                  console.log("hay en completas");
                  section = "Completadas";
                }

                const showTitle = section !== lastSection;
                lastSection = section;

                return (
                  <React.Fragment key={task.id}>
                    {showTitle && (
                      <p className={styles.sectionTitle}>{section}</p>
                    )}
                    <div
                      className={`${styles["task-item"]} ${
                        isTaskExpired(
                          task.end_date,
                          task.end_time,
                          task.status,
                          Intl.DateTimeFormat().resolvedOptions().timeZone,
                        )
                          ? styles["expired-task"]
                          : ""
                      }`}
                    >
                      <div
                        className={`${styles["checkbox-label"]} ${
                          styles[task.status]
                        }`}
                        onClick={() =>
                          handleCheckboxChange(task.id, task.status)
                        }
                      />
                      <div
                        className={styles["content-infoTask"]}
                        onMouseDown={() =>
                          handleMouseDown(
                            task.id,
                            task.task_name,
                            task.end_date,
                            task.priority,
                            task.start_time,
                            task.end_time,
                            task.status,
                          )
                        }
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={() =>
                          handleMouseDown(
                            task.id,
                            task.task_name,
                            task.end_date,
                            task.priority,
                            task.start_time,
                            task.end_time,
                            task.status,
                          )
                        }
                        onTouchEnd={handleMouseUp}
                        onTouchCancel={handleMouseUp}
                      >
                        <div className={styles["task-name"]}>
                          <p>{task.task_name}</p>
                          <div
                            className={`${styles["task-priority"]} ${
                              getPriorityData(task.priority)?.className ||
                              "default-class"
                            }`}
                          >
                            {getPriorityData(task.priority)?.label ||
                              "No Priority"}
                          </div>
                        </div>
                        <div className={styles["task-category"]}>
                          <p>{task.category}</p>
                        </div>
                        <div className={styles["task-date"]}>
                          <div className={styles["content-date"]}>
                            <p title="fecha de inicio">
                              <FontAwesomeIcon
                                icon={faClock}
                                style={{ marginRight: "5px" }}
                              />
                              {
                                task.start_time // si tiene hora
                                  ? [
                                      "Tareas vencidas",
                                      "Tareas de hoy",
                                      "Pendientes",
                                      "En progreso",
                                      "Tareas futuras",
                                    ].includes(section)
                                    ? showStartDate
                                      ? formatDateWithoutTimezoneShift(
                                          task.start_date,
                                        )
                                      : formatHour(task.start_time)
                                    : formatDateWithoutTimezoneShift(
                                        task.start_date,
                                      ) // solo día si sección no aplica
                                  : formatDateWithoutTimezoneShift(
                                      task.start_date,
                                    ) // si no hay hora, solo día
                              }
                            </p>

                            <p title="fecha final">
                              <FontAwesomeIcon
                                icon={faClock}
                                style={{ marginRight: "5px" }}
                                className={styles["date-toggle"]}
                              />
                              {
                                task.end_time // solo si la tarea tiene hora
                                  ? [
                                      "Tareas vencidas",
                                      "Tareas de hoy",
                                      "En progreso",
                                      "Pendientes",
                                      "Tareas futuras",
                                    ].includes(section)
                                    ? showEndDate
                                      ? formatDateWithoutTimezoneShift(
                                          task.end_date,
                                        )
                                      : formatHour(task.end_time)
                                    : formatDateWithoutTimezoneShift(
                                        task.end_date,
                                      ) // secciones donde solo mostramos el día
                                  : formatDateWithoutTimezoneShift(
                                      task.end_date,
                                    ) // si no hay hora, mostramos solo el día
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
        </motion.div>
      </div>
    </div>
  );
};

export default Task;
