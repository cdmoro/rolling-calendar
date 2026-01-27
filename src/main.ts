import { initStore, store } from './store';
import { applyTranslations, t } from './i18n';
import type { Language, Theme } from './types/app';
import type { CalendarDocument, CalendarEvent } from './types/calendar';
import { initExport } from './modules/export';
import { renderUI } from './render';
import {
  autosaveCurrentCalendar,
  createDraftCalendar,
  openNewCalendarDialog
} from './modules/calendars';
import './components/app-icon';
import { confirmDialog, setupDialogs } from './modules/dialogs';
import { Toast } from './modules/notifications';
import { formatEventDate, toHumanReadableDate } from './render/events';
import { getTypedForm, type CalendarFormElements } from './types/forms';
import { ls } from './modules/local-storage';
import { setFavicon } from './modules/favicon';
import { getEventLegendLabel } from './render/utils';
import { isEventInRange } from './modules/calendar';

const calendarNameInput = document.querySelector<HTMLInputElement>(
  '#calendar-name-input'
)!;
const startMonthInput =
  document.querySelector<HTMLInputElement>('#start-month')!;
const calendarTitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-title-input'
)!;
const calendarSubtitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-subtitle-input'
)!;
const calendarNameTitle =
  document.querySelector<HTMLHeadingElement>('#calendar-name')!;
const calendarDialogBtn =
  document.querySelector<HTMLButtonElement>('#calendar-settings')!;
const calendarDialog =
  document.querySelector<HTMLDialogElement>('#calendar-dialog')!;

const calendarDialogForm = getTypedForm<CalendarFormElements>(
  '#calendar-dialog form'
);

const calendarCount =
  document.querySelector<HTMLSpanElement>('#calendar-count')!;

function updateColor() {
  const color = store.calendar!.state.color;
  document.documentElement.style.setProperty(
    '--accent-color-rgb',
    hexToRgb(color)
  );
  document.documentElement.style.setProperty(
    '--accent-text-color',
    getForegroundColor(color)
  );
  colorSelectHeader.value = color;
}

calendarDialog.addEventListener('close', (e) => {
  const action = (e.target as HTMLDialogElement)?.returnValue;

  if (action === 'save') {
    if (!store.calendar) {
      Toast.error(t('calendarNotFound'), { id: 'calendar-not-found' });
      store.calendar = createDraftCalendar();
    }

    store.calendar.name =
      calendarDialogForm['calendar-name-input'].value.trim();
    calendarNameTitle.textContent = store.calendar.name;
    store.calendar = {
      ...store.calendar,
      name: calendarDialogForm['calendar-name-input'].value.trim(),
      state: {
        ...store.calendar.state,
        color: calendarDialogForm['color-select'].value,
        startYear: Number(
          calendarDialogForm['start-month'].value.split('-')[0]
        ),
        startMonth:
          Number(calendarDialogForm['start-month'].value.split('-')[1]) - 1,
        calendarTitle: calendarDialogForm['calendar-title-input'].value.trim(),
        calendarSubtitle:
          calendarDialogForm['calendar-subtitle-input'].value.trim()
      }
    };
  }

  if (action === 'create') {
    const newCalendar: CalendarDocument = {
      id: crypto.randomUUID(),
      name: calendarDialogForm['calendar-name-input'].value.trim(),
      isDraft: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        startYear: Number(
          calendarDialogForm['start-month'].value.split('-')[0]
        ),
        startMonth:
          Number(calendarDialogForm['start-month'].value.split('-')[1]) - 1,
        events: [],
        color: calendarDialogForm['color-select'].value,
        calendarTitle: calendarDialogForm['calendar-title-input'].value.trim(),
        calendarSubtitle:
          calendarDialogForm['calendar-subtitle-input'].value.trim()
      }
    };
    store.calendars.push(newCalendar);
    store.currentCalendarId = newCalendar.id!;
    store.calendar = structuredClone(newCalendar);
    calendarNameTitle.textContent = newCalendar.name;
    calendarCount.textContent = store.calendars.length.toString();

    ls.setItem('calendars', store.calendars);
    ls.setItem('currentCalendarId', store.currentCalendarId);

    updateCalendarList();

    Toast.success(t('calendarCreated', { calendar_name: newCalendar.name }), {
      id: 'calendar-created'
    });
  }

  updateColor();
  setFavicon(
    store.calendar!.state.color,
    getForegroundColor(store.calendar!.state.color)
  );
  autosaveCurrentCalendar();
  resolveCalendarHeader();
  renderUI();
});
// const calendarSelect =
//   document.querySelector<HTMLSelectElement>('#calendar-select')!;

const startDateInput = document.querySelector<HTMLInputElement>(
  '#add-edit-event-dialog #event-start-date-input'
)!;
const endDateInput = document.querySelector<HTMLInputElement>(
  '#add-edit-event-dialog #event-end-date-input'
)!;

