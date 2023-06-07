import { useRepo } from 'pinia-orm';
import StockAlert from 'src/stores/models/stockAlert/StockAlert';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();

const stockAlert = useRepo(StockAlert);

export default {
  // Axios API call
  apiSave(params: string) {
    return api()
      .post('stockAlert', params)
      .then((resp) => {
        stockAlert.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockAlert?offset=' + offset)
        .then((resp) => {
          stockAlert.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  apiUpdate(id: number, params: string) {
    return api()
      .patch('stockAlert/' + id, params)
      .then((resp) => {
        stockAlert.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stockAlert/' + id)
      .then(() => {
        stockAlert.destroy(id);
      });
  },

  apiFetchById(id: string) {
    return api()
      .get('/stockAlert/' + id)
      .then((resp) => {
        stockAlert.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },
  async apiGetStockAlertAll(clinicId: string) {
    return  api().get(`/dashBoard/getStockAlertAll/${clinicId}`).then((resp) => {
      stockAlert.save(resp.data);
        });
  },

   apiGetStockAlert(clinicId: string, serviceCode: string) {
    return api().get(
      `/dashBoard/getStockAlert/${clinicId}/${serviceCode}`
    )
  },
  getStockAlertsByClinic() {
    return stockAlert.withAllRecursive(2)
      .get();
  },
  saveStockAlert(stockAlert: any) {
    stockAlert.save(stockAlert)
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockAlert.getModel().$newInstance();
  },
};
