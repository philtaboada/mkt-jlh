export const convertUTCToLocal = (dateString?: string): string => {
  if (!dateString) {
    const date = new Date();
    const originalDay = date.getDate();
    date.setHours(date.getHours() + 5);
    if (date.getDate() !== originalDay) {
      date.setHours(23, 59, 59, 999);
    }
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  const date = new Date(dateString);
  if (!dateString.includes('T')) {
    const now = new Date();
    const combined = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
    combined.setHours(combined.getHours() + 5);
    if (combined.getDate() !== date.getDate()) {
      combined.setHours(23, 59, 59, 999);
    }
    const localDate = new Date(combined.getTime() - combined.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (dateString.includes('Z') || dateString.includes('+00:00') || dateString.includes('-00:00')) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  date.setHours(date.getHours() + 5);
  const originalDate = new Date(dateString);
  if (date.getDate() !== originalDate.getDate()) {
    date.setHours(23, 59, 59, 999);
  }
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 19).replace('T', ' ');
};
