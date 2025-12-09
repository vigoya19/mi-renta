
function parseDateToUtcMs(date: string): number {
  var parts = date.split('-').map(function (p) {
    return Number(p);
  });
  var year = parts[0];
  var monthIndex = parts[1] - 1;
  var day = parts[2];
  return Date.UTC(year, monthIndex, day);
}

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = parseDateToUtcMs(startA);
  const aEnd = parseDateToUtcMs(endA);
  const bStart = parseDateToUtcMs(startB);
  const bEnd = parseDateToUtcMs(endB);

  return aStart <= bEnd && bStart <= aEnd;
}

export function diffInDays(start: string, end: string): number {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startMs = parseDateToUtcMs(start);
  const endMs = parseDateToUtcMs(end);
  return Math.round((endMs - startMs) / oneDayMs);
}
