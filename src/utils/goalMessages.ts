// src/utils/goalMessages.ts
export type Goal = {
  id: number;
  user_id: number;
  goal: string;
  description: string;
  current_value: number;
  unit: string;
  shared: boolean;
  start_date: string;
  end_date: string;
  target_value: string | null;
  created_at: string;
  updated_at: string;
};

export type GoalMessage = {
  text: string;
  highlight?: string;
};

const DAY = 1000 * 60 * 60 * 24;

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateGoalMessages(
  goals: Goal[],
  now: Date
): GoalMessage[] {
  if (goals.length === 0) return [];

  const messages: GoalMessage[] = [];

  /* ===============================
     🔹 METAS ACTIVAS
  =============================== */

  const activeGoals = goals.filter(g => {
    const end = new Date(g.end_date);
    const notExpired = end.getTime() >= now.getTime();
    const notCompleted = g.current_value < 100;
    return notExpired && notCompleted;
  });

  /* ===============================
     1️⃣ PROGRESO HOY (NO COMPLETADAS)
  =============================== */

  const progressedToday = goals.filter(g => {
    const updated = new Date(g.updated_at);
    const progressed =
      Math.floor((now.getTime() - updated.getTime()) / DAY) === 0;

    return progressed && g.current_value < 100;
  });

  if (progressedToday.length > 0) {
    const goalName = progressedToday[0].goal;

    messages.push({
      text: `¡Genial! Has avanzado en ${goalName}. Sigue así 🚀`,
      highlight: goalName
    });
  }

  /* ===============================
     🔥 RACHA DE AVANCES
  =============================== */

  const streakGoals = goals.filter(g => {
    const updated = new Date(g.updated_at);
    const daysDiff = (now.getTime() - updated.getTime()) / DAY;

    return daysDiff <= 3 && g.current_value < 100;
  });

  if (streakGoals.length >= 2) {
    messages.push({
      text: `🔥 Llevas una racha de avances en tus metas. ¡Sigue así!`,
      highlight: `${streakGoals.length}`
    });
  }

  /* ===============================
     2️⃣ SIN AVANCE
  =============================== */

  const stalledGoals = activeGoals.filter(g => {
  const updated = new Date(g.updated_at);
  return (now.getTime() - updated.getTime()) / DAY >= 3;
  });

  if (stalledGoals.length > 0) {
    messages.push({
      text: `Hace días que no trabajas en ${stalledGoals.length} metas. ¡Todavía estás a tiempo 💪!`,
      highlight: stalledGoals.length.toString()
    });
  }

  /* ===============================
     3️⃣ PRÓXIMAS A VENCER
  =============================== */

  const expiringSoon = activeGoals.filter(g => {
    const end = new Date(g.end_date);
    const diffDays = (end.getTime() - now.getTime()) / DAY;
    return diffDays > 0 && diffDays <= 7;
  });

  if (expiringSoon.length > 0) {
    const goalName = expiringSoon[0].goal;

    messages.push({
      text: `⏰ ${goalName} se vence pronto, no la dejes para después`,
      highlight: goalName
    });
  }

  /* ===============================
     4️⃣ COMPLETADAS (ÚLTIMA SEMANA)
  =============================== */

  const completedRecently = goals.filter(g => {
    if (g.current_value < 100) return false;

    const updated = new Date(g.updated_at);
    const daysDiff = (now.getTime() - updated.getTime()) / DAY;

    return daysDiff <= 7;
  });

  if (completedRecently.length > 0) {
    const goalName = completedRecently[0].goal;

    messages.push({
      text: `¡Felicidades! Has completado ${goalName} 🏆`,
      highlight: goalName
    });
  }

  /* ===============================
     5️⃣ RESUMEN GENERAL (ACTIVAS)
  =============================== */

  messages.push({
    text: `Actualmente tienes ${activeGoals.length} metas en marcha💥`,
    highlight: `${activeGoals.length}`
  });

  /* ===============================
     6️⃣ MENSAJES POR TIPO
  =============================== */

  const typeMessages: Record<
    string,
    { min: number; messages: string[] }
  > = {
    km: {
      min: 30,
      messages: [
        "🏃‍♂️ Tu constancia física está dando frutos",
        "Moverte hoy es ganar salud mañana 💚",
        "Cada kilómetro suma, sigue así"
      ]
    },
    kg: {
      min: 5,
      messages: [
        "⚖️ Los cambios pequeños también cuentan",
        "Tu disciplina se refleja en tu progreso",
        "Paso a paso, cuerpo fuerte 💪"
      ]
    },
    horas: {
      min: 10,
      messages: [
        "⏳ El tiempo bien invertido siempre paga",
        "Cada hora te acerca a tu objetivo",
        "Constancia > intensidad"
      ]
    },
    minutos: {
      min: 60,
      messages: [
        "⏱️ Un minuto hoy, un gran resultado mañana",
        "Pequeños bloques crean grandes hábitos"
      ]
    },
    calorías: {
      min: 500,
      messages: [
        "🔥 Tu esfuerzo se siente, sigue cuidándote",
        "Cada decisión suma bienestar"
      ]
    },
    sesiones: {
      min: 5,
      messages: [
        "📅 La constancia vence a la motivación",
        "Sesión a sesión, progreso real"
      ]
    },
    COP: {
      min: 100000,
      messages: [
        "💰 Tus ahorros crecen, buen trabajo",
        "Cada peso ahorrado es tranquilidad futura"
      ]
    },
    dólares: {
      min: 50,
      messages: [
        "💸 Tu disciplina financiera da resultados",
        "Invertir en ti siempre vale la pena"
      ]
    },
    libros: {
      min: 1,
      messages: [
        "📚 Leer es crecer por dentro",
        "Un libro más, una mente más fuerte"
      ]
    },
    capítulos: {
      min: 5,
      messages: [
        "✍️ Crear también es avanzar",
        "Capítulo a capítulo se construyen historias"
      ]
    },
    proyectos: {
      min: 1,
      messages: [
        "🚀 Sacar ideas adelante no es fácil, vas bien",
        "Un proyecto activo ya es progreso"
      ]
    },
    ventas: {
      min: 1,
      messages: [
        "📈 Cada venta cuenta, sigue empujando",
        "Tu esfuerzo empieza a reflejarse"
      ]
    },
    viajes: {
      min: 1,
      messages: [
        "✈️ Planear viajes también es vivir",
        "Cada destino empieza con un paso"
      ]
    },
    "%": {
      min: 25,
      messages: [
        "📊 El progreso ya es visible",
        "Sigue así, el objetivo está cerca"
      ]
    },
    salud: {
      min: 1,
      messages: [
        "💚 Cuidar tu salud es la mejor inversión",
        "Tu bienestar es prioridad, sigue así",
        "Cada acción saludable suma años de vida"
      ]
    }
  };

  Object.entries(typeMessages).forEach(([unit, config]) => {
    const hasThatType = activeGoals.some(
      g => g.unit === unit && g.current_value >= config.min
    );

    if (hasThatType) {
      messages.push({
        text: randomFrom(config.messages)
      });
    }
  });

  /* ===============================
     🔥 LIMPIEZA FINAL
  =============================== */

  return shuffle(
    Array.from(new Map(messages.map(m => [m.text, m])).values())
  );
}
