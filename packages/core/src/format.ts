import type { Kurus } from './money';
import { kurusToLira } from './money';

const tryFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatTry(kurusValue: Kurus): string {
  return tryFormatter.format(kurusToLira(kurusValue));
}

const dateTr = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
});
const dateTimeTr = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDate(d: Date | string): string {
  return dateTr.format(typeof d === 'string' ? new Date(d) : d);
}

export function formatDateTime(d: Date | string): string {
  return dateTimeTr.format(typeof d === 'string' ? new Date(d) : d);
}

/** Relative time like "3 gün önce". */
const rtf = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' });
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

export function formatRelative(d: Date | string, now: Date = new Date()): string {
  const target = typeof d === 'string' ? new Date(d) : d;
  const diffSec = (target.getTime() - now.getTime()) / 1000;
  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diffSec) >= seconds || unit === 'second') {
      return rtf.format(Math.round(diffSec / seconds), unit);
    }
  }
  return rtf.format(0, 'second');
}
