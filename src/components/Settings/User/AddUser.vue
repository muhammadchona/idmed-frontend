<template>
  <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="q-pa-none bg-green-2">
                <div class="q-pa-md">
                    <div class="row items-center">
                        <q-icon name="people" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Cadastrar Utilizador</span>
                    </div>
                </div>
                <q-separator color="grey-13" size="1px"/>
            </q-card-section>
        <form>
        <q-scroll-area style="height: 600px;">
          <q-stepper
          v-model="step"
          ref="stepper"
          animated
        >
      <q-step
        :name="1"
        title="Dados Iniciais"
      >
            <q-card-section class="q-px-md">
               <div class="row q-mt-md">
                  <nameInput
                    ref="nome"
                    square
                    v-model="user.fullName"
                    :rules="[ val => val.length >= 3 || 'O nome indicado é inválido']"
                    lazy-rules
                     :disable="onlyView"
                    class="col fild-radius"
                    label="Nome Completo" />
            </div>
               <div class="row ">
                <nameInput
                    ref="username"
                    square
                    v-model="user.username"
                    :rules="[val => codeRules (val)]"
                    lazy-rules
                     :disable="onlyView"
                    class="col fild-radius"
                    label="Nome de Utilizador" />
            </div>
                     <div class="row" v-if="!editMode">
                <q-input
                    v-model="user.password"
                     dense
                   rounded
                   outlined
                    square
                     class="col"
                    label="Senha"
                    :rules="[ val => val.length >= 4 || 'A senha deve ter um minimo de 4 caracteres']"
                    ref="password"
                     :disable="onlyView"
                    :type="isPwd ? 'password' : 'text'">
                    <template v-slot:append >
                        <q-icon
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd"
                            color="primary"
                        />
                    </template>
                </q-input>
            </div>
             <div class="row" v-if="editMode">
                <q-input
                    v-model="user.password"
                     dense
                   rounded
                   outlined
                    square
                     class="col"
                    label="Senha"
                    :rules="[ val => val.length >= 4 || 'A senha deve ter um minimo de 4 caracteres']"
                    ref="password"
                     :disable="onlyView"
                     type="password">
                </q-input>
            </div>
             <div class="row q-mb-md">
                  <PhoneField v-model="user.contact"
                  dense
                  lazy-rules
                  ref="contact"
                   :disable="onlyView"
                   class="col fild-radius"
                    :rules="[ val => val.length >= 9 || 'O contacto deve ter um minimo de 9 caracteres']"
                  label="Contact"/>
                </div>
                <div class="row q-mb-md">
                <q-input
                dense
                outlined
                lazy-rules
                class="col fild-radius"
                 v-model="user.email"
                  :disable="onlyView"
                 type="email" label="Email" />
                </div>
                  <div class="row ">
                <div class="col-4 col-md-6 pa-md">
         <q-table
            style="max-width: 450px;max-height: 350px"
            title="Perfis"
            :rows="selectedRoles"
            :columns="columns"
            row-key="authority"
            v-if="onlyView"
            class="my-sticky-header-table"
          />
          </div>
          <div class="col-4 col-md-6 pa-md">
         <q-table
            style="max-width: 450px; max-height: 350px"
            title="Farmacias"
            :rows="selectedClinics"
            :columns="columnsClinics"
            row-key="code"
            v-if="onlyView"
            class="my-sticky-header-table"
          />
        </div>
        <div class="col-4 col-md-6 pa-md">
         <q-table
            style="max-width: 450px; max-height: 350px"
            title="Sectores Clinicos"
            :rows="clinicSectors"
            :columns="columnsClinicSectors"
            row-key="code"
            v-if="onlyView "
            class="my-sticky-header-table"
        />
        </div>
       </div>
             </q-card-section>
              </q-step>
               <q-step
          :name="2"
          title="Perfis"
      >
             <div class="q-mb-md">
                 <q-table
            title="Perfis"
            :rows="userRoles"
            :columns="columns"
            row-key="authority"
            selection="multiple"
            v-model:selected="selectedRoles"
            class="my-sticky-header-table"
            rows-per-page-options="7"
          >
         </q-table>
            </div>
              </q-step>
                 <q-step
          :name="3"
          title="Farmacias/Sectores Clinicos"
      >
             <div class="q-mb-md" v-if="this.isProvincial">
                 <q-table
            title="Farmacias"
            :rows="clinics"
            :columns="columnsClinics"
            row-key="code"
            selection="multiple"
            v-model:selected="selectedClinics"
            class="my-sticky-header-table"
            rows-per-page-options="7"
          >
         </q-table>
            </div>
              <div class="row "  v-if="!this.isProvincial">
                <nameInput
                    ref="clinic"
                    square
                    v-model="this.user.clinics[0].clinicName"
                    lazy-rules
                    class="col fild-radius"
                    :disable="!this.isProvincial"
                    label="Farmacia do Utilizador" />
            </div>
            <div class="q-mb-md" v-if="!this.isProvincial">
                 <q-table
            title="Sectores Clinicos"
            :rows="clinicSectors"
            :columns="columnsClinicSectors"
            row-key="code"
            selection="multiple"
            v-model:selected="selectedClinicSectors"
            class="my-sticky-header-table"
            rows-per-page-options="7"
          >
         </q-table>
            </div>
              </q-step>
              </q-stepper>
              <q-scroll-observer @scroll="scrollHandler" />
      </q-scroll-area>
             <q-card-actions align="right" class="q-mb-md">
                <q-stepper-navigation >
                <q-btn label="Cancelar" color="red" @click="$emit('close')" />
                <q-btn v-if="step > 1 && !onlyView" color="primary" @click="$refs.stepper.previous()" label="Voltar" class="q-ml-sm" />
          <q-btn @click="goToNextStep"  v-if="!onlyView" color="primary" :label="step !== 3 ? 'Proximo' : 'Submeter'" class="q-ml-sm"/>
        </q-stepper-navigation>
            </q-card-actions>
             <q-dialog v-model="alert.visible" persistent>
             <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
             </q-dialog>
        </form>
    </q-card>

