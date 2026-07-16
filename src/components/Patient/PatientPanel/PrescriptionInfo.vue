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
          :displayVersion="prescriptionDisplayVersion"
        />
      </div>
      <q-dialog
        persistent
        :maximized="isMobile"
        v-model="showAddPrescription"
      >
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
import { computed, provide, inject, onMounted, ref, watch } from 'vue';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import { usePrescriptionDialog } from 'src/composables/prescription/openPrecriptionDialog';
import PermissionService from 'src/services/api/user/PermissionService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import StockService from 'src/services/api/stockService/StockService';

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

const { isMobile, isOnline } = useSystemUtils();

// Inject
const patient = inject('patient');
const { showPrescriptionDialog, isNewPrescription } = usePrescriptionDialog();

const showAddPrescription = showPrescriptionDialog;
const prescriptionDisplayVersion = ref(0);

//OnMouted
onMounted(() => {
  showloading();
  init();
});

// Computed
const canAddPrescription = computed(() => {
  if (isOnline.value) {
    return PermissionService.canPerformUiAction('prescription', 'add');
  } else {
    return true;
  }
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

const prepareMobilePrescriptionEditing = async () => {
  if (isMobile.value && !isOnline.value) {
    await StockService.ensureMobileStockLoaded();
  }
};

const newPrescriptionOption = async () => {
  await prepareMobilePrescriptionEditing();
  isNewPrescription.value = true;
  showAddPrescription.value = true;
};

const editPrescriptionOption = async () => {
  await prepareMobilePrescriptionEditing();
  isNewPrescription.value = false;
  showAddPrescription.value = true;
};

const closePrescriptionOption = () => {
  showAddPrescription.value = false;
};

const refreshPrescriptionInfo = () => {
  if (isMobile.value && !isOnline.value) {
    prescriptionDisplayVersion.value += 1;
  }
};

watch(showAddPrescription, (isOpen, wasOpen) => {
  if (wasOpen && !isOpen) refreshPrescriptionInfo();
});

provide('title', title);
provide('bgColor', bgColor);
provide('addVisible', showAddButton);
provide('titleEmptyList', titleEmptyList);
provide('isNewPrescription', isNewPrescription);
provide('showAddPrescription', showAddPrescription);
provide('editPrescriptionOption', editPrescriptionOption);
provide('closePrescriptionOption', closePrescriptionOption);
provide('refreshPrescriptionInfo', refreshPrescriptionInfo);
</script>

<style></style>
