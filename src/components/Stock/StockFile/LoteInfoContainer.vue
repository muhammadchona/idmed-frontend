<template>
  <div class="box-border q-pb-md">
          <ListHeader
            :addVisible="isDisplayStep"
            :doneVisible="doneVisible"
            :mainContainer="false"
            @expandLess="expandLess"
            @addNewAdjustment="addNewAdjustment"
            @done="saveAjustment"
            @cancel="cancel"
            :bgColor="headerColor"><span class="text-blue-grey-8">Nr. do Lote: {{stock.batchNumber}} - [Saldo Actual: {{stock.stockMoviment}}] - [Validade: <span :class="getValidadeLabelColor">{{getValidade}}</span>]</span>
          </ListHeader>
          <q-table
            class="col"
            dense
            flat
            separator="cell"
            :rows="drugEventList"
            :columns="columns"
            row-key="id"
            v-show="serviceInfoVisible"
            >
            <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                <span>
                  Sem informação por visualizar
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template #header="props">
              <q-tr class="text-left bg-grey-3" style="text-align: center"  :props="props">
                <q-th style="width: 140px" >{{columns[0].label}}</q-th>
                <q-th style="width: 200px" >{{columns[1].label}}</q-th>
                <q-th style="width: 180px" >{{columns[2].label}}</q-th>
                <q-th style="width: 120px" >{{columns[3].label}}</q-th>
                <q-th style="width: 120px" >{{columns[4].label}}</q-th>
                <q-th style="width: 120px" >{{columns[5].label}}</q-th>
                <q-th style="width: 120px" >{{columns[6].label}}</q-th>
                <q-th style="width: 120px" >{{columns[7].label}}</q-th>
                <q-th style="width: 100px" >{{columns[8].label}}</q-th>
                <q-th class="col" style="width: 400px" >{{columns[9].label}}</q-th>
              </q-tr>

            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td key="eventDate" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <q-input
                        dense
                        outlined
                        class="col"
                        v-model="props.row.eventDate"
                        mask="date"
                        ref="expireDate"
                        label="Data Movimento">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="props.row.eventDate" >
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                  </span>
                  <span v-else>{{formatDate(props.row.eventDate)}}</span>
                </q-td>
                <q-td key="moviment" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.moviment"
                      label="Tipo de Movimento"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.moviment}}</span>
                </q-td>
                <q-td key="orderNumber" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.orderNumber"
                      :disable="isLossAdjustment"
                      label="Número da Guia"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.orderNumber}}</span>
                </q-td>
                <q-td key="incomes" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.incomes"
                      disable
                      label="Entradas"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.incomes}}</span>
                </q-td>
                <q-td key="outcomes" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.outcomes"
                      disable
                      label="Saídas"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.outcomes}}</span>
                </q-td>
                <q-td key="posetiveAdjustment" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.posetiveAdjustment"
                      :disable="!isPosetiveAdjustment"
                      label="Ajuste Positivo"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.posetiveAdjustment}}</span>
                </q-td>
                <q-td key="negativeAdjustment" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.negativeAdjustment"
                      :disable="!isNegativeAdjustment"
                      label="Ajuste Negativo"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.negativeAdjustment}}</span>
                </q-td>
                <q-td key="loses" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.loses"
                      :disable="!isLossAdjustment"
                      label="Perdas"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.loses}}</span>
                </q-td>
                <q-td key="balance" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.balance"
                      disable
                      label="Saldo"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.balance}}</span>
                </q-td>
                <q-td key="notes" :props="props">
                  <span v-if="props.row.id === null && !isDisplayStep">
                    <TextInput
                      v-model="props.row.notes"
                      label="Notas"
                      dense
                      class="col" />
                  </span>
                  <span v-else>{{props.row.notes}}</span>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <q-dialog v-model="alert.visible" persistent>
            <Dialog :type="alert.type" @closeDialog="closeDialog">
              <template v-slot:title> Informação</template>
              <template v-slot:msg> {{alert.msg}} </template>
            </Dialog>
          </q-dialog>
        </div>
