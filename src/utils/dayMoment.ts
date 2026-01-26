export type DayMoment = "sleep" | "morning" | "afternoon" | "night";

export const getDayMoment = (): DayMoment => {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 6) return "sleep";
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "night";
}