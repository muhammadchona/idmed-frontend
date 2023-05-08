<template>
  <div>
    <TitleBar>Detalhes do Inventário</TitleBar>
    <div class="row" v-if="website">
      <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg" style="max-width: 500px;">
        <div>
          <ListHeader
            :addVisible="false"
            :mainContainer="true"
            bgColor="bg-primary">Notas do Inventário
          </ListHeader>
          <div class="box-border q-pt-md">
            <TextInput
              v-model="inventoryType"
              label="Tipo de Inventário"
              disable
              dense
              class="col q-ma-sm" />
            <q-input
                dense
                outlined
                disable
                class="col q-ma-sm"
                v-model="startDate"
                ref="dateReceived"
                label="Data de Abertura">
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
            <q-separator class="q-mx-sm"/>
            <div class="row q-pa-sm">
              <q-btn unelevated color="blue" class="col" label="Voltar" @click="goBack"/>
              <q-space v-if="currInventory.open"/>
              <q-btn
                v-if="currInventory.open"
                unelevated
                color="red"
                class="q-ml-md col"
                @click="initInventoryClosure()"
                label="Fechar Inventário" />
            </div>
          </div>
        </div>
      </div>
      <div class="col q-pt-md q-mr-lg">
        <q-scroll-area
            :thumb-style="thumbStyle"
            :content-style="contentStyle"
            :content-active-style="contentActiveStyle"
            style="height: 750px;"
            class="q-pr-md"
          >
          <span
            v-for="drug in drugs" :key="drug.id" >
            <AdjustmentTable
              :drug="drug"
              :inventory="currInventory" />
          </span>
        </q-scroll-area>
      </div>
    </div>

        <div class="row" v-if="mobile">
      <div class="col q-mx-md q-mt-md" >
        <div>
          <ListHeader
            :addVisible="false"
            :mainContainer="true"
            bgColor="bg-primary">Notas do Inventário
          </ListHeader>
          <div class="box-border row q-pt-md">
            <TextInput
              v-model="inventoryType"
              label="Tipo de Inventário"
              disable
              dense
              class="col q-ma-sm" />
            <q-input
                dense
                outlined
                disable
                class="col q-ma-sm"
                v-model="startDate"
                ref="dateReceived"
                label="Data de Abertura">
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
            <q-separator class="q-mx-sm"/>
            <div class="row q-pa-sm" >
              <q-btn unelevated color="blue" class="col"  size="10px" label="Voltar" @click="goBack"/>
              <q-space v-if="currInventory.open"/>
              <q-btn
                v-if="currInventory.open"
                unelevated
                color="red"
                class="q-ml-md col"
                @click="initInventoryClosure()"
                size="10px"
                label="Fechar Inventário" />
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 q-px-md">
        <q-scroll-area
            :thumb-style="thumbStyle"
            :content-style="contentStyle"
            :content-active-style="contentActiveStyle"
            style="height: 750px;"
          >
          <span
            v-for="drug in drugs" :key="drug.id" >
            <AdjustmentTable
              :drug="drug"
              :inventory="currInventory" />
          </span>
        </q-scroll-area>
      </div>
    </div>

    <q-dialog v-model="alert.visible" persistent>
      <Dialog :type="alert.type" @closeDialog="closeDialog" @commitOperation="closeInventory">
        <template v-slot:title> {{dialogTitle}}</template>
        <template v-slot:msg> {{alert.msg}} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script>
import Drug from '../../../store/models/drug/Drug'
import { ref } from 'vue'
import { date, QSpinnerBall, SessionStorage } from 'quasar'
import Inventory from '../../../store/models/stockinventory/Inventory'
import Clinic from '../../../store/models/clinic/Clinic'
import { InventoryStockAdjustment } from '../../../store/models/stockadjustment/InventoryStockAdjustment'
import Stock from '../../../store/models/stock/Stock'
import StockEntrance from '../../../store/models/stockentrance/StockEntrance'
import moment from 'moment'
import mixinplatform from 'src/mixins/mixin-system-platform'

