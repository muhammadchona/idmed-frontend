import JsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import moment from 'moment'
import saveAs from 'file-saver'
import * as ExcelJS from 'exceljs'
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts'
import Report from 'src/services/api/report/ReportService'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import AbsentPatientMobileService from 'src/services/api/report/mobile/AbsentPatientMobileService'
import clinicService from 'src/services/api/clinicService/clinicService'

const {  isOnline } = useSystemUtils();


const reportName = 'PacientesFaltosos'
const logoTitle =
'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE'
const title = 'Relatório de Pacientes Faltosos ao \n Levantamento de ARV\'s'
const fileName = reportName.concat(
'_' + moment(new Date()).format('DD-MM-YYYY')
)

export default {
  async downloadPDF (id, fileType, params) {

    const  clinic = clinicService.currClinic()
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart' // or "smart", default is 16
    })
    const image = new Image()
    // image.src = '/src/assets/MoHLogo.png'
    image.src = 'src/assets/MoHLogo.png'
    const width = doc.internal.pageSize.getWidth()
    /*
      Fill Table
    */
    const cols = [
      'NID',
      'NOME',
      'Data que Faltou ao Levantamento de ARVs [0-59 dias faltoso] (d-m-a)',
      'Data em que Identificou o Abandono ao TARV [>59 dias faltoso] (d-m-a)',
      'Data em que Regressou à Unidade Sanitária',
      'Contacto'
    ]

    let data = ''
    let rowsAux = [];
    let firstReg = {}
    if (isOnline.value) {
      const rowsAux = await Report.api().get(`/absentPatientsReport/printReport/${id}/${fileType}`, { responseType: 'json' })
      if (rowsAux.response.status === 204) return rowsAux.response.status
      const firstReg = rowsAux.response.data[0]
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate)
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate)
       data = this.createArrayOfArrayRow(rowsAux.response.data)
    } else {
      rowsAux = await AbsentPatientMobileService.localDbGetAllByReportId(id)
      if(rowsAux.length === 0) return 204
      firstReg = rowsAux[0]
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate)
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate)
      data = this.createArrayOfArrayRow(rowsAux)
    }

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
      doc.addImage(image, 'PNG', data.settings.margin.left + 15, 5, 25, 25)
      doc.text('REPÚBLICA DE MOÇAMBIQUE', data.settings.margin.left + 2, 35)
      doc.text('MINISTÉRIO DA SAÚDE', data.settings.margin.left + 7, 40)
      doc.text('SERVIÇO NACIONAL DE SAÚDE', data.settings.margin.left, 45)
      doc.setFontSize(16)
      doc.text(
        'Relatório de Pacientes Faltosos ao',
        width / 2,
        35,
        {
          align: 'center'
        }
      )
      doc.text(
        'Levantamento de ARV\'s',
        width / 2,
        43,
        {
          align: 'center'
        }
      )
      doc.setFontSize(10)
      doc.text('US: ' + clinic.clinicName, width / 20, 57)
      // doc.text('US: ' + clinic, width / 2 + 80, 49)
      doc.text('Data Início:  ' + params.startDate, width / 2 + 97, 49)
      doc.text('Data Fim:    ' + params.endDate, width / 2 + 97, 57)

        // Footer
        const str = 'Pagina ' + doc.internal.getNumberOfPages()
        // Total page number plugin only available in jspdf v1.0+
        // if (typeof doc.putTotalPages === 'function') {
        //   str = str + ' de ' + totalPagesExp
        // }
        doc.setFontSize(10)

      // jsPDF 1.4+ uses getWidth, <1.4 uses .width
      const pageSize = doc.internal.pageSize
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
      doc.text(str, data.settings.margin.left, pageHeight - 10)
      },
      // startY: doc.lastAutoTable.finalY,
      theme: 'grid',
      head: [cols],
      body: data
    })
    // params.value.loading.loading.hide()
    if(isOnline.value) {
      return  doc.save('PacientesFaltosos.pdf')
    } else {
      console.log(doc)
      const pdfOutput = doc.output()
      console.log(pdfOutput)
      this.downloadFile(fileName,'pdf',pdfOutput)
    }

  },
  async downloadExcel  (id, fileType, params)  {
 
    const  clinic = clinicService.currClinic()
    let data = ''
    let rowsAux = [];
    let firstReg = {}
    if (isOnline.value) {
      const rowsAux = await Report.api().get(`/absentPatientsReport/printReport/${id}/${fileType}`, { responseType: 'json' })
      if (rowsAux.response.status === 204) return rowsAux.response.status
      const firstReg = rowsAux.response.data[0]
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate)
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate)
       data = this.createArrayOfArrayRow(rowsAux.response.data)
    } else {
      rowsAux = await AbsentPatientMobileService.localDbGetAllByReportId(id)
      if(rowsAux.length === 0) return 204
      firstReg = rowsAux[0]
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate)
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate)
      data = this.createArrayOfArrayRow(rowsAux)
    }
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'FGH'
    workbook.lastModifiedBy = 'FGH'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()

    const worksheet = workbook.addWorksheet(reportName)
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,' + MOHIMAGELOG,
      extension: 'png'
    })

    // // Get Cells
    const cellRepublica = worksheet.getCell('A8')
    const cellTitle = worksheet.getCell('A9')
    const cellPharm = worksheet.getCell('A11')
    const cellPharmParamValue = worksheet.getCell('B11')

    const cellStartDate = worksheet.getCell('E11')
    const cellEndDate = worksheet.getCell('E12')
    const cellStartDateParamValue = worksheet.getCell('F11')
    const cellEndDateParamValue = worksheet.getCell('F12')

  // // Get Rows
    const headerRow = worksheet.getRow(15)

    // Get Columns
    const colA = worksheet.getColumn('A')
    const colB = worksheet.getColumn('B')
    const colC = worksheet.getColumn('C')
    const colD = worksheet.getColumn('D')
    const colE = worksheet.getColumn('E')
    const colF = worksheet.getColumn('F')

    // Format Table Cells
    // Alignment Format
    cellRepublica.alignment =
      cellTitle.alignment =
      headerRow.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }

    cellPharm.alignment =
      cellStartDate.alignment =
      cellEndDate.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false
        }

    // Border Format
    // cellRepublica.border =
      cellTitle.border =
      cellPharm.border =
      cellPharmParamValue.border =
      cellStartDate.border =
      cellStartDateParamValue.border =
      cellEndDate.border =
      cellEndDateParamValue.border =
        {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

    // Assign Value to Cell
    cellRepublica.value = logoTitle
    cellTitle.value = title
    cellPharmParamValue.value = clinic.clinicName
    cellStartDateParamValue.value = params.startDate
    cellEndDateParamValue.value = params.endDate
    cellPharm.value = 'Unidade Sanitária'
    cellStartDate.value = 'Data Início'
    cellEndDate.value = 'Data Fim'

    // merge a range of cells
    worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:F10')
    worksheet.mergeCells('B11:D11')
    worksheet.mergeCells('A12:D12')
    headerRow.height = 30

    // add height size to Columns
    // add width size to Columns
    colA.width = 25
    colB.width = 30
    colC.width = 25
    colD.width = 25
    colE.width = 25
    colF.width = 20

    // Add Style
    cellTitle.font =
      cellStartDate.font =
      cellEndDate.font =
      cellPharm.font =
        {
          name: 'Arial',
          family: 2,
          size: 11,
          italic: false,
          bold: true
        }

    // Add Image
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 144, height: 98 }
    })

    // Cereate Table
    worksheet.addTable({
      name: reportName,
      ref: 'A14',
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false
      },
      columns: [
        // { name: 'ORD', totalsRowLabel: 'none', filterButton: false },
        { name: 'NID', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'Nome', totalsRowFunction: 'none', filterButton: false },
        {
          name: 'Data que Faltou ao Levantamento de ARVs [0-59 dias faltoso] (d-m-a)',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'Data em que Identificou o Abandono ao TARV [>59 dias faltoso] (d-m-a)',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'Data em que Regressou à Unidade Sanitária',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'Contacto',
          totalsRowFunction: 'none',
          filterButton: false
        }
      ],
      rows: data
    })

    // Format all data cells
    const lastRowNum =
      worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0
    const lastTableRowNum = lastRowNum

    // Loop through all table's row
    for (let i = 14; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i)

      // Now loop through every row's cell and finally set alignment
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }
        if (i === 14) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1fa37b' },
            bgColor: { argb: '1fa37b' }
          }
          cell.font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 11,
            italic: false,
            bold: true
          }
        }
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const fileExtension = '.xlsx'

    const blob = new Blob([buffer], { type: fileType })

    if (isOnline.value) {

    saveAs(blob, fileName + fileExtension)
    } else  {
      //   var blob = new Blob(materialEducativo.blop)
      //  const bytes = new Uint8Array(materialEducativo.blop)
     // var UTF8_STR = new Uint8Array(pdfOutput)
     //   var BINARY_ARR = UTF8_STR.buffer
     const titleFile = 'PacientesFaltosos.xlsx'
     console.log('result' + titleFile)
      saveBlob2File(fileName, blob)
      function saveBlob2File (fileName, blob) {
         const folder = cordova.file.externalRootDirectory + 'Download'
        //  var folder = 'Download'
         window.resolveLocalFileSystemURL(folder, function (dirEntry) {
           console.log('file system open: ' + dirEntry.name)
            console.log('file system open11111: ' + blob)
           createFile(dirEntry, fileName, blob)
          // $q.loading.hide()
         }, onErrorLoadFs)
       }
          function createFile (dirEntry, fileName, blob) {
         // Creates a new file
         dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
           writeFile(fileEntry, blob)
         }, onErrorCreateFile)
       }
  
       function writeFile (fileEntry, dataObj) {
         // Create a FileWriter object for our FileEntry
         fileEntry.createWriter(function (fileWriter) {
           fileWriter.onwriteend = function () {
             console.log('Successful file write...')
              openFile()
           }
  
           fileWriter.onerror = function (error) {
             console.log('Failed file write: ' + error)
           }
           fileWriter.write(dataObj)
         })
       }
       function onErrorLoadFs (error) {
         console.log(error)
       }
  
       function onErrorCreateFile (error) {
         console.log('errorr: ' + error.toString())
       }
     function openFile () {
         const strTitle = titleFile
           console.log('file system 44444: ' + strTitle)
          const folder = cordova.file.externalRootDirectory + 'Download/' + strTitle
            console.log('file system 2222: ' + folder)
            const documentURL = decodeURIComponent(folder)
     cordova.plugins.fileOpener2.open(
       documentURL,
         'application/vnd.ms-excel', {
             error: function (e) {
                 console.log('file system open3333366: ' + e + documentURL)
             },
             success: function () {
  
             }
         })
     }
    }
  },
  createArrayOfArrayRow (rows) {
    const data = []

    for (const row in rows) {
      const createRow = []
      createRow.push(rows[row].nid)
      createRow.push(rows[row].firstNames)
      createRow.push(moment(new Date(rows[row].dateMissedPickUp)).format('DD-MM-YYYY'))
      const dataIdent = rows[row].dateIdentifiedAbandonment 
      createRow.push(  (dataIdent !== null  && dataIdent !== '' )? moment(new Date(rows[row].dateIdentifiedAbandonment)).format('DD-MM-YYYY') : '')
      createRow.push(rows[row].returnedPickUp !== null ? moment(new Date(rows[row].returnedPickUp)).format('DD-MM-YYYY') : '')
      createRow.push(rows[row].contact)

      data.push(createRow)
    }

    return data
  },
 

  downloadFile(fileName , fileType, blop) {
    // console.log(blop)
    // var pdfOutput = blop.output()
   //  console.log(pdfOutput)
   //  if (typeof cordova !== 'undefined') {
      //   var blob = new Blob(materialEducativo.blop)
      //  const bytes = new Uint8Array(materialEducativo.blop)
     // var UTF8_STR = new Uint8Array(pdfOutput)
     //   var BINARY_ARR = UTF8_STR.buffer
        const titleFile = fileName + fileType
        console.log('result' + titleFile)
         saveBlob2File(titleFile, blop)
         function saveBlob2File (fileName, blob) {
            const folder = cordova.file.externalRootDirectory + 'Download'
           //  var folder = 'Download'
            window.resolveLocalFileSystemURL(folder, function (dirEntry) {
              console.log('file system open: ' + dirEntry.name)
               console.log('file system open11111: ' + blob)
              createFile(dirEntry, fileName, blob)
             // $q.loading.hide()
            }, onErrorLoadFs)
          }
             function createFile (dirEntry, fileName, blob) {
            // Creates a new file
            dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
              writeFile(fileEntry, blob)
            }, onErrorCreateFile)
          }
    
          function writeFile (fileEntry, dataObj) {
            // Create a FileWriter object for our FileEntry
            fileEntry.createWriter(function (fileWriter) {
              fileWriter.onwriteend = function () {
                console.log('Successful file write...')
                 openFile()
              }
    
              fileWriter.onerror = function (error) {
                console.log('Failed file write: ' + error)
              }
              fileWriter.write(dataObj)
            })
          }
          function onErrorLoadFs (error) {
            console.log(error)
          }
    
          function onErrorCreateFile (error) {
            console.log('errorr: ' + error.toString())
          }
        function openFile () {
            const strTitle = titleFile
              console.log('file system 44444: ' + strTitle)
             const folder = cordova.file.externalRootDirectory + 'Download/' + strTitle
               console.log('file system 2222: ' + folder)
               const documentURL = decodeURIComponent(folder)
        cordova.plugins.fileOpener2.open(
          documentURL,
            'application/pdf', {
                error: function (e) {
                    console.log('file system open3333366: ' + e + documentURL)
                },
                success: function () {
    
                }
            })
        }
     // }
   }
}