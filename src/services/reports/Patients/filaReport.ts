import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { date } from 'quasar';
import { MOHIMAGELOG } from 'src/assets/imageBytes';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import packService from 'src/services/api/pack/packService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import { fetchFontAsBase64 } from 'src/utils/ReportUtils';
import fontPath from 'src/assets/NotoSans-Regular.ttf';

const { idadeCalculator, idadeReportCalculator } = useDateUtils();
const { isMobile, isOnline } = useSystemUtils();
export default {
  async downloadPDF(
    patient: object,
    patientServiceIdentifier: object,
    loadingPDF: object
  ) {
    const fontBase64 = await fetchFontAsBase64(fontPath);
    const title =
      patientServiceIdentifier.service.code === 'TARV'
        ? 'Ficha Individual de Levantamento de ARVs ( FILA)'
        : patientServiceIdentifier.service.code === 'TPT'
        ? 'Ficha Individual de Levantamento de TPT (FILT)'
        : patientServiceIdentifier.service.code === 'PREP'
        ? 'Ficha Individual de Levantamento de PREP (FILP)'
        : 'Ficha Individual de Levantamento de Medicamento';
    const reportName =
      patientServiceIdentifier.service.code === 'TARV'
        ? 'FILA_'.concat(patientServiceIdentifier.value)
        : patientServiceIdentifier.service.code === 'TPT'
        ? 'FILT_'.concat(patientServiceIdentifier.value)
        : patientServiceIdentifier.service.code === 'PREP'
        ? 'FILP_'.concat(patientServiceIdentifier.value)
        : 'Ficha_Medicamento'.concat(patientServiceIdentifier.value);
    const fileName = reportName.concat(
      '_' + moment(new Date()).format('DD-MM-YYYY')
    );

    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });
    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64.split(',')[1]);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    doc.setProperties({
      title: fileName.concat('.pdf'),
    });
    loadingPDF.value = true;
    const image = new Image();
    // image.src = '/src/assets/MoHLogo.png';
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;
    const width = doc.internal.pageSize.getWidth();
    /*
      Fill Table
    */
    const cols = [
      'Data de Levantamento de ARVs',
      'Medicamentos ARVs',
      'Quantidade Dispensada',
      'Dosagem',
      'Data Prox. Levant.',
    ];

    let rows = [];
    if (isOnline.value && !isMobile.value) {
      await packService
        .apiGetAllByPatientId(patient.id, patientServiceIdentifier.service.code)
        .then((resp) => {
          rows = resp.data;
        });
    } else {
      await patientVisitService
        .apiGetAllPacksByPatientId(
          patient.id,
          patientServiceIdentifier.service.code
        )
        .then((resp) => {
          rows = resp;
        });
    }

    const data = [];
    let saveInicialDate = new Date(1990, 1, 1);
    const unit = 'days';
    for (const row in rows) {
      if (!date.isSameDate(rows[row].pickupDate, saveInicialDate, unit)) {
        saveInicialDate = rows[row].pickupDate;
        const createRow = [];
        createRow.push(moment(rows[row].pickupDate).format('DD-MM-YYYY'));
        createRow.push(
          createDrugArrayOfArrayRow(rows[row].packagedDrugs).join('\n')
        );
        createRow.push(
          createDrugQuantitySuppliedArrayOfArrayRow(
            rows[row].packagedDrugs
          ).join('\n')
        );
        createRow.push(
          createDrugDosageArrayOfArrayRow(rows[row].packagedDrugs).join('\n')
        );
        createRow.push(moment(rows[row].nextPickUpDate).format('DD-MM-YYYY'));

        data.push(createRow);
      }
    }

    const desiredDefinition = [
      [
        {
          content: 'NID:    ' + patientServiceIdentifier.value,
          rowSpan: 4,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Nome:',
          halign: 'left',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        { content: patient.firstNames },
        { content: 'Apelido:' },
        { content: patient.lastNames },
      ],

      [
        { content: 'Idade:' },
        { content: Math.abs(idadeReportCalculator(patient.dateOfBirth)) },
        { content: 'Sexo:' },
        { content: patient.gender },
      ],
      [
        { content: 'Contacto:' },
        {
          content:
            patient.cellphone !== null && patient.cellphone !== undefined
              ? patient.cellphone
              : '',
        },
        { content: 'Endereço:' },
        {
          content:
            patient.address !== null && patient.address !== undefined
              ? patient.address
              : '',
        },
      ],
    ];
    autoTable(
      doc,

      {
        margin: { top: 60 },
        bodyStyles: {
          font: 'NotoSans',
          halign: 'center',
          valign: 'middle',
        },
        headStyles: {
          font: 'NotoSans',
          halign: 'center',
          valign: 'middle',
        },

        theme: 'grid',
        body: desiredDefinition,
      }
    );

    autoTable(doc, {
      margin: { top: 60 },
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
      },
      didDrawPage: function (data) {
        // Header
        doc.setFontSize(10);
        doc.setTextColor(40);
        doc.addImage(image, 'PNG', data.settings.margin.left + 15, 5, 25, 25);
        doc.text('REPÚBLICA DE MOÇAMBIQUE', data.settings.margin.left + 2, 35);
        doc.text('MINISTÉRIO DA SAÚDE', data.settings.margin.left + 7, 40);
        doc.text('SERVIÇO NACIONAL DE SAÚDE', data.settings.margin.left, 45);
        doc.setFontSize(16);
        doc.text(title, width / 2, 40, {
          align: 'center',
        });
      },
      theme: 'grid',
      head: [cols],
      body: data,
    });
    // loadingPDF.value = false;

    if (isOnline.value && !isMobile.value) {
      // return doc.save('PacientesActivos.pdf')
      window.open(doc.output('bloburl'));
      loadingPDF.value = false;
    } else {
      const pdfOutput = doc.output();
      const newFileName = fileName.replace(/\//g, '-');
      DownloadFileMobile.downloadFile(
        newFileName,
        '.pdf',
        pdfOutput,
        loadingPDF
      );
    }

    // return doc.save(fileName.concat('.pdf'));
  },
};
function createDrugArrayOfArrayRow(rows: any) {
  const data = [];

  for (const row in rows) {
    const createRow = [];
    createRow.push(rows[row].drug.name);
    data.push(createRow);
  }

  return data;
}
function createDrugQuantitySuppliedArrayOfArrayRow(rows: any) {
  const data = [];

  for (const row in rows) {
    console.log('RoWWW', rows[row]);
    let qtyInUnit = 'Frasco(s)';

    if (
      rows[row].drug.clinical_service_id !==
      '80A7852B-57DF-4E40-90EC-ABDE8403E01F'
    ) {
      qtyInUnit = rows[row].drug.form.description + '(s)';
    }

    const createRow = [];
    createRow.push(rows[row].quantitySupplied + ' ' + qtyInUnit);
    data.push(createRow);
  }

  return data;
}

function createDrugDosageArrayOfArrayRow(rows: any) {
  const data = [];

  for (const row in rows) {
    const createRow = [];
    createRow.push(
      'Tomar '.concat(
        rows[row].amtPerTime !== 0
          ? rows[row].amtPerTime
          : rows[row].drug.defaultTimes
      ) +
        ' ' +
        rows[row].drug.form.description +
        ' '.concat(
          rows[row].timesPerDay !== 0
            ? rows[row].timesPerDay
            : rows[row].drug.defaultTreatment
        ) +
        ' Vez(es) por '.concat(rows[row].drug.defaultPeriodTreatment)
    );
    data.push(createRow);
  }

  return data;
}
