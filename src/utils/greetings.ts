import { getDayMoment } from "./dayMoment";

export const getGreeting = () => {
  const moment = getDayMoment();
  if (moment === "morning") return "Buenos días";
  if (moment === "afternoon") return "Buenas tardes";
  return "Buenas noches";
};

export const getGreetingIcon = () => {
  const moment = getDayMoment();
  if (moment === "morning") return "☀️";
  if (moment === "afternoon") return "🌤️";
  return "🌚";
};