<template>
  <div>
    <ListHeader />
    <EmptyList v-if="patient.identifiers.length <= 0" />
    <div v-show="serviceInfoVisible">
      <span>
        <InfoContainer />
      </span>
    </div>
    <!-- <q-dialog persistent v-model="showAddEditClinicalService">
      <AddClinicService
        :identifierToEdit="selectedIdentifier"
        :selectedPatient="selectedPatient"
        :stepp="step"
        @createFirstEpisode="createFirstEpisode"
        @close="showAddEditClinicalService = false"
      />
    </q-dialog>
    <q-dialog persistent v-model="showAddEditEpisode">
      <AddEditEpisode
        :episodeToEdit="selectedEpisode"
        :curIdentifier="selectedIdentifier"
        @close="showAddEditEpisode = false"
      />
    </q-dialog> -->
  </div>
</template>

<script setup>
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import { provide, inject, ref, computed } from 'vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
// import AddClinicService from 'components/Patient/PatientPanel/AddClinicService.vue';
// import AddEditEpisode from 'components/Patient/PatientPanel/AddEditEpisode.vue';
import InfoContainer from 'components/Patient/PatientPanel/InfoContainer.vue';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import { usePatient } from 'src/composables/patient/patientMethods';
import { usePatientServiceIdentifier } from 'src/composables/patient/patientServiceIdentifierMethods';

// Declaration
const { preferedIdentifierValue } = usePatient();
const { canBeEdited } = usePatientServiceIdentifier();
const showAddEditClinicalService = ref(false);
const emptyList = ref(false);
const selectedIdentifier = ref(new PatientServiceIdentifier());
const showAddEditEpisode = ref(false);
const serviceInfoVisible = ref(true);
const addVisible = ref(true);
const mainContainer = ref(true);
const bgColor = ref('bg-primary');
const title = ref('Serviços de Saúde da Farmácia');
const titleEmptyList = ref('Nenhum Serviço de Saúde Adicionado');

// Injection
const patient = inject('patient');

// Methods
const editClinicService = (curIdentifierParams) => {
  if (!canBeEdited(curIdentifierParams.service)) {
    alertInfo(
      'error',
      'Não pode fazer alterações sobre este serviço de saúde pois o mesmo ja possui registos de visitas do paciente/utente associados.'
    );
  } else {
    selectedIdentifier.value = curIdentifierParams;
    showAddEditClinicalService.value = true;
  }
};

const closeClinicService = (curIdentifierParams) => {
  selectedIdentifier.value = curIdentifierParams;
  showAddEditClinicalService.value = true;
};
const reopenClinicService = (curIdentifierParams) => {
  selectedIdentifier.value = curIdentifierParams;
  showAddEditClinicalService.value = true;
};
const addClinicService = () => {
  selectedIdentifier.value = null;
  showAddEditClinicalService.value = true;
};
const expandLess = (value) => {
  serviceInfoVisible.value = !value;
};
const createFirstEpisode = (identifier) => {
  selectedIdentifier.value = identifier;
  showAddEditClinicalService.value = false;
  showAddEditEpisode.value = true;
};

//Computed
const currIdentifier = computed(() => {
  return patientServiceIdentifierService.curIdentifier(
    preferedIdentifierValue(patient.value)
  );
});

provide('editClinicService', editClinicService);
provide('closeClinicService', closeClinicService);
provide('reopenClinicService', reopenClinicService);
provide('addClinicService', addClinicService);
provide('expandLess', expandLess);
provide('createFirstEpisode', createFirstEpisode);
provide('addVisible', addVisible);
provide('mainContainer', mainContainer);
provide('bgColor', bgColor);
provide('titleEmptyList', titleEmptyList);
provide('title', title);
provide('curIdentifier', currIdentifier);
// clinicServiceInfoVisible() {
//   return LocalStorage.getItem('clinicServiceInfoVisible');
// },
// canEdit() {
//   return this.canEditIdentifier();
// },
// identifiers: {
//   get() {
//     return this.patient.identifiers;
//   },
// },
</script>

<style></style>
