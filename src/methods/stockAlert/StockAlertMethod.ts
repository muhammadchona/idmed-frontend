import { useRepo } from 'pinia-orm';
import StockAlert from 'src/stores/models/stockAlert/StockAlert';
import db from 'src/stores/localbase';

const stockAlert = useRepo(StockAlert);

export default {
  // Axios API call
 
  // Local Storage Pinia
  newInstanceEntity() {
    return stockAlert.getModel().$newInstance();
  },
  
  localDbAdd(stockAlert: StockAlert) {
    return db.newDb().collection('stockAlert').add(stockAlert);
  }
  

};