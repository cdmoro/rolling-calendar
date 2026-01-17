import { state } from '../../state/app';
import { getFileName } from './utils';

function formatIcsDate(iso: string): string {
  return iso.replace(/-/g, '') + 'T000000';
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsIcs(): void {
  const events = state.calendar!.events;

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rolling Calendar//EN',
    'CALSCALE:GREGORIAN'
  ].join('\n');

  events.forEach((e) => {
    ics += `
BEGIN:VEVENT
UID:${e.id}
DTSTART:${formatIcsDate(e.start)}
DTEND:${formatIcsDate(e.end ?? e.start)}
SUMMARY:${escapeIcs(e.title)}
END:VEVENT`;
  });

  ics += '\nEND:VCALENDAR';

  download(ics, `${getFileName()}.ics`, 'text/calendar');
}
