import { useRepo } from 'pinia-orm';
import StockCenter from 'src/stores/models/stockcenter/StockCenter';
import db from 'src/stores/localbase';

const stockCenter = useRepo(StockCenter);

export default {

   localDbAdd(stockCenter: StockCenter) {
    return db.newDb().collection('stockCenters').add(stockCenter);
  },

   localDbGetById(id: String) {
    return db.newDb().collection('stockCenters').doc({ id: id }).get();
  },

   localDbGetAll() {
    return db.newDb().collection('stockCenters').get();
  },

   localDbUpdate(stockCenter: StockCenter) {
    return db
      .newDb()
      .collection('stockCenters')
      .doc({ id: stockCenter.id })
      .set(stockCenter);
  },

   localDbDelete(stockCenter: StockCenter) {
    return db
      .newDb()
      .collection('stockCenters')
      .doc({ id: stockCenter.id })
      .delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('stockCenters').delete();
  }

};