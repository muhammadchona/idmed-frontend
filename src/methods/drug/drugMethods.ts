import db from 'src/stores/localbase';
import moment from 'moment';
import Drug from 'src/stores/models/drug/Drug';
import Stock from 'src/stores/models/stock/Stock';

export default {
  getCurStockAmount(stocks) {
    if (stocks.length <= 0) return 0;
    let curStock = 0;
    Object.keys(stocks).forEach(
      function (i) {
        curStock = curStock + stocks[i].stockMoviment;
      }.bind(Drug)
    );
    return curStock;
  },

  hasStock(drug: Drug) {
    if (drug.stocks === null || drug.stocks === undefined) return false;
    const hasStock = drug.stocks.some((stock: Stock) => {
      const meses = moment().diff(
        moment(stock.expireDate, 'YYYY-MM-DD'),
        'months'
      );
      if (meses === null || meses === undefined) {
        drug.meses = 0;
      }

      return stock.stockMoviment > 0 && meses < 0;
    });

    return hasStock;
  },

  getMonthAVGConsuption(drug: Drug) {
    if (drug.packaged_drugs.length <= 0) return 0;
    let qtyConsumed = 0;
    Object.keys(drug.packaged_drugs).forEach(
      function (i) {
        qtyConsumed = qtyConsumed + drug.packaged_drugs[i].quantitySupplied;
      }.bind(drug)
    );
    return Math.round(Number(qtyConsumed / 3));
  },

  getConsuptionState(stocks, packaged_drugs) {
    const currStock = this.getCurStockAmount(stocks);
    const quantityDispensed = this.getQuantityDispensed(packaged_drugs);
    if (quantityDispensed > currStock) {
      return 'Ruptura de Stock';
    } else if (quantityDispensed < currStock) {
      return 'Acima do Consumo Máximo';
    } else {
      return 'Stock Normal';
    }
  },

  getConsuptionRelatedColor(stocks, packaged_drugs) {
    const currStock = this.getCurStockAmount(stocks);
    const quantityDispensed = this.getQuantityDispensed(packaged_drugs);
    if (quantityDispensed > currStock) {
      return 'red';
    } else if (quantityDispensed < currStock) {
      return 'info';
    } else {
      return 'primary';
    }
  },

  getQuantityDispensed(packaged_drugs) {
    let quantityDispensed = 0;
    packaged_drugs.forEach((item) => {
      quantityDispensed = quantityDispensed + item.quantitySupplied;
    });
    return quantityDispensed;
  },

  localDbAdd(drug) {
    return db.newDb().collection('drugs').add(drug);
  },

  localDbAddOrUpdate(targetCopy) {
    return db
      .newDb()
      .collection('drugs')
      .doc({ id: targetCopy.id })
      .set(targetCopy);
  },

  async localDbGetAll() {
    return await db.newDb().collection('drugs').get();
  },

  localDbGetById(drug) {
    return db.newDb().collection('drugs').doc({ id: drug.id }).get();
  },

  localDbDeleteById(drug) {
    return db.newDb().collection('drugs').doc({ id: drug.id }).delete();
  },
};
