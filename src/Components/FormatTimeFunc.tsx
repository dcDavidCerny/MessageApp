export const formatDate = (date: Date) => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString(undefined, {
    hour12: false,
  });
  let formattedTimestamp;
  if (isToday) {
    formattedTimestamp = timeString;
  } else {
    formattedTimestamp =
      date.getFullYear() === currentYear
        ? date.toLocaleDateString(undefined) + " - " + timeString
        : date.toLocaleDateString(undefined, { year: "numeric" }) +
          " - " +
          timeString;
  }
  return formattedTimestamp;
};
