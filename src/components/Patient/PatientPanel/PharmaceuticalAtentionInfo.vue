<template>
  <div>
    <ListHeader
      :addVisible="showAddButton"
      :mainContainer="true"
      bgColor="bg-primary"
      @expandLess="expandLess"
      @showAdd="showAddPharmaceuticalAtention = true">
      Atenção Farmacêutica
    </ListHeader>
    <div v-show="infoVisible">
      <EmptyList v-if="patientVisits.length <= 0" >Nenhuma Atenção Farmacêutica Adicionada</EmptyList>
      <div v-else >
      <span v-for="patientVisit in patientVisits" :key="patientVisit.id">
          <PharmaceuticalAtentionContainer
            :selectedPatientVisit="patientVisit"/>
        </span>
      </div>
      <q-dialog persistent v-model="showAddPharmaceuticalAtention">
        <AddEditPharmaceuticalAtention
          @close="showAddPharmaceuticalAtention= false"
        :editMode=false />
    </q-dialog>
    </div>
  </div>
</template>

<script>
import { SessionStorage } from 'quasar'
import Patient from '../../../store/models/patient/Patient'
import PatientVisit from '../../../store/models/patientVisit/PatientVisit'
import PregnancyScreening from '../../../store/models/screening/PregnancyScreening'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
export default {
    mixins: [mixinplatform, mixinutils],
  props: ['selectedPatient'],
  data () {
    return {
      showAddPharmAttention: false,
      infoVisible: true,
      showAddPharmaceuticalAtention: false,
      flagGo: false
    }
  },
  methods: {
    init () {
      if (this.website) {
        this.patientVisits.forEach(patientVisit => {
          PregnancyScreening.apiGetAllByPatientVisitId(patientVisit.id).then(resp => {
            this.flagGo = true
          })
        })
      }
    },
    expandLess (value) {
      this.infoVisible = !value
    }
  },
  created () {
    this.init()
  },
  computed: {
    patient: {
      get () {
        return new Patient(SessionStorage.getItem('selectedPatient'))
      }
    },
    patientVisits: {
      get () {
        const pvts = PatientVisit.query()
                          .where('patient_id', this.patient.id)
                          .limit(4)
                          .has('vitalSigns')
                          .orderBy('visitDate', 'desc')
                          .get()
      if (pvts.length > 0) pvts[0].isLast = true
      return pvts
      }
    },
    showAddButton () {
      return this.selectedPatient.identifiers.length > 0
    }
  },
  components: {
      ListHeader: require('components/Shared/ListHeader.vue').default,
      EmptyList: require('components/Shared/ListEmpty.vue').default,
      AddEditPharmaceuticalAtention: require('components/Patient/PharmaceuticalAtention/AddEditPharmaceuticalAtention.vue').default,
      PharmaceuticalAtentionContainer: require('components/Patient/PharmaceuticalAtention/PharmaceuticalAtentionContainer.vue').default
  }
}
</script>

<style>

</style>
