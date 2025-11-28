export function formatDate(date: string | Date): string {
  if (typeof date === "string") {
    const match = date.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    date = new Date(date);
  }
  const d = date as Date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hour}:${minute}`;
}
