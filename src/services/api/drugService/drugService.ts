import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Drug from 'src/stores/models/drug/Drug';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import InventoryStockAdjustmentService from '../stockAdjustment/InventoryStockAdjustmentService';
import StockService from '../stockService/StockService';
import formService from '../formService/formService';
import clinicalServiceService from '../clinicalServiceService/clinicalServiceService';

const { isMobile, isOnline } = useSystemUtils();

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const drug = useRepo(Drug);
const drugDexie = db[Drug.entity];

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const freezeDeep = (payload: any) => {
  if (payload === null || payload === undefined) return payload;
  if (Array.isArray(payload)) {
    payload.forEach((item) => freezeDeep(item));
    return Object.freeze(payload);
  }
  if (typeof payload === 'object') {
    Object.keys(payload).forEach((key) => freezeDeep(payload[key]));
    return Object.freeze(payload);
  }
  return payload;
};

let drugMobileCache: any[] = [];

const prepareCacheEntry = (row: any) => {
  const cloned = clone(row);
  return isMobile.value ? freezeDeep(cloned) : cloned;
};

const setDrugMobileCache = (rows: any[]) => {
  drugMobileCache = rows.map((row) => prepareCacheEntry(row));
};

const getDrugMobileCache = () =>
  isMobile.value ? drugMobileCache : drugMobileCache.map((row) => clone(row));

const refreshDrugMobileCache = async () => {
  const rows = await drugDexie.toArray();
  const formIds = rows.map((drug: any) => (drug?.form?.id ? drug.form.id : ''));
  const clinicalServiceIds = rows.map((drug: any) =>
    drug?.clinicalService?.id
      ? drug.clinicalService.id
      : drug.clinical_service_id
  );
  const [forms, clinicalServices, stocksList] = await Promise.all([
    formService.getAllByIDsFromDexie(formIds),
    clinicalServiceService.getAllByIDsFromDexie(clinicalServiceIds),
    StockService.getAllWithPackagedDrugStocksAndAdjustmentsFromDexie(),
  ]);

  rows.forEach((entry: any) => {
    if (entry?.form?.id) {
      entry.form =
        forms.find((form: any) => form.id === entry.form.id) ?? entry.form;
    }
    if (entry?.clinicalService?.id || entry?.clinical_service_id) {
      const id = entry?.clinicalService?.id ?? entry?.clinical_service_id;

      entry.clinicalService =
        clinicalServices.find(
          (clinicalService: any) => clinicalService.id === id
        ) ?? entry.clinicalService;
    }
    entry.stocks = stocksList.filter(
      (stock: any) => stock.drug_id === entry.id
    );
  });

  setDrugMobileCache(rows);
  return getDrugMobileCache();
};

