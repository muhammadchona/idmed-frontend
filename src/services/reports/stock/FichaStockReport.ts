import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts'
import drugFileService from 'src/services/api/drugFile/drugFileService';
import Report from 'src/services/api/report/ReportService';
import StockReceivedReport from 'src/stores/models/report/stock/StockReceivedReport';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';
import ReceivedStockMobileService from 'src/services/api/report/mobile/ReceivedStockMobileService.';
import moment from 'moment';

const { isMobile, isOnline } = useSystemUtils();

const logoTitle = 'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n CENTRAL DE MEDICAMENTOS E ARTIGOS MÉDICOS '
const title = 'Ficha do Medicamento';
const reportName = 'FichaDoMedicamento';
const fileName = reportName.concat('_' + Report.getFormatDDMMYYYY(new Date()));
const clinic = clinicService.currClinic();
const data = [];

export default {

  async downloadPDF(fileTypeParam, drugEventList, drug, stocks) {

    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart',
    });

    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const image = new Image();
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;
    const img = new Image();
    img.src = 'data:image/png;base64,' + MOHIMAGELOG;
    const width = doc.internal.pageSize.getWidth();

    const headerReport = [
      [
        {
          content: 'Ficha do Medicamento',
          styles: { minCellHeight: 20, fontSize: 16, halign: 'center' },
          colSpan: 4,
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
          content: 'FNM: ' + drug.value.fnmCode,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Medicamento: ' + drug.value.name,
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
            'Distrito: ' + clinic.district.description,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Província: ' + clinic.province.description ,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Unidade: ' + drug.value.packSize,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Data do relatório: ' + moment(new Date()).format('DD-MM-YYYY'),
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        }
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

    doc.setFontSize(10);
    doc.addImage(img, 'png', 16, 16, 16, 16);
    doc.text('República de Moçambique ', 47, 22);
    doc.text('Ministério da Saúde ', 52, 26);
    doc.text('Central de Medicamentos e Artigos Médicos ', 34, 30);

    /*
      RESUMO DE STOCK
    */
      const desiredDefinition = [
        [
          { content: 'RESUMO DE STOCK', colSpan: 8 },
        ],
        [
          { content: 'PERIODO DE MOVIMENTO' },
          { content: 'MOVIMENTO' },
          { content: 'ENTRADAS' },
          { content: 'SAÍDAS' },
          { content: 'AJUSTE POSITIVO (+)' },
          { content: 'AJUSTE NEGATIVO (-)' },
          { content: 'PERDAS' },
          { content: 'SALDOS' },
        ],
      ];

      const data1 = this.createArrayOfArrayRowForResumo(drugEventList.value);

      autoTable(doc, {
        // margin: { top: 45 },
        bodyStyles:
        {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          valign: 'middle',
          // font: 'arial',
          fontSize: 6,
          // cellPadding: 8,
          overflowColumns: 'linebreak',
        },
        headStyles:
        {
          valign: 'bottom',
          halign: 'center',
          fontSize: 6,
          lineWidth: 0.5,
          lineColor: [230, 230, 230],
          fillColor: [255, 255, 255],
          textColor: [96, 96, 96],
        },
        didDrawPage: function (data)
        {
          const str = 'Página ' + doc.internal.getNumberOfPages();
          doc.setFontSize(6);
          // jsPDF 1.4+ uses getWidth, <1.4 uses .width
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(str, data.settings.margin.right, pageHeight - 10);
        },

        theme: 'grid',
        head: desiredDefinition,
        body: data1,
    });

    /*
      LOTES
    */

    const stocksOrdenadosPorExpireDateDesc = this.filtrarEOrdenarObjetos(stocks);

    this.imprimirAoTerminar(stocksOrdenadosPorExpireDateDesc, doc, fileTypeParam, '');
  },

  async downloadExcel(fileTypeParam, drugEventList, drug, stocks) {
    const clinic = clinicService.currClinic();
    let data = this.createArrayOfArrayRowForResumo(drugEventList.value);
    if (isOnline.value) {
      // const rows = await Report.printReportOther('stockReportTemp', id);
      // if (rows.status === 204 || rows.data.length === 0) return 204;
      // const firstReg = rows.data[0];
      // params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      // params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      // data = this.createArrayOfArrayRow(rows.data);
    } else {
      const dataAux = await this.getDataLocalReport(id);
      if (dataAux === undefined || dataAux.length === 0) return 204;
      data = this.createArrayOfArrayRow(dataAux);
      params.startDateParam = Report.getFormatDDMMYYYY(data[0].startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(data[0].endDate);
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
    const cellPharmParamValue = worksheet.getCell('B11');
    const cellDistrict = worksheet.getCell('A12');
    const cellDistrictValue = worksheet.getCell('B12');
    const cellProvince = worksheet.getCell('C12');
    const cellProvinceValue = worksheet.getCell('D12');

    const cellFnm = worksheet.getCell('G11');
    const cellUnidade = worksheet.getCell('G12');
    const cellFnmValue = worksheet.getCell('H11');
    const cellUnidadeValue = worksheet.getCell('H12');
    const cellResumoTitle = worksheet.getCell('A13');

    const cellMedicamento = worksheet.getCell('I11');
    const cellDataReport = worksheet.getCell('I12');
    const cellMedicamentoValue = worksheet.getCell('J11');
    const cellDataReportValue = worksheet.getCell('J12');

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
    const colI = worksheet.getColumn('I');
    const colJ = worksheet.getColumn('J');

    worksheet.getCell('A13').fill =
    worksheet.getCell('B13').fill =
    worksheet.getCell('C13').fill =
    worksheet.getCell('D13').fill =
    worksheet.getCell('E13').fill =
    worksheet.getCell('F13').fill =
    worksheet.getCell('G13').fill =
    worksheet.getCell('H13').fill =
      {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1fa37b' },
        bgColor: { argb: '1fa37b' },
      };

    // Alignment Format
    cellResumoTitle.alignment =
    cellRepublica.alignment =
    cellTitle.alignment = headerRow.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cellPharm.alignment =
    cellDistrict.alignment =
    cellProvince.alignment =
    cellMedicamento.alignment =
    cellDataReport.alignment =
      {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: false,
      };
    // Border Format
    cellRepublica.border =
    cellTitle.border =
    cellPharm.border =
    cellDistrictValue.border =
    cellDistrict.border =
    cellPharmParamValue.border =
    cellProvince.border =
    cellProvinceValue.border =
    cellMedicamento.border =
    cellMedicamentoValue.border =
    cellDataReport.border =
    cellDataReportValue.border =
      {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    // Assign Value to Cell
    cellRepublica.value = logoTitle;
    cellTitle.value = title;
    cellPharmParamValue.value = clinic.clinicName !== null ? clinic.clinicName : '';
    cellProvinceValue.value = clinic.province !== null ? clinic.province.description : '';
    cellDistrictValue.value = clinic.district !== null ? clinic.district.description : '';
    cellUnidadeValue.value = drug.value.packSize;
    cellFnmValue.value = drug.value.fnmCode
    cellFnm.value = 'FNM';
    cellResumoTitle.value = 'RESUMO';
    cellUnidade.value = 'Unidade'
    cellMedicamentoValue.value = drug.value.name;
    cellDataReportValue.value = moment(new Date()).format('DD-MM-YYYY');
    cellPharm.value = 'Farmácia';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellMedicamento.value = 'Medicamento';
    cellDataReport.value = 'Data do relatório';
    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    // merge a range of cells
    worksheet.mergeCells('A1:A7');
    worksheet.mergeCells('A9:J10');
    worksheet.mergeCells('B11:F11');
    worksheet.mergeCells('D12:F12');
    worksheet.mergeCells('A13:H13');
    // headerRow.height = 30;
    // add height size to Columns
    // add width size to Columns
    colA.width = 20;
    colB.width = 20;
    colC.width = 40;
    colD.width = 15;
    colE.width = 25;
    colF.width = 25;
    colG.width = 20;
    colH.width = 20;
    colI.width = 20;
    colJ.width = 20;

    // Add Style
    cellResumoTitle.font =
      {
        name: 'Arial',
        color: { argb: 'FFFFFFFF' },
        family: 2,
        size: 10,
      };
    // Add Image
    // Add Image
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 144, height: 98 },
    });

    // Cereate Table RESUMO
    worksheet.addTable({
      name: reportName,
      ref: 'A14',
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'DATA DO MOVIMENTO', filterButton: false },
        {
          name: 'MOVIMENTO',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'ENTRADAS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'SAÍDAS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'AJUSTE POSITIVO (+) ',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'AJUSTE NEGATIVO (-) ',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'PERDAS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'SALDOS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
      ],
      rows: data,
    });

    const stocksOrdenadosPorExpireDateDesc = this.filtrarEOrdenarObjetos(stocks);

    this.imprimirAoTerminar(stocksOrdenadosPorExpireDateDesc, worksheet, fileTypeParam, workbook);


  },


  createArrayOfArrayRowForResumo(rows) {
    let counter = 0
    const dataa = [];
    for (const row in rows) {
      counter++
      const createRow = [];
      createRow.push(rows[row].month+', '+ parseInt(rows[row].year));
      createRow.push(rows[row].moviment);
      createRow.push(rows[row].incomes);
      createRow.push(rows[row].outcomes);
      createRow.push(rows[row].posetiveAdjustment);
      createRow.push(rows[row].negativeAdjustment);
      createRow.push(rows[row].loses);
      createRow.push(rows[row].balance);

      dataa.push(createRow);
      if(counter === 3) break;
    }
    return dataa;
  },

  createArrayOfArrayRowForLote(lotes) {
    const dataa = [];
    for (const lote in lotes) {
      const createRow = [];
      createRow.push(lotes[lote].numLote)
      createRow.push(moment(lotes[lote].eventDate).format('DD-MM-YYYY'));
      createRow.push(lotes[lote].moviment);
      createRow.push(lotes[lote].incomes);
      createRow.push(lotes[lote].outcomes);
      createRow.push(lotes[lote].posetiveAdjustment);
      createRow.push(lotes[lote].negativeAdjustment);
      createRow.push(lotes[lote].loses);
      createRow.push(lotes[lote].balance);
      createRow.push(moment(lotes[lote].validade).format('DD-MM-YYYY'));

      dataa.push(createRow);
    }

    return dataa;
  },

  async imprimirAoTerminar(stocksOrdenadosPorExpireDateDesc, docOrWorksheet, fileTypeParam, workbook) {
    const promises = [];
    const lotesPersonalisados = []
    for(const stockk in stocksOrdenadosPorExpireDateDesc) {
        const stock1 = []
        stock1.push(stocksOrdenadosPorExpireDateDesc[stockk])

        const promise = drugFileService.apiGetDrugBatchSummary(stock1[0].clinic_id, stock1[0].id).then((resp) => {
          const lotesDoStock = resp.data;

          for (let i = 0; i < lotesDoStock.length; i++) {
            // Adicionar os atributos "numLote" e "validade" a cada objeto
            lotesDoStock[i].numLote = stocksOrdenadosPorExpireDateDesc[stockk].batchNumber;
            lotesDoStock[i].validade = moment(stocksOrdenadosPorExpireDateDesc[stockk].expireDate).format('DD-MM-YYYY');
          }
          const lotesOrdenados = this.ordenaPorMovimentoDesc(lotesDoStock)
          for (let i = 0; i < lotesOrdenados.length; i++) {
            lotesPersonalisados.push(lotesOrdenados[i])
          }

      });
      promises.push(promise);
    }

    await Promise.all(promises);
    const data2Result = this.createArrayOfArrayRowForLote(this.ordenaPorMovimentoDesc1(lotesPersonalisados))
    if (fileTypeParam === 'PDF'){
          const desiredDefinition1 = [
            [
              { content: 'LOTES', colSpan: 10 },
            ],
            [
              { content: 'NR. DO LOTE'},
              { content: 'DATA DE MOVIMENTO'},
              { content: 'MOVIMENTO' },
              { content: 'ENTRADA' },
              { content: 'SAÍDA' },
              { content: 'AJUSTE POSITIVO (+)' },
              { content: 'AJUSTE NEGATIVO (-)' },
              { content: 'PERDAS' },
              { content: 'SALDO' },
              { content: 'VALIDADE' },
            ],
          ];

          autoTable(docOrWorksheet, {
            // margin: { top: 45 },
            bodyStyles:
            {
              overflow: 'linebreak',
              cellWidth: 'wrap',
              valign: 'middle',
              // font: 'arial',
              fontSize: 6,
              // cellPadding: 8,
              overflowColumns: 'linebreak',
            },
            headStyles:
            {
              valign: 'bottom',
              halign: 'center',
              fontSize: 6,
              lineWidth: 0.5,
              lineColor: [230, 230, 230],
              fillColor: [255, 255, 255],
              textColor: [96, 96, 96],
            },

            theme: 'grid',
            head: desiredDefinition1,
            body: data2Result,
        });
    if (isOnline.value && !isMobile.value) {
      // return docOrWorksheet.save(fileName.concat('.pdf'));
      window.open(docOrWorksheet.output('bloburl'));
    } else {
      const pdfOutput = docOrWorksheet.output();
      this.downloadFile(fileName, 'pdf', pdfOutput);
    }
  } else {
    docOrWorksheet.mergeCells(
      'A' +
        (Number(docOrWorksheet.lastRow.number) + 1) +
        ':J' +
        (Number(docOrWorksheet.lastRow.number) + 1)
    );

    const cellLotesTitle = docOrWorksheet.getCell('A' + (Number(docOrWorksheet.lastRow.number)))
    cellLotesTitle.value = 'LOTES'
    cellLotesTitle.fill =
    {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1fa37b' },
      bgColor: { argb: '1fa37b' },
    };
    cellLotesTitle.font = {
      name: 'Arial',
      color: { argb: 'FFFFFFFF' },
      family: 2,
      size: 10,
      italic: false,
    };


    // Format all data cells
    const lastRowNum =  docOrWorksheet.lastRow.number !== undefined ? docOrWorksheet.lastRow.number : 0;
    const lastTableRowNum = lastRowNum;
    // Loop through all table's row
    for (let i = 14; i <= lastTableRowNum; i++) {
      const row = docOrWorksheet.getRow(i);
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
        if (i === 13) {
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
            size: 10,
            italic: false,
          };
        }
      });
    }

    // Cereate Table LOTES
    docOrWorksheet.addTable({
      name: reportName,
      ref: 'A' + (Number(docOrWorksheet.lastRow.number) + 1),
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },

      columns: [
        { name: 'NR. DO LOTE', filterButton: false },
        { name: 'DATA DO MOVIMENTO', filterButton: false },
        {
          name: 'MOVIMENTO',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'ENTRADAS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'SAÍDAS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'AJUSTE POSITIVO (+) ',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'AJUSTE NEGATIVO (-) ',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'PERDAS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'SALDOS',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'VALIDADE',
          totalsRowFunction: 'none',
          filterButton: false,
        },
      ],
      rows: data2Result,
    });

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
      const titleFile = 'StockRecebido.xlsx';
      console.log('result' + titleFile);
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
  },

  // Método para filtrar e ordenar os objetos
  filtrarEOrdenarObjetos(stocks) {
    const dataAtual = moment();

    // Filtra os objetos que não expiraram
    const objetosNaoExpirados = stocks.filter(objeto =>
      moment(objeto.expireDate).isAfter(dataAtual)
    );

    // Ordena os objetos pelo mais próximo a expirar
    const objetosOrdenados = objetosNaoExpirados.sort((a, b) =>
      moment(a.expireDate).diff(moment(b.expireDate))
    );

    return objetosOrdenados;
  },

  ordenaPorMovimentoDesc(lotes) {
    // Ordena os objetos pelo mais recentemente movimentado
    const objetosOrdenados = lotes.sort((a, b) =>
      moment(b.eventDate).diff(moment(a.eventDate))
    );

    return objetosOrdenados
  },
  ordenaPorMovimentoDesc1(arrayDeObjetos) {
    // Usar o método sort() para ordenar os objetos com base na propriedade eventDate
    arrayDeObjetos.sort(function(a, b) {
        // Converter as datas para objetos Date para facilitar a comparação
        const dataA = new Date(a.eventDate);
        const dataB = new Date(b.eventDate);

        // Comparar as datas e retornar o resultado da comparação
        return dataB - dataA;
    });

    // Retornar o array ordenado
    return arrayDeObjetos;
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
  },

  async getDataLocalReport(reportId) {
    let data = [];
    const reportData = await ReceivedStockMobileService.localDbGetAllByReportId(
      reportId
    );
    data = this.createArrayOfArrayRow(reportData);
    return data;
  },
};