</template>

<script>
import { date, SessionStorage } from 'quasar'
import Stock from '../../../store/models/stock/Stock'
import { StockDestructionAdjustment } from '../../../store/models/stockadjustment/StockDestructionAdjustment'
import StockOperationType from '../../../store/models/stockoperation/StockOperationType'
import DestroyedStock from '../../../store/models/stockdestruction/DestroyedStock'
import Clinic from '../../../store/models/clinic/Clinic'
import { ref } from 'vue'
import { StockReferenceAdjustment } from '../../../store/models/stockadjustment/StockReferenceAdjustment'
import ReferedStockMoviment from '../../../store/models/stockrefered/ReferedStockMoviment'
import mixinplatform from 'src/mixins/mixin-system-platform'
import db from 'src/store/localbase'
// import DrugFile from '../../../store/models/drugFile/DrugFile'

const columns = [
  { name: 'eventDate', required: true, label: 'Data Movimento', field: 'eventDate', align: 'center', sortable: true },
  { name: 'moviment', align: 'center', label: 'Origem/Destino', sortable: true },
  { name: 'orderNumber', align: 'center', label: 'Nr. Guia', sortable: false },
  { name: 'incomes', align: 'center', label: 'Entrada', sortable: true },
  { name: 'outcomes', align: 'center', label: 'Saídas', sortable: true },
  { name: 'posetiveAdjustment', align: 'center', label: 'Ajuste Positivo (+)', sortable: true },
  { name: 'negativeAdjustment', align: 'center', label: 'Ajuste Negativo (-)', sortable: true },
  { name: 'loses', align: 'center', label: 'Perdas', sortable: true },
  { name: 'balance', align: 'center', label: 'Saldo', sortable: true },
  { name: 'notes', align: 'center', label: 'Notas', sortable: false }
]
export default {
   mixins: [mixinplatform],
  props: ['stockInfo', 'batchS'],
  data () {
    return {
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      columns,
      stockExpiteStatus: '',
      drugEventList: [],
      adjustmentType: '',
      step: 'display',
      serviceInfoVisible: true,
      curEvent: {}
    }
  },
  methods: {
    formatDate (dateString) {
      return date.formatDate(dateString, 'DD-MM-YYYY')
    },
    expandLess (value) {
      this.serviceInfoVisible = !value
    },
    saveAjustment () {
      let adjustment = null
      let reference = null
      let destruction = null
      if (this.isLossAdjustment) {
          destruction = new DestroyedStock({
            notes: this.curEvent.moviment,
            date: new Date(this.curEvent.eventDate),
            clinic: this.currClinic
          })
        adjustment = new StockDestructionAdjustment({
          adjustedValue: this.curEvent.loses,
          operation: StockOperationType.query().where('code', 'AJUSTE_NEGATIVO').first()
        })
        destruction.adjustments.push(adjustment)
      } else if (this.isPosetiveAdjustment || this.isNegativeAdjustment) {
         reference = new ReferedStockMoviment({
            origin: this.curEvent.moviment,
            date: new Date(this.curEvent.eventDate),
            quantity: this.isPosetiveAdjustment ? this.curEvent.posetiveAdjustment : this.curEvent.negativeAdjustment,
            orderNumber: this.curEvent.orderNumber,
            clinic: this.currClinic
          })
          adjustment = new StockReferenceAdjustment({
          adjustedValue: this.isPosetiveAdjustment ? this.curEvent.posetiveAdjustment : this.curEvent.negativeAdjustment,
          operation: StockOperationType.query().where('code', this.isPosetiveAdjustment ? 'AJUSTE_POSETIVO' : 'AJUSTE_NEGATIVO').first()
        })
        reference.adjustments.push(adjustment)
      }

      adjustment.adjustedStock = Stock.query()
                                      .with('drug.form')
                                      .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                      .with(['entrance.clinic.province', 'entrance.clinic.district.province', 'entrance.clinic.facilityType'])
                                      .with(['center.clinic.province', 'center.clinic.district.province', 'center.clinic.facilityType'])
                                      .where('id', this.stock.id)
                                      .first()
      if (new Date(this.curEvent.eventDate) < new Date(adjustment.adjustedStock.entrance.dateReceived)) {
        this.displayAlert('error', 'A data do movimento não pode ser menor que a data de entrada do lote.')
      } else if (new Date(this.curEvent.eventDate) > new Date()) {
        this.displayAlert('error', 'A data do movimento não pode ser maior que a data corrente.')
      } else if (this.curEvent.moviment === '') {
        this.displayAlert('error', 'Por favor indicar a Origem/Destino.')
      } else if (Number(adjustment.adjustedValue) <= 0) {
        this.displayAlert('error', 'Por favor indicar uma quantidade válida.')
      } else if ((this.isLossAdjustment || this.isNegativeAdjustment) && (Number(adjustment.adjustedStock.stockMoviment - adjustment.adjustedValue) < 0)) {
         this.displayAlert('error', 'A quantidade que pretende retitar é maior que a quantidade em stock no momento, impossível prosseguir!')
      } else {
        adjustment.clinic = this.currClinic
        adjustment.notes = this.curEvent.notes
        adjustment.captureDate = new Date(this.curEvent.eventDate)
        adjustment.finalised = true
        if (this.isPosetiveAdjustment) {
          adjustment.adjustedStock.stockMoviment = Number(adjustment.adjustedStock.stockMoviment + adjustment.adjustedValue)
        } else {
          adjustment.adjustedStock.stockMoviment = Number(adjustment.adjustedStock.stockMoviment - adjustment.adjustedValue)
        }
        adjustment.balance = adjustment.adjustedStock.stockMoviment
        this.curEvent.balance = adjustment.balance
        if (this.mobile) {
           if (this.isPosetiveAdjustment || this.isNegativeAdjustment) {
            reference.syncStatus = 'R'
            ReferedStockMoviment.localDbAdd(reference).then(resp => {
              reference.adjustments[0].adjustedStock.syncStatus = 'U'
              Stock.localDbUpdate(reference.adjustments[0].adjustedStock)
              this.step = 'display'
              this.adjustmentType = ''
              this.displayAlert('info', 'Operação efectuada com sucesso.')
              this.$emit('updateDrugFileAdjustment', reference.adjustments[0])
            }).catch(error => {
              this.displayAlert('error', error)
            })
           } else {
            destruction.syncStatus = 'R'
             DestroyedStock.localDbAdd(destruction).then(resp => {
              destruction.adjustments[0].syncStatus = 'U'
              Stock.localDbUpdate(destruction.adjustments[0].adjustedStock)
              this.$emit('updateDrugFileAdjustment', destruction.adjustments[0])
              this.step = 'display'
              this.adjustmentType = ''
              this.displayAlert('info', 'Operação efectuada com sucesso.')
            }).catch(error => {
              this.displayAlert('error', error)
            })
            db.newDb().collection('destruction').set(destruction)
           }
           this.drugEventList.shift()
        } else {
        this.doSave(reference, destruction)
        }
      }
    },
    doSave (reference, destruction) {
      if (this.isPosetiveAdjustment || this.isNegativeAdjustment) {
        ReferedStockMoviment.apiSave(reference).then(resp => {
          this.curEvent.id = resp.response.data.adjustments[0].id
          this.updateRelatedStock(reference.adjustments[0].adjustedStock)
        }).catch(error => {
          const listErrors = []
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach(element => {
                listErrors.push(element.message)
              })
            }
          }
          this.displayAlert('error', listErrors)
        })
      } else {
        DestroyedStock.apiSave(destruction).then(resp => {
          this.curEvent.id = resp.response.data.adjustments[0].id
          this.updateRelatedStock(destruction.adjustments[0].adjustedStock)
        }).catch(error => {
          const listErrors = []
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach(element => {
                listErrors.push(element.message)
              })
            }
          }
          this.displayAlert('error', listErrors)
        })
      }
    },
    updateRelatedStock (stock) {
      Stock.apiUpdate(stock).then(resp => {
        this.step = 'display'
        this.adjustmentType = ''
        this.displayAlert('info', 'Operação efectuada com sucesso.')
      }).catch(error => {
          const listErrors = []
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach(element => {
                listErrors.push(element.message)
              })
            }
          }
          this.displayAlert('error', listErrors)
        })
    },
    cancel () {
      const i = this.drugEventList.map(toRemove => toRemove.id).indexOf(this.curEvent.id) // find index of your object
      this.drugEventList.splice(i, 1)
      this.adjustmentType = ''
      this.step = 'display'
    },
    addNewAdjustment (adjustmentType) {
      this.adjustmentType = adjustmentType
        const event = {
            id: null,
            eventDate: ' ',
            moviment: ' ',
            orderNumber: adjustmentType === 'POSETIVE' ? ' ' : '-',
            incomes: '-',
            outcomes: '-',
            posetiveAdjustment: adjustmentType === 'POSETIVE' ? ' ' : '-',
            negativeAdjustment: adjustmentType === 'NEGATIVE' ? ' ' : '-',
            loses: adjustmentType === 'LOSS' ? ' ' : '-',
            balance: ' ',
            notes: ''
          }
      this.curEvent = event
      this.drugEventList.unshift(event)
      this.step = 'create'
    },
    determineValidade () {
      const expireDate = new Date(this.stock.expireDate)
      if (expireDate < new Date()) {
        this.stockExpiteStatus = 'Expired'
        return 'Expirou aos ' + this.formatDate(this.stock.expireDate)
      } else if (expireDate === new Date()) {
        this.stockExpiteStatus = 'Expiring'
        return 'Expira Hoje!'
      } else if (date.addToDate(new Date(), { months: 2 }) >= expireDate) {
        this.stockExpiteStatus = 'Expiring'
        const diff = date.getDateDiff(expireDate, new Date(), 'days')
        return 'Faltam ' + diff + ' dias para expirar'
      } else {
        this.stockExpiteStatus = 'valid'
        return this.formatDate(this.stock.expireDate)
      }
    },
    displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
    },
    generateDrugBatchEventSummary () {
      Stock.apiGetDrugBatchSummary(this.currClinic.id, this.stock.id).then(resp => {
        console.log(resp.response.data)
        const t = resp.response.data
        /* t.sort((a, b) => {
          const d1 = new Date(a.eventDate)
          const d2 = new Date(b.eventDate)
          return d2 - d1
        }) */
        this.drugEventList = t
      })
    }
  },
  computed: {
    stock () {
      if (this.website) return this.stockInfo
      return Stock.query().where('id', this.batchS.stockId).first()
    },
    getValidade () {
      return this.determineValidade()
    },
    getValidadeLabelColor () {
      if (this.stockExpiteStatus !== 'valid') {
        return 'text-red-8'
      } else {
        return 'text-green-8'
      }
    },
    doneVisible () {
      return this.step === 'eidt' || this.step === 'create'
    },
    isDisplayStep () {
      return this.step === 'display'
    },
    isPosetiveAdjustment () {
      return this.adjustmentType === 'POSETIVE'
    },
    isNegativeAdjustment () {
      return this.adjustmentType === 'NEGATIVE'
    },
    isLossAdjustment () {
      return this.adjustmentType === 'LOSS'
    },
    currClinic () {
      return Clinic.query()
                  .with('province')
                  .with('facilityType')
                  .with('district.province')
                  .where('id', SessionStorage.getItem('currClinic').id)
                  .first()
    },
    headerColor () {
      if (this.doneVisible) {
        return 'bg-orange-5'
      } else {
        return 'bg-grey-6'
      }
    }
  },
  mounted () {
    if (this.website) {
    this.generateDrugBatchEventSummary()
    } else {
       this.drugEventList.push(this.batchS)
    }
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    ListHeader: require('components/Stock/StockFile/StockFileListHeader.vue').default,
    TextInput: require('components/Shared/Input/TextField.vue').default
  }
}
</script>

<style>

</style>
