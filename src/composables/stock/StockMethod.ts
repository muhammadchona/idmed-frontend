import packService from 'src/services/api/pack/packService';
import { date } from 'quasar';
import { nSQL } from 'nano-sql';
import { v4 as uuidv4 } from 'uuid';
import StockService from 'src/services/api/stockService/StockService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';
import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

const dateUtils = useDateUtils();

export function useStock() {
  function isInUse(stock: any) {
    return (
      (stock.packagedDrugStocks !== undefined &&
        stock.packagedDrugStocks.length > 0) ||
      stock.adjustments.length > 0
    );
  }

  function getFormatedExpireDate(stock: any) {
    return date.formatDate(stock.expireDate);
  }

  function formatDate(dateString: any) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  }

  function getClassName() {
    return 'stock';
  }

  // Drug File

  async function localDbGetStockBalanceByDrug(drug: any) {
    let balance = 0;
    const result = await StockService.getStocksByDrugIdMobile(drug.id);
    for (const item of result) {
      balance += Number(item.stockMoviment);
      // Stock.insert({ data: result })
    }
    return balance;
  }

  async function localDbGetQuantitySuppliedByDrug(drug: any) {
    const result = await patientVisitService.getPatientVisitMobile();
    let drugQuantitySupplied = 0;

    for (const pvd of result) {
      for (const pvdObj of pvd.patientVisitDetails) {
        // if (pvd.pack.pickupDate > new Date()) {
        if (pvdObj.pack !== undefined) {
          for (const pcd of pvdObj.pack.packagedDrugs) {
            if (pcd.drug.id === drug.id) {
              drugQuantitySupplied += Number(pcd.quantitySupplied);
            }
          }
        }
      }
      // }
    }
    return drugQuantitySupplied;
  }
  // Resumo por drug

  async function getDestructionsDrugFile(drug: any) {
    const result = await DestroyedStockService.getReferedStockMovimentsMobile();
    const recordFileList = [];

    for (const item of result) {
      const recordFile = {};
      for (const adjustment of item.adjustments) {
        if (adjustment.adjustedStock.drug_id === drug.id) {
          recordFile.id = uuidv4();
          recordFile.eventDate = adjustment.captureDate;
          recordFile.year = new Date(adjustment.captureDate).getFullYear();
          recordFile.month = dateUtils.returnEstatisticMonth(
            new Date(adjustment.captureDate)
          ); //new Date(item.date).getMonth();
          recordFile.moviment = 'Perda';
          recordFile.orderNumber = '';
          recordFile.incomes = 0;
          recordFile.outcomes = 0;
          recordFile.posetiveAdjustment = 0;
          recordFile.negativeAdjustment = 0;
          recordFile.loses = Number(adjustment.adjustedValue);
          recordFile.balance = 0;
          recordFile.code = adjustment.operation.code;
          recordFile.stockId = '';
          recordFile.notes = '';
          recordFileList.push(recordFile);
        }
      }
    }

    const resultList = [];

    recordFileList.reduce((res, recordFile) => {
      const key = `${recordFile.year}-${recordFile.month}`;

      if (!res[key]) {
        res[key] = {
          id: recordFile.id,
          year: recordFile.year,
          month: recordFile.month,
          code: recordFile.code,
          posetiveAdjustment: 0,
          negativeAdjustment: 0,
          eventDate: recordFile.eventDate,
          moviment: recordFile.moviment,
          orderNumber: '',
          incomes: 0,
          outcomes: 0,
          loses: 0,
          balance: recordFile.balance,
          stockId: recordFile.stockId,
          notes: recordFile.notes,
        };
        resultList.push(res[key]);
      }
      res[key].loses += recordFile.loses;
      return res;
    }, {});

    return resultList;
  }

  async function getAdjustmentsDrugFile(drug: any) {
    const recordFileList = [];
    const result =
      await ReferedStockMovimentService.getReferedStockMovimentsMobile();
    for (const item of result) {
      const recordFile = {};
      for (const adjustment of item.adjustments) {
        if (
          adjustment.adjustedStock.drug_id === drug.id &&
          (adjustment.operation.code === 'AJUSTE_POSETIVO' ||
            adjustment.operation.code === 'AJUSTE_NEGATIVO')
        ) {
          recordFile.id = uuidv4();
          recordFile.code = adjustment.operation.code;
          recordFile.eventDate = item.date;
          recordFile.year = new Date(item.date).getFullYear();
          recordFile.month = dateUtils.returnEstatisticMonth(
            new Date(item.date)
          ); //new Date(item.date).getMonth();
          recordFile.moviment =
            adjustment.operation.code === 'AJUSTE_POSETIVO'
              ? 'Ajuste Posetivo'
              : 'Ajuste Negativo';
          recordFile.orderNumber = '';
          recordFile.incomes = 0;
          recordFile.outcomes = 0;
          recordFile.posetiveAdjustment =
            adjustment.operation.code === 'AJUSTE_POSETIVO'
              ? adjustment.adjustedValue
              : 0;
          recordFile.negativeAdjustment =
            adjustment.operation.code === 'AJUSTE_NEGATIVO'
              ? adjustment.adjustedValue
              : 0;
          recordFile.loses = 0;
          recordFile.balance = 0;
          recordFile.code = adjustment.operation.code;
          recordFile.stockId = '';
          recordFile.notes = '';
          recordFileList.push(recordFile);
        }
      }
      /*
       */
    }

    const resultList = [];

    recordFileList.reduce((res, recordFile) => {
      const key = `${recordFile.year}-${recordFile.month}-${recordFile.code}`;

      if (!res[key]) {
        res[key] = {
          id: recordFile.id,
          year: recordFile.year,
          month: recordFile.month,
          code: recordFile.code,
          posetiveAdjustment: 0,
          negativeAdjustment: 0,
          eventDate: recordFile.eventDate,
          moviment: recordFile.moviment,
          orderNumber: '',
          incomes: 0,
          outcomes: 0,
          loses: recordFile.loses,
          balance: recordFile.balance,
          stockId: recordFile.stockId,
          notes: recordFile.notes,
        };
        resultList.push(res[key]);
      }

      if (recordFile.code === 'AJUSTE_POSETIVO') {
        res[key].posetiveAdjustment += recordFile.posetiveAdjustment;
      } else if (recordFile.code === 'AJUSTE_NEGATIVO') {
        res[key].negativeAdjustment += recordFile.negativeAdjustment;
      }

      return res;
    }, {});

    return resultList;
  }

  async function getInventoryAdjustmentsDrugFile(drug) {
    const recordFileList = [];

    // Query inventoryStockAdjustments table to get all records
    const result =
      await InventoryStockAdjustmentService.getInventoryStockAdjustmentMobile();

    // Process the result
    for (const adjustment of result) {
      if (
        adjustment.adjustedStock.drug_id === drug.id &&
        (adjustment.operation.code === 'AJUSTE_POSETIVO' ||
          adjustment.operation.code === 'AJUSTE_NEGATIVO')
      ) {
        const recordFile = {};
        recordFile.id = uuidv4();
        recordFile.eventDate = adjustment.captureDate;
        recordFile.year = new Date(adjustment.captureDate).getFullYear();
        recordFile.month = dateUtils.returnEstatisticMonth(
          new Date(adjustment.captureDate)
        ); //new Date(item.date).getMonth();
        recordFile.moviment = 'Inventário';
        recordFile.orderNumber = '';
        recordFile.incomes = 0;
        recordFile.outcomes = 0;
        recordFile.posetiveAdjustment =
          adjustment.operation.code === 'AJUSTE_POSETIVO'
            ? adjustment.adjustedValue
            : 0;
        recordFile.negativeAdjustment =
          adjustment.operation.code === 'AJUSTE_NEGATIVO'
            ? adjustment.adjustedValue
            : 0;
        recordFile.loses = 0;
        recordFile.balance = 0;
        recordFile.code = adjustment.operation.code;
        recordFile.stockId = '';
        recordFile.notes = '';
        recordFileList.push(recordFile);
      }
    }
    const resultList = [];
    recordFileList.reduce((res, recordFile) => {
      const key = `${recordFile.year}-${recordFile.month}`;
      if (!res[key]) {
        res[key] = {
          id: recordFile.id,
          year: recordFile.year,
          month: recordFile.month,
          posetiveAdjustment: 0,
          negativeAdjustment: 0,
          eventDate: recordFile.eventDate,
          moviment: 'Inventário',
          orderNumber: '',
          incomes: 0,
          outcomes: 0,
          loses: recordFile.loses,
          balance: recordFile.balance,
          code: recordFile.code,
          stockId: recordFile.stockId,
          notes: recordFile.notes,
        };
        resultList.push(res[key]);
      }
      res[key].posetiveAdjustment += recordFile.posetiveAdjustment;
      res[key].negativeAdjustment += recordFile.negativeAdjustment;
      return res;
    }, {});

    return resultList;
  }

  async function getEntrancesDrugFile(drug) {
    const recordFileList = [];
    // Query stocks table to get all records matching the drug_id
    const stocks = await StockService.getStocksByDrugIdMobile(drug.id);
    const entranceIds = stocks.map((stock) => stock.entrance.id);
    const stockEntrances = await StockEntranceService.getStockEntrancesByIds(
      entranceIds
    );
    // Merge the results and calculate the total incomes
    const result = stockEntrances.map((entrance) => {
      const totalIncomes = stocks
        .filter((stock) => stock.entrance.id === entrance.id)
        .reduce((sum, stock) => sum + stock.unitsReceived, 0);
      return {
        incomes: totalIncomes,
        dateReceived: entrance.dateReceived,
        orderNumber: entrance.orderNumber,
      };
    });
    // Process the result
    for (const item of result) {
      const strtDate = new Date(item.startDate);
      const recordFile = {};
      recordFile.id = uuidv4();
      recordFile.eventDate = item.dateReceived;
      recordFile.year = new Date(item.dateReceived).getFullYear();
      recordFile.month = dateUtils.returnEstatisticMonth(
        new Date(item.dateReceived)
      ); //
      recordFile.moviment = 'Entrada de Stock';
      recordFile.orderNumber = item.orderNumber;
      recordFile.incomes = Number(item.incomes);
      recordFile.outcomes = 0;
      recordFile.posetiveAdjustment = 0;
      recordFile.negativeAdjustment = 0;
      recordFile.loses = 0;
      recordFile.balance = 0;
      recordFile.code = 'ENTRADA';
      recordFile.stockId = '';
      recordFile.notes = '';
      recordFileList.push(recordFile);
    }

    return recordFileList;
  }

  async function getPacksDrugFile(drug: any) {
    const recordFileList = [];
    let drugQuantitySupplied = 0;
    const result = await patientVisitService.getPatientVisitMobile();

    for (const pvd of result) {
      for (const pvdObj of pvd.patientVisitDetails) {
        if (pvdObj.pack !== undefined) {
          for (const pcd of pvdObj.pack.packagedDrugs) {
            if (pcd.drug.id === drug.id) {
              const recordFile = {};
              drugQuantitySupplied += Number(pcd.quantitySupplied);
              recordFile.id = uuidv4();
              recordFile.eventDate = pvdObj.pack.pickupDate;
              recordFile.year = new Date(pvdObj.pack.pickupDate).getFullYear();
              recordFile.month = dateUtils.returnEstatisticMonth(
                new Date(pvdObj.pack.pickupDate)
              ); // new Date(pvdObj.pack.pickupDate).getMonth();
              recordFile.moviment = 'Saídas';
              recordFile.orderNumber = '';
              recordFile.incomes = 0;
              recordFile.outcomes = drugQuantitySupplied;
              recordFile.posetiveAdjustment = 0;
              recordFile.negativeAdjustment = 0;
              recordFile.loses = 0;
              recordFile.balance = 0;
              recordFile.code = 'SAIDA';
              recordFile.notes = '';
              recordFileList.push(recordFile);
            }
          }
        }
      }
    }

    return recordFileList;
  }

  // Resumo por Stock

  async function getDestructionsDrugFileBatch(stockId: any) {
    const recordFileList = [];
    const result = await DestroyedStockService.getDestroyedStocksMobile();
    for (const item of result) {
      const recordFile = {};
      for (const adjustment of item.adjustments) {
        if (adjustment.adjustedStock.id === stockId) {
          recordFile.id = uuidv4();
          recordFile.eventDate = item.date;
          recordFile.moviment = 'Perda';
          recordFile.orderNumber = '';
          recordFile.incomes = 0;
          recordFile.outcomes = 0;
          recordFile.posetiveAdjustment = 0;
          recordFile.negativeAdjustment = 0;
          recordFile.loses = adjustment.adjustedValue;
          recordFile.balance = 0;
          recordFile.code = adjustment.operation.code;
          recordFile.stockId = '';
          recordFile.notes = '';
          recordFileList.push(recordFile);
        }
      }
      /*
       */
    }
    return recordFileList;
  }

  async function getAdjustmentsDrugFileBatch(stockId: any) {
    const recordFileList = [];

    const result =
      await ReferedStockMovimentService.getReferedStockMovimentsMobile();

    for (const item of result) {
      const recordFile = {};
      for (const adjustment of item.adjustments) {
        if (
          adjustment.adjustedStock.id === stockId &&
          (adjustment.operation.code === 'AJUSTE_POSETIVO' ||
            adjustment.operation.code === 'AJUSTE_NEGATIVO')
        ) {
          recordFile.id = uuidv4();
          recordFile.eventDate = item.date;
          recordFile.moviment =
            adjustment.operation.code === 'AJUSTE_POSETIVO'
              ? 'Ajuste Posetivo'
              : 'Ajuste Negativo';
          recordFile.orderNumber = '';
          recordFile.incomes = 0;
          recordFile.outcomes = 0;
          recordFile.posetiveAdjustment =
            adjustment.operation.code === 'AJUSTE_POSETIVO'
              ? adjustment.adjustedValue
              : 0;
          recordFile.negativeAdjustment =
            adjustment.operation.code === 'AJUSTE_NEGATIVO'
              ? adjustment.adjustedValue
              : 0;

          recordFile.notes = '';
          recordFile.loses = 0;
          recordFileList.push(recordFile);
        }
      }
      /*
       */
    }
    return recordFileList;
  }

  async function getInventoryAdjustmentsDrugFileBatch(stockId: any) {
    const recordFileList = [];

    // Query inventoryStockAdjustments table to get all records
    const result =
      await InventoryStockAdjustmentService.getInventoryStockAdjustmentMobile();

    for (const adjustment of result) {
      const recordFile = {};
      if (adjustment.adjustedStock.id === stockId) {
        recordFile.id = uuidv4();
        recordFile.eventDate = adjustment.captureDate;
        recordFile.moviment = 'Inventário';
        recordFile.orderNumber = '';
        recordFile.incomes = 0;
        recordFile.outcomes = 0;
        recordFile.posetiveAdjustment =
          adjustment.operation.code === 'AJUSTE_POSETIVO'
            ? adjustment.adjustedValue
            : 0;
        recordFile.negativeAdjustment =
          adjustment.operation.code === 'AJUSTE_NEGATIVO'
            ? adjustment.adjustedValue
            : 0;
        recordFile.loses = 0;
        recordFile.balance = 0;
        recordFile.code = adjustment.operation.code;
        recordFile.stockId = '';
        recordFile.notes = '';
        recordFileList.push(recordFile);
      }
    }
    return recordFileList;
  }

  async function getEntrancesDrugFileBatch(stockId: string) {
    const recordFileList = [];
    // Query stocks table to get all records matching the stockId pattern
    const stocks = await StockService.getBystockMobile(stockId);
    const entranceIds = stocks.map((stock) => stock.entrance.id);
    // Query stockEntrances table to get all records matching the entrance_ids
    const stockEntrances = await StockEntranceService.getStockEntrancesByIds(
      entranceIds
    );
    // Merge the results and calculate the total incomes
    const result = stockEntrances.map((entrance) => {
      const totalIncomes = stocks
        .filter((stock) => stock.entrance.id === entrance.id)
        .reduce((sum, stock) => sum + stock.unitsReceived, 0);
      return {
        incomes: totalIncomes,
        dateReceived: entrance.dateReceived,
        orderNumber: entrance.orderNumber,
        stockId: stocks.find((stock) => stock.entrance.id === entrance.id)?.id,
      };
    });

    // Process the result
    for (const item of result) {
      if (item.orderNumber !== undefined) {
        const recordFile = {};
        recordFile.id = uuidv4();
        recordFile.eventDate = item.dateReceived;
        recordFile.year = new Date(item.dateReceived).getFullYear();
        recordFile.month = new Date(item.dateReceived).getMonth();
        recordFile.moviment = 'Entrada de Stock';
        recordFile.orderNumber = item.orderNumber;
        recordFile.incomes = Number(item.incomes);
        recordFile.outcomes = 0;
        recordFile.posetiveAdjustment = 0;
        recordFile.negativeAdjustment = 0;
        recordFile.loses = 0;
        recordFile.balance = 0;
        recordFile.code = 'ENTRADA';
        recordFile.stockId = item.stockId;
        recordFile.notes = '';

        recordFileList.push(recordFile);
      }
    }

    return recordFileList;
  }

  async function getPacksDrugFileBatch(stockId: any) {
    const recordFileList = [];
    let drugQuantitySupplied = 0;

    const result = await patientVisitService.getPatientVisitMobile();

    for (const pvd of result) {
      for (const pvdObj of pvd.patientVisitDetails) {
        // if (pvd.pack.pickupDate > new Date()) {
        if (pvdObj.pack !== undefined) {
          for (const pcd of pvdObj.pack.packagedDrugs) {
            for (const pcdStockObj of pcd.packagedDrugStocks) {
              if (pcdStockObj.stock.id === stockId) {
                const recordFile = {};
                drugQuantitySupplied += Number(pcd.quantitySupplied);
                recordFile.stockId = pcdStockObj.stock.id;
                recordFile.id = uuidv4();
                recordFile.eventDate = pvdObj.pack.pickupDate;
                recordFile.moviment = 'Saídas';
                recordFile.orderNumber = '';
                recordFile.incomes = 0;
                recordFile.outcomes = drugQuantitySupplied;
                recordFile.posetiveAdjustment = 0;
                recordFile.negativeAdjustment = 0;
                recordFile.loses = 0;
                recordFile.balance = 0;
                recordFile.code = 'SAIDA';
                recordFile.notes = '';
                recordFileList.push(recordFile);
              }
            }
          }
        }
        // }
      }
    }
    return recordFileList;
  }

  return {
    isInUse,
    getFormatedExpireDate,
    formatDate,
    getClassName,
    localDbGetStockBalanceByDrug,
    localDbGetQuantitySuppliedByDrug,
    getDestructionsDrugFile,
    getAdjustmentsDrugFile,
    getInventoryAdjustmentsDrugFile,
    getEntrancesDrugFile,
    getPacksDrugFile,
    getDestructionsDrugFileBatch,
    getAdjustmentsDrugFileBatch,
    getInventoryAdjustmentsDrugFileBatch,
    getEntrancesDrugFileBatch,
    getPacksDrugFileBatch,
  };
}
