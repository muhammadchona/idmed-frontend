<template>
    <div>
        <div class="">
                 <!-- <nationalClinicsTable  :rows="getNationalClinicos" :columns="columns"  :showNationalClinicRegistrationScreen="showNationalClinicRegistrationScreen" /> -->
        <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
       Clínicos
        </div>
        <q-table
     :rows="doctors"
      :columns="columns"
      :filter="filter"
      virtual-scroll>
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
            <q-td key="firstnames" :props="props">
                {{ props.row.firstnames }}
            </q-td>
            <q-td key="lastname" :props="props">
                {{ props.row.lastname }}
            </q-td>
             <q-td key="telephone" :props="props">
                {{ props.row.telephone }}
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
                   @click="editDoctor(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                  <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="visualizeDoctor(props.row)">
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
                <q-btn size="xl" fab icon="add" @click="addDoctor" color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showDoctorRegistrationScreen">
          <addDoctor
          :selectedDoctor="doctor"
          :stepp="step"
          :editMode=editMode
           :onlyView="viewMode"
            @close="showDoctorRegistrationScreen = false" />
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
import Doctor from '../../../store/models/doctor/Doctor'
import { ref } from 'vue'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'

const columns = [
  { name: 'firstnames', required: true, label: 'Nome', align: 'left', field: row => row.firstnames, format: val => `${val}`, sortable: true },
  { name: 'lastname', required: true, label: 'Apelido', align: 'left', field: row => row.lastname, format: val => `${val}`, sortable: true },
   { name: 'telephone', required: true, label: 'Telefone', align: 'left', field: row => row.telephone, format: val => `${val}`, sortable: true },
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
        step: '',
        editMode: false,
        viewMode: false,
        showDoctorRegistrationScreen: false,
        alert: ref({
          type: '',
          visible: false,
          msg: ''
        }),
        filter: ref('')
    }
  },
 computed: {
      doctors () {
          return Doctor.query().with(['clinic.province', 'clinic.district.province', 'clinic.facilityType']).orderBy('firstnames').get()
      }
  },
  methods: {
        getIconActive (doctor) {
           if (doctor.active) {
              return 'stop_circle'
              } else if (!doctor.active) {
              return 'play_circle'
              }
       },
       getColorActive (doctor) {
           if (doctor.active) {
              return 'red'
              } else if (!doctor.active) {
              return 'green'
              }
       },
       getTooltipClass (doctor) {
           if (doctor.active) {
              return 'bg-red-5'
              } else if (!doctor.active) {
              return 'bg-green-5'
              }
       },
       editDoctor (doctor) {
        this.doctor = Object.assign({}, doctor)
        this.step = 'edit'
         this.showDoctorRegistrationScreen = true
         this.editMode = true
          this.viewMode = false
      },
        addDoctor () {
          this.doctor = new Doctor()
          this.step = 'create'
         this.showDoctorRegistrationScreen = true
           this.editMode = false
           this.viewMode = false
      },
       visualizeDoctor (doctor) {
         this.doctor = Object.assign({}, doctor)
         this.viewMode = true
            this.showDoctorRegistrationScreen = true
             this.editMode = false
      },
      promptToConfirm (doctor) {
        let msg = ''
            this.$q.dialog({ title: 'Confirmação', message: doctor.active ? 'Deseja Inactivar o Clínico?' : 'Deseja Activar o Clínico?', cancel: true, persistent: true }).onOk(() => {
              if (doctor.active) {
                doctor.active = false
                  msg = 'Clínico inactivado com sucesso.'
              } else if (!doctor.active) {
                  doctor.active = true
                     msg = 'Clínico activado com sucesso.'
              }
              if (this.mobile) {
                console.log('FrontEnd')
                if (doctor.syncStatus !== 'R') doctor.syncStatus = 'U'
                Doctor.localDbAdd(JSON.parse(JSON.stringify(doctor)))
                Doctor.insertOrUpdate({ data: doctor })
                this.displayAlert('info', msg)
              } else {
                console.log('BackEnd')
                Doctor.apiUpdate(doctor).then(resp => {
                      this.displayAlert('info', msg)
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
        },
       async getDoctors () {
          await Doctor.apiGetAll()
        }
  },
  mounted () {
    this.showloading()
    this.getDoctors().then(item => {
      this.hideLoading()
    })
  },
  components: {
     addDoctor: require('components/Settings/Doctor/AddDoctor.vue').default,
     Dialog: require('components/Shared/Dialog/Dialog.vue').default
  }
}
</script>
