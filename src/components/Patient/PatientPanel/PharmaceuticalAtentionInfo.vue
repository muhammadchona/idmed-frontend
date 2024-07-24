<template>
  <div>
    <ListHeader
      :title="title"
      :bg-color="bgColor"
      :main-container="mainContainer"
      :expanded="expandLess"
      :add-visible="
        showAddButton &&
        (!isProvincialInstalation() ||
          isProvincialInstalationPharmacysMode() ||
          isProvincialInstalationMobileClinic())
      "
      :expand-visible="false"
      :addButtonActions="addButtonActions"
    />
    <div v-show="infoVisible">
      <EmptyList v-if="patientVisits.length <= 0" />
      <div v-else>
        <span>
          <PharmaceuticalAtentionContainer />
        </span>
      </div>
      <q-dialog persistent v-model="showAddPharmaceuticalAtention">
        <AddEditPharmaceuticalAtention />
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
import AddEditPharmaceuticalAtention from 'components/Patient/PharmaceuticalAtention/AddEditPharmaceuticalAtention.vue';
import PharmaceuticalAtentionContainer from 'components/Patient/PharmaceuticalAtention/PharmaceuticalAtentionContainer.vue';
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

//Declaration
const { website } = useSystemUtils();
const {
  isProvincialInstalation,
  isProvincialInstalationPharmacysMode,
  isProvincialInstalationMobileClinic,
} = useSystemConfig();
const {
  hasEpisodes,
  hasOneAndClosedIdentifier,
  hasNoObitOrTransferedForEpisode,
} = usePatient();
const infoVisible = ref(true);
const showAddPharmaceuticalAtention = ref(false);
const title = ref('Atenção Farmacêutica');
const titleEmptyList = ref('Nenhuma Atenção Farmacêutica Adicionada');
const bgColor = ref('bg-primary');
const mainContainer = ref(true);
const editMode = ref(false);
const onlyView = ref(false);
const viewTb = ref(false);
const viewPregnancy = ref(false);
const viewAdherence = ref(false);
const viewRam = ref(false);
const showPatientVisit = ref(new PatientVisit());

//Injection
const patient = inject('patient');

// Methods
const expandLess = (valueUpdated) => {
  infoVisible.value = !valueUpdated;
};
// Computed

const addButtonActions = () => {
  showAddPharmaceuticalAtention.value = true;
  editMode.value = false;
  onlyView.value = false;
  viewTb.value = false;
  viewPregnancy.value = false;
  viewAdherence.value = false;
  viewRam.value = false;
};
const editButtonActions = (patientVisit) => {
  showPatientVisit.value = patientVisit;
  showAddPharmaceuticalAtention.value = true;
  editMode.value = true;
  onlyView.value = false;
};
const showButtonActions = () => {
  showAddPharmaceuticalAtention.value = true;
  editMode.value = false;
  onlyView.value = true;
};

const showTB = (patientVisit) => {
  showPatientVisit.value.tbScreenings[0] = patientVisit.tbScreenings[0];
  viewTb.value = true;
  viewPregnancy.value = false;
  viewAdherence.value = false;
  viewRam.value = false;
  onlyView.value = true;
};

const showPregnancy = (patientVisit) => {
  showPatientVisit.value.pregnancyScreenings[0] =
    patientVisit.pregnancyScreenings[0];
  viewTb.value = false;
  viewPregnancy.value = true;
  viewAdherence.value = false;
  viewRam.value = false;
  onlyView.value = true;
};

const showAdherence = (patientVisit) => {
  showPatientVisit.value.adherenceScreenings[0] =
    patientVisit.adherenceScreenings[0];
  viewTb.value = false;
  viewPregnancy.value = false;
  viewAdherence.value = true;
  viewRam.value = false;
  onlyView.value = true;
};

const showAdverse = (patientVisit) => {
  showPatientVisit.value.ramScreenings[0] = patientVisit.ramScreenings[0];
  viewTb.value = false;
  viewPregnancy.value = false;
  viewAdherence.value = false;
  viewRam.value = true;
  onlyView.value = true;
};

const closeButtonActions = () => {
  showAddPharmaceuticalAtention.value = false;
  showPatientVisit.value = new PatientVisit();
  viewTb.value = false;
  viewPregnancy.value = false;
  viewAdherence.value = false;
  viewRam.value = false;
  onlyView.value = false;
};

const patientVisits = computed(() => {
  return patientVisitService.getLastFourWithVitalSignByPatientId(
    patient.value.id
  );
});
const showAddButton = computed(() => {
  if (hasEpisodes(patient.value)) {
    if (hasNoObitOrTransferedForEpisode(patient.value)) {
      return true;
    } else {
      return false;
    }
  }
});
provide('title', title);
provide('bgColor', bgColor);
provide('expandLess', expandLess);
provide('addVisible', showAddButton);
provide('mainContainer', mainContainer);
provide('titleEmptyList', titleEmptyList);
provide('editMode', editMode);
provide('onlyView', onlyView);
provide('viewTb', viewTb);
provide('viewPregnancy', viewPregnancy);
provide('viewAdherence', viewAdherence);
provide('viewRam', viewRam);
provide('patientVisits', patientVisits);
provide('showPatientVisit', showPatientVisit);
provide('addButtonActions', addButtonActions);
provide('editButtonActions', editButtonActions);
provide('showButtonActions', showButtonActions);
provide('closeButtonActions', closeButtonActions);
provide('showTB', showTB);
provide('showPregnancy', showPregnancy);
provide('showAdherence', showAdherence);
provide('showAdverse', showAdverse);
</script>

<style></style>
