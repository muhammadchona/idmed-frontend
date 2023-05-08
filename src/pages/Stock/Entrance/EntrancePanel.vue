<template>
  <div>
    <TitleBar>Detalhe da Guia</TitleBar>
    <div class="row" v-if="mobile">
       <div class="col q-mx-md q-mt-md">
        <ListHeader
            :addVisible="false"
            :expandVisible="false"
            :mainContainer="true"
            bgColor="bg-primary">Notas da Guia
          </ListHeader>
          <div class="box-border row q-pt-sm ">
                    <TextInput
                      v-model="currStockEntrance.orderNumber"
                      label="Número"
                      :rules="[ val => !!val || 'Por favor indicar o número da guia']"
                      :disable="!isGuiaEditionStep"
                      dense
                       class="col q-mx-md" />
                    <q-input
                        dense
                        outlined
                        :disable="!isGuiaEditionStep"
                         class="col q-mx-md"
                        v-model="dateReceived"
                        label="Data de Criação">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="dateReceived" mask="DD-MM-YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <div class="row q-mx-sm  items-center " v-if="isGuiaDisplayStep">
                      <q-btn unelevated color="blue" class="col q-ma-sm" label="Voltar" @click="goBack"  size="12px"/>
                      <q-btn unelevated color="orange-5" class="q-ml-md col" label="Editar" @click="initGuiaEdition"  size="12px" />
                      <q-btn unelevated color="red" class="q-ml-md col" label="Remover" @click="removeGuia"  size="12px"/>
                    </div>
                    <div class="row q-pa-sm" v-if="isGuiaEditionStep">
                      <q-btn unelevated color="blue" class="col" label="Cancelar" @click="cancelOperation" size="10px"/>
                      <q-btn unelevated color="orange-5" class="q-ml-md col" label="Gravar" @click="doSaveGuia" size="10px"/>
                    </div>
                  </div>
      </div>
      <div  class="col-12 q-px-md">
      <div>
          <ListHeader
            :addVisible="isGuiaDisplayStep"
            :expandVisible="false"
            :mainContainer="true"
            @showAdd="initNewStock"
            bgColor="bg-primary">Medicamentos
          </ListHeader>
          <div class="box-border q-pb-md">
            <q-table
                class="col"
                dense
                flat
                :rows="stockList"
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
                    <q-th class="col" >{{columns[1].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[2].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[3].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[4].label}}</q-th>
                    <q-th style="width: 120px" >{{columns[5].label}}</q-th>
                    <q-th style="width: 150px; text-align: center" >{{columns[6].label}}</q-th>
                  </q-tr>

                </template>
                <template #body="props">
                  <q-tr :props="props">
                    <q-td key="order" :props="props">
                    {{index}}
                    </q-td>
                    <q-td key="drug" :props="props">
                      <q-select
                        class="col"
                        dense outlined
                        :disable="!props.row.enabled"
                        ref="drug"
                        v-model="props.row.drug"
                        :options="drugs"
                        option-value="id"
                        option-label="name"
                        label="Medicamento"
                        @filter="filterFn"
                        use-input
                        hide-selected
                        fill-input
                        input-debounce="0">
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              Sem Resultados
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-td>
                     <q-td key="manufacture" :props="props">
                      <TextInput
                        v-model="props.row.manufacture"
                        :disable="!props.row.enabled"
                        label="Fabricante"
                        dense
                        class="col" />
                    </q-td>
                    <q-td key="batchNumber" :props="props">
                      <TextInput
                        v-model="props.row.batchNumber"
                        :disable="!props.row.enabled"
                        label="Lote"
                        dense
                        class="col" />
                    </q-td>
                    <q-td key="expireDate" :props="props">
                      <q-input
                        dense
                        :disable="!props.row.enabled"
                        outlined
                        class="col"
                        v-model="props.row.auxExpireDate"
                        ref="expireDate"
                        label="Data de Validade">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="props.row.auxExpireDate" mask="DD-MM-YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    </q-td>
                    <q-td key="unitsReceived" :props="props">
                      <TextInput
                        v-model="props.row.unitsReceived"
                        :disable="!props.row.enabled"
                        label="Quantidade"
                        dense
                        class="col" />
                    </q-td>
                    <q-td key="options" :props="props">
                      <div class="col" v-if="!props.row.isInUse()">
                        <q-btn v-if="props.row.enabled" :loading="submitting" flat dense round color="primary" icon="done" @click="validateStock(props.row)"/>
                        <q-btn v-if="props.row.enabled" flat dense round color="red" icon="clear" @click="cancel(props.row)"/>
                        <q-btn v-if="!props.row.enabled" flat dense round color="orange-5" icon="edit"  @click="initStockEdition(props.row)" />
                        <q-btn v-if="!props.row.enabled" flat dense round color="red" icon="delete_forever" class="q-ml-sm"  @click="promptStockDeletion(props.row)"/>
                      </div>
                      <div class="col" v-else>
                        <q-chip color="info" text-color="white">
                          Em Uso
                        </q-chip>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
            </q-table>
          </div>
          <div class="row">
                <q-banner
                  dense
                  inline-actions
                  style="padding-top: 2px; padding-bottom: 2px;"
                  class="col text-white q-pa-none bg-orange-4 q-pr-sm">
                    <template v-slot:action class="items-center">
                        <q-btn dense unelevated color="primary" class="col" label="Imprimir" />
                    </template>
                </q-banner>
              </div>
        </div>
      </div>
    </div>

    <div class="row" v-if="website">
      <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg">
        <div>
          <ListHeader
            :addVisible="false"
            :expandVisible="false"
            :mainContainer="true"
            bgColor="bg-primary">Notas da Guia
          </ListHeader>
          <div class="box-border q-pt-md">
            <TextInput
              v-model="currStockEntrance.orderNumber"
              label="Número"
              :rules="[ val => !!val || 'Por favor indicar o número da guia']"
              :disable="!isGuiaEditionStep"
              dense
              class="col q-ma-sm" />
            <q-input
                dense
                outlined
                :disable="!isGuiaEditionStep"
                class="col q-ma-sm"
                v-model="dateReceived"
                label="Data de Criação">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                        <q-date v-model="dateReceived" mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                        </q-date>
                    </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>
            <q-separator class="q-mx-sm"/>
            <div class="row q-pa-sm" v-if="isGuiaDisplayStep">
              <q-btn unelevated color="blue" class="col" label="Voltar" @click="goBack"/>
              <q-btn unelevated color="orange-5" class="q-ml-md col" label="Editar" @click="initGuiaEdition"/>
              <q-btn unelevated color="red" class="q-ml-md col" label="Remover" @click="removeGuia"/>
            </div>
            <div class="row q-pa-sm" v-if="isGuiaEditionStep">
              <q-btn unelevated color="blue" class="col" label="Cancelar" @click="cancelOperation"/>
              <q-btn unelevated color="orange-5" class="q-ml-md col" label="Gravar" @click="doSaveGuia"/>
            </div>
          </div>
        </div>
      </div>
      <div class="col q-pt-md q-mr-lg">
      <div>
          <ListHeader
            :addVisible="isGuiaDisplayStep"
            :expandVisible="false"
            :mainContainer="true"
            @showAdd="initNewStock"
            bgColor="bg-primary">Medicamentos
          </ListHeader>
          <div class="box-border q-pb-md">
            <q-table
                class="col"
                dense
                flat
                :rows="stockList"
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
                    <q-th class="col" >{{columns[1].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[2].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[3].label}}</q-th>
                    <q-th style="width: 190px" >{{columns[4].label}}</q-th>
                    <q-th style="width: 120px" >{{columns[5].label}}</q-th>
                    <q-th style="width: 150px; text-align: center" >{{columns[6].label}}</q-th>
                  </q-tr>

                </template>
                <template #body="props">
                  <q-tr :props="props">
                    <q-td key="order" :props="props">
                    {{index}}
                    </q-td>
                    <q-td key="drug" :props="props">
                      <q-select
                        class="col"
                        dense outlined
                        :disable="!props.row.enabled"
                        ref="drug"
                        v-model="props.row.drug"
                        :options="drugs"
                        option-value="id"
                        option-label="name"
                        label="Medicamento"
                        @filter="filterFn"
                        use-input
                        hide-selected
                        fill-input
                        input-debounce="0">
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              Sem Resultados
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-td>
                     <q-td key="manufacture" :props="props">
                      <TextInput
                        v-model="props.row.manufacture"
                        :disable="!props.row.enabled"
                        label="Fabricante"
                        dense
                        class="col" />
                    </q-td>
                    <q-td key="batchNumber" :props="props">
                      <TextInput
                        v-model="props.row.batchNumber"
                        :disable="!props.row.enabled"
                        label="Lote"
                        dense
                        class="col" />
                    </q-td>
                    <q-td key="expireDate" :props="props">
                      <q-input
                        dense
                        :disable="!props.row.enabled"
                        outlined
                        class="col"
                        v-model="props.row.auxExpireDate"
                        ref="expireDate"
                        label="Data de Validade">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="props.row.auxExpireDate" mask="DD-MM-YYYY" :options="blockDataFutura">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    </q-td>
                    <q-td key="unitsReceived" :props="props">
                      <TextInput
                        v-model="props.row.unitsReceived"
                        :disable="!props.row.enabled"
                        label="Quantidade"
                        type="number"
                        dense
                        class="col" />
                    </q-td>
                    <q-td key="options" :props="props">
                      <div class="col" v-if="!props.row.isInUse()">
                        <q-btn v-if="props.row.enabled" :loading="submitting" flat dense round color="primary" icon="done" @click="validateStock(props.row)"/>
                        <q-btn v-if="props.row.enabled" flat dense round color="red" icon="clear" @click="cancel(props.row)"/>
                        <q-btn v-if="!props.row.enabled" flat dense round color="orange-5" icon="edit"  @click="initStockEdition(props.row)" />
                        <q-btn v-if="!props.row.enabled" flat dense round color="red" icon="delete_forever" class="q-ml-sm"  @click="promptStockDeletion(props.row)"/>
                      </div>
                      <div class="col" v-else>
                        <q-chip color="info" text-color="white">
                          Em Uso
                        </q-chip>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
            </q-table>
          </div>
          <div class="row">
                <q-banner
                  dense
                  inline-actions
                  style="padding-top: 2px; padding-bottom: 2px;"
                  class="col text-white q-pa-none bg-orange-4 q-pr-sm">
                    <template v-slot:action class="items-center">
                        <q-btn dense unelevated color="primary" class="col hidden" label="Imprimir" />
                    </template>
                </q-banner>
              </div>
        </div>
      </div>
    </div>
    <q-dialog v-model="alert.visible" persistent>
      <Dialog :type="alert.type" @closeDialog="closeDialog" @commitOperation="doRemoveOrCreateAfterValidate" @cancelOperation="cancelOperation">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{alert.msg}} </template>
      </Dialog>
    </q-dialog>
    </div>
