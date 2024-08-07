import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import { MOHIMAGELOG } from '../../../assets/imageBytes.ts';
import * as ExcelJS from 'exceljs';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import PatientsWithScreeningMobileService from 'src/services/api/report/mobile/PatientsWithScreeningMobileService.js';
import { fetchFontAsBase64 } from 'src/utils/ReportUtils';
const { isMobile, isOnline } = useSystemUtils();

const reportName = 'RelatorioRastreioDeGravidez';
const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title = 'Relatorio Estatistico de Dispensas Por Frasco';
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);

const img = new Image();
img.src = 'data:image/png;base64,' + MOHIMAGELOG;
const fontPath = '/src/assets/NotoSans-Regular.ttf';
export default {
  async downloadPDF(params: any) {
    const fontBase64 = await fetchFontAsBase64(fontPath);
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      // format: 'a4',
      format: [205, 313],
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default i
    });
    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64.split(',')[1]);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    const result =
      await PatientsWithScreeningMobileService.localDbGetAllByReportId(
        params.id
      );

    const firstObject = result[0];
    /*
      Fill Table
    */

    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const headerReport = [
      [
        {
          content: 'Relatorio de Pacientes Rastreados Para Gravidez',
          styles: { minCellHeight: 25, fontSize: 12, halign: 'center' },
          colSpan: 3,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
        },
      ],
      [
        {
          content: 'Clinica/Sector: ' + params.clinic.clinicName,
          colSpan: 2,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Período: ' + params.startDate + ' a ' + params.endDate,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
    ];

    autoTable(doc, {
      //  margin: { top: 10 },
      bodyStyles: {
        font: 'NotoSans',
        halign: 'left',
        valign: 'middle',
        fontSize: 8,
      },
      headStyles: {
        halign: 'left',
        valign: 'middle',
      },
      theme: 'grid',
      body: headerReport,
    });

    doc.setFontSize(8);
    doc.text('República de Moçambique ', 16, 28);
    doc.text('Ministério da Saúde ', 20, 32);
    doc.text('Serviço Nacional de Saúde', 16, 36);
    doc.addImage(img, 'png', 28, 15, 10, 10);

    const cols = [
      'NID',
      'Nome',
      'Genero',
      'Idade',
      'Data da Consulta',
      'Gravida',
      'Unidade Sanitária',
    ];
    const rows = result;
    // const data = [];

    const data = this.createArrayOfArrayRow(rows);
    autoTable(doc, {
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 8,
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50 },
      },
      didDrawPage: function (data) {
        const str = 'Página ' + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();
        doc.text(str, data.settings.margin.right, pageHeight - 10);
      },
      startY: doc.lastAutoTable.finalY,
      theme: 'grid',
      head: [cols],
      body: data,
    });
    // return doc.save('HistoricoDeLevantamento.pdf')
    // window.open(doc.output('bloburl'));
    console.log(doc);
    const pdfOutput = doc.output();
    DownloadFileMobile.downloadFile(fileName, '.pdf', pdfOutput);
  },
  async downloadExcel(params: any) {
    const result =
      await PatientsWithScreeningMobileService.localDbGetAllByReportId(
        params.id
      );
    const rows = result;
    const data = this.createArrayOfArrayRow(rows);
    console.log(data);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FGH';
    workbook.lastModifiedBy = 'FGH';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    // Force workbook calculation on load
    // workbook.calcProperties.fullCalcOnLoad = true
    const worksheet = workbook.addWorksheet(reportName);
    const imageId = workbook.addImage({
      base64: 'data:image/pngbase64,' + MOHIMAGELOG,
      extension: 'png',
    });

    // Get Cells
    const cellRepublica = worksheet.getCell('A8');
    const cellTitle = worksheet.getCell('A9');
    const cellPharm = worksheet.getCell('A11');
    const cellDistrict = worksheet.getCell('A12');
    const cellProvince = worksheet.getCell('E12');
    const cellStartDate = worksheet.getCell('L11');
    const cellEndDate = worksheet.getCell('L12');
    const cellPharmParamValue = worksheet.getCell('B11');
    const cellDistrictParamValue = worksheet.getCell('B12');
    const cellProvinceParamValue = worksheet.getCell('F12');
    const cellStartDateParamValue = worksheet.getCell('M11');
    const cellEndDateParamValue = worksheet.getCell('M12');

    // Get Rows
    const headerRow = worksheet.getRow(15);

    // Get Columns
    const colA = worksheet.getColumn('A');
    const colB = worksheet.getColumn('B');
    const colC = worksheet.getColumn('C');
    const colD = worksheet.getColumn('D');
    const colE = worksheet.getColumn('E');
    const colF = worksheet.getColumn('F');
    const colG = worksheet.getColumn('G');
    const colH = worksheet.getColumn('H');
    const colI = worksheet.getColumn('I');
    const colJ = worksheet.getColumn('J');
    const colK = worksheet.getColumn('K');

    // Format Table Cells
    // Alignment Format
    cellRepublica.alignment =
      cellTitle.alignment =
      headerRow.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };

    cellPharm.alignment =
      cellDistrict.alignment =
      cellProvince.alignment =
      cellStartDate.alignment =
      cellEndDate.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false,
        };

    // Border Format
    cellRepublica.border =
      cellTitle.border =
      cellPharm.border =
      cellDistrictParamValue.border =
      cellDistrict.border =
      cellPharmParamValue.border =
      cellProvince.border =
      cellProvinceParamValue.border =
      cellStartDate.border =
      cellStartDateParamValue.border =
      cellEndDate.border =
      cellEndDateParamValue.border =
        {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

    // Assign Value to Cell
    cellRepublica.value = logoTitle;
    cellTitle.value = title;
    cellPharmParamValue.value = result[0].clinic;
    cellProvinceParamValue.value = '';
    cellDistrictParamValue.value = result[0].district;
    cellStartDateParamValue.value = params.startDate;
    cellEndDateParamValue.value = params.endDate;
    cellPharm.value = 'Unidade Sanitária';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';

    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:M10');
    worksheet.mergeCells('B11:K11');
    worksheet.mergeCells('B12:D12');
    worksheet.mergeCells('F12:K12');
    worksheet.mergeCells('A13:K13');

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;

    // add height size to Columns
    // add width size to Columns
    colA.width = 20;
    colB.width = 20;
    colC.width = 30;
    colD.width = 10;
    colE.width = 15;
    colF.width = 20;
    colG.width = 20;
    colH.width = 20;
    colI.width = 20;
    colJ.width = 20;
    colK.width = 20;

    // Add Style
    // cellTitle.font =
    cellDistrict.font =
      cellProvince.font =
      cellStartDate.font =
      cellEndDate.font =
      cellPharm.font =
        {
          name: 'Arial',
          family: 2,
          size: 11,
          italic: false,
          bold: true,
        };

    // Add Image
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 144, height: 98 },
    });

    // Cereate Table
    worksheet.addTable({
      name: reportName,
      ref: 'A14',
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'NID', totalsRowLabel: 'none', filterButton: false },
        { name: 'Nome', totalsRowFunction: 'none', filterButton: false },
        { name: 'Genero', totalsRowFunction: 'none', filterButton: false },
        {
          name: 'Idade',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Data da Consulta',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Gravida',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Unidade Sanitaria',
          totalsRowFunction: 'none',
          filterButton: false,
        },
      ],
      rows: data,
    });

    // Format all data cells
    const lastRowNum =
      worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0;
    const lastTableRowNum = lastRowNum;

    // Loop through all table's row
    for (let i = 14; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i);

      // Now loop through every row's cell and finally set alignment
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        if (i === 14) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1fa37b' },
            bgColor: { argb: '1fa37b' },
          };
          cell.font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 11,
            italic: false,
            bold: true,
          };
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';

    const blob = new Blob([buffer], { type: fileType });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
    } else {
      const titleFile = 'RelatorioRastreioDeGravidez';
      console.log('result' + titleFile);
      DownloadFileMobile.downloadFile(titleFile, '.xlsx', blob);
    }
  },
  createArrayOfArrayRow(rows: []) {
    const data = [];

    for (const row in rows) {
      const createRow = [];
      createRow.push(rows[row].nid);
      createRow.push(
        String(
          rows[row].firstNames +
            ' ' +
            rows[row].middleNames +
            ' ' +
            rows[row].lastNames
        )
          .replaceAll('null', '')
          .replace('  ', ' ')
      );
      createRow.push(rows[row].gender);
      createRow.push(rows[row].age);
      createRow.push(
        moment(new Date(rows[row].visitDate)).format('DD-MM-YYYY')
      );
      createRow.push(rows[row].isPregnant);
      createRow.push(rows[row].clinic.clinicName);

      data.push(createRow);
    }

    return data;
  },
};
