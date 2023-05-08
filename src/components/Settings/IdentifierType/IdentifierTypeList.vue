<template>
  <div>
   <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Tipo de Identificador
      </div>
      <div class="">
      <q-table
        :rows="identifierTypes"
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
            <q-td key="pattern" :props="props">
              {{ props.row.pattern }}
          </q-td>
          <q-td key="options" :props="props">
              <div class="col">
                <q-btn flat round
                  color="amber-8"
                  icon="edit"
                 @click="editIdentifierType(props.row)">
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn flat round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="showIdentifierType(props.row)">
                  <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
      </template>
  </q-table>
      </div>
       <div class="absolute-bottomg">
            <q-page-sticky position="bottom-right" :offset="[18, 18]">
              <q-btn size="xl" fab icon="add" @click="addIdentifierType" color="primary" />
           </q-page-sticky>
      </div>
      <q-dialog persistent v-model="showAddEditIdentifierType">
        <AddEditIdentifierType
          :selectedIdentifierType="identifierType"
          :stepp="step"
          :editMode=editMode
          :onlyView="viewMode"
          @close="showAddEditIdentifierType = false" />
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
import IdentifierType from '../../../store/models/identifierType/IdentifierType'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'

const columns = [
{ name: 'code', required: true, label: 'Código', align: 'left', field: row => row.code, format: val => `${val}`, sortable: true },
{ name: 'description', required: true, label: 'Descrição', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true },
{ name: 'pattern', required: true, label: 'Padrão', align: 'left', field: row => row.pattern, format: val => `${val}`, sortable: true },
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
       showAddEditIdentifierType: false,
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
    identifierTypes () {
        return IdentifierType.query().has('code').get()
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
     editIdentifierType (identifierType) {
        this.identifierType = identifierType
        this.step = 'edit'
        this.showAddEditIdentifierType = true
        this.editMode = true
         this.viewMode = false
    },
    addIdentifierType () {
      this.identifierType = new IdentifierType()
      this.step = 'create'
      this.showAddEditIdentifierType = true
      this.editMode = false
      this.viewMode = false
    },
    showIdentifierType (identifierType) {
        this.identifierType = identifierType
        this.step = 'display'
        this.viewMode = true
        this.editMode = false
        this.showAddEditIdentifierType = true
    },
    promptToConfirm (identifierType) {
      this.$q.dialog({ title: 'Confirmação', message: identifierType.active ? 'Deseja Inactivar o Sector Clinico?' : 'Deseja Activar o Sector Clinico?', cancel: true, persistent: true }).onOk(() => {
        identifierType.active = !identifierType.active
        if (this.mobile) {
              console.log('FrontEnd')
              if (identifierType.syncStatus !== 'R') identifierType.syncStatus = 'U'
              IdentifierType.localDbAdd(JSON.parse(JSON.stringify(identifierType)))
              IdentifierType.insertOrUpdate({ data: identifierType })
              this.displayAlert('info', 'Tipo de identificador actualizado com sucesso')
            } else {
              console.log('BackEnd')
              IdentifierType.apiUpdate(identifierType).then(resp => {
                this.displayAlert('info', 'Tipo de identificador actualizado com sucesso')
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
        this.alert.visible = false
      }
},
components: {
  AddEditIdentifierType: require('components/Settings/IdentifierType/IdentifierType.vue').default,
  Dialog: require('components/Shared/Dialog/Dialog.vue').default
}
}
</script>
