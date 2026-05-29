// Import libraries via CDN (add these to your <head> before script.js)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

document.getElementById('download').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const section = document.querySelector('.section');
    const btn = document.getElementById('download');

    // Hide button during capture so it doesn't appear in the PDF
    btn.style.display = 'none';

    try {
        const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            windowWidth: section.scrollWidth,
            windowHeight: section.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(
            imgData,
            'PNG',
            0,
            0,
            canvas.width,
            canvas.height
        );

        pdf.save('echo-invoice.pdf');
    } finally {
        btn.style.display = ''; // restore button regardless of success/failure
    }
});