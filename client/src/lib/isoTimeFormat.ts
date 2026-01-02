export function isoTimeFormat(dateTime: string | number | Date) {
  const date = new Date(dateTime);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