export default {
  mixins: [mixinplatform],
  data () {
    return {
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      dialogTitle: 'Informação',
      adjustments: ref([]),
      step: 'display',
      processedAdjustments: [],
      contentStyle: {
        backgroundColor: '#ffffff',
        color: '#555'
      },

      contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      },

      thumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#0ba58b',
        width: '5px',
        opacity: 0.75
      }
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    initInventoryClosure () {
      this.dialogTitle = 'Confirmação do fecho do inventário.'
      this.displayAlert('confirmation', 'Nota: Ao encerrar o presente inventário o stock será actualizado para os dados informados e está operação não poderá ser desfeita. Continuar?')
    },
    closeInventory () {
      this.$q.loading.show({
        message: 'A fechar inventário ...',
        spinnerColor: 'grey-4',
        spinner: QSpinnerBall
        // delay: 400 // ms
      })

      setTimeout(() => {
        this.$q.loading.hide()
      }, 800)
      if (this.website) {
      Inventory.apiFetchById(this.currInventory.id).then(resp => {
        this.doProcessAndClose()
      })
      } else {
        const targetCopy = JSON.parse(JSON.stringify(this.currInventory))
        Inventory.insert({
          data: targetCopy
          }).then(inv => {
            this.doProcessAndCloseMobile()
        })
      }
    },
    doProcessAndClose () {
      const offset = 0
      const max = 100
      var doo = new Date(this.currInventory.startDate)
      var currInv2 = this.currInventory
      Inventory.delete(this.currInventory.id)
      currInv2.startDate = new Date(doo.getTime() + Math.abs(doo.getTimezoneOffset() * 60000))
      Inventory.insert({
              data: currInv2
                          })
      const inventory = Inventory.query()
                                 .with('adjustments.*')
                                 .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                 .where('id', currInv2.id)
                                 .first()
      inventory.endDate = new Date()
      inventory.open = false
      inventory.adjustments.forEach((adjustment) => {
        this.processAdjustment(adjustment, inventory)
      })
      this.doSaveAdjustment(0)
      console.log(inventory)
      console.log(this.currInventory)
      Inventory.apiUpdate(inventory).then(resp => {
        this.step = 'display'
        this.currInventory.open = false
        Inventory.apiFetchById(this.currInventory.id)
        this.getAllStockOfClinic(this.currClinic.id)
        Stock.apiGetAll(offset, max)
        Drug.apiGetAll(offset, max)
        this.displayAlert('info', 'Operação efectuada com sucesso.')
      })
    },
    doProcessAndCloseMobile () {
      const inventory = Inventory.query()
                                 .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                 .where('id', this.currInventory.id)
                                 .first()

       Inventory.localDbGetById(this.currInventory.id).then(it => {
         inventory.syncStatus = it.syncStatus
      })

      inventory.endDate = new Date()
      inventory.open = false

        InventoryStockAdjustment.localDbGetAll().then((adjustments) => {
        const adjustmentsList = adjustments.filter((adjustment) => adjustment.inventory_id === inventory.id)
        inventory.adjustments = []
        adjustmentsList.forEach((adjustment) => {
            adjustment.clinic = this.currClinic
            adjustment.adjustedStock.clinic = this.currClinic
            adjustment.adjustedStock.stockMoviment = adjustment.balance
            adjustment.inventory = null
            this.processedAdjustments.push(adjustment)
          //  this.doSaveAdjustmentMobile(0)
            const targetCopyAdj = JSON.parse(JSON.stringify(adjustment))
            InventoryStockAdjustment.localDbUpdate(targetCopyAdj).then(item => {
                    InventoryStockAdjustment.update(targetCopyAdj)
              })
      })
             inventory.clinic = this.currClinic
             inventory.adjustments = this.processedAdjustments
      const targetCopy = JSON.parse(JSON.stringify(inventory))
      Inventory.localDbUpdate(targetCopy).then(item => {
        Inventory.update(targetCopy)
      }).then(item => {
              this.step = 'display'
        this.currInventory.open = false
        this.displayAlert('info', 'Operação efectuada com sucesso.')
        })
        })
     // SessionStorage.set('currInventory', inventory)
    },
    doSaveAdjustment (i) {
      if (this.processAdjustment[i] !== undefined && this.processAdjustment[i] !== null) {
        InventoryStockAdjustment.apiUpdate(this.processAdjustment[i]).then(resp => {
          i = i + 1
          setTimeout(this.doSaveAdjustment(i), 2)
        })
      }
    },
     doSaveAdjustmentMobile (i) {
      if (this.processAdjustment[i] !== undefined && this.processAdjustment[i] !== null) {
              InventoryStockAdjustment.localDbUpdate(this.processAdjustment[i]).then(invStkAdj => {
              i = i + 1
              setTimeout(this.doSaveAdjustmentMobile(i), 2)
              })
      }
    },
    processAdjustment (adjustment, inventory) {
      const iv = Object.assign({}, inventory)
      iv.adjustments = []
      adjustment.inventory = iv
      adjustment.clinic = this.currClinic
      adjustment.finalised = true
      adjustment.adjustedStock = Stock.query()
                                      .with('drug.form')
                                      .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                      .with(['entrance.clinic.province', 'entrance.clinic.district.province', 'entrance.clinic.facilityType'])
                                      .with(['center.clinic.province', 'center.clinic.district.province', 'center.clinic.facilityType'])
                                      .where('id', adjustment.adjusted_stock_id)
                                      .first()
      adjustment.adjustedStock.stockMoviment = adjustment.balance
      this.processedAdjustments.push(adjustment)
    },
     ormatDate (dateString) {
      return date.formatDate(dateString, 'YYYY-MM-DD')
    },
    getAllStockOfClinic () {
      const offset = 0
      const max = 100
      this.doStockEntranceGet(this.currClinic.id, offset, max)
    },
    doStockEntranceGet (clinicId, offset, max) {
      StockEntrance.apiGetAllByClinicId(clinicId, offset, max).then(resp => {
            if (resp.response.data.length > 0) {
              offset = offset + max
              setTimeout(this.doStockEntranceGet(clinicId, offset, max), 2)
            }
        }).catch(error => {
            console.log(error)
        })
    },
    getDrugs () {
      if (this.currInventory.generic) {
        return Drug.query()
                   .with('stocks.*')
                   .with('form')
                   .where('active', true)
                   .get()
      } else {
        return this.currInventory.drugs
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
    retriveRelatedDrug (adjustment, drugList) {
      let isNewDrug = true
      console.log(adjustment)
      if (adjustment.adjustedStock === null) {
        adjustment.adjustedStock = Stock.query()
                                        .with('drug.form')
                                        .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                        .with(['entrance.clinic.province', 'entrance.clinic.district.province', 'entrance.clinic.facilityType'])
                                        .with(['center.clinic.province', 'center.clinic.district.province', 'center.clinic.facilityType'])
                                        .where('id', adjustment.adjusted_stock_id)
                                        .first()
      }
      const drug = Drug.query()
                      .with('stocks')
                      .with('form')
                      .where('id', adjustment.adjustedStock.drug_id)
                      .first()
      if (drugList.length <= 0) {
        drugList.push(drug)
      } else {
        Object.keys(drugList).forEach(function (i) {
          if (drugList[i].id === drug.id) {
            isNewDrug = false
          }
        })
        if (isNewDrug) drugList.push(drug)
      }
    },
    getJSDateFromDDMMYYY (dateString) {
      const dateParts = dateString.split('-')
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    },
    getDDMMYYYFromJSDate (jsDate) {
      return moment(jsDate).format('DD-MM-YYYY')
    }
  },
  computed: {
    startDate: {
      get () {
        return this.getDDMMYYYFromJSDate(this.currInventory.startDate)
      },
      set (value) {
        this.currInventory.startDate = value
      }
    },
    isDisplayStep () {
      return this.step === 'display'
    },
    isEditionStep () {
      return this.step === 'edit'
    },
    isCreationStep () {
      return this.step === 'create'
    },
    isDeletionStep () {
      return this.step === 'delete'
    },
    enableFields () {
      return this.isEditionStep || this.isCreationStep
    },
    currInventory () {
      const e = new Inventory(SessionStorage.getItem('currInventory'))
       if (this.mobile) return e
      return Inventory.query()
                      .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                      .with('adjustments.adjustedStock')
                      .where('id', e.id)
                      .first()
    },
    drugs () {
      if (this.currInventory.generic) {
        return Drug.query()
                   .with('stocks')
                   .with('form')
                   .has('stocks')
                   .where('active', true)
                   .get()
      } else {
        const drugList = []
        console.log(this.currInventory)
        Object.keys(this.currInventory.adjustments).forEach(function (i) {
          this.currInventory.adjustments[i].adjustedStock = Stock.query()
                                                                 .with('drug.form')
                                                                  .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                                                  .with(['entrance.clinic.province', 'entrance.clinic.district.province', 'entrance.clinic.facilityType'])
                                                                  .with(['center.clinic.province', 'center.clinic.district.province', 'center.clinic.facilityType'])
                                                                 .where('id', this.currInventory.adjustments[i].adjusted_stock_id)
                                                                 .first()
          console.log(this.currInventory.adjustments[i])
          this.retriveRelatedDrug(this.currInventory.adjustments[i], drugList)
        }.bind(this))
        return drugList
      }
    },
    inventoryType () {
      return this.currInventory.getInventoryType()
    },
    currClinic () {
      return Clinic.query()
                  .with('province')
                  .with('facilityType')
                  .with('district.province')
                  .where('id', SessionStorage.getItem('currClinic').id)
                  .first()
    }
  },
  created () {
    if (this.mobile) {
      Drug.localDbGetAll().then(drugs => {
        Drug.insertOrUpdate({ data: drugs })
      })
    }
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    TitleBar: require('components/Shared/TitleBar.vue').default,
    ListHeader: require('components/Shared/ListHeader.vue').default,
    TextInput: require('components/Shared/Input/TextField.vue').default,
   AdjustmentTable: require('components/Stock/Inventory/InventoryAdjustmentsContainer.vue').default
  }
}
</script>

<style lang="scss">
  .box-border {
    border: 1px solid $grey-4
  }
</style>
