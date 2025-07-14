// Utility to generate a dynamic list of years for filters and forms
export function getYearOptions(start = 2020, extra = 2) {
  const current = new Date().getFullYear();
  const end = current + extra;
  const years = [];
  for (let y = end; y >= start; y--) {
    years.push(y);
  }
  return years;
} 