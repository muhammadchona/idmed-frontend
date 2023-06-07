
import api from '../apiService/apiService';
import stockOperationType from 'src/stores/models/stockoperation/StockOperationType';
import { useRepo } from 'pinia-orm';

const stockOperationRepo =  useRepo(stockOperationType);

export default {
  // Axios API call static async
  async apiGetAll (offset: number, max: number) {
    return api().get('/stockOperationType?offset=' + offset + '&max=' + max)
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('/stockOperationType?offset=' + offset + '&limit=100')
        .then((resp) => {
          stockOperationRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
          }
        });
    }
  },
  getStockOperatinTypeByCode(code: string) {
    return stockOperationRepo.query()
    .where('code', code)
    .first()
  }
};
