import styles from '../styles/goals.module.css';
import axios from "axios";
import { generateGoalMessages } from "../utils/goalMessages";
import type { Goal } from "../utils/goalMessages";
import type { GoalMessage } from "../utils/goalMessages";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faListCheck, faQuoteLeft, faSearch, faClock, faPen, faTrash, faTimes, faSave, faSpaceShuttle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const phrases = [
  "Las metas marcan el destino, pero los sistemas determinan el camino. Enfócate en cómo avanzas cada día, construye hábitos que te acerquen a tu objetivo y disfruta el proceso.",
  "Haga que un hábito sea insatisfactorio mirando las consecuencias de no cumplirlo.",
  "El mensaje que debes llevarte es que es importante desarrollar hábitos que funcionen para tu personalidad.",
  "Elige metas que realmente se alineen con quien eres, no con lo que los demás esperan de ti.",
  "Lo que repites cada día es en lo que te conviertes. Tus hábitos definen tu destino.",
  "Si una meta es grande, divídela en pequeños pasos que puedas lograr cada día.",
  "No dependas de la fuerza de voluntad, crea sistemas que te ayuden a mantenerte en el camino.",
  "Un hábito exitoso empieza con un compromiso pequeño: 'Hoy leeré una página', en lugar de 'Quiero leer más libros'.",
  "La motivación te ayuda a empezar, pero es el sistema lo que te mantiene avanzando.",
  "Celebra cada pequeño progreso. El éxito es el resultado de muchas pequeñas victorias acumuladas.",
  "Cambia tu enfoque de 'quiero lograr esto' a 'quiero convertirme en la persona que hace esto'."
];

