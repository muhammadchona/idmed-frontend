import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import Report from 'src/services/api/report/ReportService';
import UsedStockMobileService from 'src/services/api/report/mobile/UsedStockMobileService.';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';
import { fetchFontAsBase64 } from 'src/utils/ReportUtils';
import fontPath from 'src/assets/NotoSans-Regular.ttf';
const { isOnline, isMobile } = useSystemUtils();

const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title = 'Lista de Stock Usado';
const reportName = 'ListaDeStockUsado';
const fileName = reportName.concat('_' + Report.getFormatDDMMYYYY(new Date()));

const image = new Image();
// image.src = '/src/assets/MoHLogo.png'
image.src = 'data:image/png;base64,' + MOHIMAGELOG;

export default {
  async downloadPDF(id, fileType, params) {
    const fontBase64 = await fetchFontAsBase64(fontPath);
    console.log(params);
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });
    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64.split(',')[1]);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    const width = doc.internal.pageSize.getWidth();
    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const clinic = clinicService.getById(params.clinicId);

    const headerReport = [
      [
        {
          content: 'Lista de Stock Usado',
          styles: { minCellHeight: 25, fontSize: 16, halign: 'center' },
          colSpan: 3,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
        },
      ],
      [
        {
          content: 'Unidade Sanitária: ' + clinic.clinicName,
          colSpan: 2,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content:
            'Período: ' + params.startDateParam + ' à ' + params.endDateParam,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
      [
        {
          content:
            'Distrito: ' +
            (params.district === null
              ? clinic.district.description
              : params.district.description),
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content:
            'Província: ' +
            (params.province === null
              ? clinic.province.description
              : params.province.description),
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Ano: ' + params.year,
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
        font: 'NotoSans',
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
    doc.text('Serviço Nacional de Saúde ', 16, 36);
    doc.addImage(image, 'png', 28, 15, 10, 10);

    const cols = [
      'Medicamento',
      'FNM',
      'Saldo',
      'Recebidos',
      'Saídas',
      'Ajustes',
      'Stock Actual',
    ];

    let data = [];
    if (isOnline.value) {
      const rowsAux = await Report.printReport(
        'usedStockReportTemp',
        id,
        fileType
      );
      if (rowsAux.status === 204 || rowsAux.data.length === 0) return 204;
      const firstReg = rowsAux.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      data = this.createArrayOfArrayRow(rowsAux.data);
    } else {
      const dataAux = await UsedStockMobileService.localDbGetAllByReportId(id);

      if (dataAux.length === 0) return 204;
      params.startDateParam = Report.getFormatDDMMYYYY(dataAux[0].startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(dataAux[0].endDate);
      data = this.createArrayOfArrayRow(dataAux);
    }
    autoTable(doc, {
      bodyStyles: {
        halign: 'center',
        fontSize: 8,
        font: 'NotoSans',
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
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

    if (isOnline.value && !isMobile.value) {
      // return doc.save(fileName.concat('.pdf'));
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output();
      this.downloadFile(fileName, '.pdf', pdfOutput);
    }
  },

  async downloadExcel(id, fileType2, params) {
    const clinic = clinicService.getById(params.clinicId);
    let data = [];
    if (isOnline.value) {
      const rows = await Report.printReport(
        'usedStockReportTemp',
        id,
        fileType2
      );
      if (rows.status === 204 || rows.data.length === 0) return 204;
      const firstReg = rows.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      data = this.createArrayOfArrayRow(rows.data);
    } else {
      const dataAux = await UsedStockMobileService.localDbGetAllByReportId(id);
      if (dataAux === undefined || dataAux.length === 0) return 204;
      data = this.createArrayOfArrayRow(dataAux);
    }

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
    const cellProvince = worksheet.getCell('D12');
    const cellStartDate = worksheet.getCell('F11');
    const cellEndDate = worksheet.getCell('F12');
    const cellPharmParamValue = worksheet.getCell('B11');
    const cellDistrictParamValue = worksheet.getCell('B12');
    const cellProvinceParamValue = worksheet.getCell('E12');
    const cellStartDateParamValue = worksheet.getCell('G11');
    const cellEndDateParamValue = worksheet.getCell('G12');
    // Get Rows
    const headerRow = worksheet.getRow(14);
    // Get Columns
    const colA = worksheet.getColumn('A');
    const colB = worksheet.getColumn('B');
    const colC = worksheet.getColumn('C');
    const colD = worksheet.getColumn('D');
    const colE = worksheet.getColumn('E');
    const colF = worksheet.getColumn('F');
    const colG = worksheet.getColumn('G');
    const colH = worksheet.getColumn('H');
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
    cellPharmParamValue.value =
      params.clinic !== null ? params.clinic.clinicName : clinic.clinicName;
    cellProvinceParamValue.value =
      params.province !== null
        ? params.province.description
        : clinic.province.description;
    cellDistrictParamValue.value =
      params.district !== null
        ? params.district.description
        : clinic.district.description;
    cellStartDateParamValue.value = params.startDateParam;
    cellEndDateParamValue.value = params.endDateParam;
    cellPharm.value = 'Farmácia';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';
    // merge a range of cells
    worksheet.mergeCells('A1:A7');
    worksheet.mergeCells('A9:G9');
    worksheet.mergeCells('B11:E11');
    worksheet.mergeCells('B12:C12');
    // worksheet.mergeCells('E12:F12')
    worksheet.mergeCells('A13:G13');
    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;
    // add height size to Columns
    // add width size to Columns
    colA.width = 60;
    colB.width = 30;
    colC.width = 15;
    colD.width = 15;
    colE.width = 15;
    colF.width = 15;
    colG.width = 15;
    colH.width = 15;

    // Add Style
    cellTitle.font =
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
        { name: 'Medicamento', filterButton: false },
        { name: 'FNM', filterButton: false },
        {
          name: 'Saldo',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Recebidos',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Saídas',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Ajustes',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Stock Actual',
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
      row.height = 30;
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
      //   var blob = new Blob(materialEducativo.blop)
      //  const bytes = new Uint8Array(materialEducativo.blop)
      // var UTF8_STR = new Uint8Array(pdfOutput)
      //   var BINARY_ARR = UTF8_STR.buffer
      const titleFile = 'STockUsado.xlsx';
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
    }
  },
  createArrayOfArrayRow(rows) {
    const data = [];
    for (const row in rows) {
      const createRow = [];
      createRow.push(rows[row].drugName);
      createRow.push(rows[row].fnName);
      createRow.push(Number(rows[row].actualStock));
      createRow.push(rows[row].receivedStock);
      createRow.push(rows[row].stockIssued);
      createRow.push(rows[row].adjustment);
      createRow.push(
        rows[row].actualStock +
          Number(rows[row].receivedStock) -
          Number(rows[row].stockIssued) -
          Number(rows[row].adjustment)
      );
      data.push(createRow);
    }
    return data;
  },
  downloadFile(fileName, fileType, blop) {
    // console.log(blop)
    // var pdfOutput = blop.output()
    //  console.log(pdfOutput)
    //  if (typeof cordova !== 'undefined') {
    //   var blob = new Blob(materialEducativo.blop)
    //  const bytes = new Uint8Array(materialEducativo.blop)
    // var UTF8_STR = new Uint8Array(pdfOutput)
    //   var BINARY_ARR = UTF8_STR.buffer
    const titleFile = fileName + fileType;
    console.log('result' + titleFile);
    saveBlob2File(titleFile, blop);
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
      cordova.plugins.fileOpener2.open(documentURL, 'application/pdf', {
        error: function (e) {
          console.log('file system open3333366: ' + e + documentURL);
        },
        success: function () {},
      });
    }
    // }
  },
};
