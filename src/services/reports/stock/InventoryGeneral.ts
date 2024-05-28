import JsPDF from 'jspdf';
import autoTable, { Column } from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import * as ExcelJS from 'exceljs';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';

const { isMobile, isOnline } = useSystemUtils();
const reportName = 'RelatorioInventarioGeral';
const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title = 'Relatorio de Inventario Geral';
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);

export default {
  async generateSubreport() {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add content to the subreport
    doc.text('This is a subreport PDF', 10, 10);

    // Return the generated PDF document
    return doc;
  },

  async downloadPDF(province, startDate, endDate, result) {
    const clinic = clinicService.currClinic();
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });
    const firstObject = result[0];

    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const image = new Image();
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;

    const headerReport = [
      [
        {
          content: 'Relatorio de Inventario Geral',
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
            'Período: ' +
            moment(startDate).format('DD-MM-YYYY') +
            ' à ' +
            moment(endDate).format('DD-MM-YYYY'),
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
          content: 'Província: ' + province,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Ano: ' + moment(endDate).year(),
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
    ];

    autoTable(doc, {
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
    doc.text('República de Moçambique ', 16, 28);
    doc.text('Ministério da Saúde ', 20, 32);
    doc.text('Serviço Nacional de Saúde ', 16, 36);
    doc.addImage(image, 'png', 28, 15, 10, 10);

    const cols = [
      'Ordem',
      'Lote',
      'Data do ajuste',
      'Saldo Inicial',
      'Frascos Contados',
      'Notas',
    ];

    const rows = result;

    let ord = 1;

    for (let i = 0; i < rows.length; i++) {
      const data = [];
      const data1 = [[rows[i].drugName]];
      autoTable(doc, {
        bodyStyles: {
          halign: 'left',
          fontSize: 10,
          fontStyle: 'bold',
        },
        body: data1,
      });

      ord = 1;
      const rowsAux = rows[i].adjustments;
      for (const row in rowsAux) {
        const createRow = [];
        createRow.push(ord);
        createRow.push(rowsAux[row].batchNumber);
        createRow.push(
          moment(new Date(rowsAux[row].captureDate)).format('DD-MM-YYYY')
        );
        createRow.push(rowsAux[row].balance);
        createRow.push(rowsAux[row].adjustedValue);
        createRow.push(rowsAux[row].notes);

        data.push(createRow);
        ord += 1;
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
        didDrawPage: function (data) {
          const str = 'Página ' + doc.internal.getNumberOfPages();
          doc.setFontSize(8);
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

      const resumoAdjustments = [
        [
          {
            content: 'Saldo Actual ',
            styles: {
              halign: 'left',
              valign: 'middle',
              fontStyle: 'bold',
              fontSize: '8',
              textColor: 0,
            },
            ColumnWidth: 10,
          },
          {
            content: rows[i].totalAdjustedValue,
            styles: {
              halign: 'center',
              valign: 'middle',
              fontStyle: 'bold',
              fontSize: '8',
              textColor: 0,
            },
            ColumnWidth: 20,
          },
        ],
        [
          {
            content: 'Saldo Inicial',
            styles: {
              halign: 'left',
              valign: 'middle',
              fontStyle: 'bold',
              fontSize: '8',
              textColor: 0,
            },
            ColumnWidth: 10,
          },
          {
            content: rows[i].totalBalance,
            styles: {
              halign: 'center',
              valign: 'middle',
              fontStyle: 'bold',
              fontSize: '8',
              textColor: 0,
            },
            ColumnWidth: 20,
          },
        ],
        [
          {
            content: 'Variação para o Med. ',
            styles: {
              halign: 'left',
              valign: 'middle',
              fontStyle: 'bold',
              fontSize: '8',
              textColor: 0,
            },
            cellWidth: 10,
          },
          {
            content: rows[i].totalAdjustedValue - rows[i].totalBalance,
            styles: {
              halign: 'center',
              valign: 'middle',
              fontStyle: 'bold',
              fontSize: '10',
              textColor: 0,
            },
            cellWidth: 20,
          },
        ],
      ];

      autoTable(doc, {
        headStyles: {
          halign: 'center',
        },
        theme: 'grid',
        head: [['Totais', 'Valor']],
        body: resumoAdjustments,
        startY: doc.lastAutoTable.finalY,
        tableWidth: 84,
      });
    }

    if (isOnline.value && !isMobile.value) {
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output();
      this.downloadFile(fileName, 'pdf', pdfOutput);
    }

  },
  async downloadExcel(province, startDate, endDate, result) {
    const clinic = clinicService.currClinic();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CSAUDE';
    workbook.lastModifiedBy = 'CSAUDE';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet(reportName);
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,' + MOHIMAGELOG,
      extension: 'png',
    });

    // Get Cells
    const cellRepublica = worksheet.getCell('A8');
    const cellTitle = worksheet.getCell('A9');
    const cellPharm = worksheet.getCell('A11');
    const cellDistrict = worksheet.getCell('A12');
    const cellProvince = worksheet.getCell('C12');
    const cellStartDate = worksheet.getCell('E11');
    const cellEndDate = worksheet.getCell('E12');
    const cellPharmParamValue = worksheet.getCell('B11');
    const cellDistrictParamValue = worksheet.getCell('B12');
    const cellProvinceParamValue = worksheet.getCell('D12');
    const cellStartDateParamValue = worksheet.getCell('F11');
    const cellEndDateParamValue = worksheet.getCell('F12');

    // Get Rows
    const headerRow = worksheet.getRow(15);

    // Get Columns
    const colA = worksheet.getColumn('A');
    const colB = worksheet.getColumn('B');
    const colC = worksheet.getColumn('C');
    const colD = worksheet.getColumn('D');
    const colE = worksheet.getColumn('E');
    const colF = worksheet.getColumn('F');

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
    cellProvinceParamValue.value = province;
    cellDistrictParamValue.value = result[0].district;
    cellStartDateParamValue.value = moment(startDate).format('DD-MM-YYYY');
    cellEndDateParamValue.value = moment(endDate).format('DD-MM-YYYY');
    cellPharm.value = 'Unidade Sanitária';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';

    // merge a range of cells
    worksheet.mergeCells('A9:F10');
    worksheet.mergeCells('A15:F15');

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;

    // add height size to Columns
    // add width size to Columns
    colA.width = 35;
    colB.width = 20;
    colC.width = 20;
    colD.width = 20;
    colE.width = 20;
    colF.width = 30;

    // Add Style
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
    const cell = worksheet.getCell('A15');
    cell.value = 'Medicamento';
    const rowsAux = result;

    cell.font = {
      name: 'Arial',
      family: 2,
      size: 11,
      italic: false,
      bold: true,
    };

    for (let i = 0; i < rowsAux.length; i++) {
      const lastRowNum =
        worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0;
      const lastTableRowNum = lastRowNum;

      const rows = rowsAux[i].adjustments;
      const data = this.createArrayOfArrayRow(rows);
      const refTable = i === 0 ? 'A17' : 'A' + Number(lastRowNum + 2);

      if (i === 0) {
        const cell1 = worksheet.getCell('A16');
        cell1.value = rowsAux[i].drugName;
        worksheet.mergeCells('A16:F16');
        cell1.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false,
        };
      } else {
        const rowNumber = Number(lastRowNum + 1);
        const cell2 = worksheet.getCell('A' + Number(rowNumber));
        cell2.value = rowsAux[i].drugName;
        worksheet.mergeCells('A' + rowNumber + ' : F' + rowNumber);
        cell2.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false,
        };
      }

      // Cereate Table
      worksheet.addTable({
        name: reportName,
        ref: refTable,
        headerRow: true,
        totalsRow: false,
        style: {
          showRowStripes: false,
        },

        columns: [
          { name: 'Ordem', totalsRowLabel: 'none', filterButton: false },
          {
            name: 'Lote',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Data do ajuste',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Saldo Inicial',
            totalsRowFunction: 'none',
            filterButton: false,
          },

          {
            name: 'Frascos Contados',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Notas',
            totalsRowFunction: 'none',
            filterButton: false,
          },
        ],
        rows: data,
      });

      // Format all data cells

      for (let i = 14; i <= lastTableRowNum + 1; i++) {
        const row = worksheet.getRow(i);

        // Now loop through every row's cell and finally set alignment
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      // Loop through all table's row
      for (let i = lastRowNum; i <= lastTableRowNum; i++) {
        const row = worksheet.getRow(i + 1);
        const secondRow = worksheet.getRow(i + 2);
        secondRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'dedfe0' },
            bgColor: { argb: 'dedfe0' },
          };
          cell.font = {
            name: 'Arial',
            family: 2,
            size: 11,
            italic: false,
            bold: true,
          };
        });

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

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4b4c4d' },
            bgColor: { argb: '4b4c4d' },
          };
          cell.font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 11,
            italic: false,
            bold: true,
          };
        });
      }

      const cellTotalContadosLabel = worksheet.getCell(
        'A' + Number(lastRowNum + rows.length + 3)
      );
      cellTotalContadosLabel.value = 'Saldo Actual';

      const cellTotalContadosValue = worksheet.getCell(
        'B' + Number(lastRowNum + rows.length + 3)
      );
      cellTotalContadosValue.value = rowsAux[i].totalAdjustedValue;

      const cellTotalSaldoLabel = worksheet.getCell(
        'A' + Number(lastRowNum + rows.length + 4)
      );
      cellTotalSaldoLabel.value = 'Saldo Inicial';

      const cellTotalSaldoValue = worksheet.getCell(
        'B' + Number(lastRowNum + rows.length + 4)
      );
      cellTotalSaldoValue.value = rowsAux[i].totalBalance;

      const cellVarLabel = worksheet.getCell(
        'A' + Number(lastRowNum + rows.length + 5)
      );
      cellVarLabel.value = 'Total de Variação para o Med.  ';

      const cellVarValue = worksheet.getCell(
        'B' + Number(lastRowNum + rows.length + 5)
      );
      cellVarValue.value =
        Number(rowsAux[i].totalAdjustedValue) - Number(rowsAux[i].totalBalance);

      //Bold Text
      cellTotalSaldoLabel.font =
        cellTotalContadosLabel.font =
        cellVarLabel.font =
        cellTotalSaldoLabel.font =
          {
            name: 'Arial',
            family: 2,
            size: 11,
            italic: false,
            bold: true,
          };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';

    const blob = new Blob([buffer], { type: fileType });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
    } else {
      const titleFile = 'RelatorioInventarioGeral.xlsx';
      saveBlob2File(titleFile, blob);
      function saveBlob2File(fileName, blob) {
        const folder = cordova.file.externalRootDirectory + 'Download';
        window.resolveLocalFileSystemURL(
          folder,
          function (dirEntry) {
            createFile(dirEntry, fileName, blob);
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
    }
  },
  createArrayOfArrayRow(rows) {
    const data = [];
    let ord = 1;

    for (const row in rows) {
      const createRow = [];
      createRow.push(ord);
      createRow.push(rows[row].batchNumber);
      createRow.push(
        moment(new Date(rows[row].captureDate)).format('DD-MM-YYYY')
      );
      createRow.push(rows[row].balance);
      createRow.push(rows[row].adjustedValue);
      createRow.push(rows[row].notes);

      data.push(createRow);
      ord += 1;
    }
    ord = 0;
    rows = [];

    return data;
  },
  downloadFile(fileName, fileType, blop) {
    const titleFile = fileName + fileType;
    console.log('result' + titleFile);
    saveBlob2File(titleFile, blop);
    function saveBlob2File(fileName, blob) {
      const folder = cordova.file.externalRootDirectory + 'Download';
      window.resolveLocalFileSystemURL(
        folder,
        function (dirEntry) {
          createFile(dirEntry, fileName, blob);
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
