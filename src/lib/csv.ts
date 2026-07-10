import type { Booking } from '../types/database';

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function bookingsToCsv(bookings: Booking[]): string {
  const header = [
    'Nombre niño/a',
    'Edad',
    'Adulto responsable',
    'Teléfono',
    'Email',
    'Fecha de reserva',
  ];

  const rows = bookings.map((b) => [
    b.child_name,
    b.child_age,
    b.guardian_name,
    b.phone,
    b.email ?? '',
    new Date(b.created_at).toLocaleString('es-ES'),
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsvField).join(';'))
    .join('\n');
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([`﻿${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
