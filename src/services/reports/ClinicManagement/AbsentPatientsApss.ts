import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import Report from 'src/services/api/report/ReportService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import AbsentPatientMobileService from 'src/services/api/report/mobile/AbsentPatientMobileService';
import clinicService from 'src/services/api/clinicService/clinicService';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';

const { isMobile, isOnline } = useSystemUtils();

const reportName = 'PacientesFaltososAPSS';
const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title =
  "Relatório de Pacientes Faltosos ao \n Levantamento de ARV's para APSS";
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);

const services = ['TARV', 'TB', 'CPN', 'CCR', 'SAAJ'];

export default {
  async downloadPDF(id, params) {
    const clinic = clinicService.currClinic();

    let data = [];
    let rowsAux = [];
    let firstReg = {};
    let data1 = [];

    if (isOnline.value) {
      const rowsAux = await Report.printReportOther('absentPatientsReport', id);
      if (rowsAux.status === 204 || rowsAux.data.length === 0) return 204;
      data1 = rowsAux.data;
      firstReg = rowsAux.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
    } else {
      rowsAux = await AbsentPatientMobileService.localDbGetAllByReportId(id);
      if (rowsAux.length === 0) return 204;
      firstReg = rowsAux[0];
      data1 = rowsAux;
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
    }

    for (const service of services) {
      if (isOnline.value) {
        data = this.createArrayOfArrayRow(data1, service);
      } else {
        data = this.createArrayOfArrayRow(data1, service);
      }

      const doc = new JsPDF({
        orientation: 'l',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 'smart',
      });

      const image = new Image();
      image.src = 'data:image/png;base64,' + MOHIMAGELOG;
      const img = new Image();
      img.src = 'data:image/png;base64,' + MOHIMAGELOG;

      const headerReport = [
        [
          {
            content: 'Faltosos ao Levantamento de ARV´s para APSS',
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

      const desiredDefinition = [
        [
          { content: 'NID', rowSpan: 2 },
          { content: 'NOME', rowSpan: 2 },
          { content: 'IDADE', rowSpan: 2 },
          { content: 'CONTACTO', rowSpan: 2 },
          { content: 'ENDERECO', rowSpan: 2 },
          { content: 'Serviço que Serve', colSpan: 3 },
          { content: 'Tipo de Chamada', colSpan: 2 },
          { content: 'Relatório da Chamada', colSpan: 6 },
          { content: 'Retornos e Referências', colSpan: 3 },
        ],
        [
          { content: 'TARV' },
          { content: 'TB' },
          { content: 'CPN' },
          { content: 'CCR' },
          { content: 'SAAJ' },
          { content: 'Chamada de Apoio' },
          { content: 'Chamada de Reintegração' },
          { content: 'Paciente Incontactavel' },
          { content: 'O Paciente Esqueceu a data da Consulta' },
          { content: 'O Paciente está doente' },
          { content: 'O Paciente não tem transporte' },
          { content: 'O Paciente viajou' },
          { content: 'Óbito' },
          { content: 'PPE' },
          { content: 'PREP' },
          { content: 'Cr. Exp.' },
        ],
      ];

      autoTable(doc, {
        //  margin: { top: 10 },
        bodyStyles: {
          halign: 'left',
          valign: 'middle',
          fontSize: 6,
        },
        headStyles: {
          halign: 'left',
          valign: 'middle',
          fontSize: 6,
        },
        theme: 'grid',
        body: headerReport,
      });

      doc.setFontSize(8);
      doc.text('República de Moçambique ', 16, 28);
      doc.text('Ministério da Saúde ', 20, 32);
      doc.text('Serviço Nacional de Saúde ', 16, 36);
      doc.addImage(img, 'png', 28, 15, 10, 10);

      autoTable(doc, {
        // margin: { top: 45 },
        bodyStyles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          valign: 'middle',
          // font: 'arial',
          fontSize: 6,
          // cellPadding: 8,
          overflowColumns: 'linebreak',
        },
        headStyles: {
          valign: 'bottom',
          halign: 'center',
          fontSize: 5,
          lineWidth: 0.5,
          lineColor: [230, 230, 230],
          fillColor: [255, 255, 255],
          textColor: [96, 96, 96],
        },
        columnStyles: {
          4: { cellWidth: 40, fontSize: 5 },
          11: { cellWidth: 25 },
        },
        didDrawPage: function (data) {
          const str = 'Página ' + doc.internal.getNumberOfPages();
          doc.setFontSize(6);
          // jsPDF 1.4+ uses getWidth, <1.4 uses .width
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(str, data.settings.margin.right, pageHeight - 10);
        },

        theme: 'grid',
        head: desiredDefinition,
        body: data,
      });

      if (isOnline.value && !isMobile.value) {
        doc.save(`${fileName}_${service}.pdf`);
      } else {
        const pdfOutput = doc.output();
        DownloadFileMobile.downloadFile(
          `${fileName}_${service}`,
          '.pdf',
          pdfOutput
        );
      }
    }
  },
  async downloadExcel(id, params) {
    const clinic = clinicService.currClinic();

    let data = [];
    let rowsAux = [];
    let firstReg = {};
    let data1 = [];

    if (isOnline.value) {
      const rowsAux = await Report.printReportOther('absentPatientsReport', id);
      if (rowsAux.status === 204 || rowsAux.data.length === 0) return 204;
      data1 = rowsAux.data;
      firstReg = rowsAux.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
    } else {
      rowsAux = await AbsentPatientMobileService.localDbGetAllByReportId(id);
      if (rowsAux.length === 0) return 204;
      firstReg = rowsAux[0];
      data1 = rowsAux;
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CSAUDE';
    workbook.lastModifiedBy = 'CSAUDE';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    for (const service of services) {
      if (isOnline.value) {
        data = this.createArrayOfArrayRow(data1, service);
      } else {
        data = this.createArrayOfArrayRow(data1, service);
      }

      let nameSheet = service;
      if (service === 'TARV') {
        nameSheet = 'ADULTO E PEDIATRICO';
      }

      // Adicione uma nova planilha para cada serviço
      const worksheet = workbook.addWorksheet(nameSheet);

      const imageId = workbook.addImage({
        base64: 'data:image/png;base64,' + MOHIMAGELOG,
        extension: 'png',
      });

      // // Get Cells
      const cellRepublica = worksheet.getCell('A8');
      const cellTitle = worksheet.getCell('A9');
      const cellPharm = worksheet.getCell('A11');
      const cellPharmParamValue = worksheet.getCell('B11');
      const cellDistrict = worksheet.getCell('A12');
      const cellDistrictValue = worksheet.getCell('B12');
      const cellProvince = worksheet.getCell('C12');
      const cellProvinceValue = worksheet.getCell('D12');

      const cellServicoServe = worksheet.getCell('F13');
      const cellTipoChamada = worksheet.getCell('I13');
      const cellRelatorioChamada = worksheet.getCell('K13');
      const cellRetornoReferencia = worksheet.getCell('Q13');

      const cellStartDate = worksheet.getCell('R11');
      const cellEndDate = worksheet.getCell('R12');
      const cellStartDateParamValue = worksheet.getCell('S11');
      const cellEndDateParamValue = worksheet.getCell('S12');

      // // Get Rows
      const row14 = worksheet.getRow(14);
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
      const colL = worksheet.getColumn('L');
      const colM = worksheet.getColumn('M');
      const colN = worksheet.getColumn('N');
      const colO = worksheet.getColumn('O');
      const colP = worksheet.getColumn('P');
      const colQ = worksheet.getColumn('Q');
      const colR = worksheet.getColumn('R');
      const colS = worksheet.getColumn('S');

      worksheet.getCell('A13').fill =
        worksheet.getCell('B13').fill =
        worksheet.getCell('C13').fill =
        worksheet.getCell('D13').fill =
        worksheet.getCell('E13').fill =
        worksheet.getCell('F13').fill =
        worksheet.getCell('G13').fill =
        worksheet.getCell('H13').fill =
        worksheet.getCell('I13').fill =
        worksheet.getCell('J13').fill =
        worksheet.getCell('K13').fill =
        worksheet.getCell('L13').fill =
        worksheet.getCell('M13').fill =
        worksheet.getCell('N13').fill =
        worksheet.getCell('O13').fill =
        worksheet.getCell('P13').fill =
        worksheet.getCell('Q13').fill =
        worksheet.getCell('R13').fill =
        worksheet.getCell('S13').fill =
          {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1fa37b' },
            bgColor: { argb: '1fa37b' },
          };

      cellServicoServe.font =
        cellTipoChamada.font =
        cellRelatorioChamada.font =
        cellRetornoReferencia.font =
          {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 12,
            italic: false,
            bold: true,
          };

      // Format Table Cells
      // Alignment Format
      cellServicoServe.alignment =
        cellTipoChamada.alignment =
        cellRelatorioChamada.alignment =
        cellRetornoReferencia.alignment =
        cellRepublica.alignment =
        cellTitle.alignment =
        headerRow.alignment =
          {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
          };

      cellPharm.alignment =
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
        cellPharmParamValue.border =
        cellDistrict.border =
        cellDistrictValue.border =
        cellProvince.border =
        cellProvinceValue.border =
        cellStartDate.border =
        cellStartDateParamValue.border =
        cellEndDate.border =
        cellEndDateParamValue.border =
        cellRetornoReferencia.border =
        cellRelatorioChamada.border =
        cellTipoChamada.border =
        cellServicoServe.border =
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
      cellStartDateParamValue.value = params.startDateParam;
      cellDistrictValue.value =
        params.district === null
          ? clinic?.district.description
          : params?.district.description;
      cellProvinceValue.value =
        params.province === null
          ? clinic?.province.description
          : params?.province.description;
      cellEndDateParamValue.value = params.endDateParam;
      cellPharm.value = 'Unidade Sanitária';
      cellDistrict.value = 'Distrito';
      cellProvince.value = 'Provincia';
      cellStartDate.value = 'Data Início';
      cellEndDate.value = 'Data Fim';
      cellServicoServe.value = 'Serviço que Serve';
      cellTipoChamada.value = 'Tipo de Chamada';
      cellRelatorioChamada.value = 'Relatório da Chamada';
      cellRetornoReferencia.value = 'Retornos e Referências';

      // merge a range of cells
      worksheet.mergeCells('A1:A7');
      worksheet.mergeCells('A9:S10');
      worksheet.mergeCells('B11:Q11');
      worksheet.mergeCells('D12:Q12');
      worksheet.mergeCells('F13:H13');
      worksheet.mergeCells('I13:J13');
      worksheet.mergeCells('K13:P13');
      worksheet.mergeCells('Q13:S13');
      headerRow.height = 30;

      // add height size to Columns
      // add width size to Columns
      colA.width = 25;
      colB.width = 30;
      colC.width = 25;
      colD.width = 25;
      colE.width = 25;
      colF.width = 20;
      colG.width = 25;
      colH.width = 30;
      colI.width = 25;
      colJ.width = 25;
      colK.width = 25;
      colL.width = 20;
      colM.width = 25;
      colN.width = 30;
      colO.width = 25;
      colP.width = 25;
      colQ.width = 25;
      colR.width = 20;
      colS.width = 25;

      // Add Style
      cellTitle.font =
        cellStartDate.font =
        cellEndDate.font =
        cellPharm.font =
        cellDistrict.font =
        cellProvince.font =
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
      // Adicione as linhas de dados à tabela na planilha atual
      worksheet.addTable({
        name: reportName + '_' + service.name,
        ref: 'A14',
        headerRow: true,
        totalsRow: false,
        style: {
          showRowStripes: false,
        },
        columns: [
          { name: 'NID', totalsRowLabel: 'Totals:', filterButton: false },
          { name: 'NOME', totalsRowFunction: 'none', filterButton: false },
          {
            name: 'IDADE',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'CONTACTO',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'ENDERECO',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'TARV',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'TB',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'CPN',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'CCR',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'SAAJ',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Chamada de Apoio',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Chamada de Reintegração',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Paciente Incontactavel',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'O Paciente Esqueceu a data da Consulta',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'O Paciente está doente',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'O Paciente não tem transport',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'O Paciente viajou',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Óbito',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'PPE',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'PREP',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Cr. Exp.',
            totalsRowFunction: 'none',
            filterButton: false,
          },
        ],
        rows: data,
      });

      worksheet.addRows([]);

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
    }
    // Crie o buffer do arquivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const fileTypePa =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';

    const blob = new Blob([buffer], { type: fileTypePa });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
    } else {
      //   var blob = new Blob(materialEducativo.blop)
      //  const bytes = new Uint8Array(materialEducativo.blop)
      // var UTF8_STR = new Uint8Array(pdfOutput)
      //   var BINARY_ARR = UTF8_STR.buffer
      const titleFile = 'PacientesFaltosos.xlsx';
      DownloadFileMobile.downloadFile(fileName, '.xlsx', blob);
    }
  },

  createArrayOfArrayRow(rows, service) {
    const data = [];

    for (const row in rows) {
      if (rows[row].servedService === service) {
        const createRow = [];
        createRow.push(rows[row].nid);
        createRow.push(rows[row].name);
        createRow.push(rows[row].idade);
        createRow.push(rows[row].contact);
        createRow.push(rows[row].address);

        const servedService = rows[row].servedService;

        services.forEach((code) => {
          createRow.push(servedService === code ? 'SIM' : 'NAO');
        });
        data.push(createRow);
      }
    }

    return data;
  },

  drawRotatedHeader(doc, header, angle, x, y) {
    const startY = y || 10; // Se y não for fornecido, use 10 como valor padrão
    const startX = x || 10; // Se x não for fornecido, use 10 como valor padrão

    header.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellWidth =
          doc.getStringUnitWidth(cell.content) * doc.internal.getFontSize(); // Calcular a largura da célula
        const cellHeight = doc.internal.getLineHeight(); // Calcular a altura da célula

        // Calcular as coordenadas da célula com rotação
        const rotatedX =
          startX +
          j * cellWidth * Math.cos(angle) +
          i * cellHeight * Math.sin(angle);
        const rotatedY =
          startY +
          i * cellWidth * Math.sin(angle) +
          j * cellHeight * Math.cos(angle);

        doc.text(cell.content, rotatedX, rotatedY, { angle: angle });
      });
    });
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
      const folder =
        cordova.file.externalRootDirectory + 'Download/' + strTitle;
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
