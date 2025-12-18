import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import StockService from '../../stockService/StockService';
import InventoryStockAdjustmentService from '../../stockAdjustment/InventoryStockAdjustmentService';
import patientVisitService from '../../patientVisit/patientVisitService';
import drugService from '../../drugService/drugService';
import StockUsedReport from 'src/stores/models/report/stock/StockUsedReport';
import StockOperationType from 'src/stores/models/stockoperation/StockOperationType';
import StockOperationTypeService from '../../stockOperationTypeService/StockOperationTypeService';
import DestroyedStockService from '../../destroyedStockService/DestroyedStockService';
import ReferedStockMovimentService from '../../referedStockMovimentService/ReferedStockMovimentService';
import db from 'src/stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isMobile } = useSystemUtils();
const usedStockReportDexie = db[StockUsedReport.entity];

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let usedStockReportMobileCache: any[] = [];

const setUsedStockReportCache = (rows: any[]) => {
  usedStockReportMobileCache = rows.map((row) => clone(row));
};

const getUsedStockReportCache = () =>
  usedStockReportMobileCache.map((row) => clone(row));

const upsertUsedStockReportCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = usedStockReportMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      usedStockReportMobileCache.splice(index, 1, payload);
    } else {
      usedStockReportMobileCache.push(payload);
    }
  });
};

const removeUsedStockReportFromCache = (predicate: (row: any) => boolean) => {
  usedStockReportMobileCache = usedStockReportMobileCache.filter(
    (entry) => !predicate(entry)
  );
};

