export function getTypedForm<T extends HTMLFormControlsCollection>(
  selector: string
) {
  const form = document.querySelector<HTMLFormElement>(selector);
  if (!form) throw new Error(`Form not found: ${selector}`);
  return form as HTMLFormElement & { elements: T };
}

export interface AddEditEventFormElements extends HTMLFormControlsCollection {
  id: HTMLInputElement;
  title: HTMLInputElement;
  start: HTMLInputElement;
  end: HTMLInputElement;
  type: HTMLSelectElement;
}
