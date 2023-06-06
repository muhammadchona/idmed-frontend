import { date } from 'quasar';
import { useDateUtils } from '../shared/dateUtils/dateUtils';
export function useStock () {


  function isInUse(stock: any) {
    return (
      (stock.packagedDrugStocks !== undefined &&
        stock.packagedDrugStocks.length > 0) ||
        stock.adjustments.length > 0
    );
  }

  function getFormatedExpireDate(stock: any) {
    return date.formatDate(stock.expireDate);
  }

  function formatDate(dateString: any) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  }

  /*
 localDbAdd(stock: Stock) {
    return db.newDb().collection('stocks').add(stock);
  },
   localDbGetById(id: String) {
    return db.newDb().collection('stocks').doc({ id: id }).get();
  }

  , async localDbGetAll() {
    return await db.newDb().collection('stocks').get();
  }

  , localDbUpdate(stock: Stock) {
    return db.newDb().collection('stocks').doc({ id: stock.id }).set(stock);
  }

  , localDbDelete(stock: Stock) {
    return db.newDb().collection('stocks').doc({ id: stock.id }).delete();
  }

  , localDbDeleteById(id: String) {
    return db.newDb().collection('stocks').doc({ id: id }).delete();
  }

  , localDbDeleteAll() {
    return db.newDb().collection('stocks').delete();
  }
  , localDbAddOrUpdate(stock: Stock, operation: String) {
    if (operation === 'create') {
        stock.syncStatus = 'R';
      return this.localDbAdd(stock);
    } else {
      stock.syncStatus = 'U';
      return this.localDbUpdate(stock);
    }
  }
*/
  function  getClassName() {
    return 'stock';
  }
  return {
    isInUse,
    getFormatedExpireDate,
    formatDate,
    getClassName
  }
}
