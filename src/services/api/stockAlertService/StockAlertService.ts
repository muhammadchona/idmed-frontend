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
        .catch((error) => {
          if (error.request != null) {
            const arrayErrors = JSON.parse(error.request.response);
            const listErrors = [];
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
            alertError(String(listErrors));
          } else if (error.request) {
            alertError(error.request);
          } else {
            alertError(error.message);
          }
        });
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
  // Local Storage Pinia
  newInstanceEntity() {
    return stockAlert.getModel().$newInstance();
  },
};
