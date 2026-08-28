import { date } from 'quasar';
import { v4 as uuidv4 } from 'uuid';
import StockService from 'src/services/api/stockService/StockService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';
import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import clinicService from 'src/services/api/clinicService/clinicService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import packagedDrugStockService from 'src/services/api/packagedDrugStock/packagedDrugStockService';
import packagedDrugService from 'src/services/api/packagedDrug/packagedDrugService';

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

  function getClinicId(record: any) {
    return (
      record?.clinic_id ||
      record?.clinicId ||
      record?.clinic?.id ||
      record?.entrance?.clinic_id ||
      record?.entrance?.clinicId ||
      record?.entrance?.clinic?.id ||
      ''
    );
  }

  // Drug File

  async function localDbGetStockBalanceByDrug(
    drug: any,
    clinicId = clinicService.currClinic()?.id
  ) {
    let balance = 0;
    const result = await StockService.getStocksByDrugIdMobile(drug.id);
    for (const item of result) {
      const stockClinicId = getClinicId(item);
      if (clinicId && stockClinicId !== clinicId) continue;

      // The backend stock-alert balance starts with received units and applies
      // only adjustments owned by the selected clinic. Stock records downloaded
      // for a sector can also embed the parent pharmacy's opposite adjustment;
      // including it would subtract the same transfer twice.
      balance += Number(item.unitsReceived ?? item.stockMoviment ?? 0);
      for (const adjustment of item.adjustments ?? []) {
        const adjustmentClinicId = getClinicId(adjustment);
        if (clinicId && adjustmentClinicId !== clinicId) continue;

        const operationId =
          adjustment.operation_id ??
          adjustment.operationId ??
          adjustment.operation?.id;
        const operationCode =
          adjustment.operation?.code ??
          StockOperationTypeService.getStockOperatinTypeById(operationId)?.code;
        const adjustedValue = Number(adjustment.adjustedValue ?? 0);
        if (operationCode === 'AJUSTE_POSETIVO') {
          balance += adjustedValue;
        } else if (operationCode === 'AJUSTE_NEGATIVO') {
          balance -= adjustedValue;
        }
      }
    }
    // A newly created offline visit is not part of the downloaded backend
    // ledger yet. Subtract it once until the next complete stock download.
    return balance - (await localDbGetPendingQuantitySuppliedByDrug(drug));
  }

  async function localDbGetCurrentStockMovementByDrug(
    drug: any,
    clinicId = clinicService.currClinic()?.id
  ) {
    const result = await StockService.getStocksByDrugIdMobile(drug.id);
    return result.reduce((total: number, item: any) => {
      const stockClinicId = getClinicId(item);
      if (clinicId && stockClinicId !== clinicId) return total;
      return total + Number(item.stockMoviment ?? 0);
    }, 0);
  }

  async function localDbGetPendingQuantitySuppliedByDrug(drug: any) {
    const visits = await patientVisitService.getPatientVisitMobile();
    let quantity = 0;

    for (const visit of visits) {
      if (visit.syncStatus === 'S') continue;
      for (const detail of visit.patientVisitDetails ?? []) {
        for (const packagedDrug of detail.pack?.packagedDrugs ?? []) {
          const drugId = packagedDrug.drug_id ?? packagedDrug.drug?.id;
          if (drugId === drug.id) {
            quantity += Number(packagedDrug.quantitySupplied ?? 0);
          }
        }
      }
    }
    return quantity;
  }

  async function getPackagedDrugMovementsForStocks(
    stocks: any[],
    includeUnallocatedDrugMovements = false
  ) {
    const stockIds = stocks.map((stock: any) => stock.id).filter(Boolean);
    const standaloneRows =
      await packagedDrugStockService.getAllByStockIDsRawFromDexie(stockIds);
    const combinedRows = [
      ...stocks.flatMap((stock: any) =>
        (stock.packagedDrugStocks ?? []).map((item: any) => ({
          ...item,
          resolvedStockId:
            item.stock_id ?? item.stockId ?? item.stock?.id ?? stock.id,
        }))
      ),
      ...standaloneRows.map((item: any) => ({
        ...item,
        resolvedStockId: item.stock_id ?? item.stockId ?? item.stock?.id ?? '',
      })),
    ];

    if (includeUnallocatedDrugMovements && stocks.length > 0) {
      const firstStock = stocks[0];
      const drugId =
        firstStock.drug_id ?? firstStock.drugId ?? firstStock.drug?.id;
      const clinicId = getClinicId(firstStock);
      const allocatedPackagedDrugIds = new Set(
        combinedRows
          .map(
            (item: any) =>
              item.packagedDrug_id ??
              item.packagedDrugId ??
              item.packagedDrug?.id
          )
          .filter(Boolean)
      );
      const packagedDrugs =
        await packagedDrugService.getByDrugAndOriginWithPackMobile(
          drugId,
          clinicId
        );
      combinedRows.push(
        ...packagedDrugs
          .filter((item: any) => !allocatedPackagedDrugIds.has(item.id))
          .map((item: any) => ({
            ...item,
            resolvedStockId: '',
          }))
      );
    }

    const uniqueRows = new Map<string, any>();
    for (const item of combinedRows) {
      const key =
        item.id ??
        [
          item.resolvedStockId,
          item.packagedDrug_id ?? item.packagedDrugId ?? item.packagedDrug?.id,
          item.creationDate,
          item.quantitySupplied,
        ].join(':');
      if (!uniqueRows.has(key)) uniqueRows.set(key, item);
    }
    return [...uniqueRows.values()];
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
    const addedAdjustmentIds = new Set<string>();
    const currentClinicId = clinicService.currClinic()?.id;
    const getOperationCode = (adjustment: any) => {
      const operationId =
        adjustment.operation_id ??
        adjustment.operationId ??
        adjustment.operation?.id;
      return (
        adjustment.operation?.code ??
        StockOperationTypeService.getStockOperatinTypeById(operationId)?.code
      );
    };
    const addAdjustmentRecord = (
      adjustment: any,
      eventDate: any,
      adjustedStockDrugId: any,
      fallbackStockId = ''
    ) => {
      const operationCode = getOperationCode(adjustment);
      if (
        adjustedStockDrugId !== drug.id ||
        (operationCode !== 'AJUSTE_POSETIVO' &&
          operationCode !== 'AJUSTE_NEGATIVO') ||
        !eventDate
      ) {
        return;
      }

      // The same backend adjustment can be embedded in a Stock and also be
      // available through a reference movement. Count it only once.
      const adjustmentKey =
        adjustment.id ??
        [
          fallbackStockId,
          operationCode,
          eventDate,
          adjustment.adjustedValue,
          adjustment.balance,
        ].join(':');
      if (addedAdjustmentIds.has(adjustmentKey)) return;
      addedAdjustmentIds.add(adjustmentKey);

      const recordFile = {};
      recordFile.id = adjustment.id ?? uuidv4();
      recordFile.code = operationCode;
      recordFile.eventDate = eventDate;
      recordFile.year = new Date(eventDate).getFullYear();
      recordFile.month = dateUtils.returnEstatisticMonth(new Date(eventDate));
      recordFile.moviment =
        operationCode === 'AJUSTE_POSETIVO'
          ? 'Ajuste Posetivo'
          : 'Ajuste Negativo';
      recordFile.orderNumber = adjustment.reference?.orderNumber ?? '';
      recordFile.incomes = 0;
      recordFile.outcomes = 0;
      recordFile.posetiveAdjustment =
        operationCode === 'AJUSTE_POSETIVO'
          ? Number(adjustment.adjustedValue ?? 0)
          : 0;
      recordFile.negativeAdjustment =
        operationCode === 'AJUSTE_NEGATIVO'
          ? Number(adjustment.adjustedValue ?? 0)
          : 0;
      recordFile.loses = 0;
      recordFile.balance = 0;
      recordFile.stockId =
        adjustment.adjusted_stock_id ??
        adjustment.adjustedStock?.id ??
        fallbackStockId;
      recordFile.notes = adjustment.notes ?? '';
      recordFileList.push(recordFile);
    };

    const result =
      await ReferedStockMovimentService.getReferedStockMovimentsMobile();
    for (const item of result ?? []) {
      for (const adjustment of item.adjustments ?? []) {
        addAdjustmentRecord(
          adjustment,
          item.date ?? adjustment.captureDate,
          adjustment.adjustedStock?.drug_id ??
            adjustment.adjustedStock?.drugId ??
            adjustment.adjustedStock?.drug?.id
        );
      }
    }

    // Distribution confirmations for an existing batch are returned by the
    // backend as adjustments embedded in the receiving Stock. They do not
    // create another Stock row/entrance relation, so the offline StockFile must
    // read them directly from the downloaded stock ledger.
    const stocks = await StockService.getStocksByDrugIdMobile(drug.id);
    for (const stock of stocks) {
      const stockClinicId = getClinicId(stock);
      if (currentClinicId && stockClinicId !== currentClinicId) continue;

      for (const adjustment of stock.adjustments ?? []) {
        const adjustmentClinicId = getClinicId(adjustment);
        // A stock downloaded for a sector can embed the source pharmacy's
        // opposite adjustment. Only the receiving clinic's movement belongs in
        // this tablet's StockFile.
        if (currentClinicId && adjustmentClinicId !== currentClinicId) continue;

        addAdjustmentRecord(
          adjustment,
          adjustment.captureDate,
          stock.drug_id ?? stock.drugId ?? stock.drug?.id,
          stock.id
        );
      }
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
      await InventoryStockAdjustmentService.getAllFinalizedInventoryStockAdjustmentMobile();

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
    const getEntranceId = (stock: any) =>
      stock.entrance_id ?? stock.entranceId ?? stock.entrance?.id;
    const entranceIds = stocks.map(getEntranceId).filter(Boolean);
    const stockEntrances = await StockEntranceService.getStockEntrancesByIds(
      entranceIds
    );
    // Merge the results and calculate the total incomes
    const result = stockEntrances.map((entrance) => {
      const totalIncomes = stocks
        .filter((stock) => getEntranceId(stock) === entrance.id)
        .reduce((sum, stock) => sum + Number(stock.unitsReceived ?? 0), 0);
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
          eventDate: recordFile.creationDate,
          moviment: 'Entrada de Stock',
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
      res[key].incomes += recordFile.incomes;
      return res;
    }, {});

    return resultList;
  }

  async function getPacksDrugFile(drug: any) {
    const recordFileList = [];
    const stocks = await StockService.getStocksByDrugIdMobile(drug.id);
    const movements = await getPackagedDrugMovementsForStocks(stocks, true);

    for (const movement of movements) {
      const eventDate =
        movement.creationDate ??
        movement.pack?.pickupDate ??
        movement.packagedDrug?.creationDate ??
        movement.packagedDrug?.pack?.pickupDate;
      if (!eventDate) continue;
      const movementDate = new Date(eventDate);
      if (Number.isNaN(movementDate.getTime())) continue;

      const recordFile = {};
      recordFile.id = uuidv4();
      recordFile.eventDate = eventDate;
      recordFile.year = movementDate.getFullYear();
      recordFile.month = dateUtils.returnEstatisticMonth(movementDate);
      recordFile.moviment = 'Saídas';
      recordFile.orderNumber = '';
      recordFile.incomes = 0;
      recordFile.outcomes = Number(movement.quantitySupplied ?? 0);
      recordFile.posetiveAdjustment = 0;
      recordFile.negativeAdjustment = 0;
      recordFile.loses = 0;
      recordFile.balance = 0;
      recordFile.code = 'SAIDA';
      recordFile.stockId = movement.resolvedStockId;
      recordFile.notes = '';
      recordFileList.push(recordFile);
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
          eventDate: recordFile.creationDate,
          moviment: 'Saidas',
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
      res[key].outcomes += recordFile.outcomes;
      return res;
    }, {});

    return resultList;
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

    const resultList = [];

    recordFileList.reduce((res, recordFile) => {
      const keyDate = dateUtils.getDDMMYYYFromJSDate(recordFile.eventDate);
      const key = `${keyDate}`;

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

  async function getAdjustmentsDrugFileBatch(stockId: any) {
    const recordFileList = [];
    const addedAdjustmentIds = new Set<string>();
    const currentClinicId = clinicService.currClinic()?.id;
    const addAdjustmentRecord = (adjustment: any, eventDate: any) => {
      const operationId =
        adjustment.operation_id ??
        adjustment.operationId ??
        adjustment.operation?.id;
      const operationCode =
        adjustment.operation?.code ??
        StockOperationTypeService.getStockOperatinTypeById(operationId)?.code;
      if (
        (operationCode !== 'AJUSTE_POSETIVO' &&
          operationCode !== 'AJUSTE_NEGATIVO') ||
        !eventDate
      ) {
        return;
      }

      const adjustmentKey =
        adjustment.id ??
        [
          stockId,
          operationCode,
          eventDate,
          adjustment.adjustedValue,
          adjustment.balance,
        ].join(':');
      if (addedAdjustmentIds.has(adjustmentKey)) return;
      addedAdjustmentIds.add(adjustmentKey);

      const recordFile = {};
      recordFile.id = adjustment.id ?? uuidv4();
      recordFile.eventDate = eventDate;
      recordFile.moviment =
        operationCode === 'AJUSTE_POSETIVO'
          ? 'Ajuste Posetivo'
          : 'Ajuste Negativo';
      recordFile.orderNumber = adjustment.reference?.orderNumber ?? '';
      recordFile.incomes = 0;
      recordFile.outcomes = 0;
      recordFile.posetiveAdjustment =
        operationCode === 'AJUSTE_POSETIVO'
          ? Number(adjustment.adjustedValue ?? 0)
          : 0;
      recordFile.negativeAdjustment =
        operationCode === 'AJUSTE_NEGATIVO'
          ? Number(adjustment.adjustedValue ?? 0)
          : 0;
      recordFile.notes = adjustment.notes ?? '';
      recordFile.loses = 0;
      recordFile.balance = 0;
      recordFile.code = operationCode;
      recordFile.stockId = stockId;
      recordFileList.push(recordFile);
    };

    const result =
      await ReferedStockMovimentService.getReferedStockMovimentsMobile();

    for (const item of result ?? []) {
      for (const adjustment of item.adjustments ?? []) {
        const adjustedStockId =
          adjustment.adjusted_stock_id ?? adjustment.adjustedStock?.id;
        if (adjustedStockId === stockId) {
          addAdjustmentRecord(adjustment, item.date ?? adjustment.captureDate);
        }
      }
    }

    const stocks = await StockService.getBystockMobile(stockId);
    for (const stock of stocks) {
      const stockClinicId = getClinicId(stock);
      if (currentClinicId && stockClinicId !== currentClinicId) continue;

      for (const adjustment of stock.adjustments ?? []) {
        const adjustmentClinicId = getClinicId(adjustment);
        if (currentClinicId && adjustmentClinicId !== currentClinicId) continue;
        addAdjustmentRecord(adjustment, adjustment.captureDate);
      }
    }

    const resultList = [];
    recordFileList.reduce((res, recordFile) => {
      const keyDate = dateUtils.getDDMMYYYFromJSDate(recordFile.eventDate);
      const key = `${keyDate}`;

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

  async function getInventoryAdjustmentsDrugFileBatch(stockId: any) {
    const recordFileList = [];

    // Query inventoryStockAdjustments table to get all records
    const result =
      await InventoryStockAdjustmentService.getAllFinalizedInventoryStockAdjustmentMobile();

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

    const resultList = [];
    recordFileList.reduce((res, recordFile) => {
      const keyDate = dateUtils.getDDMMYYYFromJSDate(recordFile.eventDate);
      const key = `${keyDate}`;
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

  async function getEntrancesDrugFileBatch(stockId: string) {
    const recordFileList = [];
    // Query stocks table to get all records matching the stockId pattern
    const stocks = await StockService.getBystockMobile(stockId);
    const getEntranceId = (stock: any) =>
      stock.entrance_id ?? stock.entranceId ?? stock.entrance?.id;
    const entranceIds = stocks.map(getEntranceId).filter(Boolean);
    // Query stockEntrances table to get all records matching the entrance_ids
    const stockEntrances = await StockEntranceService.getStockEntrancesByIds(
      entranceIds
    );
    // Merge the results and calculate the total incomes
    const result = stockEntrances.map((entrance) => {
      const totalIncomes = stocks
        .filter((stock) => getEntranceId(stock) === entrance.id)
        .reduce((sum, stock) => sum + Number(stock.unitsReceived ?? 0), 0);
      return {
        incomes: totalIncomes,
        dateReceived: entrance.dateReceived,
        orderNumber: entrance.orderNumber,
        stockId: stocks.find((stock) => getEntranceId(stock) === entrance.id)
          ?.id,
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

    const resultList = [];
    recordFileList.reduce((res, recordFile) => {
      const keyDate = dateUtils.getDDMMYYYFromJSDate(recordFile.eventDate);
      const key = `${keyDate}`;
      if (!res[key]) {
        res[key] = {
          id: recordFile.id,
          year: recordFile.year,
          month: recordFile.month,
          posetiveAdjustment: 0,
          negativeAdjustment: 0,
          eventDate: recordFile.eventDate,
          moviment: 'Entrada de Stock',
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
      res[key].incomes += recordFile.incomes;
      return res;
    }, {});

    return resultList;
  }

  async function getPacksDrugFileBatch(stockId: any) {
    const recordFileList = [];
    const stocks = await StockService.getBystockMobile(stockId);
    const movements = await getPackagedDrugMovementsForStocks(stocks);

    for (const movement of movements) {
      const eventDate =
        movement.creationDate ??
        movement.pack?.pickupDate ??
        movement.packagedDrug?.creationDate ??
        movement.packagedDrug?.pack?.pickupDate;
      if (!eventDate) continue;
      const movementDate = new Date(eventDate);
      if (Number.isNaN(movementDate.getTime())) continue;

      const recordFile = {};
      recordFile.stockId = stockId;
      recordFile.id = uuidv4();
      recordFile.eventDate = eventDate;
      recordFile.moviment = 'Saídas';
      recordFile.orderNumber = '';
      recordFile.incomes = 0;
      recordFile.outcomes = Number(movement.quantitySupplied ?? 0);
      recordFile.posetiveAdjustment = 0;
      recordFile.negativeAdjustment = 0;
      recordFile.loses = 0;
      recordFile.balance = 0;
      recordFile.code = 'SAIDA';
      recordFile.notes = '';
      recordFileList.push(recordFile);
    }

    const resultList = [];
    recordFileList.reduce((res, recordFile) => {
      const keyDate = dateUtils.getDDMMYYYFromJSDate(recordFile.eventDate);
      const key = `${keyDate}`;
      if (!res[key]) {
        res[key] = {
          id: recordFile.id,
          year: recordFile.year,
          month: recordFile.month,
          posetiveAdjustment: 0,
          negativeAdjustment: 0,
          eventDate: recordFile.eventDate,
          moviment: 'Saidas',
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
      res[key].outcomes += recordFile.outcomes;
      return res;
    }, {});

    return resultList;
  }

  return {
    isInUse,
    getFormatedExpireDate,
    formatDate,
    getClassName,
    localDbGetStockBalanceByDrug,
    localDbGetCurrentStockMovementByDrug,
    localDbGetPendingQuantitySuppliedByDrug,
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
