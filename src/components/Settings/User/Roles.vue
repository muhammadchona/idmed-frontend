<template>
    <div>
     <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
       Perfis
        </div>
        <div class="">
          <q-table
            :rows="userRoles"
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
            <q-td key="description" :props="props">
                {{ props.row.description }}
            </q-td>
                  <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn flat round
                    color="amber-8"
                    icon="edit"
                   @click="editUser(props.row)"
                     v-if="props.row.active === true">
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
                <q-btn size="xl" fab icon="add" @click="addUser" no-cap color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showClinicRegistrationScreen">
          <addUser
            :selectedRole="role"
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
import Role from '../../../store/models/userLogin/Role'
import { ref } from 'vue'
import mixinSystemPlatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'

const columns = [
  { name: 'description', required: true, label: 'Descricao', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  mixins: [mixinSystemPlatform, mixinutils],
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
    userRoles () {
              return Role.query().with('menus').get()
        }
  },
  methods: {
        getIconActive (user) {
           if (user.active) {
              return 'stop_circle'
              } else if (!user.active) {
              return 'play_circle'
              }
       },
       getColorActive (user) {
           if (user.active) {
              return 'red'
              } else if (!user.active) {
              return 'green'
              }
       },
        getTooltipClass (user) {
           if (user.active) {
              return 'bg-red-5'
              } else if (!user.active) {
              return 'bg-green-5'
              }
       },
       editUser (role) {
        this.role = Object.assign({}, role)
         this.showClinicRegistrationScreen = true
         this.editMode = true
          this.viewMode = false
      },
        addUser () {
          this.role = new Role()
         this.showClinicRegistrationScreen = true
           this.editMode = false
           this.viewMode = false
      },
        visualizeClinic (role) {
              this.role = Object.assign({}, role)
         this.viewMode = true
            this.showClinicRegistrationScreen = true
             this.editMode = false
      },
        promptToConfirm (role) {
         let msg = ''
            this.$q.dialog({ title: 'Confirm', message: role.active ? 'Deseja Inactivar o Perfil?' : 'Deseja Activar o Perfil?', cancel: true, persistent: true }).onOk(() => {
               if (role.active) {
                role.active = false
                msg = 'Perfil inactivado com sucesso.'
              } else if (!role.active) {
                  role.active = true
                msg = 'Perfil activado com sucesso.'
              }
              if (this.website) {
                Role.apiSave(role).then(resp => {
                  this.displayAlert('info', msg)
            }).catch(error => {
                   this.displayAlert('error', error)
            })
          } else {
            const roleLocalBase = JSON.parse(JSON.stringify(role))
              Role.localDbAddOrUpdate(roleLocalBase).then(resp => {
                Role.insert({
                    data: roleLocalBase
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
      }
  },
  mounted () {
    if (this.website) {
      Role.apiGetAll().then(item => {
        this.hideLoading()
      })
    } else {
      this.getRolesToVuex().then(item => {
        this.hideLoading()
      })
    }
  },
  components: {
     addUser: require('components/Settings/User/AddRole.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
    // clinicsTable: require('components/Settings/Clinic/ClinicsTable.vue').default
  }
}
</script>