</template>

<script>
import UserLogin from 'src/store/models/userLogin/User'
import Role from 'src/store/models/userLogin/Role'
import { ref } from 'vue'
import Clinic from '../../../store/models/clinic/Clinic'
import ClinicSector from '../../../store/models/clinicSector/ClinicSector'
import SystemConfigs from 'src/store/models/systemConfigs/SystemConfigs'
// import SecUserRole from 'src/store/models/userLogin/SecUserRole'
import { SessionStorage } from 'quasar'
import mixinSystemPlatform from 'src/mixins/mixin-system-platform'
import mixinEncryption from 'src/mixins/mixin-encryption'
import ClinicSectorType from '../../../store/models/clinicSectorType/ClinicSectorType'
import mixinutils from 'src/mixins/mixin-utils'

const columns = [
  { name: 'descricao', required: true, label: 'Descrição', align: 'left', field: row => row.authority, format: val => `${val}`, sortable: true }
]

const columnsClinics = [
  { name: 'descricao', required: true, label: 'Nome', align: 'left', field: row => row.clinicName, format: val => `${val}`, sortable: true }
]

const columnsClinicSectors = [
  { name: 'descricao', required: true, label: 'Nome', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true }
]

export default {
      props: ['selectedUser', 'onlyView', 'editMode', 'stepp'],
      mixins: [mixinSystemPlatform, mixinEncryption, mixinutils],
    data () {
        return {
            databaseCodes: [],
            submitting: false,
            user: new UserLogin(),
            userRole: '',
            clinico: '',
            alert: ref({
              type: '',
              visible: false,
              msg: ''
            }),
            columns,
            step: ref(1),
             isPwd: ref(true),
            columnsClinics,
            columnsClinicSectors,
            selectedRoles: [],
            selectedClinics: [],
            selectedClinicSectors: [],
            isProvincial: false
        }
    },
    created () {
        if (this.user !== '') {
          this.user = Object.assign({}, this.selectedUser)
          if (this.user.id !== null) {
          this.selectedRoles = this.selectedUser.authorities
          this.selectedClinics = this.selectedUser.clinics
          this.selectedClinicSectors = this.selectedUser.clinicSectors
          }
          }
    },
      mounted () {
        this.extractDatabaseCodes()
        if (this.configs.value === 'LOCAL') {
            this.isProvincial = false
            /*
           const clinicCurr = Clinic.query()
                        .with('province')
                        .with('district.province')
                        .with('facilityType')
                        .where('id', SessionStorage.getItem('currClinic').id)
                        .first()
                        / */
              const clinicCurr = new Clinic(SessionStorage.getItem('currClinic'))
             this.user.clinics[0] = clinicCurr
              this.selectedClinics[0] = clinicCurr
    } else {
         this.isProvincial = true
    }
    this.getClinicSectorTypeToVue()
    },
    computed: {
         userRoles () {
             return Role.query().with('menus').where('active', true).get()
        },
        clinics () {
            return Clinic.query()
                        .with('province')
                        .with('district.province')
                        .with('facilityType')
                        .has('code')
                        .get()
        },
        users () {
            return UserLogin.query().with('clinicSectors').with('clinics').get()
        },
        clinicSectors () {
           const allClinicSectors = ClinicSector.query().with('clinic.province')
                        .with('clinic.district.province')
                        .with('clinic.facilityType')
                        .with('clinicSectorType').has('code').where('active', true).get()
           return this.onlyView ? this.user.clinicSectors : allClinicSectors
        },
        configs () {
       return SystemConfigs.query().where('key', 'INSTALATION_TYPE').first()
      }
    },
    methods: {
        goToNextStep () {
           if (this.step === 1) {
        this.$refs.nome.$refs.ref.validate()
        this.$refs.password.validate()
         this.$refs.username.$refs.ref.validate()
         this.$refs.contact.$refs.ref.validate()
        if (!this.$refs.nome.$refs.ref.hasError &&
            !this.$refs.password.hasError && !this.$refs.username.$refs.ref.hasError &&
             !this.$refs.contact.$refs.ref.hasError) {
             this.$refs.stepper.next()
        }
           } else if (this.step === 2) {
            if (this.selectedRoles.length <= 0) {
           this.displayAlert('error', 'Por Favor seleccione pelo menos um Menú para dar Acesso')
            } else {
                this.$refs.stepper.next()
           }
           } else if (this.step === 3) {
            if (this.selectedClinicSectors.length <= 0) {
           this.displayAlert('error', 'Por Favor seleccione pelo menos uma Farmácia para dar Acesso')
            } else {
                 this.submitUser()
           }
           }
        },
        getClinicSectorTypeToVue () {
        ClinicSectorType.localDbGetAll().then(clinicSectorTypes => {
          console.log(clinicSectorTypes)
          ClinicSectorType.insert({ data: clinicSectorTypes })
      })
    },
    validateUser () {
        this.$refs.role.validate()
        this.$refs.nome.$refs.ref.validate()
        this.$refs.password.validate()
         this.$refs.username.$refs.ref.validate()
         this.$refs.contact.$refs.ref.validate()
        if (!this.$refs.nome.$refs.ref.hasError &&
            !this.$refs.password.hasError && !this.$refs.username.$refs.ref.hasError &&
            !this.$refs.role.hasError && !this.$refs.contact.ref.hasError) {
            this.submitUser()
        }
        },
        submitUser () {
           this.submitting = true
            console.log(this.user)
            this.selectedRoles = JSON.parse(JSON.stringify(this.selectedRoles))
            const roles = []
            this.selectedRoles.forEach(role => {
              roles.push(role.authority)
            })
            this.selectedClinics = JSON.parse(JSON.stringify(this.selectedClinics))
            this.selectedClinicSectors = JSON.parse(JSON.stringify(this.selectedClinicSectors))
           this.user.roles = roles
            this.user.clinics = this.selectedClinics
            this.user.clinicSectors = this.selectedClinicSectors
            this.user.accountLocked = false
            this.user.authorities = this.selectedRoles
            this.user.clinics[0] = this.user.clinicSectors[0].clinic
           /* this.selectedClinicSectors.forEach(item => {
              item.clinic = this.selectedClinics[0]
            }) */
            if (this.website) {
            UserLogin.apiSave(this.user).then(resp => {
            const userResp = resp.response.data
            userResp.authorities = this.selectedRoles
            userResp.clinics = this.selectedClinics
            userResp.clinicSectors = this.selectedClinicSectors
            UserLogin.insert({
              data: userResp
            })
               this.submitting = false
                 this.displayAlert('info', this.user.id === null ? 'Utilizador cadastrado com sucesso' : 'Utilizador actualizado com sucesso.')
            }).catch(error => {
               this.submitting = false
                  this.displayAlert('error', error)
            })
          } else {
            this.user.syncStatus = 'R'
            this.user.authorities = this.selectedRoles
              let userLocalBase = JSON.parse(JSON.stringify(this.user))
              console.log(this.userLocalBase)
              console.log(userLocalBase)
              userLocalBase = this.encrypt(userLocalBase)
              console.log(userLocalBase)
              UserLogin.localDbAddOrUpdate(userLocalBase).then(resp => {
                this.submitting = false
                UserLogin.insert({
                    data: userLocalBase
                })
                 this.displayAlert('info', this.user.id === null ? 'Utilizador cadastrado com sucesso' : 'Utilizador actualizado com sucesso.')
              })
          }
            },
            extractDatabaseCodes () {
                  this.users.forEach(element => {
                      this.databaseCodes.push(element.username)
              })
            },
            codeRules (val) {
                  if (val === '') {
                      return 'o nome do utilizador é obrigatorio'
                    } else if (val.length < 3) {
                      return 'O  nome do utilizador indicado deve ter no mínimo 3 caracteres'
                    } else if ((this.databaseCodes.includes(val) && this.selectedUser.id === this.user.id && this.isEditStep) ||
                    ((this.databaseCodes.includes(val) && this.users.filter(x => x.username === val)[0].id !== this.user.id && !this.isEditStep))) {
                    return !this.databaseCodes.includes(val) || 'O  nome do utilizador indicado já existe'
                      }
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
    components: {
        nameInput: require('components/Shared/NameInput.vue').default,
          PhoneField: require('components/Shared/Input/PhoneField.vue').default,
            Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }

}
</script>

<style>
    .fild-radius {
        border-radius: 5px;
    }
</style>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */

  .q-table__top
    /* bg color is important for th; just specify one */
    background-color: #0ba58b

  thead tr th
    position: sticky
    z-index: 0
  thead tr
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 0px
</style>