const Goals = () => {
  const [errors, setErrors] = useState<{ userId?: string; general?: string; message?: string; errorUpdate?: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [searchResults, setSearchResults] = useState<{ id: number; goal: string; description: string; current_value: number; unit: string; shared: boolean; user_id: number; start_date: string; end_date: string; }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPreviewModal, setShowAddPreviewModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{ id: number; name: string; date: string; description: string; } | null>(null);
  const [selectedGoalPreview, setSelectedGoalPreview] = useState<{ id: number; name: string; current_value: number; } | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState<GoalMessage | null>(null);
  const [editedDescription, setEditedDescription] = useState(selectedGoal?.description || "");
  const [newValue, setNewValue] = useState(0);
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [goalMessage, setGoalMessage] = useState<string | null>(null);
  const [shownMilestones, setShownMilestones] = useState<number[]>([]);
  const lastMessageRef = useRef<GoalMessage | null>(null);

  // datos globales del usuario para realizar cualquier accion
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  // permite asignarle el valor a selectedGoal o range cuando se abre el modal de editar
  useEffect(() => {
    if (selectedGoal) {
      setEditedDescription(selectedGoal.description || "");
    }

    if (selectedGoalPreview) {
      setNewValue(selectedGoalPreview.current_value);
    }

  }, [selectedGoal, selectedGoalPreview]);

  // funcion para nevegar entre componentes
  const navigate = useNavigate();
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  // pasar frases + mensajes dinámicos
  useEffect(() => {
  // convertir frases estáticas a GoalMessage
  const staticMessages: GoalMessage[] = phrases.map(text => ({ text }));

  // mensajes dinámicos desde metas
  const dynamicMessages: GoalMessage[] = generateGoalMessages(goals, new Date());

  // unir todo
  const allMessages: GoalMessage[] = [
    ...staticMessages,
    ...dynamicMessages
  ];

  if (allMessages.length === 0) return;

  const pickRandomMessage = (): GoalMessage => {
    let next: GoalMessage;

    do {
      next = allMessages[Math.floor(Math.random() * allMessages.length)];
    } while (
      lastMessageRef.current?.text === next.text &&
      allMessages.length > 1
    );

    lastMessageRef.current = next;
    return next;
  };

  // primer mensaje
  setCurrentPhrase(pickRandomMessage());

  const interval = setInterval(() => {
    const phraseElement = document.querySelector(`.${styles.fadeIn}`);
    if (phraseElement) {
      phraseElement.classList.add(styles.fadeOut);
    }

    setTimeout(() => {
      setCurrentPhrase(pickRandomMessage());

      const newElement = document.querySelector(`.${styles.fadeIn}`);
      if (newElement) {
        newElement.classList.remove(styles.fadeOut);
        newElement.classList.add(styles.fadeIn);
      }
    }, 500);
  }, 10000); // ⏱️ tiempo entre mensajes (8s)

  return () => clearInterval(interval);
}, [goals, phrases]);

  // obtener las metas del usuario
  useEffect(() => {    
   const loadGoals = async () => {
     try {
       const response = await axios.get(`${API_URL}/api/auth/loadGoals`, {
         headers: {
           Authorization: `Bearer ${token}`
         },
       });
       if (response.data.length === 0) {
         setErrors({ message: "Parece que tu lista está vacía"});
       } else {
         setErrors({ general: undefined }); // Si hay tareas, limpiamos el mensaje de error
       }
       setGoals(response.data);
     } catch (error: any) {
       if (error.response?.data.errors) {
         setErrors(error.response.data.errors);
       } else {
         setErrors({ general: "Error inesperado. Comunícalo al programador." });
       }
     }
   };
    loadGoals ();
  }, []);

  // funcion para hacer la busqueda de frases
  const handleSearch = async () => {
    try {
      setErrors({});

      const response = await axios.get(`${API_URL}/api/auth/searchGoals`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          query: searchTerm,
        },
      });
      
      setSearchResults(response.data);// Actualiza las frases con los resultados de la búsqueda
      setIsSearching(response.data.length > 0); // si la busqueda es 0 o no hay no se muestra el boton

    } catch (error: any) {
      setSearchResults([]);
      setIsSearching(false); // no aparece el boton de ir atras cuando se hace una busqueda en caso de error...
      setErrors(error.response?.data?.errors || { general: "Error en la búsqueda." });
      setTimeout(() => {
        setErrors(() => {
          if (goals.length === 0 && searchResults.length === 0) {
            return { message: "No se encontraron frases recientes." };
          }
          return {}; 
        });
      }, 5000); 
    }
  };

  // funciona para eliminar una meta
  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;
  
    try {
      await axios.delete(`${API_URL}/api/auth/deleteGoal`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Goal-Id": selectedGoal.id.toString(),
        }
      });
      
      // 🔹 Filtrar tareas actualizadas
      const updatedGoals = goals.filter(goal => goal.id !== selectedGoal.id);
      const updatedSearchResults = searchResults.filter(goal => goal.id !== selectedGoal.id);
      
      // 🔹 Actualizar el estado con los nuevos valores
      if (updatedSearchResults.length === 0) {
        setIsSearching(false); // Oculta el botón
      }

      // mostrar mensaje cuando se eliminen tareas y no haya que mostrar
      if (updatedGoals.length === 0) {
        setErrors({ message: "Parece que tu lista está vacía" });
      } else {
        setErrors({ message: "" });
      }

      setGoals(updatedGoals);
      setSearchResults(updatedSearchResults);

      handleCloseModal();
    } catch (error: any) {
      setErrors(error.response?.data?.errors || { general: 'Error al eliminar la tarea.' });
      setTimeout(() => {
        setErrors(prevErrors => ({ ...prevErrors, general: '' }));
      }, 5000);
    }
  };

   // funcion para actualizar meta
   const handleUpdateGoal = async () => {
    if (!selectedGoal) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
  
      await axios.put(`${API_URL}/api/auth/goalUpdate`, {
        goalId: selectedGoal.id, 
        editedDescription
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Actualizar tareas en el estado principal
      const updatedGoals = goals.map(goal => 
        goal.id === selectedGoal.id 
          ? { ...goal, description: editedDescription } 
          : goal
      );

      // Actualizar las tareas en los resultados de búsqueda
      const updatedSearchResults = searchResults.map(goal => 
        goal.id === selectedGoal.id 
          ? { ...goal, description: editedDescription } 
          : goal
      );
      // Actualizamos ambos estados
      setSearchResults(updatedSearchResults);
      setGoals(updatedGoals);
      handleCloseEditModal();

     const playSound = () => {
      const audio = new Audio('/OpenClose.mp3'); 
      audio.volume = 0.3;
      audio.play();
    };
    playSound();
  
    } catch (error: any) {
      setErrors(error.response?.data?.errors || { general: 'Error al actualizar la tarea.' });
      setTimeout(() => {
        setErrors(prevErrors => ({ ...prevErrors, general: '' }));
      }, 5000);
    }
  };

  // Define los hitos
  const getMilestone = (value: number): number | null => {
  if (value >= 100) return 100;
  if (value >= 75) return 75;
  if (value >= 50) return 50;
  if (value >= 25) return 25;
  if (value >= 10) return 10;
  return null;
  };

  // funcion para avanzar en una meta
  const handleGoalAdvance = async () => {
    if (!selectedGoalPreview) return;

    try {
      await axios.put(`${API_URL}/api/auth/goalAdvance`, {
        goalId: selectedGoalPreview.id, 
        newValue
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Actualizar tareas en el estado principal
      const updatedGoals = goals.map(goal => 
        goal.id === selectedGoalPreview.id 
          ? { ...goal, current_value: newValue } 
          : goal
      );

      // Actualizar las tareas en los resultados de búsqueda
      const updatedSearchResults = searchResults.map(goal => 
        goal.id === selectedGoalPreview.id 
          ? { ...goal, current_value: newValue } 
          : goal
      );
      // Actualizamos ambos estados
      setSearchResults(updatedSearchResults);
      setGoals(updatedGoals);
      setSelectedGoalPreview(prev => prev ? { ...prev, current_value: newValue } : prev);

      // Solo mostrar mensajes cuando se alcanza un hito
      const prevValue = selectedGoalPreview?.current_value || 0;
      const milestone = getMilestone(newValue);

      if (milestone && prevValue < milestone && !shownMilestones.includes(milestone)) {
        const { message } = getProgressInfo(newValue);
        if (message) {
          setGoalMessage(message);
          setShowGoalMessage(true);
          setShownMilestones(prev => [...prev, milestone]);
        }
      }

      // Cierre instantáneo con animación potente
      setTimeout(() => {
       // Solo cerramos el modal sin animación
       setShowAddPreviewModal(false);
       setErrors({});
       document.body.style.overflow = "auto"; // desbloquea scroll
       document.body.style.pointerEvents = "auto"; // desbloquea clicks
      }, 0);
  
    } catch (error: any) {
      setErrors(error.response?.data?.errors || { general: 'Error al avanzar en la meta.' });
      setTimeout(() => {
        setErrors(prevErrors => ({ ...prevErrors, general: '' }));
      }, 5000);
    }
  };

  // funcion para ocultar el botón "Ir atrás" cuando se va a lista de frases por defecto del usuario
  const handleBack = () => {
    setSearchResults([]); 
    setIsSearching(false); 
  };

  // contenido para activar el modal al dejar presioanda la pantalla para eliminar
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  const handleMouseDown = (goalId: number, goalName: string, date: string, description: string) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  
    pressTimer = setTimeout(() => {
      if ("vibrate" in navigator) {
        navigator.vibrate(100); 
      }
      setShowModal(true);
      setSelectedGoal({ id: goalId, name: goalName, date: date, description: description }); 
      document.body.style.overflow = "hidden"; 
      document.body.style.pointerEvents = "none";
    }, 600); 
  };

  const handleCloseModal = () => {
    document.body.style.overflow = "auto";  
    document.body.style.pointerEvents = "auto";  
    setShowModal(false); 
  };

  // funcion abrir el modal de actualizar
  const handleOpenEditModal = () => {
    setShowEditModal(true);
    setShowModal(false);
  };

  // funcion abrir el modal de agregar avance
  const handleAddPreview = (idGoal: number, nameGoal: string, current_value: number) => {
    setShowAddPreviewModal(true);
    document.body.style.overflow = "hidden"; 
    document.body.style.pointerEvents = "none";
    setSelectedGoalPreview({id: idGoal, name: nameGoal, current_value: current_value });
  };

  // funcion para cerrar el modal de actualizar
  const handleCloseEditModal = () => {
    setShowModal(false); //cerramos el modal de editar y eliminar
    setShowEditModal(false); 
    setErrors({});
    document.body.style.overflow = "auto";  
    document.body.style.pointerEvents = "auto"; 
  };

   // funcion para modal de avanzar cerrar
  const handleClosePreviewModal = () => {
  const modal = document.querySelector(`.${styles.modalContentPreview}`);
  if (modal) {
    modal.classList.add(styles.modalContentPreviewClosing);
    modal.addEventListener('animationend', () => {
      setShowAddPreviewModal(false);
      setErrors({});
      document.body.style.overflow = "auto";
      document.body.style.pointerEvents = "auto";
    }, { once: true });
  } else {
    setShowAddPreviewModal(false);
    setErrors({});
    document.body.style.overflow = "auto";
    document.body.style.pointerEvents = "auto";
  }
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };
  
  // progreso para la meta
  type ProgressInfo = {
  color: string;
  message: string | null;
  };
 
  const getProgressInfo = (value: number): ProgressInfo => {
    let color = "#bf1f1170"; // Rojo por defecto
    let message: string | null = null;

    // Colores según progreso
    if (value < 40) color = "#bf1f1170";      
    else if (value >= 40 && value < 70) color = "#d99e6a6c"; 
    else if (value >= 70 && value < 95) color = "#32698c6e"; 
    else color = "#32698ca9";                 
    
    // Mensajes según hitos (GENÉRICOS)
    if (value >= 100) message = "¡Felicidades! ¡Meta alcanzada! 🏆";
    else if (value >= 75) message = "¡Casi allí, no te detengas! 🌟";
    else if (value >= 50) message = "¡Mitad del camino completado! 💪";
    else if (value >= 25) message = "¡Ya casi alcanzas un cuarto del camino! 👏";
    else if (value >= 10) message = "¡Vas arrancando, sigue así! 🚀";
    return { color, message };
  };

  // ejecutar audio una vez se completa la meta
  useEffect(() => {
    if (selectedGoalPreview) {
      setNewValue(selectedGoalPreview.current_value);
    }
  }, [selectedGoalPreview]);

  useEffect(() => {
    if (selectedGoalPreview?.current_value === 100) {
      if (!sessionStorage.getItem(`goal_${selectedGoalPreview.id}_notified`)) {
        const playSound = () => {
          const audio = new Audio('/CompleteGoal.mp3'); 
          audio.volume = 0.8;
          audio.play();
        };
  
        playSound();
        sessionStorage.setItem(`goal_${selectedGoalPreview.id}_notified`, 'true');  
      }
    }
  }, [selectedGoalPreview?.current_value]);

  const formatDateWithoutTimezoneShift = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${parseInt(day)} ${meses[parseInt(month) - 1]} ${year}`;
  }; 

  // para el modal al pasar colores y valores
  const modalProgressInfo = selectedGoalPreview
  ? getProgressInfo(Number(selectedGoalPreview.current_value))
  : null;

  return (
    <div className={styles['goals-container']}>
     {/* 🔹 Modal que muestra mensajes cada que se avanza en la meta */}
      {showGoalMessage && (
        <div className={styles['goal-message-overlay']}>
          <div className={styles['goal-message-modal']}>
            <p className={styles['goal-message-text']}>{goalMessage}</p>
            <button
              className={styles['goal-message-button']}
              onClick={() => setShowGoalMessage(false)}
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Modal para eliminar o actualizar una meta*/}
      {showModal && selectedGoal && (
        <div className={styles['modalOverlay']}>
          <div className={styles['modalContent']}>
            <p className={styles['goalTitle']}>{selectedGoal.name}</p>
            <p className={styles['question']}> ¿Qué quieres hacer?</p>
            <div className={styles['btn-options']}>
              <button onClick={handleOpenEditModal}>
                <FontAwesomeIcon icon={faPen} /> Editar
              </button>
              <button onClick={handleDeleteGoal}>
                <FontAwesomeIcon icon={faTrash} /> Eliminar
              </button>
              <button onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} /> Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal para editar meta o agregar una nota o avance */}
      {showEditModal && selectedGoal &&(
        <div className={styles['modalOverlay']}>
          <div className={styles['modalContent']}>
          <span>Agregar una nota:</span>
          <p className={styles['goalName']}>{selectedGoal.name}</p>  
            <textarea 
              value={editedDescription} 
              onChange={(e) => setEditedDescription(e.target.value)} 
              className={styles['textarea-description']}
            />  
              <div className={styles['btn-options']}>
                <button onClick={handleUpdateGoal}>Actualizar
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button onClick={handleCloseEditModal}>
                  <FontAwesomeIcon icon={faTimes} />Cerrar
                </button>
              </div>
              {errors.errorUpdate && <p className={styles['error-Update']}> {errors.errorUpdate}</p>}
          </div>
        </div>
      )}

      {/* 🔹 Modal para agregar avance a una meta */}
      {showAddPreviewModal && selectedGoalPreview &&(
        <div key={selectedGoalPreview?.id} className={`${styles['modalOverlayPreview']} ${Number(selectedGoalPreview?.current_value) === 100 ? styles['goal-completed_modal'] : ''}`}>
          <div className={styles['modalContentPreview']}>
            <span>¿Qué tanto avanzaste?</span>
            <p className={styles['goalName']}>{selectedGoalPreview.name}</p>   
            <input
              className={styles['inputAdvance']}
              type="number"
              min={0}
              max={100}
              value={newValue} 
              onChange={(e) => {
              const newValue = Number(e.target.value);
              if (newValue <= 100 && newValue >= Number(selectedGoalPreview?.current_value)) {
                setNewValue(newValue);
                }
              }}
            />
              <div className={styles['goal_progress']}>
                <div className={styles['progress-bar']}>
                  <div
                    className={styles['progress']}
                    style={{
                      width: `${selectedGoalPreview.current_value}%`,
                      background: modalProgressInfo?.color,
                    }}
                    data-value={selectedGoalPreview.current_value}
                  ></div>
                </div>
              </div> 
              <div className={styles['btn-options']}>
                <button onClick={handleGoalAdvance}>Avanzar
                  <FontAwesomeIcon icon={faSpaceShuttle} />
                </button>
                <button onClick={handleClosePreviewModal}>
                  <FontAwesomeIcon icon={faTimes} />Cerrar
                </button>
              </div>
              {errors.errorUpdate && <p className={styles['error-Update']}> {errors.errorUpdate}</p>}
          </div>
        </div>
      )}

      <div className={styles['goals_header']}>
        <div className={styles['title']}>
          <h2>Tasly</h2>
        </div>
        
        <div className={styles['options']}>
          <div className={styles['button']} onClick={() => handleNavigation("/Home")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Ir Home
          </div>
          <div className={styles['button']} onClick={() => handleNavigation("/tasks")}>
            <FontAwesomeIcon icon={faListCheck}  /> Tareas
          </div>
          <div className={styles['button']} onClick={() => handleNavigation("/phrases")}>
            <FontAwesomeIcon icon={faQuoteLeft} /> Frases
          </div>
        </div>
      </div> 

      {errors.userId && <p className={styles['errorPhrases']}>{errors.userId}</p>} 

       {/* Barra de búsqueda */}
       <div className={styles['search_goals']}>
        <div className={styles['content-search']}>
          <input
            type="text"
            placeholder="Buscar meta..."
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
        {errors.message && <p className={styles['noGoals']}> {errors.message}</p>}
      </div>

      {/* contenido de frases */}
      {!isSearching && (
        <div className={styles['atomic_habits']}>
          <p className={styles.fadeIn}>
            {currentPhrase &&
              (currentPhrase.highlight
                ? currentPhrase.text.split(currentPhrase.highlight).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className={styles.highlight}>
                          {currentPhrase.highlight}
                        </span>
                      )}
                    </span>
                  ))
                : currentPhrase.text)}
          </p>
        </div>
      )}

       {/* ir atras cuando se genera una busqueda */}
       <div className={`${styles['back']} ${isSearching ? styles['visible'] : ''}`} onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} title="Ir atrás" />
      </div>

      {/* Lista de metas */}
      <div className={styles['dashboard_goal']}>
        {searchResults.length > 0
          ? searchResults.map((goal) => (
            <div
              key={goal.id}
              className={`
                ${styles['goal-item']} 
                ${Number(goal.current_value) === 100 ? styles['goal-completed'] : ''} 
                ${(goal.end_date.split('T')[0] < new Date().toISOString().split('T')[0] && Number(goal.current_value) < 100) ? styles['goal-expired'] : ''}
              `}
              >
                <div className={styles['content-infoGoal']} onMouseDown={() => handleMouseDown(goal.id, goal.goal, goal.start_date, goal.description)} onMouseUp={handleMouseUp} 
                  onMouseLeave={handleMouseUp} onTouchStart={() => handleMouseDown(goal.id, goal.goal, goal.start_date, goal.description)} 
                  onTouchEnd={handleMouseUp} onTouchCancel={handleMouseUp}>
                  <div className={styles['goal-name']}>
                    <p>{goal.goal}</p>
                  </div>
                  <div className={styles['description']}>
                    <p>{goal.description}</p>
                  </div>

                  {/* boton en 3d */}
                  <button className={styles['btn-3d']} onClick={() => handleAddPreview(goal.id, goal.goal, goal.current_value)}>
                    Avanzar 🚀
                  </button>

                  {/* avence o progreso de la meta */}
                  <div className={styles['goal_progress']}>
                      <div className={styles['progress-bar']}>
                        <div
                          className={styles['progress']}
                          style={{
                            width: `${goal.current_value}%`,
                            background: getProgressInfo(goal.current_value).color,
                          }}
                          data-value={goal.current_value}
                        ></div>
                      </div>
                  </div>

                  <div className={styles['goal-date']}>
                    <div className={styles['content-date']}>
                      <p title="fecha de creación">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(goal.start_date)}
                      </p>
                      <p title="fecha de terminación">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(goal.end_date)}
                      </p>
                    </div>
                  </div>
                </div>   
            </div>
            ))
          : goals.length > 0 &&
            goals.map((goal) => (
              <div
              key={goal.id}
              className={`
                ${styles['goal-item']} 
                ${Number(goal.current_value) === 100 ? styles['goal-completed'] : ''} 
                ${(goal.end_date.split('T')[0] < new Date().toISOString().split('T')[0] && Number(goal.current_value) < 100) ? styles['goal-expired'] : ''}
              `}
              >
                <div className={styles['content-infoGoal']} onMouseDown={() => handleMouseDown(goal.id, goal.goal, goal.start_date, goal.description)} onMouseUp={handleMouseUp} 
                  onMouseLeave={handleMouseUp} onTouchStart={() => handleMouseDown(goal.id, goal.goal, goal.start_date, goal.description)} 
                  onTouchEnd={handleMouseUp} onTouchCancel={handleMouseUp}>
                  <div className={styles['goal-name']}>
                    <p>{goal.goal}</p>
                  </div>
                  <div className={styles['description']}>
                    <p>{goal.description}</p>
                  </div>
                 
                  {/* boton en 3d */}
                  <button className={styles['btn-3d']} onClick={() => handleAddPreview(goal.id, goal.goal, goal.current_value)}>
                    Avanzar 🚀
                  </button>

                  {/* avence o progreso de la meta */}
                  <div className={styles['goal_progress']}>
                      <div className={styles['progress-bar']}>
                        <div
                          className={styles['progress']}
                          style={{
                            width: `${goal.current_value}%`,
                            background: getProgressInfo(goal.current_value).color,
                          }}
                          data-value={goal.current_value}
                        ></div>
                      </div>
                  </div>

                  <div className={styles['goal-date']}>
                    <div className={styles['content-date']}>
                      <p title="fecha de creación">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(goal.start_date)}
                      </p>
                      <p title="fecha de terminación">
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                        {formatDateWithoutTimezoneShift(goal.end_date)}
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

export default Goals;


