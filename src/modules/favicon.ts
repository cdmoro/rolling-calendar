import { store } from '../store';

export function setFavicon(color: string, foregroundColor: string) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.fillStyle = foregroundColor;
  ctx.font = 'bold 36px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const firstLetter = store.calendar
    ? store.calendar.name.charAt(0).toUpperCase()
    : ' ';
  ctx.fillText(firstLetter, size / 2, size / 2);

  const url = canvas.toDataURL('image/png');

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.href = url;

  let meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }

  meta.content = color;
}
