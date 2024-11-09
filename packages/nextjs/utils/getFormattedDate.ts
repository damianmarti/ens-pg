export function getFormattedDate(date: Date) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);

  return `${month} ${year}`;
}
