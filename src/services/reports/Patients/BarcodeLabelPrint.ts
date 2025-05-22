import JsPDF from 'jspdf';
import moment from 'moment';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import JsBarcode from 'jsbarcode';
const { isMobile, isOnline } = useSystemUtils();
const reportName = 'paciente_barcode';

const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);

export default {
  async downloadPDF(nid, province, district, healthUnit, loading) {
    const doc = new JsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [60, 70], // 60mm width, 70mm height to match ZPL dimensions
    });

    doc.setFont('helvetica', 'bold');

    // Header text - centered
    doc.setFontSize(10);
    doc.text('REPUBLICA DE MOCAMBIQUE', 30, 6, { align: 'center' });
    doc.text('MINISTERIO DA SAUDE', 30, 11, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Provincia: ${province}`, 3, 20);
    doc.text(`Distrito: ${district}`, 3, 25);
    doc.text(`Unidade Sanitaria: ${healthUnit}`, 3, 30);
    doc.text(`NID: ${nid}`, 3, 35);

    try {
      doc.setFontSize(12);
      doc.text(nid, 30, 45, { align: 'center' });

      const canvas = document.createElement('canvas');

      // Generate barcode on the canvas
      JsBarcode(canvas, nid, {
        format: 'CODE128', // Common barcode format
        width: 2, // Bar width
        height: 40, // Bar height
        displayValue: false, // Show text below barcode
        fontSize: 8, // Size of text below barcode
        margin: 0, // Margins
        background: '#ffffff',
        lineColor: '#000000',
      });

      const imgData = canvas.toDataURL('image/png');
      const barcodeWidth = 50; // Width in mm
      const barcodeHeight = 20; // Height in mm
      const barcodeX = (60 - barcodeWidth) / 2; // Center horizontally
      doc.addImage(imgData, 'PNG', barcodeX, 40, barcodeWidth, barcodeHeight);
    } catch (error) {
      console.error('Error generating barcode:', error);
    }

    if (isOnline.value && !isMobile.value) {
      // return doc.save('PacientesActivos.pdf')
      doc.save(`paciente_barcode_${nid}.pdf`);
      loading.value = false;
    } else {
      const pdfOutput = doc.output();
      DownloadFileMobile.downloadFile(fileName, '.pdf', pdfOutput, loading);
    }

    // doc.save(`paciente_barcode_${nid}.pdf`);
  },
};
