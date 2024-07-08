import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import api from '../../api/apiService/apiService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockOperationType?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            StockOperationTypeService.addBulkMobile(resp.data);
            console.log('Data synced from backend: stockOperationType');
            offset = offset + 100;
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
