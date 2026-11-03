import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Date de référence de la session de suivi d'Adrien (03/11/2026) ou date courante
 */
export function getReferenceToday(): Date {
  return new Date("2026-11-03T12:00:00");
}

export function formatDateFr(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return dateStr;
    return format(parsed, "dd MMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatShortDateFr(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return dateStr;
    return format(parsed, "dd/MM/yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

export function daysSince(dateStr: string, referenceDate = getReferenceToday()): number {
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return 0;
    return Math.max(0, differenceInCalendarDays(referenceDate, parsed));
  } catch {
    return 0;
  }
}
