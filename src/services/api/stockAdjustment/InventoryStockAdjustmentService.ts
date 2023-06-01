import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';

const inventoryStockAdjustment = useRepo(InventoryStockAdjustment);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('inventoryStockAdjustment', params)
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
      });
  },
  
  get(offset: number) {
    if (offset >= 0) {
      return api()
      .get('/inventoryStockAdjustment?offset=' + offset + '&max=100')
        .then((resp) => {
          inventoryStockAdjustment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
   patch(id: number, params: string) {
    return api()
      .patch('/inventoryStockAdjustment/' + id, params)
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('/inventoryStockAdjustment/' + id)
      .then(() => {
        inventoryStockAdjustment.destroy(id);
      });
  },

    async apiGetAll(offset: number, max: number) {
    return await  api().get(
      '/inventoryStockAdjustment?offset=' + offset + '&max=' + max
    )
  },

    async apiSave(adjustment: any) {
    return await api().post('/inventoryStockAdjustment', adjustment);
  },

    async apiRemove(id: string) {
    return await api().delete(`/inventoryStockAdjustment/${id}`);
  },

    async apiUpdate(adjustment: any) {
    return await api().patch(
      '/inventoryStockAdjustment/' + adjustment.id,
      adjustment
    );
  },


    async apiFetchById(id: string) {
    return await api().get(`/inventoryStockAdjustment/${id}`);
  }

};