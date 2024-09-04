import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from '../../../assets/imageBytes.ts';
import Report from 'src/services/api/report/ReportService';

import clinicService from 'src/services/api/clinicService/clinicService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import PrepDailyRegisterMobileService from 'src/services/api/report/mobile/PrepDailyRegisterMobileService';

const img = new Image();
img.src = 'data:image/png;base64,' + MOHIMAGELOG;

const { isOnline, isMobile } = useSystemUtils();

const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title = 'LIVRO DE REGISTO DIÁRIO DE PREPs';
const reportName = 'PrepDailyListReport';
const fileName = reportName.concat('_' + Report.getFormatDDMMYYYY(new Date()));

export default {
  async downloadPDF(id, fileType, params) {
    const clinic = clinicService.currClinic();
    let rowsAux = [];
    let data = [];
    let firstReg = {};
    if (isOnline.value) {
      rowsAux = await Report.printReport(
        'arvDailyRegisterReportTemp',
        id,
        fileType
      );
      if (rowsAux.status === 204 || rowsAux.data.length === 0) return 204;
      firstReg = rowsAux.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);

      // Agora, obtenha a lista única de objetos pai agrupados
      const listaFinal = Object.values(Report.mapaDeAgrupamento(rowsAux.data));

      data = this.createArrayOfArrayRow(listaFinal);
    } else {
      rowsAux = await this.getDataLocalReport(id);
      if (rowsAux.length === 0) return 204;
      firstReg = rowsAux[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      data = this.createArrayOfArrayRow(rowsAux);
    }

    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a3',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });

    // doc.setProperties({
    //   title: fileName.concat('.pdf'),
    // });

    const headerReport = [
      [
        {
          content: 'LIVRO DE REGISTO DIÁRIO DE PREPs',
          styles: { minCellHeight: 20, fontSize: 16, halign: 'center' },
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
    //  const width = doc.internal.pageSize.getWidth()
    const desiredDefinition = [
      [
        { content: 'ORD', rowSpan: 2 },
        { content: 'NID', rowSpan: 2 },
        { content: 'NOME', rowSpan: 2 },
        { content: 'Tipo de paciente', rowSpan: 2 },
        { content: 'Faixa Etária', colSpan: 4 },
        { content: 'Tipo PREP', rowSpan: 2 },
        { content: 'Regime', rowSpan: 2 },
        {
          content: 'Produtos e Quantidades',
          rowSpan: 2,
          styles: { cellWidth: 50 },
        },
        { content: 'Tipo de Dispensa', rowSpan: 2 },
        { content: 'Linha', rowSpan: 2 },
        { content: 'Data de Levant.', rowSpan: 2 },
        { content: 'Data Proxi. Levant.', rowSpan: 2 },
        { content: 'PROFILAXIA', colSpan: 3 },
      ],
      [
        { content: '[0-4]' },
        { content: '[5-9]:' },
        { content: '[10-14]' },
        { content: '[>15]' },
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
    doc.addImage(img, 'png', 28, 15, 10, 10);

    autoTable(doc, {
      // margin: { top: 45 },
      bodyStyles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        valign: 'middle',
        fontSize: 6,
        overflowColumns: 'linebreak',
      },
      headStyles: {
        valign: 'bottom',
        halign: 'center',
        fontSize: 6,
        lineWidth: 0.5,
        lineColor: [230, 230, 230],
        fillColor: [255, 255, 255],
        textColor: [96, 96, 96],
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
      return doc.save(fileName.concat('.pdf'));
      // window.open(doc.output('bloburl'));
    } else {
      console.log(doc);
      const pdfOutput = doc.output();
      this.downloadFile(fileName, 'pdf', pdfOutput);
    }
  },

  async downloadExcel(id, fileType2, params) {
    const clinic = clinicService.currClinic();
    let rowsAux = [];
    let data = [];
    let firstReg = {};
    if (isOnline.value) {
      rowsAux = await Report.printReport(
        'arvDailyRegisterReportTemp',
        id,
        fileType2
      );
      if (rowsAux.status === 204 || rowsAux.data.length === 0) return 204;
      firstReg = rowsAux.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);

      // Agora, obtenha a lista única de objetos pai agrupados
      const listaFinal = Object.values(Report.mapaDeAgrupamento(rowsAux.data));

      data = this.createArrayOfArrayRow(listaFinal);
    } else {
      rowsAux = await this.getDataLocalReport(id);
      firstReg = rowsAux[0];
      if (rowsAux.length === 0) return 204;
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      data = this.createArrayOfArrayRow(rowsAux);
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
    const cellFaixaEtaria = worksheet.getCell('E13');
    const cellProfilaxia = worksheet.getCell('P13');
    // const row13Header = worksheet.getCell('A13; R13')

    // Get Rows
    const headerRow = worksheet.getRow(14);
    const row13 = worksheet.getRow(13);
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
    // Format Table Cells
    // Alignment Format
    cellProfilaxia.alignment =
      cellFaixaEtaria.alignment =
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

    cellDistrictParamValue.border =
      cellDistrict.border =
      cellProvince.border =
      cellProvinceParamValue.border =
      cellEndDate.border =
      cellEndDateParamValue.border =
        {
          bottom: { style: 'thin' },
        };

    cellProfilaxia.border = cellFaixaEtaria.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    // Assign Value to Cell
    cellRepublica.value = logoTitle;
    cellTitle.value = title;
    cellPharmParamValue.value = clinic.clinicName;
    cellProvinceParamValue.value = clinic.province.description;
    cellDistrictParamValue.value = clinic.district.description;
    cellStartDateParamValue.value = params.startDateParam;
    cellEndDateParamValue.value = params.endDateParam;
    cellPharm.value = 'Farmácia';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';
    cellFaixaEtaria.value = 'Faixa Etária';
    cellProfilaxia.value = 'Profilaxia';
    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:G9');
    worksheet.mergeCells('B11:E11');
    worksheet.mergeCells('B12:C12');
    worksheet.mergeCells('E13:G13');
    worksheet.mergeCells('P13:R13');
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
        {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '1fa37b' },
          bgColor: { argb: '1fa37b' },
        };
    cellFaixaEtaria.font = {
      name: 'Arial',
      color: { argb: 'FFFFFFFF' },
      family: 2,
      size: 12,
      italic: false,
      bold: true,
    };
    cellProfilaxia.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1fa37b' },
      bgColor: { argb: '1fa37b' },
    };
    cellProfilaxia.font = {
      name: 'Arial',
      color: { argb: 'FFFFFFFF' },
      family: 2,
      size: 12,
      italic: false,
      bold: true,
    };
    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;
    row13.height = 30;
    // add height size to Columns
    // add width size to Columns
    colA.width = 10;
    colB.width = 30;
    colC.width = 30;
    colD.width = 20;
    colE.width = 10;
    colF.width = 10;
    colG.width = 10;
    colH.width = 10;
    colI.width = 15;
    colJ.width = 25;
    colK.width = 50;
    colL.width = 15;
    colM.width = 15;
    colN.width = 15;
    colO.width = 15;
    colP.width = 15;
    colQ.width = 10;
    colR.width = 10;
    colS.width = 10;
    // colG.height = 50

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
        { name: 'ORD', filterButton: false },
        { name: 'NID', filterButton: false },
        {
          name: 'NOME ',
          filterButton: false,
        },
        {
          name: 'TIPO DE PACIENTE',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: '[0 -4]',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: '[5-9]',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: '[10-14]',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: '[>15]',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'TIPO TARV.',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'REGIME',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'PRODUTOS - (QUANTIDADES) ',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'TIPO DE DISPENSA',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'LINHA',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'DATA DE LEVANTAMENTO',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'DATA PROXIM. LEVANTAMENTO',
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
          name: 'CR. Exp',
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
    // let x = 14
    for (let i = 14; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i);
      row.height = 50;
      row.halign = 'left';
      row.wrapText = true;

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
    let p = 15;

    let dataAux = {};

    if (params.isOnline) {
      dataAux = rows.data;
    } else {
      dataAux = rowsAux;
    }
    for (let j = 0; j <= dataAux.length; j++) {
      // Now loop through every row's cell and finally set alignment
      const reportData = dataAux[j];
      if (reportData !== undefined) {
        let drugDetails = '';
        for (const row in reportData.drugQuantityTemps) {
          drugDetails =
            drugDetails +
            (reportData.drugQuantityTemps[row].drugName +
              ' - (' +
              reportData.drugQuantityTemps[row].quantity +
              ');                                       ');
        }

        const cell = worksheet.getCell('K' + p);
        cell.value = drugDetails;
        p++;
      }
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';
    const blob = new Blob([buffer], { type: fileType });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
    } else {
      const titleFile = 'LivroDiarioDePreps.xlsx';
      console.log('result' + titleFile);
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
      // createRow.push(rows[row].orderNumber);
      createRow.push(ord++);
      createRow.push(rows[row].nid);
      createRow.push(
        String(rows[row].patientName).replaceAll('null', '').replace('  ', ' ')
      );
      createRow.push(rows[row].startReason);
      createRow.push(rows[row].ageGroup_0_4);
      createRow.push(rows[row].ageGroup_5_9);
      createRow.push(rows[row].ageGroup_10_14);
      createRow.push(rows[row].ageGroup_Greater_than_15);
      createRow.push(rows[row].patientType);
      createRow.push(rows[row].regime);
      createRow.push(
        Report.createDrugArrayOfArrayRow(rows[row].drugQuantityTemps).join(
          '; \n'
        )
      );
      createRow.push(rows[row].dispensationType);
      createRow.push(rows[row].therapeuticLine);
      console.log(rows[row].pickupDate)
      createRow.push(Report.getFormatDDMMYYYY(rows[row].pickupDate));
      console.log(Report.getFormatDDMMYYYY(rows[row].pickupDate))
      createRow.push(Report.getFormatDDMMYYYY(rows[row].nextPickupDate));
      createRow.push(rows[row].ppe);
      createRow.push(rows[row].prep);
      createRow.push('');
      data.push(createRow);
    }

    return data;
  },
  async getDataLocalReport(reportId) {
    const reportData =
      await PrepDailyRegisterMobileService.localDbGetAllByReportId(reportId);

    //console.log(data)
    if (reportData === null || reportData.length === 0) return '204';
    return reportData;
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