const refreshUsedStockReportCache = async () => {
  const rows = await usedStockReportDexie.toArray();
  setUsedStockReportCache(rows);
  return getUsedStockReportCache();
};

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    await this.localDbDeleteByReportId(reportParams.id);
    let resultDrugsStocks = [];
    let resultDrugStocksInventory = [];
    let resultDrugStocksDestruction = [];
    let resultDrugStocksReferred = [];
    // let resultDrugStockReferred = []
    let resultDrugPackaged = [];
    let arrayDrugStock = [];
    const stocks = await StockService.localDbGetAll();
    const result = stocks.filter(
      (stock) =>
        stock.entrance?.dateReceived >= reportParams.startDate &&
        stock.entrance?.dateReceived <= reportParams.endDate &&
        stock.drug.clinical_service_id === reportParams.clinicalService
    );
    resultDrugsStocks = this.groupedMap(result, 'drug_id');
    arrayDrugStock = Array.from(resultDrugsStocks.keys());
    const inventoryStockAdjustments =
      await InventoryStockAdjustmentService.localDbGetAll();
    const inventoryStocks = inventoryStockAdjustments.filter(
      (inventoryStock) =>
        inventoryStock.inventory.startDate >= reportParams.startDate &&
        inventoryStock.inventory.endDate <= reportParams.endDate &&
        arrayDrugStock.includes(inventoryStock.adjustedStock.drug.id)
    );
    resultDrugStocksInventory = this.groupedMapChild(
      inventoryStocks,
      'adjustedStock.drug.id'
    );

    const packs = await patientVisitService.localDbGetPacks();
    const packagedDrug = [];
    const packsDate = packs.filter(
      (pack) =>
        pack !== undefined &&
        pack.pickupDate >= reportParams.startDate &&
        pack.pickupDate <= reportParams.endDate
    );
    packsDate.forEach((pack) => {
      pack.packagedDrugs.forEach((item) => {
        packagedDrug.push(item);
      });
    });
    resultDrugPackaged = this.groupedMapChildPack(packagedDrug, 'drug_id');
    const destroyedStocks = await DestroyedStockService.localDbGetAll();
    const adjustedDestroyedStocks = [];
    let resultDestruccted = [];
    resultDestruccted = destroyedStocks.filter(
      (destroyedStock) =>
        destroyedStock.date >= reportParams.startDate &&
        destroyedStock.date <= reportParams.endDate
    );
    resultDestruccted.forEach((destroyedStock) => {
      destroyedStock.adjustments.forEach((destroyedAdjust) => {
        adjustedDestroyedStocks.push(destroyedAdjust);
      });
    });
    resultDrugStocksDestruction = this.groupedMapChildAdjustments(
      adjustedDestroyedStocks,
      'adjustedStock'
    );
    const referredStocks = await ReferedStockMovimentService.localDbGetAll();
    const adjustedReferedStocks = [];
    let resultAdjustedReferred = [];
    resultAdjustedReferred = referredStocks.filter(
      (referredStock) =>
        referredStock.date >= reportParams.startDate &&
        referredStock.date <= reportParams.endDate
    );
    resultAdjustedReferred.forEach((referredStock) => {
      referredStock.adjustments.forEach((referredAdjust) => {
        adjustedReferedStocks.push(referredAdjust);
      });
    });
    resultDrugStocksReferred = this.groupedMapChildAdjustments(
      adjustedReferedStocks,
      'adjustedStock'
    );
    // return resultDrugStocksReferred
    const drugsIds = Array.from(resultDrugsStocks.keys());
    const stockDestructedIds = Array.from(resultDrugStocksDestruction.keys());
    const referredStocksIds = Array.from(resultDrugStocksReferred.keys());
    for (const drug of drugsIds) {
      const drugObj = await drugService.getCleanDrugById(drug);
      const usedStock = new StockUsedReport();
      usedStock.fnmCode = drugObj.fnmCode;
      usedStock.drugName = drugObj.name;
      usedStock.actualStock = 0;
      usedStock.receivedStock = 0;
      usedStock.adjustment = 0;
      resultDrugsStocks.get(drugObj.id).forEach((stock) => {
        usedStock.receivedStock += stock.unitsReceived;
        usedStock.actualStock += stock.unitsReceived;
        stockDestructedIds.forEach((drugStockDestruiction) => {
          if (drugStockDestruiction === stock.id) {
            resultDrugStocksDestruction
              .get(drugStockDestruiction)
              .forEach((destructionAdjustment) => {
                usedStock.adjustment -= destructionAdjustment.adjustedValue;
                usedStock.actualStock -= destructionAdjustment.adjustedValue;
              });
          }
        });
        referredStocksIds.forEach((drugStockReferredId) => {
          if (drugStockReferredId === stock.id) {
            resultDrugStocksReferred
              .get(drugStockReferredId)
              .forEach((referredAdjustment) => {
                const operation =
                  StockOperationTypeService.getStockOperatinTypeById(
                    referredAdjustment.operation.id
                  );
                if (operation.code === 'AJUSTE_POSETIVO') {
                  usedStock.adjustment += referredAdjustment.adjustedValue;
                  usedStock.actualStock += referredAdjustment.adjustedValue;
                } else if (operation.code === 'AJUSTE_NEGATIVO') {
                  usedStock.adjustment -= referredAdjustment.adjustedValue;
                  usedStock.actualStock -= referredAdjustment.adjustedValue;
                }
              });
          }
        });
      });
      // console.log(resultDrugStocksInventory.get(drugObj.id))
      const inventoryAdjustmentList =
        resultDrugStocksInventory.get(drugObj.id) === undefined
          ? []
          : resultDrugStocksInventory.get(drugObj.id);
      for (const inventoryAdjustment of inventoryAdjustmentList) {
        if (inventoryAdjustment.operation.code === 'AJUSTE_POSETIVO') {
          usedStock.adjustment += inventoryAdjustment.adjustedValue;
          usedStock.actualStock += inventoryAdjustment.adjustedValue;
        } else if (inventoryAdjustment.operation.code === 'AJUSTE_NEGATIVO') {
          usedStock.adjustment -= inventoryAdjustment.adjustedValue;
          usedStock.actualStock -= inventoryAdjustment.adjustedValue;
        }
      }
      if (resultDrugPackaged.get(drugObj.id) !== undefined) {
        resultDrugPackaged.get(drugObj.id).forEach((drugPackaged) => {
          usedStock.stockIssued += drugPackaged.quantitySupplied;
          usedStock.actualStock -= drugPackaged.quantitySupplied;
        });
      }
      usedStock.reportId = reportParams.id;
      // patientHistory.period = reportParams.periodTypeView
      usedStock.year = reportParams.year;
      usedStock.endDate = reportParams.endDate;
      usedStock.startDate = reportParams.startDate;
      usedStock.id = uuidv4();
      await this.localDbAddOrUpdate(usedStock);
    }
  },

  groupedMap(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(e[key], [...(entryMap.get(e[key]) || []), e]),
      new Map()
    );
  },
  groupedMapChild(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(e.adjustedStock.drug.id, [
          ...(entryMap.get(e.adjustedStock.drug.id) || []),
          e,
        ]),
      new Map()
    );
  },
  groupedMapChildPack(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(e.drug.id, [...(entryMap.get(e.drug.id) || []), e]),
      new Map()
    );
  },
  groupedMapChildAdjustments(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(e.adjustedStock.id, [
          ...(entryMap.get(e.adjustedStock.id) || []),
          e,
        ]),
      new Map()
    );
  },
  getStockOperationTypeById(id) {
    return StockOperationType.query().where('id', id).first();
  },
  getStockOperationToVue() {
    StockOperationTypeService.localDbGetAll().then((stockOperationTypes) => {
      StockOperationType.insert({ data: stockOperationTypes });
    });
  },

  localDbAddOrUpdate(targetCopy: any) {
    const payload = clone(targetCopy);
    return usedStockReportDexie
      .put(payload)
      .then(() => {
        upsertUsedStockReportCache(payload);
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  async localDbDeleteByReportId(reportId: any) {
    await usedStockReportDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .delete();
    removeUsedStockReportFromCache((entry) => entry.reportId === reportId);
  },

  async localDbGetAllByReportId(reportId: any) {
    const records = await usedStockReportDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray();
    upsertUsedStockReportCache(records);
    return records.map((entry: any) => clone(entry));
  },

  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshUsedStockReportCache();
  },

  getCachedByReportId(reportId: any) {
    if (!isMobile.value) {
      return [];
    }
    return getUsedStockReportCache().filter(
      (entry) => entry.reportId === reportId
    );
  },
};
