/* eslint-disable */
import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import Report from 'src/services/api/report/ReportService';
import moment from 'moment';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';

const { isMobile, isOnline } = useSystemUtils();

const logoTitle = 'REPÚBLICA DE MOÇAMBIQUE \nMINISTÉRIO DA SAÚDE \nCENTRAL DE MEDICAMENTOS E ARTIGOS MÉDICOS';
const title = 'BALANCETE';
const reportName = 'balancete';
const fileName = reportName.concat('_' + moment(new Date()).format('DD-MM-YYYY'));

export default {
  async downloadPDF(id) {
    const doc = new JsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart',
    });

    doc.setFontSize(10);
    const image = new Image();
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;

    doc.setProperties({ title: fileName.concat('.pdf') });

    const clinic = clinicService.currClinic();
    let balanceteData = [];
    if (isOnline.value) {
      const balanceteReport = await Report.printReportOther('balanceteReport', id);
      if (balanceteReport.status === 204 || !balanceteReport.data.length) return 204;
      balanceteData = balanceteReport.data;
    }

    // Agrupar por medicamento
    const groupedData = balanceteData.reduce((acc, item) => {
      if (!acc[item.medicamento]) {
        acc[item.medicamento] = [];
      }
      acc[item.medicamento].push(item);
      return acc;
    }, {});

    const createMainHeader = (item) => [
      [
        {
          content: 'FNM',
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          colSpan: 2,
          content: 'Medicamento',
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          content: 'Unidade',
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          colSpan: 2,
          content: 'Prazo de Validade',
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        }
      ],
      [
        {
          content: item.fnm,
          styles: { halign: 'left', textColor: 0, fillColor: [255, 255, 255], lineWidth: 0.2 }
        },
        {
          colSpan: 2,
          content: item.medicamento,
          styles: { halign: 'center', valign: 'middle', textColor: 0, fillColor: [255, 255, 255], lineWidth: 0.2 }
        },
        {
          content: item.unidade,
          styles: { valign: 'middle', halign: 'left', textColor: 0, fillColor: [255, 255, 255], lineWidth: 0.2 }
        },
        {
          colSpan: 2,
          content: Report.getFormatDDMMYYYY(item.validadeMedicamento),
          styles: { halign: 'center', valign: 'middle', textColor: 0, fillColor: [255, 255, 255], lineWidth: 0.2 }
        }
      ],
      [
        {
          content: 'Data de Movimento',
          styles: { halign: 'left', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          content: 'Entradas',
          styles: { halign: 'left', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          content: 'Perdas e Ajustes',
          styles: { valign: 'middle', halign: 'left', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          content: 'Saidas',
          styles: { halign: 'left', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          content: 'Stock Existente',
          styles: { halign: 'left', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        },
        {
          content: 'Notas',
          styles: { valign: 'middle', halign: 'left', fontStyle: 'bold', textColor: 0, fillColor: [211, 211, 211], lineWidth: 0.2 }
        }
      ],

    ];

    const headData = [
      [
        image,
        {
          content: logoTitle,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: 0 }
        },
        {
          colSpan: 2,
          content: title,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: 0 }
        }
      ],
      [
        {
          content: 'Unidade Sanitária: ' + clinic.clinicName,
          colSpan: 3,
          styles: { halign: 'left', fontStyle: 'bold', textColor: 0 }
        },
        {
          content: 'Data Inicio: ' + Report.getFormatDDMMYYYY(balanceteData[0].startDate),
          styles: { valign: 'middle', halign: 'left', fontStyle: 'bold', textColor: 0 }
        }
      ],
      [
        {
          colSpan: 2,
          content: 'Distrito: ' + clinic.district.description,
          styles: { halign: 'left', fontStyle: 'bold', textColor: 0 }
        },
        {
          content: 'Província: ' + clinic.province.description,
          styles: { halign: 'left', fontStyle: 'bold', textColor: 0 }
        },
        {
          content: 'Data Fim: ' + Report.getFormatDDMMYYYY(balanceteData[0].endDate),
          styles: { valign: 'middle', halign: 'left', fontStyle: 'bold', textColor: 0 }
        }
      ]
    ];

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: { halign: 'center', fontSize: 6, textColor: 0 },
      columnStyles: { 0: { cellWidth: 20 } },  // Increase the width of the event_date column
      styles: { maxCellHeight: 4 },
      body: headData,
      startY: 10,
    });

    doc.addImage(image, 'PNG', 16, 10, 10, 10);

    // Add a table for each medication
    Object.keys(groupedData).forEach(medicamento => {
      const firstItem = groupedData[medicamento][0];
      const mainHeader = createMainHeader(firstItem);

      // Inicializa a variável para segurar o estoque inicial
      let estoqueAtual = firstItem.stockExistente;

      const matriz = groupedData[medicamento].map(item => {
        // Atualiza o estoque atual com base nos movimentos do item
        estoqueAtual += (item.entradas || 0) - (item.perdasEAjustes || 0) - (item.saidas || 0);

        return [
          Report.getFormatDDMMYYYY(item.diaDoEvento),
          item.entradas,
          item.perdasEAjustes,
          item.saidas,
          estoqueAtual, // Define o estoque atualizado
          item.notas
        ];
      });

      autoTable(doc, {
        theme: 'grid',
        bodyStyles: { halign: 'center', fontSize: 6 },
        columnStyles: { 0: { cellWidth: 20 }, 2: { cellWidth: 15 }, 3: { cellWidth: 18 } },
        headStyles: { halign: 'center', valign: 'middle', fontSize: 6 },
        head: mainHeader,
        body: matriz,
        startY: doc.lastAutoTable.finalY + 3,
      });
    });

    if (isOnline.value && !isMobile.value) {
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output();
      downloadFile(fileName, 'pdf', pdfOutput);
    }
  },

  async downloadExcel(id) {
    const clinic = clinicService.currClinic();
    let balanceteData = [];
    let matriz = [];
    let firstReg = {};
    let params = {};

    if (isOnline.value) {
      const balanceteReport = await Report.printReportOther('balanceteReport', id);
      if (balanceteReport.status === 204 || !balanceteReport.data.length) return 204;
      balanceteData = balanceteReport.data;
      matriz = balanceteReport.data;
      firstReg = balanceteData[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CSAUDE';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet('Balancete');
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,' + MOHIMAGELOG,
      extension: 'png',
    });

    const cellRepublica = worksheet.getCell('A8');
    const cellTitle = worksheet.getCell('A9');
    const cellPharm = worksheet.getCell('A11');
    const cellPharmParamValue = worksheet.getCell('B11');

    const cellStartDate = worksheet.getCell('E11');
    const cellEndDate = worksheet.getCell('E12');
    const cellStartDateParamValue = worksheet.getCell('F11');
    const cellEndDateParamValue = worksheet.getCell('F12');

    cellRepublica.alignment = cellTitle.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cellPharm.alignment = cellStartDate.alignment = cellEndDate.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
    cellTitle.border = cellPharm.border = cellPharmParamValue.border = cellStartDate.border = cellStartDateParamValue.border = cellEndDate.border = cellEndDateParamValue.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    cellRepublica.value = 'República de Moçambique';
    cellTitle.value = 'Balancete';
    cellPharmParamValue.value = clinic?.clinicName;
    cellStartDateParamValue.value = params.startDateParam;
    cellEndDateParamValue.value = params.endDateParam;
    cellPharm.value = 'Unidade Sanitária';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';

    worksheet.mergeCells('A1:A7');
    worksheet.mergeCells('A9:F10');
    worksheet.mergeCells('B11:D11');
    worksheet.mergeCells('A12:D12');

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 144, height: 98 },
    });


    const groupedData = balanceteData.reduce((acc, item) => {
      if (!acc[item.medicamento]) {
        acc[item.medicamento] = [];
      }
      acc[item.medicamento].push(item);
      return acc;
    }, {});

    Object.keys(groupedData).forEach(medicamento => {
      const firstItem = groupedData[medicamento][0];

      worksheet.addRow(['FNM', 'Medicamento', 'Unidade', 'Validade Medicamento']);
      const headerRow1 = worksheet.lastRow;

      headerRow1?.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D3D3D3' } 
        };
        cell.font = {
          bold: true
        };
      });

      // Adiciona os valores de firstItem antes da linha "Data de Movimento"
      const headerValues = [
        firstItem.fnm,
        firstItem.medicamento,
        firstItem.unidade,
        Report.getFormatDDMMYYYY(firstItem.validadeMedicamento)
      ];
      worksheet.addRow(headerValues);

      worksheet.addRow(['Data de Movimento', 'Entradas', 'Perdas e Ajustes', 'Saidas', 'Stock Existente', 'Notas']);
      const headerRow2 = worksheet.lastRow;

      headerRow2?.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D3D3D3' }
        };
        cell.font = {
          bold: true
        };
      });

      let estoqueAtual = firstItem.stockExistente;

      const matriz = groupedData[medicamento].map(item => {
        estoqueAtual += (item.entradas || 0) - (item.perdasEAjustes || 0) - (item.saidas || 0);

        return [
          Report.getFormatDDMMYYYY(item.diaDoEvento),
          item.entradas,
          item.perdasEAjustes,
          item.saidas,
          estoqueAtual,
          item.notas
        ];
      });

      matriz.forEach(item => worksheet.addRow(item));
      worksheet.addRow([]);
    });

    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;

    const buffer = await workbook.xlsx.writeBuffer();
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';

    const blob = new Blob([buffer], { type: fileType });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
    } else {
      const titleFile = 'Balancete.xlsx';
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
    }
  }
};

function downloadFile(fileName, fileType, fileContent) {
  let fileExtension = fileType === 'pdf' ? '.pdf' : '.xlsx';
  const blob = new Blob([fileContent], { type: fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName.concat(fileExtension));
}
