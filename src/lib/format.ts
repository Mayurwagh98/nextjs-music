const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(value: number) {
  return price.format(value);
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m} min`;
}

export function totalMinutes(lessons: { minutes: number }[]) {
  return lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
}

export function formatSessionTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
