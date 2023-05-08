<template>
    <div>
     <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
       Utilizadores
        </div>
        <div class="">
          <q-table
            :rows="users"
            :columns="columns"
            :filter="filter"
          >
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
            <q-td key="fullName" :props="props">
                {{ props.row.fullName }}
            </q-td>
             <q-td key="username" :props="props">
                  {{ props.row.username }}
            </q-td>
              <q-td key="active" :props="props">
                {{ !props.row.accountLocked ? 'Sim':'Nao' }}
            </q-td>
                  <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn flat round
                    color="amber-8"
                    icon="edit"
                   @click="editUser(props.row)"
                   v-if="props.row.accountLocked === false">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                  <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="visualizeClinic(props.row)">
                    <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                  </q-btn>
                 <q-btn flat round
                      class="q-ml-md"
                      :color="getColorActive(props.row)"
                      :icon="getIconActive(props.row)"
                      @click.stop="promptToConfirm(props.row)"
                     >
                     <q-tooltip :class="getTooltipClass(props.row)">{{!props.row.accountLocked ? 'Inactivar': 'Activar'}}</q-tooltip>
                     </q-btn>
                  </div>
                  </q-td>
            </q-tr>
        </template>
    </q-table>
        </div>
         <div class="absolute-bottomg">
              <q-page-sticky position="bottom-right" :offset="[18, 18]">
                <q-btn size="xl" fab icon="add" @click="addUser" no-cap color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showClinicRegistrationScreen">
          <addUser
            :selectedUser="user"
             :editMode=editMode
           :onlyView="viewMode"
            @close="showClinicRegistrationScreen = false" />
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
import UserLogin from '../../../store/models/userLogin/User'
import Role from '../../../store/models/userLogin/Role'
import SystemConfigs from 'src/store/models/systemConfigs/SystemConfigs'
import Clinic from '../../../store/models/clinic/Clinic'
import { ref } from 'vue'
import mixinSystemPlatform from 'src/mixins/mixin-system-platform'
import ClinicSectorType from '../../../store/models/clinicSectorType/ClinicSectorType'
import mixinEncryption from 'src/mixins/mixin-encryption'
import mixinutils from 'src/mixins/mixin-utils'
const columns = [
  { name: 'fullName', required: true, label: 'Nome Completo', align: 'left', field: row => row.fullName, format: val => `${val}`, sortable: true },
  { name: 'username', required: true, label: 'Nome do Utilizador', align: 'left', field: row => row.username, format: val => `${val}`, sortable: true },
  { name: 'active', required: true, label: 'Activo', align: 'left', field: row => row.active, format: val => `${val}`, sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  mixins: [mixinSystemPlatform, mixinEncryption, mixinutils],
  data () {
    const $q = useQuasar()

    return {
        columns,
        $q,
         showClinicRegistrationScreen: false,
         editMode: false,
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
      users () {
            return UserLogin.query().with('clinic.province')
                        .with('clinic.district.province')
                        .with('clinic.facilityType')
                        .with('clinicSectors.clinic.province')
                        .with('clinicSectors.clinic.district.province')
                        .with('clinicSectors.clinic.facilityType')
                        .with('clinicSectors.clinicSectorType')
                        .get()
        },
         configs () {
       return SystemConfigs.query().where('key', 'INSTALATION_TYPE').first()
      }
  },
  methods: {
     async getAllClinicsByProvinceCode (provinceCode) {
           await Clinic.api().get('/clinic/province/' + provinceCode).then(resp => {
            this.hideLoading()
            }).catch(error => {
                console.log(error)
            })
      },
        getIconActive (user) {
           if (user.accountLocked) {
              return 'play_circle'
              } else if (!user.accountLocked) {
              return 'stop_circle'
              }
       },
       getColorActive (user) {
           if (user.accountLocked) {
              return 'green'
              } else if (!user.accountLocked) {
              return 'red'
              }
       },
        getTooltipClass (user) {
           if (!user.accountLocked) {
              return 'bg-green-5'
              } else if (user.accountLocked) {
              return 'bg-red-5'
              }
       },
       editUser (user) {
        this.user = Object.assign({}, user)
         this.showClinicRegistrationScreen = true
         this.editMode = true
          this.viewMode = false
      },
        addUser () {
          this.user = new UserLogin()
         this.showClinicRegistrationScreen = true
           this.editMode = false
           this.viewMode = false
      },
        visualizeClinic (user) {
           this.user = Object.assign({}, user)
         this.viewMode = true
            this.showClinicRegistrationScreen = true
             this.editMode = false
      },
        promptToConfirm (user) {
         let msg = ''
            this.$q.dialog({ title: 'Confirmação', message: !user.accountLocked ? 'Deseja Inactivar o Utilizador?' : 'Deseja Activar o Utilizador?', cancel: true, persistent: true }).onOk(() => {
               if (!user.accountLocked) {
                user.accountLocked = true
                msg = 'Utilizador inactivado com sucesso.'
              } else if (user.accountLocked) {
                  user.accountLocked = false
                msg = 'Utilizador activado com sucesso.'
              }
              if (this.website) {
             UserLogin.apiSave(user).then(resp => {
                  this.displayAlert('info', msg)
            }).catch(error => {
                   this.displayAlert('error', error)
            })
          } else {
            let userLocalBase = JSON.parse(JSON.stringify(user))
              userLocalBase = this.encrypt(userLocalBase)
              UserLogin.localDbAddOrUpdate(userLocalBase).then(resp => {
                this.submitting = false
                UserLogin.insert({
                    data: userLocalBase
                })
                this.displayAlert('info', msg)
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
        getRolesToVuex () {
       Role.localDbGetAll().then(roles => {
        Role.insert({ data: roles })
       })
      },
      getSecUserToVuex () {
        UserLogin.localDbGetAll().then(users => {
          UserLogin.insert({ data: users })
       })
      },
      getSystemConfigsToVue () {
        SystemConfigs.localDbGetAll().then(systemConfigs => {
          SystemConfigs.insert({ data: systemConfigs })
      })
    },
    getClinicSectorTypeToVue () {
        ClinicSectorType.localDbGetAll().then(clinicSectorTypes => {
          console.log(clinicSectorTypes)
          ClinicSectorType.insert({ data: clinicSectorTypes })
      })
    }
  },
  mounted () {
    this.showloading()
    if (this.website) {
    UserLogin.apiGetAll(0, 100)
    Role.apiGetAll().then(item => {
      this.hideLoading()
    })
    if (this.configs.value === 'PROVINCIAL') {
     this.getAllClinicsByProvinceCode(this.configs.description)
    }
  } else {
    this.getRolesToVuex()
    this.getSecUserToVuex()
    this.getSystemConfigsToVue()
    this.getClinicSectorTypeToVue()
  }
 // this.hideLoading()
  },
  components: {
     addUser: require('components/Settings/User/AddUser.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
    // clinicsTable: require('components/Settings/Clinic/ClinicsTable.vue').default
  }
}
</script>
