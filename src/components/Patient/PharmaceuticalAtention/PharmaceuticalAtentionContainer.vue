<template>
  <div>
    <ListHeader :addVisible="false" bgColor="bg-grey-6" > Data do Registo: {{ formatDate(patientVisit.visitDate) }}</ListHeader>
    <q-card class="noRadius">
      <q-card-section class="row q-pa-none">
        <div class="col-12">
          <q-table
            class="col"
            dense
            unelevated
            separator="vertical"
            :rows="patientVisits"
            :columns="columns"
            row-key="id"
            hide-bottom
            >
            <template #header="props">
              <q-tr class="text-left bg-grey-2"  :props="props">
                <q-th >{{columns[0].label}}</q-th>
                <q-th >{{columns[1].label}}</q-th>
                <q-th v-if="!patient.isMale()">{{columns[2].label}}</q-th>
                <q-th >{{columns[3].label}}</q-th>
                <q-th >{{columns[4].label}}</q-th>
                <q-th v-if="this.selectedPatientVisit.isLast" >{{columns[5].label}}</q-th>
              </q-tr>

            </template>
            <template #body="props">
              <q-tr no-hover :props="props">
                <q-td key="vitalSigns" :props="props">
                  <span class="text-weight-medium">Peso:</span>
                  {{props.row.vitalSigns[0].weight + ' Kg'}}
                  <span class="text-weight-bolder"> | </span>
                  <span class="text-weight-medium">Altura:</span>
                  {{props.row.vitalSigns[0].height + ' m'}}
                  <span class="text-weight-bolder"> | </span>
                  <span class="text-weight-medium">IMC:</span>
                  {{Math.round(props.row.vitalSigns[0].imc * 100) / 100 + ''}}
                  <span class="text-weight-bolder"> | </span>
                  <span class="text-weight-medium">Sistole:</span>
                  {{props.row.vitalSigns[0].systole + ' mmhHg'}}
                  <span class="text-weight-bolder"> | </span>
                  <span class="text-weight-medium">Diastole:</span>
                  {{props.row.vitalSigns[0].distort + ' mmHg'}}
                </q-td>
                <q-td key="tb" :props="props">
                  <q-btn class="q-pa-none" flat color="primary" label="Ver Detalhes" @click="viewTb = true"/>
                </q-td>
                <q-td v-if="!patient.isMale()" auto-width key="pregnancyScreening" :props="props">
                  <q-btn class="q-pa-none" flat color="primary" label="Ver Detalhes" @click="viewPregnancy = true"/>
                </q-td>
                <q-td auto-width key="adherenceScreening" :props="props">
                  <q-btn class="q-pa-none" flat color="primary" label="Ver Detalhes" @click="viewAdherence = true"/>
                </q-td>
                <q-td auto-width key="ramScreening" :props="props">
                  <q-btn class="q-pa-none" flat color="primary" label="Ver Detalhes" @click="viewRam = true"/>
                </q-td>
                <q-td v-if="this.selectedPatientVisit.isLast" auto-width key="opts" :props="props">
                  <div class="col">
                    <q-btn
                      flat
                      @click="showAddPharmaceuticalAtention = true"
                      round
                      color="orange-5"
                      icon="edit" >
                      <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      @click.stop="promptToConfirm(patientVisit)"
                      round
                      color="red"
                      icon="delete" >
                      <q-tooltip class="bg-red">Remover</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </q-card-section>
      <q-dialog persistent v-model="viewTb">
      <tbTable :selectedTbTracing="patientVisit.tbScreening[0]" :onlyView=true @close="viewTb = false"/>
      </q-dialog>
       <q-dialog v-if="!patient.isMale()" persistent v-model="viewPregnancy">
      <pregnancyTable :selectedPregnancyTracing="patientVisit.pregnancyScreening[0]" :onlyView=true @close="viewPregnancy = false"/>
      </q-dialog>
       <q-dialog persistent v-model="viewAdherence">
      <adherenceTable :selectedAdherenceTracing="patientVisit.adherenceScreening[0]" :onlyView=true @close="viewAdherence = false"/>
      </q-dialog>
       <q-dialog persistent v-model="viewRam">
      <ramTable :selectedRamTracing="patientVisit.ramScreening[0]" :onlyView=true @close="viewRam = false"/>
      </q-dialog>
       <q-dialog persistent v-model="showAddPharmaceuticalAtention">
      <AddEditPharmaceuticalAtention
        :editPatientVisit="patientVisit"
        :editMode=true
        @close="showAddPharmaceuticalAtention= false" />
  </q-dialog>
    <q-dialog v-model="alert.visible">
          <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
    </q-card>
  </div>
</template>

