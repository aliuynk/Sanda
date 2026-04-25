/**
 * Seasonal flag: products may define a range (start .. end month). The range
 * can wrap the year end (e.g. walnuts Oct-Apr).
 */
export function getInSeasonFlag(
  month: number,
  start: number | null | undefined,
  end: number | null | undefined,
): boolean {
  if (!start || !end) return false;
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}

export function monthIsSeasonal(
  start: number | null | undefined,
  end: number | null | undefined,
  now: Date = new Date(),
): boolean {
  return getInSeasonFlag(now.getMonth() + 1, start, end);
}
