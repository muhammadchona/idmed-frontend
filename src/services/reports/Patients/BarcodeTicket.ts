import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import { fetchFontAsBase64 } from 'src/utils/ReportUtils';
import fontPath from 'src/assets/NotoSans-Regular.ttf';
const { isMobile, isOnline } = useSystemUtils();
const reportName = 'EtiquetaCodigo';
const logoTitle = 'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE';

const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);

export default {
  async downloadPDF(patientServiceIdentifier, barcodeCanvas) {
    const fontBase64 = await fetchFontAsBase64(fontPath);
    const clinic = clinicService.currClinic();
    const doc = new JsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [75, 55],
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });
    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64.split(',')[1]);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');

    // const totalPagesExp = '{total_pages_count_string}'

    doc.setProperties({
      title: fileName.concat('.png'),
    });

    doc.rect(2, 2, 71, 51); // (x, y, width, height)

    // Get page width
    const pageWidth = doc.internal.pageSize.getWidth();

    // Center-align text dynamically
    function centerText(text, yPosition, fontSize = 8) {
      doc.setFontSize(fontSize);
      const textWidth = doc.getTextWidth(text);
      const centerX = (pageWidth - textWidth) / 2;
      doc.text(text, centerX, yPosition);
    }

    // Title (Republic & Ministry)
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    // doc.text('REPÚBLICA DE MOÇAMBIQUE', 10, 10);
    // doc.text('MINISTÉRIO DA SAÚDE', 17, 15);

    centerText('REPÚBLICA DE MOÇAMBIQUE', 10, 8);
    centerText('MINISTÉRIO DA SAÚDE', 15, 8);

    doc.line(3, 18, 72, 18);

    doc.setFont('times', 'bold');
    doc.setFontSize(7);
    doc.text('Província:', 4, 23);
    doc.text('Distrito:', 4, 28);
    doc.text('Unidade Sanitária:', 4, 33);

    doc.setFont('times', 'normal');
    doc.text(clinic.province.description, 18, 23);
    doc.text(clinic.district.description, 18, 28);
    doc.text(clinic.clinicName, 25, 33);

    doc.line(4, 35, 70, 35);

    doc.setFont('times', 'bold');
    doc.text('NID:', 4, 38);
    doc.setFont('times', 'normal');
    doc.text(patientServiceIdentifier.value, 12, 38);

    // Draw another separator line
    doc.line(4, 40, 72, 40);

    const canvas = barcodeCanvas;
    const imgData = canvas.toDataURL('image/png'); // Convert the canvas to an image

    doc.addImage(imgData, 'PNG', 10, 42, 55, 10); // Position and size of the image on the PDF
    // doc.addImage(imgData, 'PNG', 0, 0, 80, 80);

    if (isOnline.value && !isMobile.value) {
      // return doc.save('PacientesActivos.pdf')
      window.open(doc.output('bloburl'));
      //  loading.value = false;
    } else {
      const pdfOutput = doc.output();
      DownloadFileMobile.downloadFile(fileName, '.png', pdfOutput, false);
    }
    // params.value.loading.loading.hide()
    // return doc.save('HistoricoDeLevantamento.pdf')

    // params.value.loading.loading.hide()
  },
};
