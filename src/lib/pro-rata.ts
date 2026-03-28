import { differenceInDays, parseISO } from "date-fns";

/**
 * Calculate pro-rata entitlement for mid-year starters.
 * Rounds to nearest 0.5 (UK standard).
 */
export function calculateProRata(
  fullEntitlement: number,
  startDate: string,
  yearStart: string,
  yearEnd: string
): number {
  const empStart = parseISO(startDate);
  const yStart = parseISO(yearStart);
  const yEnd = parseISO(yearEnd);

  // If employee started before or on year start, full entitlement
  if (empStart <= yStart) return fullEntitlement;

  // If employee started after year end, 0
  if (empStart > yEnd) return 0;

  const totalDays = differenceInDays(yEnd, yStart) + 1;
  const remainingDays = differenceInDays(yEnd, empStart) + 1;

  const proRata = fullEntitlement * (remainingDays / totalDays);

  // Round to nearest 0.5
  return Math.round(proRata * 2) / 2;
}
