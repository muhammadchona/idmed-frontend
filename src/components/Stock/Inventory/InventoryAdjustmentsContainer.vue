<template>
  <div>
          <ListHeader
            :addVisible="false"
            :doneVisible="isEditStep"
            @expandLess="expandLess"
            :mainContainer="false"
            @done="saveAdjustments"
            :bgColor="headerColor">{{drug.name}}
          </ListHeader>
          <div class="box-border q-pb-md" v-show="infoContainerVisible">
            <q-table
                class="col"
                dense
                flat
                :rows="adjustments"
                :columns="columns"
                row-key="id"
                >
                <template v-slot:no-data="{ icon, filter }">
                  <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                    <span>
                      Sem resultados para visualizar
                    </span>
                    <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                  </div>
                </template>
                <template #header="props">
                  <q-tr class="text-left bg-grey-3"  :props="props">
                    <q-th style="width: 70px" >{{columns[0].label}}</q-th>
                    <q-th style="width: 110px" >{{columns[1].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[2].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[3].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[4].label}}</q-th>
                    <q-th class="col" >{{columns[5].label}}</q-th>
                  </q-tr>

                </template>
                <template #body="props">
                  <q-tr :props="props">
                    <q-td key="order" :props="props">
                      {{props.row.index}}
                    </q-td>
                    <q-td key="batchNumber" :props="props">
                      <TextInput
                        v-model="props.row.adjustedStock.batchNumber"
                        disable
                        label="Lote"
                        dense
                        class="col" />
                    </q-td>
                    <q-td key="expireDate" :props="props">
                      <q-input
                        dense
                        outlined
                        disable
                        class="col"
                        v-model="props.row.adjustedStock.auxExpireDate"
                        ref="reOpenDate"
                        label="Data de Validade">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="props.row.adjustedStock.auxExpireDate" mask="DD-MM-YYYY" >
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                      </q-input>
                    </q-td>
                    <q-td key="currQty" :props="props">
                      <div class="row">
                        <TextInput
                          v-model="props.row.adjustedStock.stockMoviment"
                          disable
                          label="Quantidade"
                          dense
                          class="col" />
                      </div>
                    </q-td>
                      <q-td key="balance" :props="props">
                      <div class="row">
                        <TextInput
                          v-model="props.row.balance"
                          :disable="!inventory.open"
                          @update:model-value="changeStepToEdition()"
                          label="Quantidade"
                          dense
                          class="col" />
                        <TextInput
                          v-model="props.row.adjustedStock.drug.form.description"
                          disable
                          label="Foma"
                          dense
                          class="col q-ml-sm" />
                      </div>
                    </q-td>
                    <q-td key="notes" :props="props">
                      <TextInput
                        v-model="props.row.notes"
                        :disable="!inventory.open"
                        @update:model-value="changeStepToEdition()"
                        label="Notas"
                        dense
                        class="col" />
                    </q-td>
                  </q-tr>
                </template>
            </q-table>
          </div>
          <q-separator color="orange" v-show="!infoContainerVisible"/>
          <q-dialog v-model="alert.visible" persistent>
            <Dialog :type="alert.type" @closeDialog="closeDialog">
              <template v-slot:title> Informação</template>
              <template v-slot:msg> {{alert.msg}} </template>
            </Dialog>
          </q-dialog>
        </div>
</template>

<script>
import { InventoryStockAdjustment } from '../../../store/models/stockadjustment/InventoryStockAdjustment'
import { ref } from 'vue'
import { date, SessionStorage } from 'quasar'
import Clinic from '../../../store/models/clinic/Clinic'
import Stock from '../../../store/models/stock/Stock'
import StockOperationType from '../../../store/models/stockoperation/StockOperationType'
import moment from 'moment'
import mixinplatform from 'src/mixins/mixin-system-platform'
import Drug from '../../../store/models/drug/Drug'
 import Inventory from '../../../store/models/stockinventory/Inventory'