const colorSelect = document.querySelector<HTMLInputElement>('#color-select')!;
const colorSelectHeader = document.querySelector<HTMLInputElement>(
  '#calendar-color-input'
)!;

const calendarsDialog =
  document.querySelector<HTMLDialogElement>('#calendars-dialog')!;
const calendarList = calendarsDialog.querySelector('#calendar-list')!;

const eventsBtn =
  document.querySelector<HTMLButtonElement>('#manage-events-btn')!;
const eventsDialog =
  document.querySelector<HTMLDialogElement>('#events-dialog')!;
const eventList = eventsDialog.querySelector('#event-list')!;

eventsBtn.addEventListener('click', () => {
  updateEventList();
  eventsDialog.showModal();
});

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function getForegroundColor(hex: string) {
  const [r, g, b] = hexToRgb(hex).split(', ').map(Number);
  return r * 0.299 + g * 0.587 + b * 0.114 > 135 ? '#000000' : '#FFFFFF';
}

export function setTheme(theme: Theme, color: string = '#4a90e2') {
  const html = document.documentElement;
  let resolvedTheme = theme;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }

  // html.setAttribute('data-theme', `${resolvedTheme}-${color}`);
  const foregroundColor = getForegroundColor(color);
  html.setAttribute('data-theme', `${resolvedTheme}`);
  html.style.setProperty('--accent-color-rgb', hexToRgb(color));
  html.style.setProperty('--accent-text-color', foregroundColor);
  setFavicon(color, foregroundColor);

  ls.setItem('theme', `${theme}`);

  if (store.calendar) {
    store.calendar.state.color = color;
    autosaveCurrentCalendar();
  }
}

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (store.theme === 'auto') {
      const newColorScheme = e.matches ? 'dark' : 'light';
      setTheme(newColorScheme, store.calendar!.state.color);
    }
  });

async function deleteCalendar(id: string) {
  const index = store.calendars.findIndex((cal) => cal.id === id);
  if (index === -1) return;

  const calendarName = store.calendars[index].name;

  const confirmDelete = await confirmDialog({
    title: t('deleteCalendar'),
    message: t('deleteCalendarConfirmation'),
    detail: `${t('name')}: <strong>${calendarName}</strong>`,
    confirmButtonText: t('delete'),
    cancelButtonText: t('cancel'),
    confirmButtonClass: 'btn-danger'
  });

  if (confirmDelete) {
    store.calendars.splice(index, 1);
    ls.setItem('calendars', store.calendars);

    if (store.calendars.length > 0) {
      const lastUpdatedCalendar = store.calendars.find((cal, _, arr) => {
        return (
          new Date(cal.updatedAt) >=
          new Date(Math.max(...arr.map((c) => new Date(c.updatedAt).getTime())))
        );
      });

      const newCurrentCalendar = lastUpdatedCalendar || store.calendars[0];
      store.currentCalendarId = newCurrentCalendar.id!;
      store.calendar = structuredClone(newCurrentCalendar);

      ls.setItem('currentCalendarId', newCurrentCalendar.id!);
      calendarNameTitle.textContent = newCurrentCalendar.name;
    } else {
      const draftCalendar = createDraftCalendar();

      store.calendars.push(draftCalendar);
      store.currentCalendarId = draftCalendar.id!;
      store.calendar = structuredClone(draftCalendar);

      ls.setItem('currentCalendarId', draftCalendar.id!);
      calendarNameTitle.textContent = t('untitledCalendar');
    }

    calendarCount.textContent = store.calendars.length.toString();
    Toast.success(
      t('calendarDeleted', {
        calendar_name: calendarName
      }),
      {
        id: 'calendar-deleted'
      }
    );

    colorSelectHeader.value = store.calendar.state.color;
    document.documentElement.style.setProperty(
      '--accent-color-rgb',
      hexToRgb(store.calendar.state.color)
    );

    const foregroundColor = getForegroundColor(store.calendar.state.color);

    document.documentElement.style.setProperty(
      '--accent-text-color',
      foregroundColor
    );
    setFavicon(store.calendar.state.color, foregroundColor);

    resolveCalendarHeader();
    autosaveCurrentCalendar();
    renderUI();
  }
}

calendarDialogBtn.addEventListener('click', () => {
  const submitBtn = calendarDialog.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  )!;
  calendarDialog.querySelector('h3')!.innerHTML = `
    <app-icon name="edit"></app-icon>
    <span>${t('editCalendar')}</span>
  `;

  calendarDialogForm['calendar-name-input'].value = store.calendar?.name;
  calendarDialogForm['start-month'].value =
    `${store.calendar!.state.startYear}-${String(store.calendar!.state.startMonth + 1).padStart(2, '0')}`;
  calendarDialogForm['calendar-title-input'].value =
    store.calendar!.state.calendarTitle;
  calendarDialogForm['calendar-subtitle-input'].value =
    store.calendar!.state.calendarSubtitle;
  calendarDialogForm['color-select'].value = store.calendar!.state.color;
  submitBtn.textContent = t('save');
  submitBtn.value = 'save';

  calendarDialog.showModal();

  calendarDialogForm['calendar-title-input'].focus();
});

