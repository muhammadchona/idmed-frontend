<template>
  <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="q-pa-none bg-green-2">
                <div class="q-pa-md">
                    <div class="row items-center">
                        <q-icon name="manage_accounts" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Cadastrar Perfil</span>
                    </div>
                </div>
                <q-separator color="grey-13" size="1px"/>
            </q-card-section>
              <form @submit.prevent="validateRole" >
              <q-scroll-area style="height: 600px;">
            <q-card-section class="q-px-md">
               <div class="row q-mt-md">
                  <nameInput
                    ref="nome"
                    square
                    v-model="role.name"
                    :rules="[val => codeRules (val)]"
                    lazy-rules
                    :disable="onlyView"
                    class="col fild-radius"
                    label="Nome" />
            </div>
               <div class="row q-mt-md">
                  <nameInput
                    ref="description"
                    square
                    v-model="role.description"
                    :rules="[ val => val.length >=3 || 'A descrição indicado deve ter no mínimo 3 caracteres']"
                    lazy-rules
                    :disable="onlyView"
                    class="col fild-radius"
                    label="Descrição" />
            </div>
              <div class="q-pa-md">
         <q-table
            title="Funcionalidades"
            :rows="menus"
            :columns="columns"
            row-key="code"
            selection="multiple"
            v-model:selected="role.menus"
            class="my-sticky-header-table"
              v-if="!onlyView"
            rows-per-page-options="8"
          >
         </q-table>
            <q-table
      class="col"
      title="Funcionalidades"
      :rows="role.menus"
      :columns="columns1"
      row-key="code"
      v-if="onlyView"
        />
              </div>
              </q-card-section>
              <q-scroll-observer @scroll="scrollHandler" />
      </q-scroll-area>
                <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')" />
                <q-btn type="submit" :loading="submitting" label="Submeter" color="primary" v-if="!onlyView"/>
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
import Role from 'src/store/models/userLogin/Role'
import { ref } from 'vue'
import Menu from 'src/store/models/userLogin/Menu'
import mixinSystemPlatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
// import { v4 as uuidv4 } from 'uuid'
const columns = [
  { name: 'descricao', required: true, label: 'Seleccionar Todas', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true }
]

const columns1 = [
  { name: 'descricao', required: true, label: 'Descricão', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true }
]

export default {
      props: ['selectedRole', 'onlyView', 'editMode'],
      mixins: [mixinSystemPlatform, mixinutils],
    data () {
        return {
            databaseCodes: [],
            submitting: false,
            role: new Role(),
            userRole: '',
            clinico: '',
            alert: ref({
              type: '',
              visible: false,
              msg: ''
            }),
            columns,
            columns1,
            step: ref(1),
             isPwd: ref(true)
        }
    },
    created () {
        if (this.role !== '') {
          this.role = Object.assign({}, this.selectedRole)
          }
    },
      mounted () {
        this.extractDatabaseCodes()
    },
    computed: {
         userRoles () {
          return Role.query().with('menus').get()
        },
        menus () {
          return Menu.all().filter(arrayItem => arrayItem.code !== '08')
        }
    },
    methods: {
    validateRole () {
      this.$refs.nome.$refs.ref.validate()
        this.$refs.description.$refs.ref.validate()
        if (!this.$refs.nome.$refs.ref.hasError &&
            !this.$refs.description.$refs.ref.hasError) {
            if (this.role.menus.length === 0) {
          this.displayAlert('error', 'Seleccione pelo menos uma funcionalidade!')
        } else {
                   this.submitUser()
            }
      }
        },
        submitUser () {
           this.submitting = true
            console.log(this.role)
            this.role.active = true
            this.role.authority = 'ROLE_' + this.role.name
            if (this.website) {
              Role.apiSave(this.role).then(resp => {
              this.submitting = false
                 this.displayAlert('info', this.role.id === null ? 'Perfil cadastrado com sucesso' : 'Perfil actualizado com sucesso.')
            }).catch(error => {
               this.submitting = false
                  this.displayAlert('error', error)
            })
            } else {
             // this.role.id = uuidv4()
              this.role.syncStatus = 'R'
              const roleLocalBase = JSON.parse(JSON.stringify(this.role))
              console.log(this.role)
              console.log(roleLocalBase)
              Role.localDbAddOrUpdate(roleLocalBase).then(resp => {
                this.submitting = false
                Role.insert({
                    data: roleLocalBase
                })
                 this.displayAlert('info', this.role.id === null ? 'Perfil cadastrado com sucesso' : 'Perfil actualizado com sucesso.')
              })
            }
    },
    extractDatabaseCodes () {
        this.userRoles.forEach(element => {
            this.databaseCodes.push(element.name)
    })
    },
    codeRules (val) {
     if (val === '') {
        return 'o Código é obrigatorio'
      } else if (val.length < 3) {
        return 'O nome indicado deve ter no mínimo 3 caracteres'
      } else if ((this.databaseCodes.includes(val) && this.selectedRole.id === this.role.id && !this.isEditStep) ||
      ((this.databaseCodes.includes(val) && this.userRoles.filter(x => x.name === val)[0].id !== this.role.id && this.isEditStep))) {
      return !this.databaseCodes.includes(val) || 'o Código indicado já existe'
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
            Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }

}
</script>

<style>
    .fild-radius {
        border-radius: 5px;
    }
</style>
