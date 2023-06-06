import { useRepo } from 'pinia-orm';
import ReferedStockMoviment from 'src/stores/models/stockrefered/ReferedStockMoviment';
import api from '../apiService/apiService';

const referedStockMoviment = useRepo(ReferedStockMoviment);

export default {
  // Axios API call
  post(params: any) {
    return api()
      .post('referedStockMoviment', params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      })
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('referedStockMoviment?offset=' + offset)
        .then((resp) => {
          referedStockMoviment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('referedStockMoviment/' + id, params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stock/' + id)
      .then(() => {
        referedStockMoviment.destroy(id);
      });
  },
   async apiGetAll(offset: number, max:number) {
    return  api().get(
      '/referedStockMoviment?offset=' + offset + '&max=' + max
    );
  },
   async apiSave(referedStockMoviment: any) {
    return  api().post('/referedStockMoviment', referedStockMoviment);
  },

   async apiRemove(id: string) {
    return   api().delete(`/referedStockMoviment/${id}`);
  },
   async apiUpdate(referedStockMoviment: any) {
    return  api().patch(
      '/referedStockMoviment',
      referedStockMoviment
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return referedStockMoviment.getModel().$newInstance();
  }
  

};