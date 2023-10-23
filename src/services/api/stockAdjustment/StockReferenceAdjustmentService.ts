import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { StockReferenceAdjustment } from 'src/stores/models/stockadjustment/StockReferenceAdjustment';

const stockReferenceAdjustment = useRepo(StockReferenceAdjustment);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('referedStockMoviment', params)
      .then((resp) => {
        stockReferenceAdjustment.save(resp.data);
      });
  },
  
  get(offset: number) {
    if (offset >= 0) {
      return api()
      .get('stockReferenceAdjustment?offset=' + offset + '&max=100')
        .then((resp) => {
          stockReferenceAdjustment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('stockReferenceAdjustment/' + id, params)
      .then((resp) => {
        stockReferenceAdjustment.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stockReferenceAdjustment/' + id)
      .then(() => {
        stockReferenceAdjustment.destroy(id);
      });
  },
 
};