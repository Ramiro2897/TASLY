import { useEffect, useState } from "react";

const pendingTaskMessages = [
  "Empieza por la tarea más fácil 💡",
  "Haz solo una. El resto vendrá solo ⚡",
  "Una tarea ahora vale más que motivación después 🔥",
  "No rompas la cadena hoy 💪",
  "Pequeños pasos, grandes resultados 🌱",
  "Completar una cambia el resto del día 🚀",
  "Hazla aunque no tengas ganas",
];

export const useMotivation = () => {
  const [motivation, setMotivation] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(
      Math.random() * pendingTaskMessages.length
    );
    setMotivation(pendingTaskMessages[randomIndex]);
  }, []);

  return { motivation };
};