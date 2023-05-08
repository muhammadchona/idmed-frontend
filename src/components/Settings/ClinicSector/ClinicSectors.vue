<template>
    <div>
     <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
        Sector Clínico
        </div>
        <div class="">
        <q-table
          :rows="clinicSectors"
          :columns="columns"
          :filter="filter">
        <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
                </q-input>
        </template>
          <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                <span>
                  Sem resultados para visualizar
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
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
                   @click="editClinicSector(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                  <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="visualizeClinicSector(props.row)">
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
                <q-btn size="xl" fab icon="add" @click="addClinicSector" color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showClinicSectorRegistrationScreen">
          <addClinicSector
            :selectedClinicSector="clinicSector"
            :editMode=editMode
            :stepp="step"
            :onlyView="viewMode"
            @close="showClinicSectorRegistrationScreen = false" />
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
import ClinicSector from '../../../store/models/clinicSector/ClinicSector'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'

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
         showClinicSectorRegistrationScreen: false,
         editMode: false,
         step: '',
         viewMode: false,
           alert: ref({
              type: '',
              visible: false,
              msg: ''
            }),
            filter: ref('')
    }
  },
 computed: {
      clinicSectors () {
          const clinics = ClinicSector.query().withAll().has('code').get()
          this.hideLoading()
          return clinics
      }
  },
  methods: {
    getIconActive (clinicSector) {
           if (clinicSector.active) {
              return 'stop_circle'
              } else if (!clinicSector.active) {
              return 'play_circle'
              }
       },
       getColorActive (clinicSector) {
           if (clinicSector.active) {
              return 'red'
              } else if (!clinicSector.active) {
              return 'green'
              }
       },
        getTooltipClass (clinicSector) {
           if (clinicSector.active) {
              return 'bg-red-5'
              } else if (!clinicSector.active) {
              return 'bg-green-5'
              }
       },
       editClinicSector (clinicSector) {
        this.clinicSector = Object.assign({}, clinicSector)
        this.step = 'edit'
        this.showClinicSectorRegistrationScreen = true
        this.editMode = true
        this.viewMode = false
      },
      addClinicSector () {
        this.clinicSector = new ClinicSector()
        this.step = 'create'
        this.showClinicSectorRegistrationScreen = true
        this.editMode = false
        this.viewMode = false
      },
        visualizeClinicSector (clinicSector) {
           this.clinicSector = Object.assign({}, clinicSector)
         this.viewMode = true
            this.showClinicSectorRegistrationScreen = true
             this.editMode = false
      },
        promptToConfirm (clinicSector) {
            this.$q.dialog({ title: 'Confirmação', message: clinicSector.active ? 'Deseja Inactivar o Sector Clinico?' : 'Deseja Activar o Sector Clinico?', cancel: true, persistent: true }).onOk(() => {
               if (clinicSector.active) {
                clinicSector.active = false
              } else if (!clinicSector.active) {
                  clinicSector.active = true
              }
              console.log(clinicSector)
              if (this.mobile) {
                console.log('FrontEnd')
                if (clinicSector.syncStatus !== 'R') clinicSector.syncStatus = 'U'
                ClinicSector.localDbAdd(JSON.parse(JSON.stringify(clinicSector)))
                ClinicSector.insertOrUpdate({ data: clinicSector })
                this.displayAlert('info', 'Sector Clinico actualizado com sucesso')
              } else {
                console.log('BackEnd')
                ClinicSector.apiUpdate(clinicSector).then(resp => {
                  const operation = clinicSector.active ? 'activado' : 'inactivado'
                  this.displayAlert('info', `Sector Clinico ${operation} com sucesso`)
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
  },
  components: {
     addClinicSector: require('components/Settings/ClinicSector/AddClinicSector.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
  }
}
</script>
