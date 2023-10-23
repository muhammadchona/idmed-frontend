import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import StockReceivedReport from 'src/stores/models/report/stock/StockReceivedReport';
import StockService from '../../stockService/StockService';

// const activeInDrugStore = useRepo(ActiveInDrugStore);



export default {

   getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params)
    console.log(reportParams)
   StockService.localDbGetAll().then(stocks => {
      console.log(stocks)
   const result = stocks.filter(stock => (stock.entrance.dateReceived >= reportParams.startDate && stock.entrance.dateReceived <= reportParams.endDate) && stock.drug.clinicalService.id === reportParams.clinicalService)
      console.log(result)
      return result
    }).then(reportDatas => {
      reportDatas.forEach(reportData => {
        const stockReceived = new StockReceivedReport()
        stockReceived.reportId = reportParams.id
      // patientHistory.period = reportParams.periodTypeView
      stockReceived.year = reportParams.year
      stockReceived.startDate = reportParams.startDate
      stockReceived.endDate = reportParams.endDate
      stockReceived.orderNumber = reportData.entrance.orderNumber
      stockReceived.drugName = reportData.drug.name
      stockReceived.expiryDate = reportData.expireDate
      stockReceived.dateReceived = reportData.entrance.dateReceived
      stockReceived.unitsReceived = reportData.unitsReceived
      stockReceived.manufacture = reportData.manufacture
      stockReceived.batchNumber = reportData.batchNumber
      stockReceived.id = uuidv4()
      this.localDbAddOrUpdate(stockReceived)
     console.log(stockReceived)
    })
      })
 
  },

    localDbAddOrUpdate (targetCopy: any) {
        return nSQL().onConnected(() => {
            nSQL(StockReceivedReport.entity).query('upsert', targetCopy).exec()
        })
        },

    async localDbGetAllByReportId (reportId: any) {
        return nSQL(StockReceivedReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
            if (result !== undefined) {
            return result
            }
            return null
        })
        },
     async getDataLocalReport (reportId: string) {
          
      return nSQL(StockReceivedReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
        return result
    })
          
           
        }

}