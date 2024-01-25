import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Drug from 'src/stores/models/drug/Drug';
import { useLoading } from 'src/composables/shared/loading/loading';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const { isMobile, isOnline } = useSystemUtils();

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const drug = useRepo(Drug);

export default {
  async post(params: string) {
    const resp = await api().post('drug', params);
    drug.save(resp.data);
    alertSucess('O Registo foi efectuado com sucesso');
  },
  get(offset: number) {
    if (offset >= 0) {
      // showloading();
      return (
        api()
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
          })
      );
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
    return api()
      .get('drug/getInventoryDrugs/' + id)
      .then((resp) => {
        closeLoading();
        return resp.data;
      });
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
  getActiveDrugs() {
    return drug.query().withAllRecursive(1).where('active', true).get();
  },
  getDrugsFromListId(drugListId: []) {
    return drug.query().withAllRecursive(1).find(drugListId);
  },
  getDrugsWithValidStockInList() {
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
    return drug
      .query()
      .withAllRecursive(2)
      .where('active', true)
      .whereHas('therapeuticRegimenList', (query) => {
        query.where('id', regimenId);
      })
      .get();
  },
  getDrugById(id: string) {
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
    return drug.query().withAllRecursive(1).where('id', id).first();
  },
  getDrugWith2ById(id: string) {
    return drug.query().withAllRecursive(2).where('id', id).first();
  },
  getCleanDrugById(id: string) {
    return drug.where('id', id).first();
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return drug.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllDrugs() {
    return drug.withAllRecursive(1).orderBy('name').get();
  },

  getAllForAllDrugs() {
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
};
