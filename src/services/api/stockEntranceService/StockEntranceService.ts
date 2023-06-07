import { useRepo } from 'pinia-orm';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();

const stockEntrance = useRepo(StockEntrance);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('stockEntrance', params)
      .then((resp) => {
        stockEntrance.save(resp.data);
        return resp.data
      })
    },

  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockEntrance?offset=' + offset + '&max=100')
        .then((resp) => {
          stockEntrance.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  apiUpdate(id: number, params: string) {
    return api()
      .patch('stockEntrance/' + id, params)
      .then((resp) => {
        stockEntrance.save(resp.data);
      })
  },
  delete(id: string) {
    return api()
      .delete('stockEntrance/' + id)
      .then(() => {
        stockEntrance.destroy(id);
      })
  },

  apiFetchById(id: string) {
    return api()
      .get('/inventory/' + id)
      .then((resp) => {
        stockEntrance.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },
   async apiGetAllByClinicId (clinicId: string, offset: number, max: number) {
    return await api().get('/stockEntrance/clinic/' + clinicId + '?offset=' + offset + '&max=' + max)
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockEntrance.getModel().$newInstance();
  },
// ****** PNIA 
  getStockEntranceById (id: string) {
    return stockEntrance.query()
    .with('stocks')
    .with('clinic')
    .where('id', id)
    .first()
  },

  getStockEntrances() {
      return stockEntrance.query()
                                .with('clinic')
                                .with('stocks')
                                .orderBy('dateReceived', 'desc')
                                .get()
  }

};
