<template>
  <q-card style="width: 900px; max-width: 90vw;" class="q-pa-none q-ma-none">
    <div class="row items-center q-py-md q-pl-lg text-center bg-green-2">
      <q-icon  name="inventory" size="md" />
        <div class="text-subtitle1 q-ml-sm">Inventário</div>
    </div>
    <q-separator color="grey-13" size="1px"/>
        <form @submit.prevent="submitForm" class="q-pa-none q-ma-none" >
            <q-card-section class="q-pb-md">
                <div class="q-mt-md">
                    <div class="row">
                      <q-input
                        dense
                        outlined
                        class="col q-ml-md q-mb-md"
                        v-model="startDate"
                        ref="startDate"
                        lazy-rules
                        label="Data do Inventário *">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="startDate" mask="DD-MM-YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    </div>
                </div>
                <div class="row">
                    <div class="col q-ml-md"  tabindex="0"> Tipo de Inventário:
                        <q-radio keep-color color="primary" v-model="currInventory.generic"  v-bind:val="true" label="Geral" />
                        <q-radio keep-color color="primary" v-model="currInventory.generic"  v-bind:val="false" label="Parcial"/>
                    </div>
                </div>
                <div
                  v-if="!currInventory.generic"
                  class="row q-mt-md">
                  <q-table
                    class="col q-ml-md"
                    dense
                    title="Medicamentos"
                    :rows="drugs"
                    :columns="columns"
                    :filter="filter"
                    row-key="id"
                    :selected-rows-label="getSelectedString"
                    selection="multiple"
                    v-model:selected="selected"
                  >
                    <template v-slot:top-right class="bg-grey-3">
                      <q-input
                        outlined
                        dense
                        style="width: 400px"
                        debounce="300"
                        v-model="filter"
                        placeholder="Pesquisar">
                        <template v-slot:append>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </template>
                    <template #header="props">
                  <q-tr class="text-left bg-grey-3"  :props="props">
                    <q-th style="width: 70px"  ></q-th>
                    <q-th style="width: 120px" >{{columns[0].label}}</q-th>
                    <q-th class="col" >{{columns[1].label}}</q-th>
                  </q-tr>
            </template>
                  </q-table>
                </div>
            </q-card-section>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn type="submit" label="Avançar" color="primary" />
            </q-card-actions>
        </form>
        <q-dialog v-model="alert.visible" persistent>
          <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
    </q-card>
</template>

<script>
import Inventory from '../../../store/models/stockinventory/Inventory'
import { ref } from 'vue'
import Drug from '../../../store/models/drug/Drug'
import { date, SessionStorage } from 'quasar'
import Clinic from '../../../store/models/clinic/Clinic'
import { InventoryStockAdjustment } from '../../../store/models/stockadjustment/InventoryStockAdjustment'
import Stock from '../../../store/models/stock/Stock'
import StockOperationType from '../../../store/models/stockoperation/StockOperationType'
import moment from 'moment'
import mixinplatform from 'src/mixins/mixin-system-platform'
import { v4 as uuidv4 } from 'uuid'

