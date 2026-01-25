export function getTypedForm<T extends HTMLFormControlsCollection>(
  selector: string
) {
  const form = document.querySelector<HTMLFormElement>(selector);
  if (!form) throw new Error(`Form not found: ${selector}`);
  return form as HTMLFormElement & { elements: T };
}

export interface NewCalendarFormElements extends HTMLFormControlsCollection {
  label: HTMLInputElement;
}

export interface AddEditEventFormElements extends HTMLFormControlsCollection {
  id: HTMLInputElement;
  title: HTMLInputElement;
  start: HTMLInputElement;
  end: HTMLInputElement;
  type: HTMLSelectElement;
}

export interface CalendarFormElements extends HTMLFormControlsCollection {
  'calendar-name-input': HTMLInputElement;
  'start-month': HTMLInputElement;
  'calendar-title-input': HTMLInputElement;
  'calendar-subtitle-input': HTMLInputElement;
  'color-select': HTMLInputElement;
}
