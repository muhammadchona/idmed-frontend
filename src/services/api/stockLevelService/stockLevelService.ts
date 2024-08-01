import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import StockLevel from 'src/stores/models/stocklevel/StockLevel';

const stockLevel = useRepo(StockLevel);
const stockLevelDexie = StockLevel.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('stockLevel', params)
      .then((resp) => {
        stockLevel.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockLevel?offset=' + offset + '&max=100')
        .then((resp) => {
          stockLevel.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  getStockLevelByClinicAndDrugWeb(clinicId: any, drugId: any) {
    return api()
      .get('stockLevel/getStockLevelByClinicAndDrug/' + clinicId + '/' + drugId)
      .then((resp) => {
        closeLoading();
        return resp.data;
      });
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('stockLevel/' + uuid, params)
      .then((resp) => {
        stockLevel.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('stockLevel/' + uuid)
      .then(() => {
        stockLevel.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[stockLevelDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockLevel.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[stockLevelDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockLevel.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return db[stockLevelDexie]
      .toArray()
      .then((rows: any) => {
        stockLevel.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[stockLevelDexie]
      .put(paramsId)
      .then(() => {
        stockLevel.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[stockLevelDexie]
      .bulkPut(params)
      .then(() => {
        stockLevel.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockLevel.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllstockLevels() {
    return stockLevel.get();
  },
  isStockLevelExists(clinicSectorId: any, drugId: any) {
    const list = stockLevel
      .query()
      .where('clinic_id', clinicSectorId)
      .where('drug_id', drugId)
      .get();
    return list.length > 0;
  },

  getStockLevel(clinicSectorId: any, drugId: any) {
    const obj = stockLevel
      .query()
      .where('clinic_id', clinicSectorId)
      .where('drug_id', drugId)
      .first();
    return obj;
  },
};