const columns = [
  { name: 'order', required: true, label: 'Ordem', field: 'index', align: 'center', sortable: false },
  { name: 'batchNumber', align: 'center', label: 'Lote', sortable: true },
  { name: 'expireDate', align: 'center', label: 'Data de Validade', sortable: false },
  { name: 'currQty', align: 'center', label: 'Saldo Actual', sortable: true },
  { name: 'balance', align: 'center', label: 'Quantidade Contada', sortable: true },
  { name: 'notes', align: 'center', label: 'Notas', sortable: false }
]
export default {
  mixins: [mixinplatform],
  props: ['drug', 'inventory'],
  data () {
    return {
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      columns,
      adjustments: ref([]),
      step: 'display',
      infoContainerVisible: true
    }
  },
  methods: {
    formatDate (dateString) {
      return date.formatDate(dateString, 'DD-MM-YYYY')
    },
    expandLess (value) {
      this.infoContainerVisible = !value
    },
    async init () {
        if (this.mobile) {
        /* Inventory.localDbGetAll().then(item => {
              console.log('LISTA Inventarios: ', item)
              if (item.syncStatus !== '') {
                  Inventory.insert({
                    data: item
                  })
              }
            }) */
          await InventoryStockAdjustment.localDbGetAll().then(item => {
            console.log('LISTA AJustes: ', item)
            if (item.syncStatus !== '') {
                InventoryStockAdjustment.insert({
                  data: item
                })
            }
          })
          await Drug.localDbGetAll().then(drugs => {
            Drug.insertOrUpdate({ data: drugs })
          })
          this.prepareInit()
        } else {
          this.prepareInit()
        }
    },
    prepareInit () {
          let i = 1
                if (this.drug.stocks.length > 0) {
                    Object.keys(this.drug.stocks).forEach(function (k) {
                      this.initNewAdjustment(this.drug.stocks[k], this.drug, i)
                      i = i + 1
                    }.bind(this))
                }
    },
    initNewAdjustment (stock, drug, i) {
      let newAdjustment = null
      newAdjustment = InventoryStockAdjustment.query()
                                              .with('adjustedStock')
                                              .with('inventory')
                                              .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                              .with('operation')
                                              .where('adjusted_stock_id', stock.id)
                                              .where((_record, query) => {
                                                      query.where('inventory_id', this.inventory.id)
                                                    })
                                              .first()
     console.log(newAdjustment)
     if (newAdjustment === null) {
        newAdjustment = new InventoryStockAdjustment({
          inventory: this.inventory,
          clinic: this.currClinic
        })
      }
      newAdjustment.index = i
      newAdjustment.adjustedStock = Stock.query()
                                          .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                          .with(['entrance.clinic.province', 'entrance.clinic.district.province', 'entrance.clinic.facilityType'])
                                          .with(['center.clinic.province', 'center.clinic.district.province', 'center.clinic.facilityType'])
                                          .where('id', stock.id)
                                          .first()
      newAdjustment.adjustedStock.auxExpireDate = this.getDDMMYYYFromJSDate(newAdjustment.adjustedStock.expireDate)
      newAdjustment.adjustedStock.drug = drug
      this.adjustments.push(newAdjustment)
    },
    saveAdjustments () {
      Object.keys(this.adjustments).forEach(function (k) {
        const adjustment = this.adjustments[k]
        let operation = null
        if (adjustment.balance > adjustment.adjustedStock.stockMoviment) {
          operation = StockOperationType.query().where('code', 'AJUSTE_POSETIVO').first()
        } else if (adjustment.balance < adjustment.adjustedStock.stockMoviment) {
          operation = StockOperationType.query().where('code', 'AJUSTE_NEGATIVO').first()
        } else {
          operation = StockOperationType.query().where('code', 'SEM_AJUSTE').first()
        }
        this.adjustments[k].captureDate = new Date()
        this.adjustments[k].operation = operation
        if (this.adjustments[k].isPosetiveAdjustment()) {
          this.adjustments[k].adjustedValue = Number(this.adjustments[k].balance - this.adjustments[k].adjustedStock.stockMoviment)
        } else if (this.adjustments[k].isNegativeAdjustment()) {
          this.adjustments[k].adjustedValue = Number(this.adjustments[k].adjustedStock.stockMoviment - this.adjustments[k].balance)
        } else {
          this.adjustments[k].adjustedValue = 0
        }
      }.bind(this))
      this.doSave(0)
    },
    doSave (i) {
      if (this.adjustments[i] !== undefined) {
        if (this.adjustments[i].balance.length <= 0 || isNaN(this.adjustments[i].balance)) {
          this.displayAlert('error', 'Por favor indicar um Numero Valido para o campo Quantidade Contada.')
        } else {
          console.log(this.adjustments[i]) // devolver ajustes ao salvar
          if (this.website) {
            InventoryStockAdjustment.apiFetchById(this.adjustments[i].id).then(resp1 => {
              if (resp1.response.data.length === 0) {
                InventoryStockAdjustment.apiSave(this.adjustments[i]).then(resp => {
                    this.adjustments[i].id = resp.response.data.id
                    i = i + 1
                    setTimeout(this.doSave(i), 2)
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
              } else {
                InventoryStockAdjustment.apiUpdate(this.adjustments[i]).then(resp => {
                    this.adjustments[i].id = resp.response.data.id
                    i = i + 1
                    setTimeout(this.doSave(i), 2)
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
              }
        })
            } else {
                    const targetCopy = new InventoryStockAdjustment(JSON.parse(JSON.stringify(this.adjustments[i])))
                    const id = targetCopy.id
                     InventoryStockAdjustment.localDbGetById(id).then(item => {
                    if (item !== null && item !== undefined) {
                       targetCopy.syncStatus = 'U'
                      targetCopy.operation_id = targetCopy.operation.id
                      targetCopy.clinic = this.currClinic
                      targetCopy.clinic_id = targetCopy.clinic.id
                                InventoryStockAdjustment.localDbUpdate(targetCopy).then(resp => {
                                  InventoryStockAdjustment.insert(
                                    {
                                        data: targetCopy
                                      }
                                  )
                              i = i + 1
                              setTimeout(this.doSave(i), 2)
                              this.displayAlert('info', 'Operação efectuada com sucesso.')
                              })
                        } else {
                              targetCopy.syncStatus = 'R'
                              targetCopy.inventory_id = targetCopy.inventory.id
                              targetCopy.adjusted_stock_id = targetCopy.adjustedStock.id
                              targetCopy.operation_id = targetCopy.operation.id
                              InventoryStockAdjustment.localDbAdd(targetCopy).then(resp => {
                                    InventoryStockAdjustment.insert({
                                      data: targetCopy
                                    })
                                i = i + 1
                                setTimeout(this.doSave(i), 2)
                                this.displayAlert('info', 'Operação efectuada com sucesso.')
                            })
                        }
                        if (this.inventory.open && (this.inventory.syncStatus !== 'R' && this.inventory.syncStatus !== 'U')) {
                          Inventory.localDbGetById(this.inventory.id).then(item => {
                            const target = JSON.parse(JSON.stringify(item))
                             target.syncStatus = 'U'
                            Inventory.localDbUpdate(target).then(item => {
                               Inventory.update({ data: target })
                            })
                          })
                        }
                        })
                    }
        }
      } else {
        this.step = 'display'
      }
    },
    changeStepToEdition () {
      this.step = 'edit'
    },
    displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
    },
    getJSDateFromDDMMYYY (dateString) {
      const dateParts = dateString.split('-')
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    },
    getDDMMYYYFromJSDate (jsDate) {
      return moment(jsDate).format('DD-MM-YYYY')
    }
  },
  mounted () {
    this.init()
    console.log(this.newInventory)
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    ListHeader: require('components/Shared/ListHeader.vue').default,
    TextInput: require('components/Shared/Input/TextField.vue').default
  },
  computed: {
    isEditStep () {
      return this.step === 'edit'
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
      if (this.isEditStep) {
        return 'bg-amber-9'
      } else {
        return 'bg-primary'
      }
    },
    newInventory () {
      console.log(this.$route.params.isNew)
      return this.$route.params.isNew
    }
  }
}
</script>

<style>

</style>
