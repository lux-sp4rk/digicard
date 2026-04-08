/**
 * Normalizes various date formats to a comparable Date object
 * @param {string} dateStr - Date string in various formats (ISO 8601, RSS, etc.)
 * @returns {Date|null} Parsed Date or null if invalid
 */
export const normalizeDate = dateStr => {
  if (!dateStr) return null;

  // Try parsing as ISO 8601 first (YouTube format)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try parsing RSS format (Substack: "Mon, 06 Jan 2025 11:00:00 GMT")
  // The Date constructor should handle this, but let's be explicit
  const rssMatch = dateStr.match(
    /^(\w{3}),\s+(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{2}:\d{2}:\d{2})\s*(\w+)?$/
  );
  if (rssMatch) {
    date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};
