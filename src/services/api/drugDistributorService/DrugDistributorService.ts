import { useRepo } from 'pinia-orm';
import DrugDistributor from 'src/stores/models/drugDistributor/DrugDistributor';
import api from '../apiService/apiService';
import moment from 'moment';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();

const drugDistributor = useRepo(DrugDistributor);

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
      return this.apiUpdateWeb(id, params);
    }
  },

  async delete(id: string) {
    if (!isOnline.value) {
      return this.deleteMobile(id);
    } else {
      return this.deleteWeb(id);
    }
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return drugDistributor.getModel().$newInstance();
  },
  async apiSave(drugDistributor: any) {
    return api().post('/drugDistributor', drugDistributor);
  },

  async apiRemove(id: any) {
    return api().delete(`/drugDistributor/${id}`);
  },

  async apiUpdate(drugDistributor: any) {
    return api().patch(
      '/drugDistributor/' + drugDistributor.id,
      drugDistributor
    );
  },

  async apiGetAll(offset: number, max: number) {
    return api().get('/drugDistributor?offset=' + offset + '&max=' + max);
  },

  // Web
  postWeb(params: string) {
    return api()
      .post('drugDistributor', params)
      .then((resp) => {
        drugDistributor.save(resp.data);
        return resp.data;
      });
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drugDistributor?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            drugDistributor.save(resp.data);
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
      .patch('drugDistributor/' + id, params)
      .then((resp) => {
        drugDistributor.save(resp.data);
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('drugDistributor/' + id)
      .then(() => {
        drugDistributor.destroy(id);
      });
  },

  getDistributionsByStatus(clinicSectorId: any, status: any) {
    return api()
      .get(
        `drugDistributor/getDistributionsByStatus/${clinicSectorId}/${status}`
      )
      .then((resp) => {
        return resp.data;
      });
  },

  // PINIA

  getDrugDistributorById(id: string) {
    return drugDistributor.query().withAllRecursive().where('id', id).first();
  },

  getStockDistributorById(id: string) {
    return (
      drugDistributor
        .query()
        //Stock.query()
        .with('drug')
        .with('clinic')
        .with('stockDistributor')
        .where('id', id)
        .first()
    );
  },

  //Mobile
  async putMobile(params: any) {
    const resp = await nSQL('drugDistributors')
      .query('upsert', JSON.parse(JSON.stringify(params)))
      .exec();
    drugDistributor.save(params);
    return resp;
  },

  getMobile() {
    return nSQL().onConnected(() => {
      nSQL('drugDistributors')
        .query('select')
        .exec()
        .then((result) => {
          console.log(result);
          drugDistributor.save(result);
          return result;
        });
    });
  },

  localDbGetAll() {
    return nSQL('drugDistributors')
      .query('select')
      .exec()
      .then((result) => {
        return result;
      });
  },

  localDbGetUsedStock(reportParams: any) {
    return nSQL('drugDistributors')
      .query('select')
      .where(['drug.clinicalService.id', '=', reportParams.clinicalService])
      .exec()
      .then((result) => {
        console.log(result);
        return result;
      });
  },

  // Local Storage Pinia
  deleteAllFromStorage() {
    drugDistributor.flush();
  },

  updateDrugDistributorStatus(record: any, status: any) {
    return api()
      .patch(
        `drugDistributor/updateDrugDistributorStatus/${record.id}/${status}`
      )
      .then((resp) => {
        drugDistributor.save(record);
        return resp.data;
      });
  },

  getDrugDistributorList(stockDistributorId: string) {
    return drugDistributor
      .query()
      .withAllRecursive(3)
      .where('stock_distributor_id', stockDistributorId)
      .get();
  },
};
