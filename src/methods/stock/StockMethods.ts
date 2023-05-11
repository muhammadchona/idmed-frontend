import Stock from "src/stores/models/stock/Stock"; 
import  db from "src/stores/localbase";
import { date } from 'quasar';
export default {


  isInUse() {
    return (
      (this.packagedDrugStocks !== undefined &&
        this.packagedDrugStocks.length > 0) ||
      this.adjustments.length > 0
    );
  },

  getFormatedExpireDate() {
    return this.formatDate(this.expireDate);
  },

  formatDate(dateString: String) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  },
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

  , getClassName() {
    return 'stock';
  }
}
