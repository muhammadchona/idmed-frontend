import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import api from '../../api/apiService/apiService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import StockOperationType from 'src/stores/models/stockoperation/StockOperationType';

const StockOperationTypeDexie = db[StockOperationType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockOperationType?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            StockOperationTypeDexie.bulkPut(resp.data);
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

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania stockOperationType');
    (await SynchronizationService.hasData(StockOperationTypeDexie))
      ? await StockOperationTypeService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie stockOperationType');
    const getAllstockOperationType =
      StockOperationTypeService.getAllFromStorage();
    await StockOperationTypeDexie.bulkPut(getAllstockOperationType);
  },
};
