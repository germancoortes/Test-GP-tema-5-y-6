import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatSessionDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}h`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
