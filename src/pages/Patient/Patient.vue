<template>
  <div>
    <search
      v-if="isSearch"
      @goToPatientPanel="showSelected"/>

    <PatientPanel
      :selectedPatient="currPatient"
      v-if="isPatientDetails" />
         <q-dialog v-model="alert.visible">
          <Dialog :type="alert.type" @closeDialog="closeDialog" @commitOperation="commitOperation">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
  </div>
</template>

<script>
// import { LocalStorage } from 'quasar'
import { SessionStorage } from 'quasar'
import { ref } from 'vue'
import Patient from '../../store/models/patient/Patient'
import Clinic from '../../store/models/clinic/Clinic'
export default {
    data () {
      return {
        isSearch: true,
        isPatientDetails: false,
        currPatient: new Patient(),
        alert: ref({
                type: '',
                visible: false,
                msg: ''
              })
      }
    },
    methods: {
      showSelected (patient) {
        this.currPatient = Object.assign({}, patient)
        this.isSearch = false
        this.isPatientDetails = true
      },
      doPatientGet (clinicId, offset, max) {
        Patient.apiGetAllByClinicId(clinicId, offset, max).then(resp => {
              if (resp.response.data.length > 0) {
                offset = offset + max
                setTimeout(this.doPatientGet(clinicId, offset, max), 2)
              }
          }).catch(error => {
              console.log(error)
          })
      },
        displayAlert (type, msg) {
        this.alert.type = type
        this.alert.msg = msg
        this.alert.visible = true
      },
      closeDialog () {
        this.alert.visible = false
        this.$router.push({ path: '/' })
        if (this.alert.type === 'info') {
          this.$emit('close')
        }
      },
      getAllPatientsOfClinic () {
        const offset = 0
        const max = 100
        this.doPatientGet(this.clinic.id, offset, max)
      }
    },
    mounted () {
      // this.getAllPatientsOfClinic()
    },
    computed: {
      clinic: {
        get () {
          return Clinic.query()
                    .where('id', SessionStorage.getItem('currClinic').id)
                    .first()
        }
      }
      /*
      clinic () {
        return LocalStorage.getItem('currClinic')
      }
      */
    },
    components: {
        search: require('components/Patient/Search.vue').default,
        Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }
}
</script>

<style>

</style>
