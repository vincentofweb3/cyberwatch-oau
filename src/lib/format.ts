export function formatDate(
  value: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
    ...options,
  }).format(date);
}

export function formatRelativeTime(value: Date) {
  const difference = value.getTime() - Date.now();
  const absolute = Math.abs(difference);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absolute < 60 * 60 * 1000) return formatter.format(Math.round(difference / 60000), "minute");
  if (absolute < 24 * 60 * 60 * 1000)
    return formatter.format(Math.round(difference / 3600000), "hour");
  return formatter.format(Math.round(difference / 86400000), "day");
}
