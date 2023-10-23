 import { Model } from 'pinia-orm'
import ArvDailyRegisterTempReport from './ArvDailyRegisterTempReport';

export default class DrugQuantityTemp extends Model{
  static entity = 'drugQuantityTemps';
  static fields() {
    return {
      id: this.attr(null),
      drugName: this.attr(null),
      quantity: this.attr(null),
      arvDailyRegisterReport: this.belongsTo(
        ArvDailyRegisterTempReport,
        'arv_daily_register_report_id'
      ),
    };
  }
}
