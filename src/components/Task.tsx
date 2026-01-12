import { useState, useEffect } from "react";
import axios from "axios";
import styles from '../styles/task.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowLeft, faQuoteLeft, faBullseye, faClock, faPen, faTrash, faTimes, faSave} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";


const Task = () => {
  const [tasks, setTasks] = useState<{ id: number; task_name: string; start_date: string; end_date: string; category: string; priority: string; complete: boolean;  status: string; created_at: string; updated_at: string; user_id: number; }[]>([]);
  const [errors, setErrors] = useState<{ userId?: string; general?: string; message?: string; errorUpdate?: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: number; task_name: string; start_date: string; end_date: string; category: string; priority: string; complete: boolean; status: string; created_at: string; updated_at: string; user_id: number; }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: number; name: string; date: string; priority: string; } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [priority, setPriority] = useState(selectedTask?.priority || "low");  // low por defecto si es null o undefined
  console.log(tasks, 'todas las propiedades de tasks')

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    // 1️⃣ Asignar fecha y prioridad si selectedTask cambia
    if (selectedTask) {
      if (selectedTask.date) {
        setNewDate(selectedTask.date.split('T')[0]); // Establece la fecha si está disponible
      }
  
      if (selectedTask.priority) {
        const priorityInSpanish =
          selectedTask.priority === "high" ? "alta" :
          selectedTask.priority === "medium" ? "media" :
          "baja";
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
        setErrors(error.response?.data.errors || { general: "Error inesperado. Comunícalo al programador." });
      }
    };
  
    loadTasks();
  }, [selectedTask]); // Se ejecuta cada vez que cambia `selectedTask`
  

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
  
      setSearchResults(response.data);// Actualiza las tareas con los resultados de la búsqueda
      setIsSearching(response.data.length > 0); // si la busqueda es 0 o no hay no se muestra el boton

    } catch (error: any) {
      setSearchResults([]);
      setIsSearching(false); // no aparece el boton de ir atras cuando se hace una busqueda en caso de error...
      setErrors(error.response?.data?.errors || { general: "Error en la búsqueda." });
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
    low: { label: "Leve", className: styles.lowPriority }
  };
  
  // Función para obtener los valores de la prioridad
  const getPriorityData = (priority: string) => {
    // Verificamos que el valor de priority sea uno de los válidos
    const validPriority = priority === 'high' || priority === 'medium' || priority === 'low' ? priority : 'low';
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
  const handleCheckboxChange = async (taskId: number, currentStatus: string) => {

    // 🔊 notificación de audio INMEDIATA
    if (currentStatus !== 'completed') {
    const audio = new Audio('/complete.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
    }

     const getNextStatus = (status: string) => {
      if (status === 'pending') return 'in_progress';
      if (status === 'in_progress') return 'completed';
      return 'completed';
    };
     const nextStatus = getNextStatus(currentStatus);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.put(`${API_URL}/api/auth/updateTask`, 
        { status: nextStatus }, // Enviamos el nuevo estado de "complete"
        {
          headers: {
            Authorization: `Bearer ${token}`,  
            "Task-Id": taskId, 
            "Status": nextStatus   
          }
        }
      );
  
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      ));

      setSearchResults(prevResults => prevResults.map(task =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      ));
  
    } catch (error: any) {
      setErrors(error.response?.data?.errors || { general: 'Error en la búsqueda.' }); 
      setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, general: '' })); 
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
        }
      });
      
      // 🔹 Filtrar tareas actualizadas
      const updatedTasks = tasks.filter(task => task.id !== selectedTask.id);
      const updatedSearchResults = searchResults.filter(task => task.id !== selectedTask.id);
      
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
      setErrors(error.response?.data?.errors || { general: 'Error al eliminar la tarea.' });
      setTimeout(() => {
        setErrors(prevErrors => ({ ...prevErrors, general: '' }));
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

    // 🔊 notificación de audio INMEDIATA
    const playSound = () => {
      const audio = new Audio('/OpenClose.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    };
    playSound();
  
    try {
      const API_URL = import.meta.env.VITE_API_URL;
  
       await axios.put(`${API_URL}/api/auth/taskUpdate`, {
        taskId: selectedTask.id, 
        updatedDate: localDate,
        updatedPriority,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Actualizar tareas en el estado principal
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task,  end_date: localDate, priority: updatedPriority } 
          : task
      );

      // Actualizar las tareas en los resultados de búsqueda
      const updatedSearchResults = searchResults.map(task => 
        task.id === selectedTask.id 
          ? { ...task, end_date: localDate, priority: updatedPriority } 
          : task
      );

      // Actualizamos ambos estados
      setSearchResults(updatedSearchResults);
      setTasks(updatedTasks);
      handleCloseEditModal(); //cierra el modal
  
    } catch (error: any) {
      setErrors(error.response?.data?.errors || { general: 'Error al actualizar la tarea.' });
      setTimeout(() => {
        setErrors(prevErrors => ({ ...prevErrors, general: '' }));
      }, 5000);
    }
  };
  
  // contenido para activar el modal al dejar presioanda la pantalla para eliminar
  let pressTimer: ReturnType<typeof setTimeout> | null = null;

  const handleMouseDown = (taskId: number, taskName: string, endDate: string, priority: string) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  
    pressTimer = setTimeout(() => {
      if ("vibrate" in navigator) {
        navigator.vibrate(100); 
      }
      setShowModal(true);
      setSelectedTask({ id: taskId, name: taskName, date: endDate, priority: priority }); 
      document.body.style.overflow = "hidden"; 
      document.body.style.pointerEvents = "none";
    }, 600); 
  };

  const handleCloseModal = () => {
    document.body.style.overflow = "auto";  
    document.body.style.pointerEvents = "auto";  
    setShowModal(false); 
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
    setShowModal(false); //cerramos el modal de editar y eliminar
    setShowEditModal(false); 
    setErrors({}); // Limpiamos los errores
    document.body.style.overflow = "auto";  
    document.body.style.pointerEvents = "auto"; 
  };

  const getColombiaDate = () => {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // esto da "2025-04-04"
  };
  
  // funcion para validar si la tarea esta vencida y sin completar
  const isTaskExpired = (endDate: string, isComplete: boolean): boolean => {
    if (isComplete) return false;
    // Convertimos las fechas al timezone de Colombia y las truncamos a medianoche
    const today = getColombiaDate();
    const taskEnd = endDate.split('T')[0];

    console.log('fecha de hoy', today, 'y fecha tasend', taskEnd);
  
    return taskEnd < today;
  };  

  const formatDateWithoutTimezoneShift = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${parseInt(day)} ${meses[parseInt(month) - 1]} ${year}`;
  };  

  return (

    <div className={styles['task-container']}> {/* Usar estilos del módulo */}
     {/* 🔹 Modal para eliminar o actualizar tarea*/}
     {showModal && selectedTask && (
        <div className={styles['modalOverlay']}>
          <div className={styles['modalContent']}>
            <p className={styles['taskTitle']}>{selectedTask.name}</p>
            <p className={styles['question']}> ¿Qué quieres hacer?</p>
            <div className={styles['btn-options']}>
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
      {showEditModal && selectedTask &&(
        <div className={styles['modalOverlay']}>
          <div className={styles['modalContent']}>
            <p className={styles['taskTitle']}>{selectedTask.name}</p>
              <label>Fecha final:</label>
              <input 
                type="date" 
                value={newDate} 
                onChange={(e) => {
                  setNewDate(e.target.value);
                  }} 
                />
      
              <select
                onChange={(e) => setPriority(e.target.value)}  // Actualiza el estado al seleccionar
                value={priority}  // Se establece el valor del select según el estado
                required
                >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
      
              <div className={styles['btn-options']}>
                <button onClick={handleUpdateTask}>Actualizar
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button onClick={handleCloseEditModal}>
                  <FontAwesomeIcon icon={faTimes} />Cerrar
                </button>
              </div>
              {errors.errorUpdate && <p className={styles['error-search']}> {errors.errorUpdate}</p>}
          </div>
        </div>
      )}

      <div className={styles['task_header']}>
        <div className={styles['title']}>
          <h2>Tasly</h2>
        </div>
        <div className={styles['options']}>
          <div className={styles['button']} onClick={() => handleNavigation("/Home")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Ir Home
          </div>
          <div className={styles['button']} onClick={() => handleNavigation("/phrases")}>
            <FontAwesomeIcon icon={faQuoteLeft}  /> Frases
          </div>
          <div className={styles['button']} onClick={() => handleNavigation("/goals")}>
            <FontAwesomeIcon icon={faBullseye} /> Metas
          </div>
        </div>

      </div>

      {errors.userId && <p className={styles['errorTask']}>{errors.userId}</p>}    
  
      {/* Barra de búsqueda */}
      <div className={styles['search_task']}>
        <div className={styles['content-search']}>
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
      </div>
      <div className={styles['error-container']}>
        {errors.general && <p className={styles['error-search']}> {errors.general}</p>}
        {errors.message && <p className={styles['noTask']}> {errors.message}</p>}
      </div>

      {/* ir atras cuando se genera una busqueda */}
      <div className={`${styles['back']} ${isSearching ? styles['visible'] : ''}`} onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} title="Ir atrás" />
      </div>

      {/* Lista de tareas */}
      <div className={styles['dashboard_task']}>
        {searchResults.length > 0
          ? searchResults.map((task) => (
            <div key={task.id} className={`${styles['task-item']} ${isTaskExpired(task.end_date, task.complete) ? styles['expired-task'] : ''}`}>
                <div
                  className={`${styles['checkbox-label']} ${styles[task.status]}`}
                  onClick={() => handleCheckboxChange(task.id, task.status)}
                >
                </div>

                <div className={styles['content-infoTask']} onMouseDown={() => handleMouseDown(task.id, task.task_name, task.end_date, task.priority)} onMouseUp={handleMouseUp} 
                  onMouseLeave={handleMouseUp} onTouchStart={() => handleMouseDown(task.id, task.task_name, task.end_date, task.priority)} 
                  onTouchEnd={handleMouseUp} onTouchCancel={handleMouseUp}>
                  <div className={styles['task-name']}>
                    <p>{task.task_name}</p>
                    <div className={`${styles['task-priority']} ${getPriorityData(task.priority)?.className || 'default-class'}`}>
                      {getPriorityData(task.priority)?.label || 'No Priority'}
                    </div>
                  </div>
                  <div className={styles['task-category']}>
                    <p>{task.category}</p> 
                  </div>
                  <div className={styles['task-date']}>
                    <div className={styles['content-date']}>
                    <p title="fecha de inicio">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(task.start_date)}
                      </p>
                      <p title="fecha final">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(task.end_date)}
                      </p>  
                    </div>
                  </div>
                </div>   
            </div>
            ))
          : tasks.length > 0 &&
            tasks.map((task) => (
              <div key={task.id} className={`${styles['task-item']} ${isTaskExpired(task.end_date, task.complete) ? styles['expired-task'] : ''}`}>
                <div
                  className={`${styles['checkbox-label']} ${styles[task.status]}`}
                  onClick={() => handleCheckboxChange(task.id, task.status)}
                >
              </div>

                <div className={styles['content-infoTask']} onMouseDown={() => handleMouseDown(task.id, task.task_name, task.end_date, task.priority)} onMouseUp={handleMouseUp} 
                  onMouseLeave={handleMouseUp} onTouchStart={() => handleMouseDown(task.id, task.task_name, task.end_date, task.priority)} 
                  onTouchEnd={handleMouseUp} onTouchCancel={handleMouseUp}>
                  <div className={styles['task-name']}>
                    <p>{task.task_name}</p>
                    <div className={`${styles['task-priority']} ${getPriorityData(task.priority)?.className || 'default-class'}`}>
                      {getPriorityData(task.priority)?.label || 'No Priority'}
                    </div>
                  </div>
                  <div className={styles['task-category']}>
                    <p>{task.category}</p> 
                  </div>
                  <div className={styles['task-date']}>
                    <div className={styles['content-date']}>
                      <p title="fecha de inicio">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(task.start_date)}
                      </p>
                      <p title="fecha final">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(task.end_date)}
                      </p>                      
                    </div>
                  </div>
                </div>   
            </div>

            ))}
      </div>
    </div>
  );
};

export default Task;

