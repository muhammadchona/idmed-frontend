<template>
    <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
         Regime Terapêutico
        </div>
        <div class="">
                 <!-- <nationalClinicsTable  :rows="getNationalClinicos" :columns="columns"  :showNationalClinicRegistrationScreen="showNationalClinicRegistrationScreen" /> -->
        <q-table
     :rows="therapeuticRegimens"
      :columns="columns"
      :filter="filter"
       row-key="regimenScheme">
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
            <q-td key="regimenScheme" :props="props">
                {{ props.row.regimenScheme }}
            </q-td>
            <q-td key="description" :props="props">
                {{ props.row.description }}
            </q-td>
               <q-td key="active" :props="props">
                {{ props.row.active ? 'Sim':'Nao' }}
            </q-td>
                  <q-td key="options" :props="props">
                  <div class="col">
                    <!-- <q-btn flat round
                    color="amber-8"
                    icon="edit"
                    v-if="props.row.active === true"
                   @click="editTherapeuticRegimen(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn> -->

                  <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="visualizeTherapeuticRegimen(props.row)">
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
                <!-- <q-btn size="xl" fab icon="add" @click="addTherapeuticRegimen" color="primary" /> -->
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showTherapeuticRegimenRegistrationScreen">
          <AddTherapeuticRegimen
          :selectedTherapeuticRegimen="therapeuticRegimen"
          :onlyView="viewMode"
            @close="showTherapeuticRegimenRegistrationScreen = false" />
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
import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'

const columns = [
  { name: 'regimenScheme', required: true, label: 'Esquema do Regime', align: 'left', field: row => row.regimenScheme, format: val => `${val}`, sortable: true },
  { name: 'description', required: true, label: 'Descricao', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true },
   { name: 'active', required: true, label: 'Activo', align: 'left', field: row => row.active, format: val => `${val}`, sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  mixins: [mixinplatform, mixinutils],
  data () {
    const $q = useQuasar()

    return {
      filter: ref(''),
        columns,
        $q,
         showTherapeuticRegimenRegistrationScreen: false,
         viewMode: false
    }
  },
 computed: {
      therapeuticRegimens () {
             return TherapeuticRegimen.query().with('drugs.form').with('clinicalService.identifierType').with('drugs.clinicalService').orderBy('regimenScheme').get()
      }
  },
  methods: {
       getIconActive (therapeuticRegimen) {
           if (therapeuticRegimen.active) {
              return 'stop_circle'
              } else if (!therapeuticRegimen.active) {
              return 'play_circle'
              }
       },
       getColorActive (therapeuticRegimen) {
           if (therapeuticRegimen.active) {
              return 'red'
              } else if (!therapeuticRegimen.active) {
              return 'green'
              }
       },
       getTooltipClass (therapeuticRegimen) {
           if (therapeuticRegimen.active) {
              return 'bg-red-5'
              } else if (!therapeuticRegimen.active) {
              return 'bg-green-5'
              }
       },
       editTherapeuticRegimen (therapeuticRegimen) {
         this.viewMode = false
        this.therapeuticRegimen = Object.assign({}, therapeuticRegimen)
         this.showTherapeuticRegimenRegistrationScreen = true
      },
        addTherapeuticRegimen () {
          this.viewMode = false
          this.therapeuticRegimen = new TherapeuticRegimen()
         this.showTherapeuticRegimenRegistrationScreen = true
      },
       visualizeTherapeuticRegimen (therapeuticRegimen) {
          this.therapeuticRegimen = Object.assign({}, therapeuticRegimen)
         this.viewMode = true
           this.showTherapeuticRegimenRegistrationScreen = true
      },
         promptToConfirm (therapeuticRegimen) {
           let msg = ''
            this.$q.dialog({ title: 'Confirmação', message: therapeuticRegimen.active ? 'Deseja Inactivar o Regime?' : 'Deseja Activar o Regime?', cancel: true, persistent: true }).onOk(() => {
              if (therapeuticRegimen.active) {
                therapeuticRegimen.active = false
                  msg = 'Regime inactivado com sucesso.'
              } else if (!therapeuticRegimen.active) {
                  therapeuticRegimen.active = true
                     msg = 'Regime activado com sucesso.'
              }
              if (this.mobile) {
                console.log('FrontEnd')
                if (therapeuticRegimen.syncStatus !== 'R') therapeuticRegimen.syncStatus = 'U'
                TherapeuticRegimen.localDbAdd(JSON.parse(JSON.stringify(therapeuticRegimen)))
                TherapeuticRegimen.insertOrUpdate({ data: therapeuticRegimen })
                this.displayAlert('info', msg)
              } else {
                TherapeuticRegimen.apiUpdate(therapeuticRegimen).then(resp => {
                  this.displayAlert('info', msg)
                }).catch(error => {
                  console.log(therapeuticRegimen.id)
                  console.log(error)
                })
              }
        })
      }
  },
  mounted () {
   // const offset = 0
   // this.getTherapeuticRegimens()
   // this.getAllForms(offset)
  },
  components: {
    AddTherapeuticRegimen: require('components/Settings/TherapeuticRegimen/AddTherapeuticRegimen.vue').default
  }
}
</script>
