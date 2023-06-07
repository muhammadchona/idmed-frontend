import { useRepo } from 'pinia-orm';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import db from 'src/stores/localbase';


export function useStockEntrance() { 
  
/*
   localDbAdd(stockEntrance: StockEntrance) {
    return db.newDb().collection('stockEntrances').add(stockEntrance);
  },

   localDbGetById(id: string) {
    return db.newDb().collection('stockEntrances').doc({ id: id }).get();
  },

   localDbGetAll() {
    return db.newDb().collection('stockEntrances').get();
  }
,
   localDbUpdate(stockEntrance: StockEntrance) {
    return db
      .newDb()
      .collection('stockEntrances')
      .doc({ id: stockEntrance.id })
      .set(stockEntrance);
  }  

  , localDbDelete(stockEntrance: StockEntrance) {
    return db
      .newDb()
      .collection('stockEntrances')
      .doc({ id: stockEntrance.id })
      .delete();
  },
  
  localDbDeleteById(idStockEntrance: string) {
    return db
      .newDb()
      .collection('stockEntrances')
      .doc({ id: idStockEntrance })
      .delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('stockEntrances').delete();
  },

   localDbGetByStockEntranceId(id: string) {
    return db.newDb().collection('stockEntrances').doc({ id: id }).get();
  },
*/
  function  getClassName() {
    return 'stockEntrance';
  }
  

};