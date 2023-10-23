import { Model } from 'pinia-orm';
import ClinicalService from '../ClinicalService/ClinicalService';
import Form from '../form/Form';
import PackagedDrug from '../packagedDrug/PackagedDrug';
import PackagedDrugStock from '../packagedDrug/PackagedDrugStock';
import Stock from '../stock/Stock';
import TherapeuticRegimen from '../therapeuticRegimen/TherapeuticRegimen';
import TherapeuticRegimensDrug from '../TherapeuticRegimensDrug/TherapeuticRegimensDrug';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

export default class Drug extends Model {
  static entity = 'drugs';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      name: this.attr(''),
      fnmCode: this.attr(''),
      // sideTreatment: this.attr(''),
      packSize: this.attr(''),
      // clinicalStage: this.attr(''),
      defaultTimes: this.attr(''),
      defaultTreatment: this.attr(''),
      defaultPeriodTreatment: this.attr(''),
      active: this.boolean(true),
      form_id: this.attr(''),
      clinical_service_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      form: this.belongsTo(Form, 'form_id'),
      clinicalService: this.belongsTo(ClinicalService, 'clinical_service_id'),
      packaged_drugs: this.hasMany(PackagedDrug, 'drug_id'),
      packagedDrugStocks: this.hasMany(PackagedDrugStock, 'drug_id'),
      stocks: this.hasMany(Stock, 'drug_id'),
      therapeuticRegimenList: this.belongsToMany(
        TherapeuticRegimen,
        TherapeuticRegimensDrug,
        'drug_id',
        'therapeutic_regimen_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  getCurStockAmount() {
    if (this.stocks.length <= 0) return 0;
    let curStock = 0;
    Object.keys(this.stocks).forEach(
      function (i) {
        curStock = curStock + this.stocks[i].stockMoviment;
      }.bind(this)
    );
    return curStock;
  }

  hasStock() {
    if (this.stocks === null || this.stocks === undefined) return false;
    const hasStock = this.stocks.some((stock) => {
      const meses = moment().diff(
        moment(stock.expireDate, 'YYYY-MM-DD'),
        'months'
      );
      if (meses === null || meses === undefined) {
        this.meses = 0;
      }

      return stock.stockMoviment > 0 && meses < 0;
    });

    return hasStock;
  }

  getMonthAVGConsuption() {
    if (this.packaged_drugs.length <= 0) return 0;
    let qtyConsumed = 0;
    Object.keys(this.packaged_drugs).forEach(
      function (i) {
        qtyConsumed = qtyConsumed + this.packaged_drugs[i].quantitySupplied;
      }.bind(this)
    );
    return Math.round(Number(qtyConsumed / 3));
  }

  getConsuptionState() {
    const currStock = this.getCurStockAmount();
    const quantityDispensed = this.getQuantityDispensed();
    if (quantityDispensed > currStock) {
      return 'Ruptura de Stock';
    } else if (quantityDispensed < currStock) {
      return 'Acima do Consumo Máximo';
    } else {
      return 'Stock Normal';
    }
  }

  getConsuptionRelatedColor() {
    const currStock = this.getCurStockAmount();
    const quantityDispensed = this.getQuantityDispensed();
    if (quantityDispensed > currStock) {
      return 'red';
    } else if (quantityDispensed < currStock) {
      return 'info';
    } else {
      return 'primary';
    }
  }

  getQuantityDispensed() {
    let quantityDispensed = 0;
    this.packaged_drugs.forEach((item) => {
      quantityDispensed = quantityDispensed + item.quantitySupplied;
    });
    return quantityDispensed;
  }
}
