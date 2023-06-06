import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import destroyedStock from 'src/stores/models/stockdestruction/DestroyedStock';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { alertSucess, alertError, alertWarning } = useSwal();
const destroyedStockRepo = useRepo(destroyedStock)


export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('destroyedStock', params)
      .then((resp) => {
        destroyedStockRepo.save(resp.data);
      })
  },

  get(offset: number) {
    if (offset >= 0) {
      return api()
      .get('destroyedStock?offset=' + offset)
        .then((resp) => {
          destroyedStockRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },

   async apiSave(destroyedStock: any) {
    return await api().post('/destroyedStock', destroyedStock);
  },

  async apiRemove(id: any) {
    return await api().delete(`/destroyedStock/${id}`);
  },

    async apiUpdate(destroyedStock: any) {
    return await  api().patch('/destroyedStock', destroyedStock);
  },

   async apiGetAll(offset: any, max: any) {
    return await api().get(
      '/destroyedStock?offset=' + offset + '&max=' + max
    );
  }
 
  

};