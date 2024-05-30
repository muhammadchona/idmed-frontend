import { useRepo } from 'pinia-orm';
import StockDistributor from 'src/stores/models/stockDistributor/StockDistributor';
import api from '../apiService/apiService';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();
const stockDistributor = useRepo(StockDistributor);

export default {
  // Axios API call
  async post(params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },

  get(offset: number) {
    if (!isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async apiUpdate(id: string, params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.apiUpdateWeb(id, params);
    }
  },

  async delete(id: any) {
    if (!isOnline.value) {
      return this.deleteMobile(id);
    } else {
      return this.deleteWeb(id);
    }
  },

  apiFetchById(id: string) {
    if (!isOnline.value) {
      return this.apiFetchByIdMobile(id);
    } else {
      return this.apiFetchByIdWeb(id);
    }
  },
  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    if (!isOnline.value) {
      this.apiGetAllByClinicIdMobile(clinicId);
    } else {
      this.apiGetAllByClinicIdWeb(clinicId, offset, max);
    }
  },

  // WEB
  postWeb(params: string) {
    return api()
      .post('stockDistributor', params)
      .then((resp) => {
        stockDistributor.save(resp.data);
        return resp.data;
      });
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockDistributor?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            stockDistributor.save(resp.data);
            offset = offset + 100;
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('stockDistributor/' + id, params)
      .then((resp) => {
        stockDistributor.save(resp.data);
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('stockDistributor/' + id)
      .then(() => {
        stockDistributor.destroy(id);
      });
  },
  apiFetchByIdWeb(id: string) {
    return api()
      .get('/stockDistributor/' + id)
      .then((resp) => {
        stockDistributor.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },

  async apiGetAllByClinicIdWeb(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/stockDistributor/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  //Mobile

  async putMobile(params: any) {
    const resp = await nSQL('stockDistributors')
      .query('upsert', JSON.parse(JSON.stringify(params)))
      .exec();
    stockDistributor.save(params);
    return resp;
  },

  getMobile() {
    return nSQL('stockDistributors')
      .query('select')
      .exec()
      .then((result) => {
        console.log(result);
        stockDistributor.save(result);
        //  return result
      });
  },

  getByStockDistributorMobile(stockDistributor: any) {
    return nSQL('stockDistributors')
      .query('select')
      .where(['stockDistributors[id]', '=', stockDistributor.id])
      .exec()
      .then((result) => {
        console.log(result);
        stockDistributor.save(result);
      });
  },

  async deleteMobile(id: any) {
    const resp = await nSQL('stockDistributors')
      .query('delete')
      .where(['id', '=', id])
      .exec();
    stockDistributor.destroy(id);
    return resp;
  },

  apiFetchByIdMobile(id: any) {
    return nSQL('stockDistributors')
      .query('select')
      .where(['id', '=', id])
      .exec()
      .then((result) => {
        console.log(result);
        stockDistributor.save(result);
      });
  },

  apiGetAllByClinicIdMobile(id: any) {
    return nSQL().onConnected(() => {
      nSQL('stockDistributor')
        .query('select')
        .where(['stockDistributor[clinic_id]', '=', id])
        .exec()
        .then((result) => {
          console.log(result);
          stockDistributor.save(result);
        });
    });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return stockDistributor.getModel().$newInstance();
  },
  // ****** PNIA
  getStockDistributorById(id: string) {
    return stockDistributor
      .query()
      .with('drugDistributors')
      .with('clinic')
      .where('id', id)
      .first();
  },

  getStockDistributorServices(clinicId: any) {
    return stockDistributor
      .query()
      .with('clinic')
      .with('drugDistributors')
      .where('clinic_id', clinicId)
      .orderBy('creationDate', 'desc')
      .get();
  },

  getStockDistributorConfirmation(clinicId: any) {
    return stockDistributor
      .query()
      .with('clinic')
      .with('drugDistributors')
      .whereHas('drugDistributors', (query) => {
        query.where('clinic_id', clinicId);
      })
      .orderBy('creationDate', 'desc')
      .get();
  },
  deleteAllFromStorage() {
    stockDistributor.flush();
  },
};
