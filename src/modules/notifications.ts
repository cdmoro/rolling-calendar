import type { InternalNotification, NotifyOptions, NotifyType } from "../types/app";

const DEFAULT_DURATION = 3000;

let container: HTMLDivElement | null = null;
const active = new Map<string, InternalNotification>();

/* ---------- public API ---------- */

export function notify(
  message: string,
  options: NotifyOptions = {}
): void {
  ensureContainer();

  const {
    type = 'info',
    duration = DEFAULT_DURATION,
    dismissible = true,
    id
  } = options;

  if (id && active.has(id)) return;

  const notifId = id ?? crypto.randomUUID();
  const el = createNotificationElement(message, type, dismissible);

  container!.appendChild(el);

  const entry: InternalNotification = { id: notifId, element: el };
  active.set(notifId, entry);

  // Auto dismiss
  if (duration > 0) {
    entry.timeout = window.setTimeout(() => {
      removeNotification(notifId);
    }, duration);
  }
}

/* ---------- helpers ---------- */

function ensureContainer() {
  if (container) return;

  container = document.createElement('div');
  container.className = 'notifications';
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'true');

  document.body.appendChild(container);
}

function createNotificationElement(
  message: string,
  type: NotifyType,
  dismissible: boolean
): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `notification notification--${type}`;
  el.role = 'status';

  const text = document.createElement('div');
  text.className = 'notification__message';
  text.textContent = message;

  el.appendChild(text);

  if (dismissible) {
    const btn = document.createElement('button');
    btn.className = 'notification__close';
    btn.type = 'button';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => {
      removeNotificationByElement(el);
    });
    el.appendChild(btn);
  }

  requestAnimationFrame(() => {
    el.classList.add('is-visible');
  });

  return el;
}

function removeNotification(id: string) {
  const notif = active.get(id);
  if (!notif) return;

  notif.element.classList.remove('is-visible');

  notif.element.addEventListener(
    'transitionend',
    () => notif.element.remove(),
    { once: true }
  );

  if (notif.timeout) {
    clearTimeout(notif.timeout);
  }

  active.delete(id);
}

function removeNotificationByElement(el: HTMLElement) {
  const entry = [...active.values()].find(n => n.element === el);
  if (entry) {
    removeNotification(entry.id);
  }
}
