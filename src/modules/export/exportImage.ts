import { getFileName } from './utils';

export async function exportAsImage(): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');

  const el = document.querySelector('.main-section') as HTMLElement;
  if (!el) return;

  const canvas = await html2canvas(el, {
    backgroundColor: '#FFFFFF',
    scale: 2
  });

  const link = document.createElement('a');
  link.download = `${getFileName()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
