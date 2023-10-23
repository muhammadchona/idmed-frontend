/* eslint-disable */
import JsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import * as ExcelJS from 'exceljs'
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts'
import Report from 'src/services/api/report/ReportService'
import moment from 'moment'

 const logoTitle ='REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE'
const title = 'HISTÓRICO DE LEVANTAMENTOS PARA \n PACIENTES REFERIDOS'
const reportName = 'HistoricoDeLevanPaciRefere'
 const fileName = reportName.concat('_' + moment(new Date()).format('DD-MM-YYYY'));

export default {
    async downloadPDF (params) {
      const doc = new JsPDF({
        orientation: 'l',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 'smart' 
      })
      const image = new Image()
      image.src = 'data:image/png;base64,' + MOHIMAGELOG
        const width = doc.internal.pageSize.getWidth()
      /*
        Fill Table
      */
        const cols = [
          'ORD',
          'NID',
          'Nome',
          'Tipo TARV',
          'Regime Terapeutico',
          'Tipo De Dispensa',
          'Data Levant.',
          'Data Prox. Levant.',
          'Farmacia'
        ]
      const rows = await Report.printReportOther('referredPatientsReport', params.id)
      if(rows.status === 204) return rows.status
      const firstReg = rows.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      const data = this.createArrayOfArrayRow(rows.data)
  
      autoTable(doc, {
        margin: { top: 60 },
        bodyStyles: {
          halign: 'center'
        },
        headStyles: {
          halign: 'center',
          valign: 'middle'
        },
        didDrawPage: function (data) {
          // Header
          doc.setFontSize(10)
          doc.setTextColor(40)
          doc.setFontSize(16)
          doc.text(title,
            width / 2,
            40,
            {
              align: 'center'
            }
          )
          doc.setFontSize(10)
          doc.text('Unidade Sanitaria: ' + params.clinic.clinicName, width / 15, 57)
        //  doc.text('Data Início: ' + moment(params.startDateParam, 'DD-MM-YYYY').format('DD/MM/YYYY'), width / 2 + 98, 49)
        //  doc.text('Data Fim: ' + moment(params.endDateParam, 'DD-MM-YYYY').format('DD/MM/YYYY'), width / 2 + 98, 57)
          doc.text('Periodo: ' + params.startDateParam +' à '+ params.endDateParam, width / 2 + 90, 57)
          // doc.line(0, 35, 400, 50);
        },
        theme: 'grid',
        head: [cols],
        body: data,
      });
     // params.value.loading.loading.hide()
      return doc.save(reportName + '.pdf')
    },
    async downloadExcel(params) {

      const rows = await Report.printReportOther('referredPatientsReport',params.id)
      if(rows.status === 204) return rows.status
      const firstReg = rows.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      const data =  this.createArrayOfArrayRow(rows.data)
  
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FGH';
      workbook.lastModifiedBy = 'FGH';
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();
  
      // Force workbook calculation on load
      //workbook.calcProperties.fullCalcOnLoad = true;
      const worksheet = workbook.addWorksheet(reportName);
     
      // Get Cells
      const cellRepublica = worksheet.getCell('A8');
      const cellTitle = worksheet.getCell('A9');
      const cellPharm = worksheet.getCell('A11');
      const cellDistrict = worksheet.getCell('A12');
      const cellProvince = worksheet.getCell('D12');
      const cellStartDate = worksheet.getCell('G11');
      const cellEndDate = worksheet.getCell('G12');
      const cellPharmParamValue = worksheet.getCell('B11');
      const cellDistrictParamValue = worksheet.getCell('B12');
      const cellProvinceParamValue = worksheet.getCell('E12');
      const cellStartDateParamValue = worksheet.getCell('H11');
      const cellEndDateParamValue = worksheet.getCell('H12');
  
      // Get Rows
      const headerRow = worksheet.getRow(14);
  
      //Get Columns
      const colA = worksheet.getColumn('A');
      const colB = worksheet.getColumn('B');
      const colC = worksheet.getColumn('C');
      const colD = worksheet.getColumn('D');
      const colE = worksheet.getColumn('E');
      const colF = worksheet.getColumn('F');
      const colG = worksheet.getColumn('G');
      const colH = worksheet.getColumn('H');
      const colI = worksheet.getColumn('I');
  
  
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
      cellPharmParamValue.value = params.clinic !== null ? params.clinic.clinicName : '';
      cellProvinceParamValue.value = params.province !== null ? params.province.description : ''
      cellDistrictParamValue.value = params.district !== null ? params.district.description : '';
      cellStartDateParamValue.value = moment(params.startDateParam, 'DD-MM-YYYY').format('DD/MM/YYYY');
      cellEndDateParamValue.value = moment(params.endDateParam, 'DD-MM-YYYY').format('DD/MM/YYYY');
      cellPharm.value = 'Farmácia';
      cellDistrict.value = 'Distrito';
      cellProvince.value = 'Província';
      cellStartDate.value = 'Data Início';
      cellEndDate.value = 'Data Fim';
  
      // merge a range of cells
      worksheet.mergeCells('A1:A7');
      worksheet.mergeCells('A9:H10');
      worksheet.mergeCells('B11:F11');
      worksheet.mergeCells('B12:C12');
      worksheet.mergeCells('E12:F12');
      worksheet.mergeCells('A13:H13');
  
      // add width size to Columns
      // add height size to Rows
      headerRow.height = 30;
  
      // add height size to Columns
      // add width size to Columns
      colA.width = 10;
      colB.width = 30;
      colC.width = 25;
      colD.width = 25;
      colE.width = 20;
      colF.width = 20;
      colG.width = 20;
      colH.width = 20;
      colI.width = 20;
  
  
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
          { name: 'Ord', totalsRowLabel: 'Totals:', filterButton: false },
          { name: 'NID', totalsRowLabel: 'Totals:', filterButton: false },
          { name: 'Nome', totalsRowFunction: 'none', filterButton: false },
          {
            name: 'Tipo TARV',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Regime Terapeutico',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Tipo de Dispensa',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Data Levant.',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Data Prox. Levant.',
            totalsRowFunction: 'none',
            filterButton: false,
          },
          {
            name: 'Farmacia',
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
  
      //Loop through all table's row
      for (let i = 14; i <= lastTableRowNum; i++) {
        const row = worksheet.getRow(i);
  
        //Now loop through every row's cell and finally set alignment
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
          if (i == 14) {
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
      
      saveAs(blob, fileName + fileExtension);
    },
    
    createArrayOfArrayRow(rows) {
      const data = []
  
      let ord = 0
      for (const row in rows) {
        const createRow = []
        createRow.push(++ord)
        createRow.push(rows[row].nid)
        createRow.push(rows[row].name)
        createRow.push(rows[row].tarvType)
        createRow.push(rows[row].therapeuticalRegimen)
        createRow.push(rows[row].dispenseType)
        createRow.push(this.getFormatDDMMYYYY(rows[row].pickUpDate))
        createRow.push(this.getFormatDDMMYYYY(rows[row].nextPickUpDate))
        createRow.push(rows[row].referralPharmacy)
  
        data.push(createRow)
      }
  
      return data
    },
    getFormatDDMMYYYY(date) {
      return moment(date).format('DD-MM-YYYY');
    },
  }
