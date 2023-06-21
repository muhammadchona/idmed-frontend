import moment from 'moment'
import saveAs from 'file-saver'
import * as ExcelJS from 'exceljs'

const reportName = 'RelatorioDeMigracao'
const title = 'Relatorio de Migracao iDart/IDMED'
const fileName = reportName.concat(
'_' + moment(new Date()).format('DD-MM-YYYY')
)

export default {
  async downloadExcel (provinceName, districtName, usName, result) {
    const rows = result
    const data = this.createArrayOfArrayRow(rows)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'FGH'
    workbook.lastModifiedBy = 'FGH'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()

    const worksheet = workbook.addWorksheet(reportName)

    const cellTitle = worksheet.getCell('A9')

    const cellProvince = worksheet.getCell('A11')
    const cellProvinceParamValue = worksheet.getCell('B11')

    const cellDistrict = worksheet.getCell('C11')
    const cellDistrictParamValue = worksheet.getCell('D11')

    const cellDate = worksheet.getCell('E11')
    const cellDateParamValue = worksheet.getCell('F11')

    const cellPharm = worksheet.getCell('A12')
    const cellPharmParamValue = worksheet.getCell('B12')

    // Get Rows
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
    // cellRepublica.alignment =
      cellTitle.alignment =
      headerRow.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }

    cellPharm.alignment =
      cellDistrict.alignment =
      cellProvince.alignment =
      cellDate.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false
        }

    // Border Format
    // cellRepublica.border =
      cellTitle.border =
      cellPharm.border =
      cellDistrictParamValue.border =
      cellDistrict.border =
      cellPharmParamValue.border =
      cellProvince.border =
      cellProvinceParamValue.border =
      cellDate.border =
      cellDateParamValue.border =
        {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

    // Assign Value to Cell
    // cellRepublica.value = logoTitle
    cellTitle.value = title
    cellPharmParamValue.value = usName
    cellProvinceParamValue.value = provinceName
    cellDistrictParamValue.value = districtName
    cellDateParamValue.value = moment(new Date()).format('DD-MM-YYYY')
    cellPharm.value = 'Unidade Sanitária'
    cellDistrict.value = 'Distrito'
    cellProvince.value = 'Província'
    cellDate.value = 'Data'

    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:F10')
    // worksheet.mergeCells('B11:D11')
    worksheet.mergeCells('B12:F12')
    // worksheet.mergeCells('E12:H12')
    // worksheet.mergeCells('A13:I13')

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30

    // add height size to Columns
    // add width size to Columns
    colA.width = 30
    colB.width = 30
    colC.width = 30
    colD.width = 30
    colE.width = 30
    colF.width = 150

    // Add Style
      cellTitle.font =
      cellDistrict.font =
      cellProvince.font =
      cellDate.font =
      cellPharm.font =
        {
          name: 'Arial',
          family: 2,
          size: 11,
          italic: false,
          bold: true
        }

    // Add Image
    // worksheet.addImage(imageId, {
    //   tl: { col: 0, row: 1 },
    //   ext: { width: 144, height: 98 },
    // });

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
        { name: 'ORD', totalsRowLabel: 'none', filterButton: false },
        { name: 'ENTIDADE (iDart)', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'ID (iDart)', totalsRowFunction: 'none', filterButton: false },
        { name: 'CODIGO DO ERRO', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'ESTADO', totalsRowFunction: 'none', filterButton: false },
        { name: 'DESCRICAO', totalsRowFunction: 'none', filterButton: false }
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
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileExtension = '.xlsx'

    const blob = new Blob([buffer], { type: fileType })

    saveAs(blob, fileName + fileExtension)
  },
  createArrayOfArrayRow (rows) {
    const data = []
    let ord = 1

    for (const row in rows) {
      const createRow = []
      createRow.push(ord)
      createRow.push(rows[row].sourceEntity)
      createRow.push(rows[row].sourceId)
      createRow.push(rows[row].errorCode)
      createRow.push(rows[row].status)
      createRow.push(rows[row].errorDescription)

      data.push(createRow)
      ord += 1
    }
    ord = 0
    rows = []

    return data
  }
}
