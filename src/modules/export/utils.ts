import { store } from '../../store';

export function getFileName(): string {
  const title = store.calendar!.state.calendarTitle || 'Rolling Calendar';
  const month = store.calendar!.state.startMonth + 1;
  const year = store.calendar!.state.startYear;

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
