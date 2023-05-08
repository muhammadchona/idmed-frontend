<template>
  <div>
   <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Serviço Clínico
      </div>
      <div class="">
      <q-table
        :rows="clinicalServices"
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
          <q-td key="code" :props="props">
              {{ props.row.code }}
          </q-td>
          <q-td key="description" :props="props">
              {{ props.row.description }}
          </q-td>
            <q-td key="active" :props="props">
              {{ props.row.active ? 'Sim':'Nao' }}
          </q-td>
                <q-td key="options" :props="props">
                <div class="col">
                  <q-btn flat round
                  color="amber-8"
                  icon="edit"
                 v-if="props.row.active === true"
                 @click="editClinicService(props.row)">
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn flat round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeClinicalService(props.row)">
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
       <div class="absolute-bottomg">
            <q-page-sticky position="bottom-right" :offset="[18, 18]">
              <q-btn size="xl" fab icon="add" @click="addClinicService" color="primary" />
           </q-page-sticky>
      </div>
        <q-dialog persistent v-model="showClinicServiceRegistrationScreen" >
        <addClinicalService
        :selectedClinicalService="clinicalService"
        :stepp="step"
        :editMode=editMode
         :onlyView="viewMode"
          @close="showClinicServiceRegistrationScreen = false" />
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
import ClinicalService from '../../../store/models/ClinicalService/ClinicalService'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'

const columns = [
{ name: 'code', required: true, label: 'Código', align: 'left', field: row => row.code, format: val => `${val}`, sortable: true },
{ name: 'description', required: true, label: 'Nome', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true },
 { name: 'active', required: true, label: 'Activo', align: 'left', field: row => row.active, format: val => `${val}`, sortable: true },
{ name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  mixins: [mixinplatform, mixinutils],
data () {
  const $q = useQuasar()

  return {
      columns,
      $q,
      showClinicServiceRegistrationScreen: false,
      editMode: false,
      viewMode: false,
      step: '',
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
           filter: ref('')
  }
},
computed: {
    clinicalServices () {
        return ClinicalService.query().with('attributes.clinicalServiceAttributeType')
        .with('identifierType')
        .with('therapeuticRegimens')
        .with('clinicSectors.clinic')
        .with('clinicSectors.clinicSectorType')
        .has('code').get()
    },
    therapeuticRegimens () {
        return TherapeuticRegimen.query().with('drugs.form').where('active', true).get()
    }
},
methods: {
async  getClinicServices () {
        await ClinicalService.api().get('/clinicalService')
     },
     getIconActive (clinicalService) {
         if (clinicalService.active) {
            return 'stop_circle'
            } else if (!clinicalService.active) {
            return 'play_circle'
            }
     },
     getColorActive (clinicalService) {
         if (clinicalService.active) {
            return 'red'
            } else if (!clinicalService.active) {
            return 'green'
            }
     },
      getTooltipClass (clinicalService) {
         if (clinicalService.active) {
            return 'bg-red-5'
            } else if (!clinicalService.active) {
            return 'bg-green-5'
            }
     },
     editClinicService (clinicalService) {
      this.clinicalService = Object.assign({}, clinicalService)
      this.step = 'edit'
       this.showClinicServiceRegistrationScreen = true
       this.editMode = true
        this.viewMode = false
    },
      addClinicService () {
        this.clinicalService = new ClinicalService()
        this.step = 'create'
       this.showClinicServiceRegistrationScreen = true
         this.editMode = false
         this.viewMode = false
    },
      visualizeClinicalService (clinicalService) {
         this.clinicalService = Object.assign({}, clinicalService)
       this.viewMode = true
          this.showClinicServiceRegistrationScreen = true
           this.editMode = false
    },
      promptToConfirm (clinicalService) {
          this.$q.dialog({ title: 'Confirmação', message: clinicalService.active ? 'Deseja Inactivar o Serviço Clínico?' : 'Deseja Activar o Serviço Clínico?', cancel: true, persistent: true }).onOk(() => {
            let operation = ''
            if (clinicalService.active) {
              clinicalService.active = false
                operation = 'inactivado'
            } else if (!clinicalService.active) {
                clinicalService.active = true
                operation = 'activado'
            }
            console.log(clinicalService)
            if (this.mobile) {
              console.log('FrontEnd')
              if (clinicalService.syncStatus !== 'R') clinicalService.syncStatus = 'U'
              ClinicalService.localDbAdd(JSON.parse(JSON.stringify(clinicalService)))
              ClinicalService.insertOrUpdate({ data: clinicalService })
              this.displayAlert('info', `Servico Clínico ${operation} com sucesso`)
            } else {
              console.log('BackEnd')
              clinicalService.therapeuticRegimens = []
              ClinicalService.apiUpdate(clinicalService).then(resp => {
                this.displayAlert('info', `Servico Clínico ${operation} com sucesso`)
              }).catch(error => {
                this.displayAlert('error', error)
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
  this.getClinicServices().then(item => {
    this.hideLoading()
  })
},
components: {
   addClinicalService: require('components/Settings/ClinicalService/AddClinicalService.vue').default,
    Dialog: require('components/Shared/Dialog/Dialog.vue').default
}
}
</script>
