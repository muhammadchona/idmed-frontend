import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import StockReceivedReport from 'src/stores/models/report/stock/StockReceivedReport';
import StockService from '../../stockService/StockService';
import db from 'src/stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isMobile } = useSystemUtils();
const stockReceivedReportDexie = db[StockReceivedReport.entity];

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let stockReceivedReportMobileCache: any[] = [];

const setStockReceivedReportCache = (rows: any[]) => {
  stockReceivedReportMobileCache = rows.map((row) => clone(row));
};

const getStockReceivedReportCache = () =>
  stockReceivedReportMobileCache.map((row) => clone(row));

const upsertStockReceivedReportCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = stockReceivedReportMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      stockReceivedReportMobileCache.splice(index, 1, payload);
    } else {
      stockReceivedReportMobileCache.push(payload);
    }
  });
};

const removeStockReceivedReportFromCache = (
  predicate: (row: any) => boolean
) => {
  stockReceivedReportMobileCache = stockReceivedReportMobileCache.filter(
    (entry) => !predicate(entry)
  );
};

const refreshStockReceivedReportCache = async () => {
  const rows = await stockReceivedReportDexie.toArray();
  setStockReceivedReportCache(rows);
  return getStockReceivedReportCache();
};

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    await this.localDbDeleteByReportId(reportParams.id);
    const stocks = await StockService.localDbGetAll();
    const reportDatas = stocks.filter(
      (stock) =>
        stock.entrance?.dateReceived >= reportParams.startDate &&
        stock.entrance?.dateReceived <= reportParams.endDate &&
        stock.drug.clinicalService.id === reportParams.clinicalService
    );

    for (const reportData of reportDatas) {
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
      await this.localDbAddOrUpdate(stockReceived);
    }
  },

  async localDbAddOrUpdate(targetCopy: any) {
    const payload = clone(targetCopy);
    return stockReceivedReportDexie
      .put(payload)
      .then(() => {
        upsertStockReceivedReportCache(payload);
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  async localDbDeleteByReportId(reportId: any) {
    await stockReceivedReportDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .delete();
    removeStockReceivedReportFromCache((entry) => entry.reportId === reportId);
  },

  async localDbGetAllByReportId(reportId: any) {
    const records = await stockReceivedReportDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray();

    upsertStockReceivedReportCache(records);
    return records.map((entry: any) => clone(entry));
  },

  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStockReceivedReportCache();
  },

  getCachedByReportId(reportId: any) {
    if (!isMobile.value) {
      return [];
    }
    return getStockReceivedReportCache().filter(
      (entry) => entry.reportId === reportId
    );
  },
};
