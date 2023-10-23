import { v4 as uuidv4 } from 'uuid'
import { nSQL } from 'nano-sql'
import { Model } from 'pinia-orm'

export default class MmiaStockReport extends Model {
    static entity = 'mmiaStockReports'
    static fields () {
      return {
        id: this.string(() => uuidv4()),
        reportId: this.attr(''),
        periodType: this.attr(''),
        period: this.attr(''),
        year: this.attr(''),
        startDate: this.attr(''),
        endDate: this.attr(''),
        province: this.attr(''),
        district: this.attr(''),

       // fields
       fnmCode: this.attr(''),
       unit: this.attr(''),
      // drugId: this.attr(''),
       drugName: this.attr(''),
       balance: this.attr(''),
       initialEntrance: this.attr(0),
       outcomes: this.attr(0),
       lossesAdjustments: this.attr(0),
       actualStock: this.attr(0),
       inventory: this.attr(0),
       expireDate: this.attr(0)
      }
    }

}