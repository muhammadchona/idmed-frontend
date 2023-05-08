<template>
    <div>
     <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
       Medicamentos
        </div>
        <div class="">
                 <!-- <nationalClinicsTable  :rows="getNationalClinicos" :columns="columns"  :showNationalClinicRegistrationScreen="showNationalClinicRegistrationScreen" /> -->
        <q-table
          :rows="drugs"
          :columns="columns"
          :filter="filter">
        <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
                </q-input>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props">
            <q-td key="name" :props="props">
                {{ props.row.name }}
            </q-td>
            <q-td key="packSize" :props="props">
                {{ props.row.packSize }}
            </q-td>
             <q-td key="defaultTimes" :props="props">
                {{ props.row.defaultTimes }}
            </q-td>
            <q-td key="defaultTreatment" :props="props">
                {{ props.row.defaultTreatment }}
            </q-td>
               <q-td key="defaultPeriodTreatment" :props="props">
                {{ props.row.defaultPeriodTreatment }}
            </q-td>
                  <q-td key="options" :props="props">
                  <div class="col">
                    <!-- <q-btn flat round
                    color="amber-8"
                    icon="edit"
                    v-if="props.row.active === true"
                   @click="editDrug(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn> -->

                  <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="visualizeDrug(props.row)">
                    <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                      </q-btn>
                     <q-btn flat round
                      class="q-ml-md"
                      :color="getColorActive(props.row)"
                      :icon="getIconActive(props.row)"
                      @click.stop="promptToConfirm(props.row)"
                     >
                    <q-tooltip :class="getTooltipClass(props.row)">{{props.row.active ? 'Inactivar': 'Activar'}}</q-tooltip>
                     </q-btn>
                  </div>
                  </q-td>
            </q-tr>
        </template>
    </q-table>
        </div>
         <div v-if="false" class="absolute-bottomg">
              <q-page-sticky position="bottom-right" :offset="[18, 18]">
                <q-btn size="xl" fab icon="add" @click="addDrug" color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showDrugRegistrationScreen">
          <addDrug
          :selectedDrug="drug"
          :onlyView="viewMode"
            @close="showDrugRegistrationScreen = false" />
      </q-dialog>
      <q-dialog v-model="alert.visible">
        <Dialog :type="alert.type" @closeDialog="closeDialog">
          <template v-slot:title> Informação</template>
          <template v-slot:msg> {{alert.msg}} </template>
      </Dialog>
      </q-dialog>
    </div>
</template>
<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import Drug from '../../../store/models/drug/Drug'
import Form from '../../../store/models/form/Form'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'left', field: row => row.name, format: val => `${val}`, sortable: true },
  { name: 'packSize', required: true, label: 'Tamanho do Pacote', align: 'left', field: row => row.packSize, format: val => `${val}`, sortable: true },
   { name: 'defaultTimes', required: true, label: 'Numero de toma', align: 'left', field: row => row.defaultTimes, format: val => `${val}`, sortable: true },
  { name: 'defaultTreatment', required: true, label: 'Numero de Vezes a Tomar', align: 'left', field: row => row.defaultTreatment, format: val => `${val}`, sortable: true },
   { name: 'defaultPeriodTreatment', required: true, label: 'Periodo a Tomar', align: 'left', field: row => row => row.defaultPeriodTreatment, format: val => `${val}`, sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  mixins: [mixinplatform, mixinutils],
  data () {
    const $q = useQuasar()

    return {
        columns,
        $q,
        step: '',
         showDrugRegistrationScreen: false,
         viewMode: false,
         filter: ref(''),
         alert: ref({
          type: '',
          visible: false,
          msg: ''
        })
    }
  },
 computed: {
      drugs () {
             const drugs = Drug.query().with('form').with('clinicalService.identifierType').orderBy('name').get()
             this.hideLoading()
             return drugs
      },
       forms () {
            return Form.all()
        }
  },
  methods: {
       getIconActive (drug) {
           if (drug.active) {
              return 'stop_circle'
              } else if (!drug.active) {
              return 'play_circle'
              }
       },
       getColorActive (drug) {
           if (drug.active) {
              return 'red'
              } else if (!drug.active) {
              return 'green'
              }
       },
         getTooltipClass (drug) {
           if (drug.active) {
              return 'bg-red-5'
              } else if (!drug.active) {
              return 'bg-green-5'
              }
       },
       editDrug (drug) {
         this.viewMode = false
        this.drug = Object.assign({}, drug)
         this.showDrugRegistrationScreen = true
      },
        addDrug () {
          this.viewMode = false
          this.drug = new Drug()
         this.showDrugRegistrationScreen = true
      },
       visualizeDrug (drug) {
          this.drug = Object.assign({}, drug)
         this.viewMode = true
           this.showDrugRegistrationScreen = true
      },
         promptToConfirm (drug) {
           let msg = ''
            this.$q.dialog({ title: 'Confirmação', message: drug.active ? 'Deseja Inactivar o medicamento?' : 'Deseja Activar o medicamento?', cancel: true, persistent: true }).onOk(() => {
              if (drug.active) {
                drug.active = false
                  msg = 'Medicamento inactivado com sucesso.'
              } else if (!drug.active) {
                  drug.active = true
                  msg = 'Medicamento activado com sucesso.'
              }
              if (this.mobile) {
                console.log('FrontEnd')
                if (drug.syncStatus !== 'R') drug.syncStatus = 'U'
                Drug.localDbAdd(JSON.parse(JSON.stringify(drug)))
                Drug.insertOrUpdate({ data: drug })
                this.displayAlert('info', msg)
              } else {
                console.log('BackEnd')
                Drug.apiUpdate(drug).then(resp => {
                    this.$emit('drug', resp.response.data)
                    this.displayAlert('info', msg)
                }).catch(error => {
                  this.displayAlert('error', error)
                  console.log(drug.id)
                  console.log(error)
                })
              }
        })
      },
       displayAlert (type, msg) {
          this.alert.type = type
          this.alert.msg = msg
          this.alert.visible = true
        },
        closeDialog () {
          if (this.alert.type === 'info') {
            this.$emit('close')
          }
        }
  },
  mounted () {
    this.showloading()
   // this.getDrugs()
  },
  components: {
    addDrug: require('components/Settings/Drug/AddDrug.vue').default,
    Dialog: require('components/Shared/Dialog/Dialog.vue').default
  //   nationalClinicsTable: require('components/Settings/NationalClinic/NationalClinicsTable.vue').default
  }
}
</script>
