// import { Model } from '@vuex-orm/core'
import { v4 as uuidv4 } from 'uuid'
import { nSQL } from 'nano-sql'
import { Model } from 'pinia-orm'

export default class MmiaRegimenSubReport extends Model {
    static entity = 'mmiaRegimenSubReport'
    static fields () {
      return {
        id: this.string(() => uuidv4()),
        reportId: this.attr(''),

       // fields
       code: this.attr(''),
       regimen: this.attr(''),
      // drugId: this.attr(''),
      line: this.attr(''),
      lineCode: this.attr(''),
      totalPatients: this.attr(0),
      cumunitaryClinic: this.attr(0)
      }
    }
}