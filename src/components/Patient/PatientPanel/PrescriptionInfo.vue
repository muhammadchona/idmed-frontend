<template>
  <div>
    <ListHeader
      :addButtonActions="newPrescriptionOption"
      :mainContainer="true"
      bgColor="bg-primary"
      :add-visible="showAddPrescriptionButton"
      :expandVisible="false"
      :title="title"
    />
    <div>
      <EmptyList v-if="!patientHasEpisodes" />
      <div v-else>
        <PrescriptionInfoContainer
          v-for="identifier in patient.identifiers"
          :key="identifier.id"
          :identifierId="identifier.id"
          :serviceId="identifier.service.id"
        />
      </div>
      <q-dialog persistent v-model="showAddPrescription">
        <AddEditPrescription />
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import AddEditPrescription from 'components/Patient/PatientPanel/AddEditPrescription.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
import PrescriptionInfoContainer from 'components/Patient/Prescription/PrescriptionInfoContainer.vue';
import { computed, provide, inject, onMounted, ref } from 'vue';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

//Declaration
const {
  hasEpisodes,
  hasOneAndClosedIdentifier,
  hasNoObitOrTransferedForEpisode,
} = usePatient();
const { website, isDeskTop, isMobile } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const showAddPrescription = ref(false);
const isNewPrescription = ref(false);
const selectedVisitDetails = ref('');
const step = ref('');
const title = ref('Prescrição');
const titleEmptyList = ref('Nenhuma Prescrição Adicionada');
const bgColor = ref('bg-primary');

// Inject
const patient = inject('patient');

//OnMouted
onMounted(() => {
  showloading();
  init();
});

// Computed
const patientHasNoPrescription = computed(() => {
  if (patient.value.identifiers.length <= 0) return true;
  return !patientHasEpisodes.value;
});
const showAddButton = computed(() => {
  return patientHasEpisodes.value && !patientHasClosedIdentifier.value;
});

const patientHasEpisodes = computed(() => {
  return hasEpisodes(patient.value);
});
const patientHasClosedIdentifier = computed(() => {
  return hasOneAndClosedIdentifier(patient.value);
});

const showAddPrescriptionButton = computed(() => {
  if (hasEpisodes(patient.value)) {
    if (hasNoObitOrTransferedForEpisode(patient.value)) {
      return true;
    } else {
      return false;
    }
  }
});
// Methods
const init = async () => {
  closeLoading();
};

const addNewPack = (patientVisitDetails) => {
  selectedVisitDetails.value = patientVisitDetails;
  step.value = 'addNewPack';
  showAddPrescription.value = true;
};

const editPack = (patientVisitDetails) => {
  selectedVisitDetails.value = patientVisitDetails;
  step.value = 'editPack';
  showAddPrescription.value = true;
};

const newPrescriptionOption = () => {
  isNewPrescription.value = true;
  showAddPrescription.value = true;
};

const editPrescriptionOption = () => {
  isNewPrescription.value = false;
  showAddPrescription.value = true;
};

const closePrescriptionOption = () => {
  showAddPrescription.value = false;
};

provide('title', title);
provide('bgColor', bgColor);
provide('addVisible', showAddButton);
provide('titleEmptyList', titleEmptyList);
provide('isNewPrescription', isNewPrescription);
provide('showAddPrescription', showAddPrescription);
provide('editPrescriptionOption', editPrescriptionOption);
provide('closePrescriptionOption', closePrescriptionOption);
</script>

<style></style>
