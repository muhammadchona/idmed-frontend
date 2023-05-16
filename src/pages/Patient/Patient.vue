<template>
  <div>
    <search v-if="isSearch" @goToPatientPanel="showSelected" />
    <!-- <PatientPanel :selectedPatient="currPatient" v-if="isPatientDetails" /> -->
  </div>
</template>

<script setup>
import { computed, onMounted, provide, reactive, ref } from 'vue';
// import Patient from '../../store/models/patient/Patient';
import patientService from 'src/services/api/patientService/patientService';
import { useLoading } from 'src/composables/shared/loading/loading';
import clinicService from 'src/services/api/clinicService/clinicService';
import search from 'components/Patient/Search.vue';
import Patient from 'src/stores/models/patient/Patient';
// import PatientPanel from 'src/pages/Patient/Panel/PatientPanel.vue';

const isSearch = reactive(ref(true));
const isPatientDetails = reactive(ref(false));
const currPatient = reactive(ref(new Patient()));

const { closeLoading, showloading } = useLoading();

onMounted(() => {
  showloading();
  patientService.get(0);
});

const clinic = computed(() => {
  return clinicService.currClinic();
});

provide('clinic', clinic);
provide('currPatient', currPatient);
provide('isSearch', isSearch);
provide('isPatientDetails', isPatientDetails);

// export default {
//   methods: {
//     showSelected(patient) {
//       this.currPatient = Object.assign({}, patient);
//       this.isSearch = false;
//       this.isPatientDetails = true;
//     },
//     doPatientGet(clinicId, offset, max) {
//       Patient.apiGetAllByClinicId(clinicId, offset, max)
//         .then((resp) => {
//           if (resp.response.data.length > 0) {
//             offset = offset + max;
//             setTimeout(this.doPatientGet(clinicId, offset, max), 2);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     },
//     displayAlert(type, msg) {
//       this.alert.type = type;
//       this.alert.msg = msg;
//       this.alert.visible = true;
//     },
//     closeDialog() {
//       this.alert.visible = false;
//       this.$router.push({ path: '/' });
//       if (this.alert.type === 'info') {
//         this.$emit('close');
//       }
//     },
//     getAllPatientsOfClinic() {
//       const offset = 0;
//       const max = 100;
//       this.doPatientGet(this.clinic.id, offset, max);
//     },
//   },
//   mounted() {
//     // this.getAllPatientsOfClinic()
//   },
//   computed: {},
//   components: {
//     search: require('components/Patient/Search.vue').default,
//     Dialog: require('components/Shared/Dialog/Dialog.vue').default,
//   },
// };
</script>

<style></style>
