import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import StockOperationType from 'src/stores/models/stockoperation/StockOperationType';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockOperationType?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(StockOperationType.entity).query('upsert', resp.data).exec();
          StockOperationTypeService.savePinia(resp.data)
          console.log('Data synced from backend: StockOperationType');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },
};