</template>

<script>
import Drug from '../../../store/models/drug/Drug'
import Stock from '../../../store/models/stock/Stock'
import StockEntrance from '../../../store/models/stockentrance/StockEntrance'
import { ref } from 'vue'
import StockCenter from '../../../store/models/stockcenter/StockCenter'
import { date, SessionStorage } from 'quasar'
import Clinic from '../../../store/models/clinic/Clinic'
import moment from 'moment'
import mixinplatform from 'src/mixins/mixin-system-platform'
import AuditSyncronization from 'src/store/models/auditSyncronization/AuditSyncronization'
// import { v4 as uuidv4 } from 'uuid'

const columns = [
  { name: 'order', required: true, label: 'Ordem', field: 'index', align: 'left', sortable: false },
  { name: 'drug', align: 'left', label: 'Medicamento', sortable: true },
  { name: 'manufacture', align: 'left', label: 'Fabricante', sortable: true },
  { name: 'batchNumber', align: 'left', label: 'Lote', sortable: true },
  { name: 'expireDate', align: 'left', label: 'Data de Validade', sortable: false },
  { name: 'unitsReceived', align: 'left', label: 'Quantidade', sortable: true },
  { name: 'options', align: 'center', label: 'Opções', sortable: false }
]
export default {
   mixins: [mixinplatform],
  data () {
    return {
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      submitting: false,
      columns,
      dateReceived: '',
      step: 'display',
      guiaStep: 'display',
      selectedStock: '',
      drugs: ref([]),
      stockList: ref([]),
      stock: ''
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    date: ref(moment(date).format('YYYY/MM/DD')),
        blockDataFutura (date) {
            return date >= moment(new Date()).add(28, 'd').format('YYYY/MM/DD')
        },
    filterFn (val, update, abort) {
      if (val === '') {
          update(() => {
             this.drugs = this.activeDrugs
          })
          return
        }

      update(() => {
        this.drugs = this.activeDrugs.filter((drug) => { return this.stringContains(drug.name, val) })
      })
    },
    stringContains (stringToCheck, stringText) {
        if (stringText === '') return false
        return stringToCheck.toLowerCase().includes(stringText.toLowerCase())
    },
    async init () {
      this.dateReceived = this.getDDMMYYYFromJSDate(this.currStockEntrance.dateReceived)
      if (this.mobile) {
        await Drug.localDbGetAll().then(drugs => {
          drugs.forEach((drug) => {
            Drug.update({ where: drug.id, data: drug })
          })
        })
        this.loadStockList()
      }
    },
    async getClinicAux () {
        await Clinic.apiFetchMainClinic().then((resp) => {
          this.clinicAux = resp.response.data
          })
    },
    cancelOperation () {
      this.guiaStep = 'display'
      this.submitting = false
    },
    doSaveGuia () {
          this.currStockEntrance.dateReceived = this.getJSDateFromDDMMYYY(this.dateReceived) // this.getJSDateFromDDMMYYY()
          console.log(this.currStockEntrance)
          this.currStockEntrance.clinic = this.currClinic
          if (this.website) {
            if (this.guiaStep === 'create') {
             StockEntrance.apiSave(this.currStockEntrance).then(resp => {
            SessionStorage.set('currStockEntrance', resp.response.data)
            this.guiaStep = 'display'
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
            } else if (this.guiaStep === 'edit') {
              StockEntrance.apiUpdate(this.currStockEntrance).then(resp => {
            SessionStorage.set('currStockEntrance', resp.response.data)
            this.guiaStep = 'display'
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
          } else {
            this.currStockEntrance.syncStatus = 'U'
            StockEntrance.localDbUpdate(this.currStockEntrance).then(stockEnt => {
              StockEntrance.update(this.currStockEntrance)
              this.guiaStep = 'display'
              this.displayAlert('info', 'Operação efectuada com sucesso.')
               })
          }
    },
    initGuiaEdition () {
      if (this.currStockEntrance.stocks.length > 0 || this.stockList.length > 0) {
        this.displayAlert('error', 'Não pode editar os dados da guia, pois ja existem registos de lotes associados.')
      } else {
        this.guiaStep = 'edit'
      }
    },
    removeGuia () {
      if (this.currStockEntrance.stocks.length > 0 || this.stockList.length > 0) {
        this.displayAlert('error', 'Não pode remover esta guia, pois ja existem registos de lotes associados.')
      } else {
        this.guiaStep = 'delete'
        this.displayAlert('confirmation', 'Deseja remover a presente guia de entrada de stock?')
      }
    },
    doRemoveGuia () {
      if (this.website) {
      StockEntrance.apiRemove(this.currStockEntrance.id).then(resp => {
        StockEntrance.delete(this.currStockEntrance.id)
        this.goBack()
        this.displayAlert('info', 'Operação efectuada com sucesso.')
      })
      } else {
        const targetEntrance = JSON.parse(JSON.stringify(this.currStockEntrance))
         StockEntrance.localDbGetById(targetEntrance.id).then(item => {
          if (item.syncStatus !== 'R' && item.syncStatus !== 'U') {
                        const auditSync = new AuditSyncronization()
                          auditSync.operationType = 'remove'
                          auditSync.className = StockEntrance.getClassName()
                          auditSync.syncStatus = 'D'
                          auditSync.entity = item
                          AuditSyncronization.localDbAdd(auditSync)
                    }
                    StockEntrance.localDbDelete(item).then(stock => {
                      StockEntrance.delete(item.id)
                      })
                     this.$router.go(-1)
                  })
      }
    },
    formatDate (dateString) {
      return date.formatDate(dateString, 'YYYY-MM-DD')
    },
    getJSDateFromDDMMYYY (dateString) {
      const dateParts = dateString.split('-')
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    },
    getDDMMYYYFromJSDate (jsDate) {
      return moment(jsDate).format('DD-MM-YYYY')
    },
    doRemoveOrCreateAfterValidate () {
        if (this.isCreationStep || this.isEditionStep) {
        this.doSave(this.stock)
      } else {
        this.doRemove()
      }
    },
     doRemove () {
    //  if (this.isCreationStep) {
     //   this.doSave(this.stock)
    //  } else
     if (!this.isGuiaDeletionStep) {
        this.doRemoveStock()
      } else {
        this.doRemoveGuia()
      }
    },
    doRemoveStock () {
      this.step = 'delete'
      if (this.website) {
          Stock.apiRemove(this.selectedStock.id).then(resp => {
          Stock.delete(this.selectedStock.id)
          this.removeFromList(this.selectedStock)
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
         const targetStock = JSON.parse(JSON.stringify(this.selectedStock))
          this.removeFromList(targetStock)
         Stock.localDbGetById(targetStock.id).then(item => {
          if (item.syncStatus !== 'R' && item.syncStatus !== 'U') {
                        const auditSync = new AuditSyncronization()
                          auditSync.operationType = 'remove'
                          auditSync.className = Stock.getClassName()
                          auditSync.syncStatus = 'D'
                          auditSync.entity = item
                          AuditSyncronization.localDbAdd(auditSync)
                    }
                    Stock.localDbDelete(item).then(stock => {
                      Stock.delete(item.id)
                      })
                     this.step = 'display'
                  })
          }
    },
    initNewStock () {
      if (this.isEditionStep || this.isCreationStep) {
        this.displayAlert('error', 'Por favor concluir ou cancelar a operação em curso antes de iniciar a adição de novo registo.')
      } else {
        this.step = 'create'
        const newStock = new Stock({
          drug: new Drug(),
          center: this.stockCenter,
          enabled: true,
          clinic: this.currClinic,
          entrance: this.currStockEntrance
        })
        this.stockList.push(newStock)
      }
    },
     isPositiveInteger (str) {
        const num = Number(str)
        if (Number.isInteger(num) && num > 0) {
          return true
        }
        if (typeof str !== 'string') {
          return false
        }
        return false
      },
    validateStock (stock) {
      this.submitting = true
      stock.expireDate = this.getJSDateFromDDMMYYY(stock.auxExpireDate)
      if (stock.drug.name === '') {
        this.submitting = false
        this.displayAlert('error', 'Por favor indicar o medicamento!')
      } else if (stock.manufacture === '') {
        this.submitting = false
        this.displayAlert('error', 'Por favor indicar o fabricante!')
      } else if (stock.batchNumber === '') {
        this.submitting = false
        this.displayAlert('error', 'Por favor indicar o lote!')
      } else if (!date.isValid(stock.expireDate)) {
        this.submitting = false
        this.displayAlert('error', 'Por favor indicar uma data de validade válida!')
      } else if (stock.expireDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
        this.submitting = false
        this.displayAlert('error', 'A data de validade não pode ser anterior a data corrente!')
      } else if (!this.isPositiveInteger(stock.unitsReceived)) {
        this.submitting = false
        this.displayAlert('error', 'Por favor indicar uma quantidade válida!')
      } else if (!(stock.expireDate instanceof Date)) {
        this.displayAlert('error', 'A data de validade é inválida!')
      } else if (stock.expireDate <= moment(new Date()).add(28, 'd')) {
        this.submitting = false
        this.displayAlert('error', 'O medicamento não deve expirar em menos de 28 dias, Por favor indique uma data de validade válida!')
      } else {
        this.stock = stock
        if (stock.expireDate <= moment(new Date()).add(91, 'd')) {
        //  this.
       // const expireDate = moment(stock.expireDate)
      // const todayDate = moment(new Date())
      // const months = expireDate.diff(todayDate, 'months')
            this.displayAlert('confirmation', ' O stock especificado irá expirar em menos de 3 meses. Deseja continuar')
       } else {
        this.doSave(stock)
      }
      }
    },
    async doSave (stock) {
      stock.stockMoviment = stock.unitsReceived
      if (this.website) {
        if (this.isCreationStep) {
              await Stock.apiSave(stock).then(resp => {
                stock.id = resp.response.data.id
                this.submitting = false
                stock.enabled = false
                this.step = 'display'
                this.displayAlert('info', 'Operação efectuada com sucesso.')
              }).catch(error => {
                  this.submitting = false
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
      } else if (this.isEditionStep) {
            await Stock.apiUpdate(stock).then(resp => {
            stock.id = resp.response.data.id
            this.submitting = false
            stock.enabled = false
            this.step = 'display'
            this.displayAlert('info', 'Operação efectuada com sucesso.')
          }).catch(error => {
              this.submitting = false
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
      } else {
                   //  const targetCopy = new Stock(JSON.parse(JSON.stringify(stock)))
                   stock.entrance_id = this.currStockEntrance.id // stock.entrance.id
                   stock.drug_id = stock.drug.id
                   stock.clinic = SessionStorage.getItem('currClinic')
                   stock.clinic_id = SessionStorage.getItem('currClinic').id
                   stock.enabled = false
                   stock.center = StockCenter.query().where('prefered', true).first()
                   stock.stock_center_id = stock.center.id
                   stock.entrance.clinic_id = SessionStorage.getItem('currClinic').id
                   stock.center.clinic = SessionStorage.getItem('currClinic')
                  // const uuid = uuidv4
                   const targetCopy = JSON.parse(JSON.stringify(stock))
                   Stock.localDbAddOrUpdate(targetCopy, this.step).then(stock1 => {
                     Stock.insert(
                  {
                    data: stock1.data.data
                  })
                      if (this.step === 'edit') {
                        Stock.localDbGetAll().then((stocks) => {
                        const toUpdates = stocks.filter((stock) => stock.entrance.id === this.currStockEntrance.id)
                        StockEntrance.localDbGetByStockEntranceId(this.currStockEntrance.id).then(entrance => {
                          entrance.stocks = []
                         entrance.syncStatus = (entrance.syncStatus === '' || entrance.syncStatus === 'S') && stock.syncStatus === 'U' ? 'U' : 'R'
                         entrance.stocks = toUpdates
                           StockEntrance.localDbUpdate(entrance).then(stockEntr => {
                            StockEntrance.insert(
                              {
                              data: stockEntr.data
                               }
                              )
                           })
                        })
                      })
                      } else {
                        this.currStockEntrance.syncStatus = (this.currStockEntrance.syncStatus !== 'R' && this.currStockEntrance.syncStatus !== 'U') ? 'U' : 'R'
                        this.currStockEntrance.stocks.push(targetCopy)
                         StockEntrance.localDbUpdate(this.currStockEntrance)
                      }
                    this.submitting = false
                    this.step = 'display'
                    this.displayAlert('info', 'Operação efectuada com sucesso.')
                  }).catch(error => {
                this.displayAlert('error', error)
              })
      }
    },
    async fetchStockEntrance () {
      await StockEntrance.apiFetchById(this.currStockEntrance.id).then(resp => {
        this.currStockEntrance = resp.response.data
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
    cancel (stock) {
      if (this.isEditionStep) {
        stock.drug = this.selectedStock.drug
        stock.expireDate = this.selectedStock.expireDate
        stock.batchNumber = this.selectedStock.batchNumber
        stock.unitsReceived = this.selectedStock.unitsReceived
        stock.enabled = false
      } else if (this.isCreationStep) {
        this.removeFromList(stock)
      }
      this.step = 'display'
    },
    removeFromList (stock) {
      const i = this.stockList.map(toRemove => toRemove.id).indexOf(stock.id) // find index of your object
      this.stockList.splice(i, 1)
    },
    initStockEdition (stock) {
      this.selectedStock = Object.assign({}, stock)
      if (this.isEditionStep || this.isCreationStep) {
        this.displayAlert('error', 'Por favor concluir ou cancelar a operação em curso antes de iniciar a edição deste registo.')
      } else {
        stock.enabled = true
        this.step = 'edit'
      }
    },
    promptStockDeletion (stock) {
      if (this.isEditionStep || this.isCreationStep) {
        this.displayAlert('error', 'Por favor concluir ou cancelar a operação em curso antes de iniciar a remoção deste registo.')
      } else {
        this.selectedStock = stock
        this.displayAlert('confirmation', 'Confirma a remoção do lote [' + stock.batchNumber + ']?')
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
    getCurrStockEntrance () {
      const e = new StockEntrance(SessionStorage.getItem('currStockEntrance'))
      if (this.mobile) return e
      return StockEntrance.query()
                          .with('stocks')
                          .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                          .where('id', e.id)
                          .first()
                        },
    loadStockList () {
      this.stockList = ref([])
      if (this.currStockEntrance.stocks.length > 0) {
        Object.keys(this.currStockEntrance.stocks).forEach(function (k) {
          const stock = Stock.query()
                                   .with('clinic.province')
                                   .with('entrance.clinic.province')
                                   .with('center.clinic.province')
                                   .with('center.clinic.facilityType')
                                   .with('center.clinic.district.province')
                                   .with('clinic.facilityType')
                                   .with('clinic.district.province')
                                   .with('packagedDrugs')
                                   .with('packagedDrugStocks')
                                   .with('adjustments')
                                   .with('drug.form')
                                   .where('id', this.currStockEntrance.stocks[k].id)
                                   .first()
          stock.auxExpireDate = this.getDDMMYYYFromJSDate(stock.expireDate)
          this.stockList.push(stock)
        }.bind(this))
      }
        console.log('Finished loading stock')
    }
  },
  created () {
      this.drugs = this.activeDrugs
  },
  mounted () {
    this.init()
    this.loadStockList()
    this.getClinicAux()
  },
  computed: {
    currStockEntrance () {
      return this.getCurrStockEntrance()
    },
    activeDrugs () {
      return Drug.query().with('form').where('active', true).get()
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
    isGuiaDeletionStep () {
      return this.guiaStep === 'delete'
    },
    isGuiaEditionStep () {
      return this.guiaStep === 'edit'
    },
    isGuiaDisplayStep () {
      return this.guiaStep === 'display'
    },
    stockCenter () {
      return StockCenter.query()
                        .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                        .first()
    },
    currClinic () {
      return this.clinicAux
        /* return Clinic.query()
                    .with('province')
                    .with('facilityType')
                    .with('district.province')
                    .where('id', SessionStorage.getItem('currClinic').id)
                    .first() */
      }
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    TitleBar: require('components/Shared/TitleBar.vue').default,
    ListHeader: require('components/Shared/ListHeader.vue').default,
    TextInput: require('components/Shared/Input/TextField.vue').default
  }
}
</script>

<style lang="scss">
  .box-border {
    border: 1px solid $grey-4
  }
</style>
