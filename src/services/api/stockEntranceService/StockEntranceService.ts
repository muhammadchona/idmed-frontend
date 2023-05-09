import { useRepo } from 'pinia-orm';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import api from '../apiService/apiService';
import { alert } from 'src/components/Shared/Dialog/Dialog';

const stockEntrance = useRepo(StockEntrance);

export default {
  // Axios API call
 apiSave(params: string) {
    return api()
      .post('stockEntrance', params)
      .then((resp) => {
        stockEntrance.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockEntrance?offset=' + offset)
        .then((resp) => {
          stockEntrance.save(resp.data);
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
      .patch('stockEntrance/' + id, params)
      .then((resp) => {
        stockEntrance.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stockEntrance/' + id)
      .then(() => {
        stockEntrance.destroy(id);
      });
  },

  apiFetchById(id: string) {
    return api().get(
      '/inventory/' + id ) .then((resp) => {
        stockEntrance.save(resp.data);
      if (resp.data.length > 0) {
        setTimeout(this.get, 2);
      }
    });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockEntrance.getModel().$newInstance();
  },
  

};