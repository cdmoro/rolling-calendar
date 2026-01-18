import { state } from '../../state/app';

export function getFileName(): string {
  const title = state.calendar!.calendarTitle || 'Rolling Calendar';
  const month = state.calendar!.startMonth + 1;
  const year = state.calendar!.startYear;

  let fileName = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);

  if (month === 1) {
    fileName += `_${year}`;
  } else {
    fileName += `_${year}-${year + 1}`;
  }

  return fileName;
}
