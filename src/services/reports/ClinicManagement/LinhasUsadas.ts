/* eslint-disable */
import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import Report from 'src/services/api/report/ReportService';
import moment from 'moment';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import MmiaMobileService from 'src/services/api/report/mobile/MmiaMobileService';
import clinicService from 'src/services/api/clinicService/clinicService';

const { isMobile, isOnline } = useSystemUtils();

const logoTitle = 'REPÚBLICA DE MOÇAMBIQUE \nMINISTÉRIO DA SAÚDE \nCENTRAL DE MEDICAMENTOS E ARTIGOS MÉDICOS';
const title = 'LINHAS TERAPEUTICAS \n USADAS';
const reportName = 'Linhas_Usadas';
const fileName = reportName.concat('_' + moment(new Date()).format('DD-MM-YYYY'));

function agruparPorRegime(data) {
  return data.reduce((resultado, item) => {
    const { codigoRegime, regimeTerapeutico, totalPrescricoes, linhaTerapeutica } = item;

    if (!resultado[codigoRegime]) {
      resultado[codigoRegime] = {
        regimeTerapeutico,
        "1ª Linha": 0,
        "2ª Linha": 0,
        "3ª Linha": 0,
        total: 0
      };
    }

    resultado[codigoRegime][linhaTerapeutica] += totalPrescricoes;
    resultado[codigoRegime].total += totalPrescricoes;

    return resultado;
  }, {});
}

function transformarEmMatriz(agrupado) {
  return Object.entries(agrupado).map(([codigoRegime, dados]) => [
    codigoRegime,
    dados.regimeTerapeutico,
    dados["1ª Linha"],
    dados["2ª Linha"],
    dados["3ª Linha"],
    dados.total
  ]);
}

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
    let linhasUsadasData = [];
    let matriz = [[]];
    if (isOnline.value) {
      const linhasUsadasReport = await Report.printReportOther('linhasUsadasReport', id);
      if (linhasUsadasReport.status === 204 || !linhasUsadasReport.data.length) return 204;
      linhasUsadasData = linhasUsadasReport.data;
      const agrupado = agruparPorRegime(linhasUsadasReport.data);
      matriz = transformarEmMatriz(agrupado);
    }

    const regimenCols = [
      'Código',
      'Regime Terapêutico',
      '1ª Linha',
      '2ª Linha',
      '3ª Linha',
      'Total',
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
          content: 'Data Inicio: ' + Report.getFormatDDMMYYYY(linhasUsadasData[0].startDate),
          styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', textColor: 0 }
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
          content: 'Data Fim: ' + Report.getFormatDDMMYYYY(linhasUsadasData[0].endDate),
          styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', textColor: 0 }
        }
      ]
    ];

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: { halign: 'center', fontSize: 6, textColor: 0 },
      columnStyles: { 0: { cellWidth: 14 } },
      styles: { maxCellHeight: 4 },
      body: headData,
      startY: 10,
    });

    doc.addImage(image, 'PNG', 16, 10, 10, 10);

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: { halign: 'center', fontSize: 6 },
      columnStyles: { 0: { cellWidth: 13 }, 2: { cellWidth: 15 }, 3: { cellWidth: 18 } },
      headStyles: { halign: 'center', valign: 'middle', fontSize: 6, fillColor: [75, 76, 77] },
      styles: { maxCellHeight: 4 },
      head: [regimenCols],
      body: matriz,
      startY: doc.lastAutoTable.finalY,
    });

    doc.setFontSize(8);
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height || pageSize.getHeight();
    doc.text('Página ' + doc.internal.getNumberOfPages(), 15, pageHeight - 10);

    if (isOnline.value && !isMobile.value) {
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output();
      downloadFile(fileName, 'pdf', pdfOutput);
    }
  },

  async downloadExcel(id) {
    const clinic = clinicService.currClinic();
    console.log(clinic)
    let linhasUsadasReport = {};
    let linhasUsadasData = [];
    let matriz = [[]]
    if (isOnline.value) {
      linhasUsadasReport = await Report.printReportOther('linhasUsadasReport', id);
      console.log(linhasUsadasReport)
      if (linhasUsadasReport.status === 204 || linhasUsadasReport.data.length === 0) return 204;
      linhasUsadasData = linhasUsadasReport.data;
      const agrupado = agruparPorRegime(linhasUsadasReport.data);
      matriz = transformarEmMatriz(agrupado);
      console.log(matriz)

    } else {
      //
    }

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
    const headerRowQuantificacao = worksheet.getRow(14);
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
        headerRowQuantificacao.alignment =
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
    cellPharmParamValue.value = clinic?.clinicName;
    cellProvinceParamValue.value = clinic?.province.description;
    cellDistrictParamValue.value = clinic?.district.description;
    cellStartDateParamValue.value = Report.getFormatDDMMYYYY(linhasUsadasData[0].startDate);
    cellEndDateParamValue.value = Report.getFormatDDMMYYYY(linhasUsadasData[0].endDate);;
    cellPharm.value = 'Unidade Sanitária';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';

    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:F10');
    worksheet.mergeCells('B11:D11');

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;
    headerRowQuantificacao.height = 30;

    // add height size to Columns
    // add width size to Columns
    colA.width = 20;
    colB.width = 20;
    colC.width = 30;
    colD.width = 15;
    colE.width = 20;
    colF.width = 15;

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
        { name: 'Código', totalsRowLabel: 'none', filterButton: false },
        { name: 'Regime Terapêutico', totalsRowLabel: 'none:', filterButton: false },
        { name: '1ª Linha', totalsRowFunction: 'none', filterButton: false },
        { name: '2ª Linha', totalsRowFunction: 'none', filterButton: false },
        { name: '3ª Linha', totalsRowFunction: 'none', filterButton: false, },
        { name: 'Total', totalsRowFunction: 'none', filterButton: false, },
      ],
      rows: matriz,
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
      const titleFile = 'PacientesActivos.xlsx';
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
  },
}
function downloadFile(fileName, fileType, fileContent) {
  let fileExtension = fileType === 'pdf' ? '.pdf' : '.xlsx';
  const blob = new Blob([fileContent], { type: fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName.concat(fileExtension));
}

