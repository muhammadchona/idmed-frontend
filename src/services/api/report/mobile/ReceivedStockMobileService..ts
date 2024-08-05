import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import { useRepo } from 'pinia-orm';
import StockReceivedReport from 'src/stores/models/report/stock/StockReceivedReport';
import StockService from '../../stockService/StockService';
import db from 'src/stores/dexie';

const StockReceivedRepo = useRepo(StockReceivedReport);
const stockReceivedReportDexie = StockReceivedReport.entity;

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);
    const stocks = await StockService.localDbGetAll();
    const reportDatas = stocks.filter(
      (stock) =>
        stock.entrance.dateReceived >= reportParams.startDate &&
        stock.entrance.dateReceived <= reportParams.endDate &&
        stock.drug.clinicalService.id === reportParams.clinicalService
    );

    reportDatas.forEach((reportData) => {
      const stockReceived = new StockReceivedReport();
      stockReceived.reportId = reportParams.id;
      // patientHistory.period = reportParams.periodTypeView
      stockReceived.year = reportParams.year;
      stockReceived.startDate = reportParams.startDate;
      stockReceived.endDate = reportParams.endDate;
      stockReceived.orderNumber = reportData.entrance.orderNumber;
      stockReceived.drugName = reportData.drug.name;
      stockReceived.expiryDate = reportData.expireDate;
      stockReceived.dateReceived = reportData.entrance.dateReceived;
      stockReceived.unitsReceived = reportData.unitsReceived;
      stockReceived.manufacture = reportData.manufacture;
      stockReceived.batchNumber = reportData.batchNumber;
      stockReceived.id = uuidv4();
      this.localDbAddOrUpdate(stockReceived);
      console.log(stockReceived);
    });
  },

  async localDbAddOrUpdate(targetCopy: any) {
    return db[stockReceivedReportDexie]
      .add(JSON.parse(JSON.stringify(targetCopy)))
      .then(() => {
        StockReceivedRepo.save(targetCopy);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async localDbGetAllByReportId(reportId: any) {
    const records = await db[stockReceivedReportDexie]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray();
    return records;
  },
};
