
import api from '../apiService/apiService';
import stockOperationType from 'src/stores/models/stockoperation/StockOperationType';
import { useRepo } from 'pinia-orm';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isMobile, isOnline } = useSystemUtils();

const stockOperationRepo =  useRepo(stockOperationType);

export default {
  // Axios API call static async

  get(offset: number) {

    if (!isOnline.value) {
      return nSQL().onConnected(() => {
        nSQL('stockOperationTypes').query('select').exec().then(result => {
         console.log(result)
         stockOperationRepo.save(result)
          return result
         })
       })
    } else {
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
    }
   },
   
  async apiGetAll (offset: number, max: number) {
    return api().get('/stockOperationType?offset=' + offset + '&max=' + max)
  },
 
  getStockOperatinTypeByCode(code: string) {
    return stockOperationRepo.query()
    .where('code', code)
    .first()
  },

  //Pinia

  savePinia(st: any) {
    stockOperationRepo.save(st)
  }
};
