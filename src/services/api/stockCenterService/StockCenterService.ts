import { useRepo } from 'pinia-orm';
import StockCenter from 'src/stores/models/stockcenter/StockCenter';
import api from '../apiService/apiService';
import { alert } from 'src/components/Shared/Dialog/Dialog';

const stockCenter = useRepo(StockCenter);

export default {
  // Axios API call
 apiSave(params: string) {
    return api()
      .post('stockCenter', params)
      .then((resp) => {
        stockCenter.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockCenter?offset=' + offset)
        .then((resp) => {
          stockCenter.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        }).catch((error) => {
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
            alert('Erro no registo', listErrors, null, null, null);
          } else if (error.request) {
            alert('Erro no registo', error.request, null, null, null);
          } else {
            alert('Erro no registo', error.message, null, null, null);
          }
        });
    }
  },
  apiUpdate(id: number, params: string) {
    return api()
      .patch('stockCenter/' + id, params)
      .then((resp) => {
        stockCenter.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stockCenter/' + id)
      .then(() => {
        stockCenter.destroy(id);
      });
  },

  apiFetchById(id: string) {
    return api().get(
      '/stockCenter/' + id ) .then((resp) => {
        stockCenter.save(resp.data);
      if (resp.data.length > 0) {
        setTimeout(this.get, 2);
      }
    });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockCenter.getModel().$newInstance();
  },
  

};