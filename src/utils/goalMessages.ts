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
  type?: "streak" | "progress" | "warning" | "info";
  priority?: number;
};

const DAY = 1000 * 60 * 60 * 24;
const MAX_DYNAMIC_MESSAGES = 4;

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function daysSince(date: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(date).getTime()) / DAY);
}

export function generateGoalMessages(goals: Goal[], now: Date): GoalMessage[] {
  if (goals.length === 0) return [];

  const messages: GoalMessage[] = [];

  /* ===============================
     🔹 METAS ACTIVAS
  =============================== */

  const activeGoals = goals.filter((g) => {
    const end = new Date(g.end_date);
    return end.getTime() >= now.getTime() && g.current_value < 100;
  });

  /* ===============================
     1️⃣ PROGRESO HOY (REAL)
  =============================== */

  const progressedToday = activeGoals
    .filter((g) => daysSince(g.updated_at, now) === 0 && g.current_value > 0)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime(),
    );

  if (progressedToday.length > 0) {
    messages.push({
      text: `¡Genial! Has avanzado en ${progressedToday[0].goal}. Sigue así 🚀`,
      highlight: progressedToday[0].goal,
      type: "progress",
      priority: 3,
    });
  }

  /* ===============================
     🔥 RACHA HONESTA
  =============================== */

  const hasStreak = progressedToday.length >= 2;

  if (hasStreak) {
    messages.push({
      text: `🔥 Hoy avanzaste en varias metas. ¡Eso es constancia!`,
      highlight: `${progressedToday.length}`,
      type: "streak",
      priority: 4,
    });
  }

  /* ===============================
     2️⃣ SIN AVANCE
     👉 solo si NO hay racha
  =============================== */

  if (!hasStreak) {
    const stalledGoals = activeGoals.filter(
      (g) => daysSince(g.updated_at, now) >= 3,
    );

    if (stalledGoals.length > 0) {
      messages.push({
        text: `Hace días que no trabajas en ${stalledGoals.length} metas. ¡Todavía estás a tiempo 💪!`,
        highlight: stalledGoals.length.toString(),
        type: "warning",
        priority: 1,
      });
    }
  }

  /* ===============================
     3️⃣ PRÓXIMAS A VENCER
  =============================== */

  const expiringSoon = activeGoals.filter((g) => {
    const diffDays =
      (new Date(g.end_date).getTime() - now.getTime()) / DAY;
    return diffDays > 0 && diffDays <= 7;
  });

  if (expiringSoon.length > 0) {
    messages.push({
      text: `⏰ ${expiringSoon[0].goal} se vence pronto, no la dejes para después`,
      highlight: expiringSoon[0].goal,
      type: "warning",
      priority: 2,
    });
  }

  /* ===============================
     4️⃣ COMPLETADAS (ÚLTIMA SEMANA)
  =============================== */

  const completedRecently = goals.filter(
    (g) => g.current_value >= 100 && daysSince(g.updated_at, now) <= 7,
  );

  if (completedRecently.length > 0) {
    messages.push({
      text: `¡Felicidades! Has completado ${completedRecently[0].goal} 🏆`,
      highlight: completedRecently[0].goal,
      type: "info",
      priority: 3,
    });
  }

  /* ===============================
     5️⃣ RESUMEN GENERAL
     👉 solo si hay metas activas
  =============================== */

  if (activeGoals.length > 0) {
    messages.push({
      text: `Actualmente tienes ${activeGoals.length} metas en marcha 💥`,
      highlight: `${activeGoals.length}`,
      type: "info",
      priority: 0,
    });
  }

  /* ===============================
     6️⃣ MENSAJES POR TIPO
  =============================== */

  const typeMessages: Record<string, { min: number; messages: string[] }> = {
    km: {
      min: 30,
      messages: [
        "🏃‍♂️ Tu constancia física está dando frutos",
        "Moverte hoy es ganar salud mañana 💚",
        "Cada kilómetro suma, sigue así",
      ],
    },
    kg: {
      min: 5,
      messages: [
        "⚖️ Los cambios pequeños también cuentan",
        "Tu disciplina se refleja en tu progreso",
        "Paso a paso, cuerpo fuerte 💪",
      ],
    },
    horas: {
      min: 10,
      messages: [
        "⏳ El tiempo bien invertido siempre paga",
        "Cada hora te acerca a tu objetivo",
        "Constancia > intensidad",
      ],
    },
    minutos: {
      min: 60,
      messages: [
        "⏱️ Un minuto hoy, un gran resultado mañana",
        "Pequeños bloques crean grandes hábitos",
      ],
    },
    calorías: {
      min: 500,
      messages: [
        "🔥 Tu esfuerzo se siente, sigue cuidándote",
        "Cada decisión suma bienestar",
      ],
    },
    sesiones: {
      min: 5,
      messages: [
        "📅 La constancia vence a la motivación",
        "Sesión a sesión, progreso real",
      ],
    },
    COP: {
      min: 100000,
      messages: [
        "💰 Tus ahorros crecen, buen trabajo",
        "Cada peso ahorrado es tranquilidad futura",
      ],
    },
    dólares: {
      min: 50,
      messages: [
        "💸 Tu disciplina financiera da resultados",
        "Invertir en ti siempre vale la pena",
      ],
    },
    libros: {
      min: 1,
      messages: [
        "📚 Leer es crecer por dentro",
        "Un libro más, una mente más fuerte",
      ],
    },
    capítulos: {
      min: 5,
      messages: [
        "✍️ Crear también es avanzar",
        "Capítulo a capítulo se construyen historias",
      ],
    },
    proyectos: {
      min: 1,
      messages: [
        "🚀 Sacar ideas adelante no es fácil, vas bien",
        "Un proyecto activo ya es progreso",
      ],
    },
    ventas: {
      min: 1,
      messages: [
        "📈 Cada venta cuenta, sigue empujando",
        "Tu esfuerzo empieza a reflejarse",
      ],
    },
    viajes: {
      min: 1,
      messages: [
        "✈️ Planear viajes también es vivir",
        "Cada destino empieza con un paso",
      ],
    },
    "%": {
      min: 25,
      messages: [
        "📊 El progreso ya es visible",
        "Sigue así, el objetivo está cerca",
      ],
    },
    salud: {
      min: 1,
      messages: [
        "💚 Cuidar tu salud es la mejor inversión",
        "Tu bienestar es prioridad, sigue así",
        "Cada acción saludable suma años de vida",
      ],
    },
  };

  Object.entries(typeMessages).forEach(([unit, config]) => {
    const hasThatType = activeGoals.some(
      (g) => g.unit === unit && g.current_value >= config.min,
    );

    if (hasThatType) {
      messages.push({
        text: randomFrom(config.messages),
        type: "info",
        priority: 0,
      });
    }
  });

  /* ===============================
     🔥 LIMPIEZA FINAL
  =============================== */

  const uniqueMessages = Array.from(
    new Map(messages.map((m) => [m.text, m])).values(),
  );

  return shuffle(
    uniqueMessages
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .slice(0, MAX_DYNAMIC_MESSAGES),
  );
}