document
  .querySelector<HTMLButtonElement>('#delete-calendar-btn')!
  .addEventListener('click', async () => {
    const calendarId = store.currentCalendarId;
    if (!calendarId) return;
    await deleteCalendar(calendarId);
  });

function updateActiveCalendarInList() {
  const calendarItems =
    calendarList.querySelectorAll<HTMLDivElement>('.list-item');

  calendarItems.forEach((item) => {
    console.log(item.dataset.id, store.currentCalendarId);
    item.classList.toggle(
      'active',
      item.dataset.id === store.currentCalendarId
    );
  });
}

function openCalendar(id: string) {
  const selectedCalendar = store.calendars.find((cal) => cal.id === id);

  if (selectedCalendar) {
    store.currentCalendarId = selectedCalendar.id!;
    store.calendar = structuredClone(selectedCalendar);
    ls.setItem('currentCalendarId', selectedCalendar.id!);
    calendarTitleInput.value = store.calendar.state.calendarTitle || '';
    calendarSubtitleInput.value = store.calendar.state.calendarSubtitle || '';
    startMonthInput.value = `${store.calendar.state.startYear}-${String(
      store.calendar.state.startMonth + 1
    ).padStart(2, '0')}`;
    colorSelectHeader.value = store.calendar.state.color;
    colorSelect.value = store.calendar.state.color;
    // document.documentElement.style.setProperty(
    //   '--accent-color-rgb',
    //   hexToRgb(store.calendar.state.color)
    // );
    // document.documentElement.style.setProperty(
    //   '--accent-text-color',
    //   getForegroundColor(store.calendar.state.color)
    // );

    calendarNameTitle.textContent = selectedCalendar.name;

    updateColor();
    setFavicon(
      store.calendar.state.color,
      getForegroundColor(store.calendar.state.color)
    );
    // updateCalendarList();
    resolveCalendarHeader();
    // autosaveCurrentCalendar();
    updateActiveCalendarInList();
    uptdateEventCount();
    renderUI();

    Toast.info(t('calendarOpened', { calendar_name: selectedCalendar.name }), {
      id: 'calendar-opened'
    });
  } else {
    Toast.error(t('calendarNotFound'), { id: 'calendar-not-found' });
  }
}

function resolveCalendarHeader() {
  const headerDiv = document.querySelector<HTMLDivElement>('#calendar-header')!;
  const title = store.calendar?.state.calendarTitle;
  const subtitle = store.calendar?.state.calendarSubtitle;

  headerDiv.innerHTML = '';

  if (title) {
    const h1 = document.createElement('h1');
    h1.id = 'calendar-title';
    h1.textContent = title;
    headerDiv.appendChild(h1);
  }

  if (subtitle) {
    const h2 = document.createElement('h2');
    h2.id = 'calendar-subtitle';
    h2.textContent = subtitle;
    headerDiv.appendChild(h2);
  }

  if (store.calendar) {
    store.calendar.state.calendarTitle = title;
    store.calendar.state.calendarSubtitle = subtitle;
    // autosaveCurrentCalendar();
  }
}

export function sortEventsByStartDate(events: CalendarEvent[]) {
  events.sort((a, b) => {
    const aTime = new Date(a.start).getTime();
    const bTime = new Date(b.start).getTime();
    return aTime - bTime;
  });
}

document
  .querySelector<HTMLSelectElement>('#language-select')!
  .addEventListener('change', (e) => {
    store.language = (e.target as HTMLSelectElement).value as Language;
    ls.setItem('language', store.language);
    applyTranslations();
    renderUI();
  });

document
  .querySelector<HTMLSelectElement>('#theme-select')!
  .addEventListener('change', (e) => {
    store.theme = (e.target as HTMLSelectElement).value as Theme;
    setTheme(store.theme, store.calendar!.state.color);
  });

colorSelectHeader.addEventListener('input', (e) => {
  const theme = document.querySelector<HTMLSelectElement>('#theme-select')!
    .value as Theme;
  store.calendar!.state.color = (e.target as HTMLSelectElement).value;
  setTheme(theme, store.calendar!.state.color);
});

startDateInput.addEventListener('change', (e) => {
  endDateInput.min = (e.target as HTMLInputElement).value;
});

document
  .querySelector<HTMLButtonElement>('#new-calendar-btn')!
  .addEventListener('click', () => {
    openNewCalendarDialog();
  });

