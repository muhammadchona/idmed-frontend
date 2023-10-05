import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { date } from 'quasar';
import { MOHIMAGELOG } from 'src/assets/imageBytes';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import packService from 'src/services/api/pack/packService';

const { idadeCalculator } = useDateUtils();
export default {
  async downloadPDF(
    patient: object,
    patientServiceIdentifier: object,
    loadingPDF: object
  ) {
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

    const rows = packService.getPacksFromPatientId(patientServiceIdentifier.id);

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
        { content: Math.abs(idadeCalculator(patient.dateOfBirth)) },
        { content: 'Sexo:' },
        { content: patient.gender },
      ],
      [
        { content: 'Contacto:' },
        { content: patient.cellphone },
        { content: 'Endereço:' },
        { content: patient.address },
      ],
    ];
    autoTable(
      doc,

      {
        margin: { top: 60 },
        bodyStyles: {
          halign: 'center',
          valign: 'middle',
        },
        headStyles: {
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
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
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
    loadingPDF.value = false;
    return doc.save(fileName.concat('.pdf'));
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
    const createRow = [];
    createRow.push(rows[row].quantitySupplied + ' Frasco(s)');
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
