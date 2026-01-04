import { exportAsImage } from './exportImage';
import { exportAsPdf } from './exportPdf';
import { exportAsIcs } from './exportIcs';

function getExportTheme(current?: string): string {
  if (!current) return 'light';

  if (current === 'dark') return 'light';

  if (current.startsWith('dark-')) {
    return current.replace(/^dark-/, 'light-');
  }

  return current;
}

async function withExportTheme(fn: () => Promise<void>) {
  document.documentElement.classList.add('exporting');
  const html = document.documentElement;
  const prevTheme = html.dataset.theme;

  html.dataset.theme = getExportTheme(prevTheme);

  try {
    await fn();
  } finally {
    if (prevTheme) {
      html.dataset.theme = prevTheme;
    } else {
      delete html.dataset.theme;
    }

    document.documentElement.classList.remove('exporting');
  }
}

async function exportPdfWithTheme() {
  await withExportTheme(async () => {
    await exportAsPdf();
  });
}

async function exportImageWithTheme() {
  await withExportTheme(async () => {
    await exportAsImage();
  });
}

export function initExport() {
  document
    .getElementById('export-pdf')
    ?.addEventListener('click', exportPdfWithTheme);

  document
    .getElementById('export-image')
    ?.addEventListener('click', exportImageWithTheme);
  document.getElementById('export-ics')?.addEventListener('click', exportAsIcs);
}
