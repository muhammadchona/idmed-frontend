import { useRepo } from 'pinia-orm';
import { StockDestructionAdjustment } from 'src/stores/models/stockadjustment/StockDestructionAdjustment';
import api from '../apiService/apiService';

 const stockDestructionAdjustment = useRepo(StockDestructionAdjustment);

export default {

 
  apiSave(params: string) {
    return api()
      .post('stockDestructionAdjustment', params)
      .then((resp) => {
        stockDestructionAdjustment.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockDestructionAdjustment?offset=' + offset + '&max=100')
        .then((resp) => {
          stockDestructionAdjustment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  apiUpdate(id: number, params: string) {
    return api()
      .patch('stockDestructionAdjustment/' + id, params)
      .then((resp) => {
        stockDestructionAdjustment.save(resp.data);
      });
  },
  apiRemove(id: number) {
    return api()
      .delete('stockDestructionAdjustment/' + id)
      .then(() => {
        stockDestructionAdjustment.destroy(id);
      });
  }
}
