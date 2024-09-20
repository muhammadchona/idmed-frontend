import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import { MOHIMAGELOG } from '../../../assets/imageBytes.ts';
import * as ExcelJS from 'exceljs';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import NotSyncronizedPacksToServerService from 'src/services/api/report/mobile/PacksByDrugBottleMobileService';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import PacksByDrugBottleMobileService from 'src/services/api/report/mobile/PacksByDrugBottleMobileService';

const { isMobile, isOnline } = useSystemUtils();

const reportName = 'DispensasPorFrascos';
const logoTitle =
  'REPUBLICA DE MOÇAMBIQUE \n MINISTERIO DA SAÚDE \n SERVIÇO NACIONAL DE SAUDE';
const title = 'Relatorio Estatistico de Dispensas Por Frasco';
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);

const img = new Image();
img.src = 'data:image/png;base64,' + MOHIMAGELOG;

export default {
  async downloadPDF(params: any) {
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      // format: 'a4',
      format: [205, 313],
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default i
    });
    const result = await PacksByDrugBottleMobileService.localDbGetAllByReportId(
      params.id
    );
    console.log(params);
    console.log(result[0]);
    const firstObject = result[0];
    if (result.length === 0) return 204;
    /*
      Fill Table
    */

    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const headerReport = [
      [
        {
          content: 'Relatorio Estatistico de Dispensas Por Frasco',
          styles: { minCellHeight: 25, fontSize: 12, halign: 'center' },
          colSpan: 3,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
        },
      ],
      [
        {
          content: 'Sector Clinic: ' + params.clinic.clinicName,
          colSpan: 2,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Periodo: ' + params.startDate + ' a ' + params.endDate,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
      [
        {
          content: 'Distrito: ' + firstObject.district,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Provincia: ' + firstObject.province,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Ano: ' + firstObject.year,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
    ];

    autoTable(doc, {
      //  margin: { top: 10 },
      bodyStyles: {
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
    doc.text('Republica de Mocambique ', 16, 28);
    doc.text('Ministerio da Saude ', 20, 32);
    doc.text('Serviço Nacional de Saude ', 16, 36);
    doc.addImage(img, 'png', 28, 15, 10, 10);

    const cols = ['Medicamento', 'Total de Frascos Dispensados'];
    const rows = result;
    const data = [];

    for (const row in rows) {
      const createRow = [];

      createRow.push(rows[row].drugName);
      createRow.push(rows[row].bottles_packed);

      data.push(createRow);
    }
    autoTable(doc, {
      bodyStyles: {
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
    const result = await PacksByDrugBottleMobileService.localDbGetAllByReportId(
      params.id
    );
    const rows = result;
    if (result.length === 0) return 204;
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
    colA.width = 70;
    colB.width = 70;

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
        { name: 'Medicamento', totalsRowLabel: 'none', filterButton: false },
        {
          name: 'Total de Frascos Dispensados',
          totalsRowLabel: 'Totals:',
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

    // const titleFile = 'RelatorioDeDispensasNaoSicronizadas';
    // console.log('result' + titleFile);
    DownloadFileMobile.downloadFile(reportName, '.xlsx', blob);
    /*
      saveBlob2File(titleFile, blob);
      function saveBlob2File(fileName, blob) {
        const folder = cordova.file.externalRootDirectory + 'Download';
        //  var folder = 'Download'
        window.resolveLocalFileSystemURL(
          folder,
          function (dirEntry) {
            createFile(dirEntry, fileName, blob);
            // $q.loading.hide()
          },
          onErrorLoadFs
        );
      }
      function createFile(dirEntry, fileName, blob) {
        // Creates a new file
        dirEntry.getFile(
          fileName,
          { create: true, exclusive: false },
          function (fileEntry) {
            writeFile(fileEntry, blob);
          },
          onErrorCreateFile
        );
      }

      function writeFile(fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry
        fileEntry.createWriter(function (fileWriter) {
          fileWriter.onwriteend = function () {
            console.log('Successful file write...');
            openFile();
          };

          fileWriter.onerror = function (error) {
            console.log('Failed file write: ' + error);
          };
          fileWriter.write(dataObj);
        });
      }
      function onErrorLoadFs(error) {
        console.log(error);
      }

      function onErrorCreateFile(error) {
        console.log('errorr: ' + error.toString());
      }
      function openFile() {
        const strTitle = titleFile;
        console.log('file system 44444: ' + strTitle);
        const folder =
          cordova.file.externalRootDirectory + 'Download/' + strTitle;
        console.log('file system 2222: ' + folder);
        const documentURL = decodeURIComponent(folder);
        cordova.plugins.fileOpener2.open(
          documentURL,
          'application/vnd.ms-excel',
          {
            error: function (e) {
              console.log('file system open3333366: ' + e + documentURL);
            },
            success: function () {},
          }
        );
      }
      */
  },
  createArrayOfArrayRow(rows) {
    const data = [];

    for (const row in rows) {
      const createRow = [];

      createRow.push(rows[row].drugName);
      createRow.push(rows[row].bottles_packed);

      data.push(createRow);
    }

    return data;
  },
};
