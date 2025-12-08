
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  var aStart = new Date(startA).getTime();
  var aEnd = new Date(endA).getTime();
  var bStart = new Date(startB).getTime();
  var bEnd = new Date(endB).getTime();

  return aStart <= bEnd && bStart <= aEnd;
}

export function diffInDays(start: string, end: string): number {
  var oneDayMs = 24 * 60 * 60 * 1000;
  var startMs = new Date(start).getTime();
  var endMs = new Date(end).getTime();
  return Math.round((endMs - startMs) / oneDayMs);
}