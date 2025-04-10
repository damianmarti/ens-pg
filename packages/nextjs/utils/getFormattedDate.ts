export function getFormattedDate(date: Date) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString();

  return `${month} ${year}`;
}

export function getFormattedDateWithDay(date: Date) {
  const dateFormatted = getFormattedDate(date);

  const day = date.getDate().toString();

  return `${day} ${dateFormatted}`;
}
