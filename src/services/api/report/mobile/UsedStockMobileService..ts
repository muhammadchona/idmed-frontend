import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import { useRepo } from 'pinia-orm';
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

const usedStockReportDexie = StockUsedReport.entity;
const usedStockReportRepo = useRepo(StockUsedReport);

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);
    let resultDrugsStocks = [];
    let resultDrugStocksInventory = [];
    let resultDrugStocksDestruction = [];
    let resultDrugStocksReferred = [];
    // let resultDrugStockReferred = []
    let resultDrugPackaged = [];
    let arrayDrugStock = [];
    const stocks = await StockService.localDbGetAll();
    console.log(stocks);
    const result = stocks.filter(
      (stock) =>
        stock.entrance.dateReceived >= reportParams.startDate &&
        stock.entrance.dateReceived <= reportParams.endDate &&
        stock.drug.clinical_service_id === reportParams.clinicalService
    );
    console.log(result);
    resultDrugsStocks = this.groupedMap(result, 'drug_id');
    console.log(resultDrugsStocks);
    arrayDrugStock = Array.from(resultDrugsStocks.keys());
    console.log(arrayDrugStock);
    // return arrayDrugStock
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
    console.log(resultDrugStocksInventory);
    // return resultDrugStocksInventory

    const packs = await patientVisitService.localDbGetPacks();
    const packagedDrug = [];
    const packsDate = packs.filter(
      (pack) =>
        pack !== undefined &&
        pack.pickupDate >= reportParams.startDate &&
        pack.pickupDate <= reportParams.endDate
    );
    console.log(packsDate);
    packsDate.forEach((pack) => {
      pack.packagedDrugs.forEach((item) => {
        packagedDrug.push(item);
      });
    });
    console.log(packagedDrug);
    resultDrugPackaged = this.groupedMapChildPack(packagedDrug, 'drug_id');
    console.log(resultDrugPackaged);
    //  return resultDrugPackaged
    const destroyedStocks = await DestroyedStockService.localDbGetAll();
    const adjustedDestroyedStocks = [];
    let resultDestruccted = [];
    console.log(destroyedStocks);
    resultDestruccted = destroyedStocks.filter(
      (destroyedStock) =>
        destroyedStock.date >= reportParams.startDate &&
        destroyedStock.date <= reportParams.endDate
    );
    console.log(resultDestruccted);
    resultDestruccted.forEach((destroyedStock) => {
      destroyedStock.adjustments.forEach((destroyedAdjust) => {
        adjustedDestroyedStocks.push(destroyedAdjust);
      });
    });
    resultDrugStocksDestruction = this.groupedMapChildAdjustments(
      adjustedDestroyedStocks,
      'adjustedStock'
    );
    console.log(resultDrugStocksDestruction);
    //  return resultDrugStocksInventory
    const referredStocks = await ReferedStockMovimentService.localDbGetAll();
    const adjustedReferedStocks = [];
    let resultAdjustedReferred = [];
    console.log(referredStocks);
    resultAdjustedReferred = referredStocks.filter(
      (referredStock) =>
        referredStock.date >= reportParams.startDate &&
        referredStock.date <= reportParams.endDate
    );
    console.log(resultAdjustedReferred);
    resultAdjustedReferred.forEach((referredStock) => {
      referredStock.adjustments.forEach((referredAdjust) => {
        adjustedReferedStocks.push(referredAdjust);
      });
    });
    resultDrugStocksReferred = this.groupedMapChildAdjustments(
      adjustedReferedStocks,
      'adjustedStock'
    );
    console.log(resultDrugStocksReferred);
    // return resultDrugStocksReferred
    const drugsIds = Array.from(resultDrugsStocks.keys());
    const stockDestructedIds = Array.from(resultDrugStocksDestruction.keys());
    const referredStocksIds = Array.from(resultDrugStocksReferred.keys());
    console.log(drugsIds);
    console.log(stockDestructedIds);
    console.log(referredStocksIds);
    for (const drug of drugsIds) {
      const drugObj = await drugService.getCleanDrugById(drug);
      const usedStock = new StockUsedReport();
      usedStock.fnmCode = drugObj.fnmCode;
      usedStock.drugName = drugObj.name;
      usedStock.actualStock = 0;
      console.log(resultDrugsStocks.get(drugObj.id));
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
      console.log(usedStock);
      usedStock.reportId = reportParams.id;
      // patientHistory.period = reportParams.periodTypeView
      usedStock.year = reportParams.year;
      usedStock.endDate = reportParams.endDate;
      usedStock.id = uuidv4();
      this.localDbAddOrUpdate(usedStock);
    }
  },

  groupedMap(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e[key],
          [...(entryMap.get(e[key]) || []), e],
          console.log(e[key])
        ),
      new Map()
    );
  },
  groupedMapChild(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e.adjustedStock.drug.id,
          [...(entryMap.get(e.adjustedStock.drug.id) || []), e],
          console.log(e.adjustedStock.drug.id)
        ),
      new Map()
    );
  },
  groupedMapChildPack(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e.drug.id,
          [...(entryMap.get(e.drug.id) || []), e],
          console.log(e.drug.id)
        ),
      new Map()
    );
  },
  groupedMapChildAdjustments(items, key) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e.adjustedStock.id,
          [...(entryMap.get(e.adjustedStock.id) || []), e],
          console.log(e.adjustedStock.id)
        ),
      new Map()
    );
  },
  getStockOperationTypeById(id) {
    console.log(StockOperationType.query().where('id', id).first());
    return StockOperationType.query().where('id', id).first();
  },
  getStockOperationToVue() {
    StockOperationTypeService.localDbGetAll().then((stockOperationTypes) => {
      StockOperationType.insert({ data: stockOperationTypes });
    });
  },

  localDbAddOrUpdate(targetCopy: any) {
    return db[usedStockReportDexie]
      .add(JSON.parse(JSON.stringify(targetCopy)))
      .then(() => {
        usedStockReportRepo.save(targetCopy);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async localDbGetAllByReportId(reportId: any) {
    const records = await db[usedStockReportDexie]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray();
    return records;
  },
};
