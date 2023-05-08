<template>
    <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
        Sistemas para Interoperabilidade
        </div>
        <div class="">
        <q-table
          :rows="getHis"
          :columns="columns"
          :filter="filter"
          row-key="abbreviation"
          v-model:pagination="pagination"
        >
       <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                <span>
                  Sem resultados para visualizar
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
        <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
                </q-input>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props">
            <q-td auto-width>
            <q-btn size="sm" color="primary" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'expand_less' : 'expand_more'" />
          </q-td>
            <q-td key="abbreviation" :props="props">
                {{ props.row.abbreviation }}
            </q-td>
            <q-td key="description" :props="props">
                {{ props.row.description }}
            </q-td>
                  <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn flat round
                    color="amber-8"
                    icon="edit"
                      v-if="props.row.active === true"
                   @click="editHealthInformationSystem(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
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
             <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
           <selectedAttributesTable  :rows="props.row.interoperabilityAttributes" :columns="columnsSelectedAttributes" :viewMode="props.expand"/>
          </q-td>
        </q-tr>
        </template>
    </q-table>
        </div>
         <div class="absolute-bottomg">
              <q-page-sticky position="bottom-right" :offset="[18, 18]">
                <q-btn size="xl" fab icon="add" @click="addHealthInformationSystem" color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showHISRegistrationScreen">
          <addHIS
          :selectedHis="healthInformationSystem"
          :stepp="step"
           :createMode=createMode
           :editMode="editMode"
            @close="showHISRegistrationScreen = false" />
      </q-dialog>
    </div>
</template>
<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import HealthInformationSystem from '../../../store/models/healthInformationSystem/HealthInformationSystem'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'

const columns = [
   { name: '', required: true, label: '' },
  { name: 'abbreviation', required: true, label: 'Abreviatura', align: 'left', field: row => row.abbreviation, format: val => `${val}`, sortable: true },
  { name: 'description', required: true, label: 'Descricao', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]

const columnInteroperabilityTypes = [
  { name: 'code', required: true, label: 'Nome', align: 'left', field: row => row.fnmCode, format: val => `${val}`, sortable: true }
]

const columnsSelectedAttributes = [
  { name: 'interoperabilityType', required: true, label: 'Nome', align: 'left', field: row => row.interoperabilityType.description, format: val => `${val}`, sortable: true },
  { name: 'value', required: true, label: 'Valor', align: 'left', field: row => row.value, format: val => `${val}`, sortable: true }
]
export default {
    mixins: [mixinplatform, mixinutils],
  data () {
    const $q = useQuasar()

    return {
        columns,
        columnInteroperabilityTypes,
        columnsSelectedAttributes,
        $q,
        step: '',
         showHISRegistrationScreen: false,
          alert: ref({
              type: '',
              visible: false,
              msg: ''
            }),
             filter: ref(''),
               createMode: false,
         editMode: false
    }
  },
 computed: {
      getHis () {
          return HealthInformationSystem.query().with('interoperabilityAttributes.interoperabilityType').has('abbreviation').get()
      }
  },
  methods: {
     getIconActive (his) {
           if (his.active) {
              return 'stop_circle'
              } else if (!his.active) {
              return 'play_circle'
              }
       },
       getColorActive (his) {
           if (his.active) {
              return 'red'
              } else if (!his.active) {
              return 'green'
              }
       },
         getTooltipClass (his) {
           if (his.active) {
              return 'bg-red-5'
              } else if (!his.active) {
              return 'bg-green-5'
              }
       },
    getHealthInformationSystem () {
            HealthInformationSystem.api().get('/healthInformationSystem')
       },
       editHealthInformationSystem (healthInformationSystem) {
        this.healthInformationSystem = Object.assign({}, healthInformationSystem)
        this.step = 'edit'
         this.showHISRegistrationScreen = true
           this.editMode = true
           this.createMode = false
      },
       addHealthInformationSystem () {
        this.healthInformationSystem = new HealthInformationSystem()
        this.step = 'create'
         this.showHISRegistrationScreen = true
           this.editMode = false
           this.createMode = true
      },
      promptToConfirm (his) {
            this.$q.dialog({ title: 'Confirmação', message: his.active ? 'Deseja Inactivar o Sistema da Interoperabilidade?' : 'Deseja Activar o Sistema da Interoperabilidade?', cancel: true, persistent: true }).onOk(() => {
               if (his.active) {
                his.active = false
              } else if (!his.active) {
                  his.active = true
              }
              if (this.mobile) {
                console.log('FrontEnd')
                if (his.syncStatus !== 'R') his.syncStatus = 'U'
                HealthInformationSystem.localDbAdd(JSON.parse(JSON.stringify(his)))
                HealthInformationSystem.insertOrUpdate({ data: his })
                this.displayAlert('info', 'Tipo de identificador actualizado com sucesso')
              } else {
                console.log('BackEnd')
                HealthInformationSystem.apiUpdate(his).then(resp => {
                      this.displayAlert('info', 'Sistema da Interoperabilidade inactivado com sucesso')
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
    this.getHealthInformationSystem()
  },
  components: {
     addHIS: require('components/Settings/Interoperability/AddHIS.vue').default,
      selectedAttributesTable: require('components/Settings/Interoperability/HealthInformationSystemAttributeTable.vue').default
  }
}
</script>
