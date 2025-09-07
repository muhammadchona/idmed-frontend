import { useRepo } from 'pinia-orm';
import ReferedStockMoviment from 'src/stores/models/stockrefered/ReferedStockMoviment';
import api from '../apiService/apiService';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from 'src/stores/dexie';
import StockReferenceAdjustmentService from '../stockAdjustment/StockReferenceAdjustmentService';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();

const referedStockMoviment = useRepo(ReferedStockMoviment);
const referedStockMovimentDexie = db[ReferedStockMoviment.entity];

export default {
  // Axios API call
  post(params: any) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (!isOnline.value) {
      return this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  patch(id: string, params: any) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(id, params);
    }
  },

  async delete(id: string) {
    if (!isOnline.value) {
      return this.deleteMobile(id);
    } else {
      return this.deleteWeb(id);
    }
  },

  async apiSave(referedStockMoviment: any) {
    return api().post('/referedStockMoviment', referedStockMoviment);
  },

  async apiRemove(id: string) {
    return api().delete(`/referedStockMoviment/${id}`);
  },
  async apiUpdate(referedStockMoviment: any) {
    return api().patch('/referedStockMoviment', referedStockMoviment);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return referedStockMoviment.getModel().$newInstance();
  },

  // WEB

  postWeb(params: any) {
    return api()
      .post('referedStockMoviment', params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('referedStockMoviment?offset=' + offset)
        .then((resp) => {
          referedStockMoviment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  getAllByClinic(clinicId: any, offset: number) {
    if (!isOnline.value) {
      this.getAllByClinicMobile(clinicId);
    } else {
      this.getAllByClinicWeb(clinicId, offset);
    }
  },

  getAllByClinicWeb(clinicId: any, offset: number) {
    if (offset >= 0) {
      return api()
        .get(
          'referedStockMoviment/clinic/' +
            clinicId +
            '?offset=' +
            offset +
            '&max=100'
        )
        .then((resp) => {
          referedStockMoviment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  patchWeb(id: any, params: string) {
    return api()
      .patch('referedStockMoviment/' + id, params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      });
  },
  deleteWeb(id: any) {
    return api()
      .delete('referedStockMoviment/' + id)
      .then(() => {
        referedStockMoviment.destroy(id);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return api().get('/referedStockMoviment?offset=' + offset + '&max=' + max);
  },

  // MOBILE

  addMobile(params: string) {
    return referedStockMovimentDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        referedStockMoviment.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async putMobile(params: any) {
    const referenceStockMoviment = JSON.parse(JSON.stringify(params));

    return referedStockMovimentDexie.put(referenceStockMoviment).then(() => {
      if (referenceStockMoviment.adjustments.length > 0) {
        referenceStockMoviment.adjustments.map((adjustment: any) => {
          adjustment.adjusted_stock_id = adjustment.adjustedStock.id;
          adjustment.operation_id = adjustment.operation.id;
          adjustment.clinic_id = adjustment.clinic.id;
          StockReferenceAdjustmentService.addMobile(adjustment);
        });
      }
      referedStockMoviment.save(referenceStockMoviment);
    });
  },

  getMobile() {
    return referedStockMovimentDexie
      .toArray()
      .then((rows: any) => {
        referedStockMoviment.save(rows);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getReferedStockMovimentsMobile() {
    const rows = await referedStockMovimentDexie.toArray();
    return rows;
  },

  async getAllByClinicMobile(clinicId: any) {
    const collection = referedStockMovimentDexie.filter(
      (referedStockMoviment: ReferedStockMoviment) =>
        referedStockMoviment?.clinic?.id === clinicId
    );
    return await collection.toArray().then((rows: any) => {
      referedStockMoviment.save(rows);
      return rows;
    });
  },

  async localDbGetAll() {
    return referedStockMovimentDexie.toArray().then((rows: any) => {
      referedStockMoviment.save(rows);
      return rows;
    });
  },

  async getBystockMobile(stockId: any) {
    const collection = referedStockMovimentDexie.filter(
      (referedStockMoviment: ReferedStockMoviment) =>
        referedStockMoviment?.stock?.id === stockId
    );
    return await collection.toArray().then((rows: any) => {
      referedStockMoviment.save(rows);
      return rows;
    });
  },

  async deleteMobile(id: any) {
    const resp = await nSQL('referedStockMoviments')
      .query('delete')
      .where(['id', '=', id])
      .exec();
    referedStockMoviment.destroy(id);
    return resp;
  },
};
