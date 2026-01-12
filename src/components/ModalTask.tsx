import React, { useState } from "react";
import axios from "axios";
import styles from '../styles/modalTask.module.css';


interface ModalTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: { task: string; startDate: string; endDate: string; category: string; priority: string }) => void;
  onTaskAdded: (taskData: any) => void;
  onTasksLengthUpdated: (newTask: { status: string }) => void;
}

const ModalTask: React.FC<ModalTaskProps> = ({ isOpen, onClose, onSubmit, onTaskAdded, onTasksLengthUpdated }) => {
  const [task, setTask] = useState(""); // Nombre de la tarea
  const [startDate, setStartDate] = useState(""); // Fecha de inicio
  const [endDate, setEndDate] = useState(""); // Fecha de finalización
  const [category, setCategory] = useState(""); // Categoría
  const [priority, setPriority] = useState("medium"); // Prioridad
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ task_name?: string; date?: string; category?: string; priority?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

      // Crear el objeto con los datos
      const taskData = { task, startDate, endDate, category, priority };

      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL;

      try {
       const response =   await axios.post(`${API_URL}/api/auth/task`, taskData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // Llamar a la función onSubmit para que el padre reciba los datos
        onSubmit(taskData);
        onTaskAdded(response.data);
        onTasksLengthUpdated(response.data);

        // Limpiar los campos después de enviar
        setTask("");
        setStartDate("");
        setEndDate("");
        setCategory("");
        setPriority("medium");
        setSuccessMessage("La tarea se agregó!");
        // Limpiar los errores
        setErrors({});
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 5000);

      } catch (error: any) {
        // Manejo de errores específicos de la respuesta del backend
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors); // Mostrar errores específicos
        } else {
          // Manejo de errores generales cuando no hay un `response.data.errors`
          setErrorMessage('La tarea no se guardó.');
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        }
      }
      
  };

  // Opción de cancelar y limpiar datos al cerrar el modal
  const handleClose = () => {
    setTask("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    setPriority("medium");
    setSuccessMessage(null);
    setErrorMessage(null);

     // Limpiar los errores
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;


return (
  <div className={styles['modal-overlay']}>
    <div className={styles['modal-content']}>
      <h2>Agregar Tarea</h2>
      {successMessage && <div className={styles['success-message']}>{successMessage}</div>}
      {errorMessage && <div className={styles['error-message']}>{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        {errors.task_name && <div className={styles['errorContainer']}><span className={styles['errorTask']}>{errors.task_name}</span></div>}
        <input
          type="text"
          placeholder="Escribe tu tarea"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        {errors.date && <div className={styles['errorContainer']}><span className={styles['errorTask']}>{errors.date}</span></div>}
        <div className={styles['starDate']}>
          <label htmlFor="startDate">Fecha de inicio:</label>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <div className={styles['starDate']}>
          <label htmlFor="endDate">Fecha final:</label>
        </div>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        {errors.category && <div className={styles['errorContainer']}><span className={styles['errorTask']}>{errors.category}</span></div>}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Selecciona una categoría</option>
          <option value="personal">Personal</option>
          <option value="trabajo">Trabajo</option>
          <option value="urgente">Urgente</option>
          <option value="otro">Otro</option>
        </select>

        {errors.priority && <div className={styles['errorContainer']}><span className={styles['errorTask']}>{errors.priority}</span></div>}
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>

        <div className={styles['modal-actions']}>
          <button type="submit">Guardar</button>
          <button type="button" onClick={handleClose}>Cerrar</button>
        </div>
      </form>
    </div>
  </div>
);

};

export default ModalTask;
