<template>
  <div>
    <ListHeader
      :addButtonActions="newPrescriptionOption"
      :mainContainer="true"
      bgColor="bg-primary"
      :add-visible="
        canAddPrescription &&
        showAddPrescriptionButton &&
        (!isProvincialInstalation() ||
          isProvincialInstalationPharmacysMode() ||
          isProvincialInstalationMobileClinic())
      "
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
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import { usePrescriptionDialog } from 'src/composables/prescription/openPrecriptionDialog';
import PermissionService from 'src/services/api/user/PermissionService';

//Declaration
const {
  hasEpisodes,
  hasOneAndClosedIdentifier,
  hasNoObitOrTransferedForEpisode,
} = usePatient();
const {
  isProvincialInstalation,
  isProvincialInstalationPharmacysMode,
  isProvincialInstalationMobileClinic,
} = useSystemConfig();
const { closeLoading, showloading } = useLoading();
// const showAddPrescription = ref(false);
// const isNewPrescription = ref(false);
const title = ref('Prescrição');
const titleEmptyList = ref('Nenhuma Prescrição Adicionada');
const bgColor = ref('bg-primary');

// Inject
const patient = inject('patient');
const { showPrescriptionDialog, isNewPrescription } = usePrescriptionDialog();

const showAddPrescription = showPrescriptionDialog;

//OnMouted
onMounted(() => {
  showloading();
  init();
});

// Computed
const canAddPrescription = computed(() => {
  return PermissionService.canPerformUiAction('prescription', 'add');
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