document
  .querySelector<HTMLButtonElement>('#manage-calendars-btn')!
  .addEventListener('click', () => {
    calendarsDialog.showModal();
  });

function uptdateEventCount() {
  const eventCountEl = document.querySelector<HTMLSpanElement>('#event-count')!;
  eventCountEl.textContent = store.calendar!.state.events.length.toString();
}

function updateEventList() {
  eventList.innerHTML = '';

  if (store.calendar!.state.events.length === 0) {
    const noEventsEl = document.createElement('div');
    noEventsEl.className = 'empty-list';
    noEventsEl.innerHTML = `
      <div>${t('noEventsFound')}</div>
      <!--button class="btn btn-primary btn-sm" id="add-first-event-btn">
        <app-icon name="new-event"></app-icon>
        <span>${t('newEvent')}</span>
      </button-->
    `;
    eventList.appendChild(noEventsEl);
    return;
  }

  store.calendar!.state.events.forEach((event) => {
    const inRange = isEventInRange(event);
    const div = document.createElement('div');

    div.className = `list-item ${event.type || 'no-activity'}`;
    div.classList.toggle('out-of-range', !inRange);
    div.innerHTML = `
      <span class="list-icon"></span>
      <div class="list-info">
        <h4 class="list-title">${event.title}</h4>
        <div class="list-dates">${formatEventDate(event, true)}</div>
        <div class="list-type">${getEventLegendLabel(event.type || 'no-activity')}${!inRange ? ` • ${t('outOfRange')}` : ''}</div>
      </div>
      <div class="list-actions">
        <button class="btn btn-danger btn-icon btn-delete-event" data-id="${event.id}" title="${t('delete')}">
          <app-icon name="trash"></app-icon>
        </button>
      </div>
    `;
    eventList.appendChild(div);
  });
}

function updateCalendarList() {
  const calendars = structuredClone(store.calendars);

  calendarList.innerHTML = '';

  calendars
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    })
    .forEach((cal) => {
      const calendarListItem = document.createElement('div');
      calendarListItem.className = 'list-item';
      calendarListItem.dataset.id = cal.id;
      calendarListItem.classList.toggle(
        'active',
        cal.id === store.currentCalendarId
      );
      // ${cal.id === store.currentCalendarId ? '✓' : ''}
      calendarListItem.innerHTML = `
      <div class="list-icon" style="background: ${cal.state.color}; color: ${getForegroundColor(cal.state.color)};"></div>
      <div class="list-info">
        <h4 class="list-title">${cal.name}</h4>
        <div class="list-dates">${cal.state.events.length} ${t('events')}</div>
        <div class="list-updated-at">${toHumanReadableDate(new Date(cal.updatedAt), true)}</div>
      </div>
      <div class="list-actions">
        <button class="btn btn-secondary btn-icon btn-open-calendar" data-id="${cal.id}" data-title="open">
          <app-icon name="open-folder"></app-icon>
        </button>
        <button class="btn btn-danger btn-icon btn-delete-calendar" data-id="${cal.id}" data-title="delete">
          <app-icon name="trash"></app-icon>
        </button>
      </div>
    `;
      calendarList.appendChild(calendarListItem);
    });
}

function main() {
  initStore();
  applyTranslations();
  renderUI();
  initExport();
  setupDialogs();
  updateCalendarList();
  updateEventList();
  uptdateEventCount();

  calendarList.addEventListener('click', (e) => {
    const openBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.btn-open-calendar'
    );
    const deleteBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.btn-delete-calendar'
    );

    if (openBtn?.dataset.id) {
      openCalendar(openBtn.dataset.id);
    }

    if (deleteBtn?.dataset.id) {
      deleteCalendar(deleteBtn.dataset.id);
    }
  });

  const color = store.calendar!.state.color;
  const html = document.documentElement;
  let resolvedTheme = store.theme;

  if (store.theme === 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }

  html.setAttribute('data-theme', `${resolvedTheme}`);
  html.style.setProperty('--accent-color-rgb', hexToRgb(color));

  const foregroundColor = getForegroundColor(color);
  html.style.setProperty('--accent-text-color', foregroundColor);
  setFavicon(color, foregroundColor);

  const calendarName = store.calendar?.name;

  if (calendarName) {
    calendarNameTitle.textContent = calendarName;
    calendarNameInput.value = calendarName;
  }
  calendarCount.textContent = store.calendars.length.toString();

  resolveCalendarHeader();

  document.querySelector<HTMLSelectElement>('#theme-select')!.value =
    store.theme;
  colorSelectHeader.value = color;
  colorSelect.value = color;
  document.querySelector<HTMLSelectElement>('#language-select')!.value =
    store.language;

  if (import.meta.env.DEV) {
    window.__INTERNAL__ = {
      state: store
    };
  }
}

main();