export default {
  async post(params: string) {
    const resp = await api().post('drug', params);
    drug.save(resp.data);
    alertSucess('O Registo foi efectuado com sucesso');
  },
  async get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      if (offset >= 0) {
        // showloading();
        return await api()
          .get('drug?offset=' + offset + '&max=100', {
            onDownloadProgress(progressEvent) {
              // showloading();
            },
          })
          // .get('drug?offset=' + offset + '&max=100')
          .then((resp) => {
            drug.save(resp.data);
            offset = offset + 100;
            if (resp.data.length > 0) {
              this.get(offset);
            } else {
              closeLoading();
            }
          });
      }
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug?offset=' + offset + '&max=100')
        .then((resp) => {
          drug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  getFromProvincial(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug/drugFromProvicnial/' + offset)
        .then((resp) => {
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromProvincial(offset);
          } else {
            this.get(0);
            alertSucess('Lista actualizada com sucesso');
          }
        });
    }
  },
  async getInventoryDrugs(id: string) {
    if (isOnline.value) {
      return await this.getInventoryDrugsWeb(id);
    } else {
      return await this.getInventoryDrugsMobile(id);
    }
  },
  async patch(id: string, params: string) {
    const resp = await api().patch('drug/' + id, params);
    drug.save(JSON.parse(resp.config.data));
    alertSucess('O Registo foi alterado com sucesso');
  },
  async delete(id: number) {
    await api().delete('drug/' + id);
    drug.destroy(id);
  },

  async getInventoryDrugsWeb(id: any) {
    return api()
      .get('drug/getInventoryDrugs/' + id)
      .then((resp) => {
        closeLoading();
        return resp.data;
      });
  },

  //Mobile
  getMobile() {
    if (!isMobile.value) {
      return Promise.resolve([]);
    }
    return refreshDrugMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },

  async getDrugsByIds(drugIds: any) {
    return await drugDexie.where('id').anyOf(drugIds).toArray();
  },

  async getMobileDrugById(drugId: any) {
    if (isMobile.value && !isOnline.value) {
      const cached = getDrugMobileCache().find((item) => item.id === drugId);
      if (cached) {
        return cached;
      }
    }
    return drugDexie.where('id').equalsIgnoreCase(drugId).first();
  },
  async getInventoryDrugsMobile(inventoryId: any) {
    // Step 1: Query StockAdjustments table for the given inventory ID
    const adjustments =
      await InventoryStockAdjustmentService.apiGetAdjustmentsByInventoryIdMobile(
        inventoryId
      );
    const adjustedStockIds = adjustments.map((adj) => adj.adjustedStock.id);
    const stocks = await StockService.getStocksByIds(adjustedStockIds);

    const drugIds = stocks.map((stock) => stock.drug.id);
    const drugs = await this.getDrugsByIds(drugIds);
    const drugMap = new Map();
    drugs.forEach((drug) => {
      const key = `${drug.fnmCode}-${drug.name}-${drug.id}`;
      if (!drugMap.has(key)) {
        drugMap.set(key, drug);
      }
    });

    return Array.from(drugMap.values());
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    const payload = clone(params);
    return drugDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshDrugMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getActiveDrugs() {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().filter((entry) => entry.active);
    }
    return drug.query().withAllRecursive(1).where('active', true).get();
  },
  getDrugsFromListId(drugListId: []) {
    if (isMobile.value && !isOnline.value) {
      const cache = getDrugMobileCache();
      return cache.filter((entry) => drugListId.includes(entry.id));
    }
    const item = drug.query().withAllRecursive(1).find(drugListId);
    return item;
  },
  getDrugsWithValidStockInList() {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache()
        .filter((entry) => Array.isArray(entry.stocks))
        .filter((entry) =>
          entry.stocks.some((stock: any) =>
            moment(stock.expireDate, 'YYYY-MM-DD').isAfter(
              moment().format('YYYY-MM-DD')
            )
          )
        )
        .sort((a, b) =>
          String(a.name || '').localeCompare(String(b.name || ''))
        );
    }
    return drug
      .query()
      .withAllRecursive(1)
      .whereHas('stocks', (query) => {
        query.where((stock) => {
          return moment(stock.expireDate, 'YYYY-MM-DD').isAfter(
            moment().format('YYYY-MM-DD')
          );
        });
        query.orderBy('expireDate', 'asc');
      })
      .get();
  },
  getActiveDrugsByRegimen(regimenId: string) {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().filter(
        (d) =>
          d?.active === true && // where('active', true)
          Array.isArray(d?.therapeuticRegimenList) &&
          d.therapeuticRegimenList.some((reg: any) => reg?.id === regimenId) // whereHas(...)
      );
    } else {
      return drug
        .query()
        .withAllRecursive(2)
        .where('active', true)
        .whereHas('therapeuticRegimenList', (query) => {
          query.where('id', regimenId);
        })
        .get();
    }
  },
  getDrugById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().find((item) => item.id === id) ?? null;
    }
    return drug
      .query()
      .withAllRecursive(1)
      .whereHas('stocks', (query) => {
        query.orderBy('expireDate', 'asc');
      })
      .where('id', id)
      .first();
  },
  getDrugWith1ById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().find((item) => item.id === id) ?? null;
    }
    return drug.query().withAllRecursive(1).where('id', id).first();
  },
  getDrugWith2ById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().find((item) => item.id === id) ?? null;
    }
    return drug.query().withAllRecursive(2).where('id', id).first();
  },
  getCleanDrugById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().find((item) => item.id === id) ?? null;
    }
    return drug.where('id', id).first();
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return drug.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllDrugs() {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || ''))
      );
    }
    return drug.withAllRecursive(1).orderBy('name').get();
  },

  getAllForAllDrugs() {
    if (isMobile.value && !isOnline.value) {
      return getDrugMobileCache().sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || ''))
      );
    }
    return drug.orderBy('name').get();
  },

  savePinia(drugs: any) {
    drug.save(drugs);
  },

  // Mobile

  async getAllActiveDrugsMobile() {
    return nSQL('drugs')
      .query('select')
      .exec()
      .then((result) => {
        drug.save(result);
        return result;
      });
  },

  async hasStock(drug: any) {
    return nSQL('stocks')
      .query('select')
      .where(['drug_id', '=', drug.id])
      .exec()
      .then((result) => {
        return result.length > 0;
      });
  },
  async getAllByIDsFromDexie(ids: []) {
    const drugs = await drugDexie.where('id').anyOf(ids).toArray();

    const formsIds = drugs.map((drug: any) =>
      drug?.form?.id ? drug.form.id : ''
    );

    const clinicalServiceIds = drugs.map((drug: any) =>
      drug?.clinicalService?.id ? drug.clinicalService.id : ''
    );

    const [forms, clinicalServices] = await Promise.all([
      formService.getAllByIDsFromDexie(formsIds),
      clinicalServiceService.getAllByIDsFromDexie(clinicalServiceIds),
    ]);

    drugs.map((drug: any) => {
      drug.form = forms.find((form: any) => form.id === drug.form.id);
      drug.clinicalService = clinicalServices.find(
        (clinicalService: any) => clinicalService.id === drug.clinicalService.id
      );
    });
    return drugs;
  },

  async getAllWithStocksFromDexie() {
    const [stocksList] = await Promise.all([
      StockService.getAllWithPackagedDrugStocksAndAdjustmentsFromDexie(),
    ]);

    const drugIds = stocksList.map((stock: any) => stock.drug_id);

    const drugsWithStock = await drugDexie
      .where('id')
      .anyOfIgnoreCase(drugIds)
      .toArray();

    drugsWithStock.map((drug: any) => {
      drug.stocks = stocksList.filter(
        (stock: any) => stock.drug_id === drug.id
      );
    });

    return drugsWithStock;
  },

  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return await refreshDrugMobileCache();
  },
};