const columns = [
  { name: 'code', required: true, label: 'Código FNM', field: 'fnmCode', align: 'left', sortable: false },
  { name: 'drug', align: 'left', label: 'Medicamento', field: 'name', sortable: true }
]
export default {
  mixins: [mixinplatform],
  data () {
    return {
      filter: ref(''),
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      columns,
      currInventory: new Inventory(),
      selected: ref([])
    }
  },
  methods: {
    formatDate (dateString) {
      return date.formatDate(dateString, 'YYYY-MM-DD')
    },
    displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
    },
    getSelectedString () {
      return this.selected.length === 0 ? '' : `${this.selected.length} registo${this.selected.length > 1 ? 's' : ''} selecionado de ${this.drugs.length}`
    },
    submitForm () {
      if (date.isValid(this.currInventory.startDate)) {
        const inventory = Inventory.query().orderBy('endDate', 'desc').first()
        console.log(this.currInventory)
        console.log(inventory)
        if (new Date(this.currInventory.startDate).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)) {
          this.displayAlert('error', 'A data de inicio do inventário não pode ser superior a data corrente.')
        } else
        if (inventory !== null && (new Date(this.currInventory.startDate).setHours(0, 0, 0, 0) < new Date(inventory.endDate).setHours(0, 0, 0, 0))) {
          console.log(new Date(this.currInventory.startDate))
          console.log(new Date(inventory.endDate))
          this.displayAlert('error', 'A data de inicio do inventário não pode ser anterior a data de fecho do útimo inventário registado [' + this.getDDMMYYYFromJSDate(inventory.endDate) + ']')
        } else
        if (this.currInventory.generic) {
          this.initInventory()
        } else {
          if (this.selected.length <= 0) {
            this.displayAlert('error', 'Por favor selecionar os medicamentos a inventariar uma vez seleccionada a opção para inventário parcial.')
          } else {
            this.initInventory()
          }
        }
      } else {
        this.displayAlert('error', 'Por favor indicar uma data de início válida!')
      }
    },
    async initInventory () {
      if (!this.currInventory.generic) {
        this.doBeforeSave()
      }
      this.currInventory.clinic = SessionStorage.getItem('currClinic') // this.currClinic

      if (this.website) {
      await Inventory.apiSave(this.currInventory).then(resp => {
        SessionStorage.set('currInventory', resp.response.data)
      console.log(resp.response)
        Inventory.apiFetchById(resp.response.data.id).then(resp => {
          this.$router.push('/stock/inventory')
        })
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
          this.currInventory.syncStatus = 'R'
          this.currInventory.id = uuidv4()
          this.currInventory.clinic = this.currClinic
          this.currInventory.clinic_id = this.currClinic.id

        Object.keys(this.currInventory.adjustments).forEach(function (k) {
            const item = this.currInventory.adjustments[k]
            item.inventory_id = this.currInventory.id
            item.adjusted_stock_id = item.adjustedStock.id
            item.id = uuidv4()
        }.bind(this))

          const targetCopy = JSON.parse(JSON.stringify(this.currInventory))
          Inventory.localDbAdd(targetCopy).then(inv => {
            Inventory.insert(
              {
                data: targetCopy
              })
            SessionStorage.set('currInventory', this.currInventory)
            this.$router.push('/stock/inventory')
        })
        }
    },
    doBeforeSave () {
      Object.keys(this.selected).forEach(function (k) {
        const drug = this.selected[k]
        Object.keys(drug.stocks).forEach(function (i) {
          this.initNewAdjustment(drug.stocks[i], drug)
        }.bind(this))
      }.bind(this))
    },
    initNewAdjustment (stock, drug) {
      const newAdjustment = new InventoryStockAdjustment({
        adjustedStock: Stock.query()
                            .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                            .with(['entrance.clinic.province', 'entrance.clinic.district.province', 'entrance.clinic.facilityType'])
                            .with(['center.clinic.province', 'center.clinic.district.province', 'center.clinic.facilityType'])
                            .where('id', stock.id)
                            .first(),
        clinic: this.currClinic,
        captureDate: new Date(),
        operation: StockOperationType.query().where('code', 'AJUSTE_NEGATIVO').first()
      })
      newAdjustment.adjustedStock.drug = drug
      this.currInventory.adjustments.push(newAdjustment)
    },
    getJSDateFromDDMMYYY (dateString) {
      const dateParts = dateString.split('-')
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    },
    getDDMMYYYFromJSDate (jsDate) {
      return moment(jsDate).format('DD-MM-YYYY')
    }
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default
  },
  computed: {
    startDate: {
      get () {
        if (this.currInventory.startDate === null || this.currInventory.startDate === '') return null
        return this.getDDMMYYYFromJSDate(this.currInventory.startDate)
      },
      set (value) {
        this.currInventory.startDate = this.getJSDateFromDDMMYYY(value)
      }
    },
    drugs () {
      return Drug.query()
                 .with('stocks')
                 .with('form')
                 .has('stocks')
                 .where('active', true)
                 .get()
    },
    currClinic () {
      return Clinic.query()
                   .with('province')
                   .with('facilityType')
                   .with('district.province')
                   .where('id', SessionStorage.getItem('currClinic').id)
                   .first()
    }
  }
}
</script>

<style>

</style>
