import { useRepo } from 'pinia-orm';
import StockCenter from 'src/stores/models/stockcenter/StockCenter';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const stockCenter = useRepo(StockCenter);

export default {
  // Axios API call
  async apiSave(params: string) {
    const resp = await api().post('stockCenter', params);
    stockCenter.save(resp.data);
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
          } else {
            closeLoading();
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
  async apiUpdate(id: number, params: string) {
    const resp = await api().patch('stockCenter/' + id, params);
    stockCenter.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('stockCenter/' + id);
    stockCenter.destroy(id);
  },

  async apiFetchById(id: string) {
    const resp = await api().get('/stockCenter/' + id);
    stockCenter.save(resp.data);
    if (resp.data.length > 0) {
      setTimeout(this.get, 2);
    }
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockCenter.getModel().$newInstance();
  },
};
