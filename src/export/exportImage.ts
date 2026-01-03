import html2canvas from 'html2canvas';

export async function exportAsImage(): Promise<void> {
  const el = document.querySelector('.main-section') as HTMLElement;
  if (!el) return;

  const canvas = await html2canvas(el, {
    backgroundColor: null,
    scale: 2
  });

  const link = document.createElement('a');
  link.download = 'rolling-calendar.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
