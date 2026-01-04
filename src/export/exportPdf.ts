export async function exportAsPdf(): Promise<void> {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
    ]);

    const el = document.querySelector('.main-section') as HTMLElement;
    if (!el) return;

    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const scaleX = maxWidth / canvas.width;
    const scaleY = maxHeight / canvas.height;
    const scale = Math.min(scaleX, scaleY);
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;
    const x = (pageWidth - imgWidth) / 2;
    const y = margin;

    pdf.addImage(
        imgData,
        'PNG',
        x,
        y,
        imgWidth,
        imgHeight
    );


    pdf.save('rolling-calendar.pdf');
}
