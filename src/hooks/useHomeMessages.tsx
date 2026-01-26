type TaskSummary = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
};

export const useHomeContextMessages = (
  taskSummary: TaskSummary,
  styles: any
) => {
  const getDayMoment = () => {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 6) return "sleep";
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "night";
  };

  const getContextMessage = () => {
    const { total, pending, inProgress, completed } = taskSummary;
    const moment = getDayMoment();

    // 🌙 Sleep
    if (moment === "sleep") {
      return "Ya es tarde. Descansa un poco 🌙";
    }

    // 🌅 MAÑANA
    if (moment === "morning") {
      if (total === 0) {
        return <>Empieza el día creando una tarea o una meta.</>;
      }

      if (pending > 0 && inProgress > 0) {
        return (
          <>
            Tienes <span className={styles.taskCount}>{pending}</span>{" "}
            tarea(s) pendiente(s) y{" "}
            <span className={styles.taskCount}>{inProgress}</span> en progreso.
            ¡Puedes empezar la pendiente o continuar lo que has iniciado! 💪
          </>
        );
      }

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

      if (completed === total) {
        return <>Buen inicio de día, ya completaste todo 🙌</>;
      }

      return <>Elige una tarea importante y empieza con calma.</>;
    }

    // 🌇 TARDE
    if (moment === "afternoon") {
      if (total === 0) {
        return "Aún no has creado tareas hoy. Si quieres, puedes empezar ahora.";
      }

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

      if (inProgress > 0) {
        return (
          <>
            Tienes <span className={styles.taskCount}>{inProgress}</span>{" "}
            tarea(s) en proceso. Sigue así 💪
          </>
        );
      }

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

  return { getContextMessage };
};