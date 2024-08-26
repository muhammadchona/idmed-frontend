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
      ]
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
    if (isOnline.value) {
      const balanceteReport = await Report.printReportOther('balanceteReport', id);
      if (balanceteReport.status === 204 || !balanceteReport.data.length) return 204;
      balanceteData = balanceteReport.data;
      matriz = balanceteReport.data;
    }
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CSAUDE';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    const worksheet = workbook.addWorksheet(fileName);

    const logo = new Image();
    logo.src = 'data:image/png;base64,' + MOHIMAGELOG;
    const imageId1 = workbook.addImage({
      base64: logo.src,
      extension: 'png',
    });

    worksheet.addImage(imageId1, {
      tl: { col: 0.2, row: 0.2 },
      ext: { width: 35, height: 35 },
    });

    worksheet.mergeCells('B1:C3');
    worksheet.getCell('B1').value = logoTitle;
    worksheet.getCell('B1').font = {
      name: 'Arial',
      size: 9,
      bold: true,
    };
    worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('D1:E3');
    worksheet.getCell('D1').value = title;
    worksheet.getCell('D1').font = {
      name: 'Arial',
      size: 11,
      bold: true,
    };
    worksheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A4:B4');
    worksheet.getCell('A4').value = 'Unidade Sanitária: ' + clinic.clinicName;
    worksheet.getCell('A4').font = {
      name: 'Arial',
      size: 8,
      bold: true,
    };
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.getCell('D4').value = 'Data Inicio: ' + Report.getFormatDDMMYYYY(balanceteData[0].startDate);
    worksheet.getCell('D4').font = {
      name: 'Arial',
      size: 8,
      bold: true,
    };
    worksheet.getCell('D4').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('A5:B5');
    worksheet.getCell('A5').value = 'Distrito: ' + clinic.district.description;
    worksheet.getCell('A5').font = {
      name: 'Arial',
      size: 8,
      bold: true,
    };
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.getCell('C5').value = 'Província: ' + clinic.province.description;
    worksheet.getCell('C5').font = {
      name: 'Arial',
      size: 8,
      bold: true,
    };
    worksheet.getCell('C5').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.getCell('D5').value = 'Data Fim: ' + Report.getFormatDDMMYYYY(balanceteData[0].endDate);
    worksheet.getCell('D5').font = {
      name: 'Arial',
      size: 8,
      bold: true,
    };
    worksheet.getCell('D5').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.addRow([]);
    worksheet.addRow(['FNM', 'Medicamento', 'Unidade', 'Validade Medicamento']);
    worksheet.addRow(['Data de Movimento', 'Entradas', 'Perdas e Ajustes', 'Saidas', 'Stock Existente', 'Notas']);

// Agrupar por medicamento
    const groupedData = balanceteData.reduce((acc, item) => {
      if (!acc[item.medicamento]) {
        acc[item.medicamento] = [];
      }
      acc[item.medicamento].push(item);
      return acc;
    }, {});

    Object.keys(groupedData).forEach(medicamento => {
      const firstItem = groupedData[medicamento][0];

      const headerValues = [
        firstItem.fnm,
        firstItem.medicamento,
        firstItem.unidade,
        firstItem.validadeMedicamento
      ];

      worksheet.addRow(headerValues);

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

      matriz.forEach(item => worksheet.addRow(item));
      worksheet.addRow([]); // Adicionar uma linha vazia entre os grupos
    });

    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;

    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
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