<script>
import { SessionStorage, date } from 'quasar'
import Patient from '../../../store/models/patient/Patient'
import PatientVisit from '../../../store/models/patientVisit/PatientVisit'
import { ref } from 'vue'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import AuditSyncronization from 'src/store/models/auditSyncronization/AuditSyncronization'
const columns = [
  { name: 'vitalSigns', required: true, field: 'row.vitalSigns', label: 'Dados Vitais', align: 'left', sortable: false },
  { name: 'tb', align: 'left', field: 'row.tbScreening', label: 'Rastreio TB', sortable: false },
  { name: 'pregnancyScreening', align: 'left', field: 'row.pregnancyScreening', label: 'Rastreio Gravidez', sortable: false },
  { name: 'adherenceScreening', align: 'left', field: 'row.adherenceScreening', label: 'Monitoria e Reforço a Adesão', sortable: false },
  { name: 'ramScreening', align: 'left', field: 'row.ramScreening', label: 'Reações Adversas', sortable: false },
  { name: 'opts', align: 'left', label: 'Opções', sortable: false }
]
export default {
  props: ['selectedPatientVisit'],
    mixins: [mixinplatform, mixinutils],
  data () {
    return {
        alert: ref({
        type: '',
        visible: false,
        msg: ''
          }),
          columns,
      curIdentifier: {},
      isPatientActive: false,
      showAddEpisode: false,
      selectedEpisode: {},
      showAddEditEpisode: false,
       viewTb: false,
       viewPregnancy: false,
       viewAdherence: false,
      viewRam: false,
      showAddPharmaceuticalAtention: false

    }
  },
  components: {
    ListHeader: require('components/Shared/ListHeader.vue').default,
    tbTable: require('components/Patient/PharmaceuticalAtention/TbQuestionsTable.vue').default,
    pregnancyTable: require('components/Patient/PharmaceuticalAtention/PregnancyQuestionsTable.vue').default,
    adherenceTable: require('components/Patient/PharmaceuticalAtention/MonitoringReinforcementAdherinTable.vue').default,
    ramTable: require('components/Patient/PharmaceuticalAtention/AdverseReactionQuestiosTable.vue').default,
    AddEditPharmaceuticalAtention: require('components/Patient/PharmaceuticalAtention/AddEditPharmaceuticalAtention.vue').default,
    Dialog: require('components/Shared/Dialog/Dialog.vue').default
  },
  methods: {
    init () {
      if (this.website) {
        PatientVisit.apiFetchById(this.selectedPatientVisit.id)
      }
    },
    checkPatientStatusOnService () {
      if (this.curIdentifier.endDate !== '') {
        this.isPatientActive = true
      }
    },
    promptToConfirm (patientVisit) {
            this.$q.dialog({ title: 'Confirmação', message: 'Deseja Apagar a atenção farmaceutica?', cancel: true, persistent: true }).onOk(() => {
              if (this.website) {
                if (patientVisit.patientVisitDetails.length === 0) {
        PatientVisit.apiRemove(patientVisit.id).then(resp => {
            PatientVisit.delete(patientVisit.id)
          const i = this.patientVisits.map(toRemove => toRemove.id).indexOf(patientVisit.id) // find index of your object
         this.patientVisits.splice(i, 1)
             }).catch(error => {
           const listErrors = []
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach(element => {
                listErrors.push(element.message)
              })
            }
          }
          this.displayAlert('error', listErrors)
          })
           } else {
              patientVisit.vitalSigns.splice(0, patientVisit.vitalSigns.length)
              patientVisit.tbScreening.splice(0, patientVisit.tbScreening.length)
              patientVisit.pregnancyScreening.splice(0, patientVisit.pregnancyScreening.length)
              patientVisit.adherenceScreening.splice(0, patientVisit.adherenceScreening.length)
              patientVisit.ramScreening.splice(0, patientVisit.ramScreening.length)
              console.log(patientVisit)
              PatientVisit.apiSave(patientVisit).then(resp => {
             this.displayAlert('info', 'Atenção Farmaceutica removida com sucesso.')
             }).catch(error => {
             this.displayAlert('error', error)
          })
           }
              } else {
                PatientVisit.localDbGetById(patientVisit.id).then(item => {
          if (item.syncStatus !== 'R') {
                        const auditSync = new AuditSyncronization()
                          auditSync.operationType = 'remove'
                          auditSync.className = PatientVisit.getClassName()
                          auditSync.entity = item
                          AuditSyncronization.localDbAdd(auditSync)
                    }
         PatientVisit.localDbDelete(patientVisit)
         PatientVisit.delete(patientVisit.id)
        this.displayAlert('info', 'Operação efectuada com sucesso.')
              })
            }
        })
      },
    formatDate (dateString) {
      return date.formatDate(dateString, 'DD-MM-YYYY')
    },
     displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
      if (this.alert.type === 'info') this.$emit('close')
    }
  },
  computed: {
    patient () {
      return new Patient(SessionStorage.getItem('selectedPatient'))
    },
    patientVisit () {
      return this.patientVisits[0]
    },
    patientVisits () {
      return PatientVisit.query().with('patient.*')
                          .with('patient.patientVisits.clinic.province')
                          .with('vitalSigns')
                          .with('tbScreening')
                          .with('pregnancyScreening')
                          .with('adherenceScreening')
                          .with('ramScreening')
                          .with('patientVisitDetails.episode')
                          .with('patientVisitDetails.clinic')
                          .with('clinic')
                          .where('id', this.selectedPatientVisit.id)
                          .has('clinic')
                          .has('vitalSigns')
                          .orderBy('visitDate', 'desc')
                          .get()
    }
  },
  created () {
    this.init()
  }
}
</script>

<style>
  .noRadius {
    border-radius: 0px
  }
</style>
