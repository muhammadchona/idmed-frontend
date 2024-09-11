<template>
  <div>
    <ListHeader
      :addVisible="
        (isProvincialInstalation() &&
          isProvincialInstalationMobileClinic() &&
          !isProvincialInstalationPharmacysMode()) ||
        isLocalInstalation()
      "
      :mainContainer="true"
      bgColor="bg-primary"
      :addButtonActions="addClinicService"
    >
      Serviços de Saúde da Farmácia
    </ListHeader>
    <EmptyList v-if="patient.identifiers.length <= 0" />
    <div v-show="serviceInfoVisible">
      <span>
        <InfoContainer
          v-for="identifier in patient.identifiers"
          :key="identifier.id"
          :identifierId="identifier.id"
          :serviceId="identifier.service.id"
        />
      </span>
    </div>
    <q-dialog persistent v-model="showAddEditClinicalService">
      <AddClinicService />
    </q-dialog>
  </div>
</template>

<script setup>
import AddClinicService from 'components/Patient/PatientPanel/AddClinicService.vue';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import { provide, inject, ref, computed, onMounted } from 'vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
// import AddEditEpisode from 'components/Patient/PatientPanel/AddEditEpisode.vue';
import InfoContainer from 'components/Patient/PatientPanel/InfoContainer.vue';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import { usePatient } from 'src/composables/patient/patientMethods';
import { usePatientServiceIdentifier } from 'src/composables/patient/patientServiceIdentifierMethods';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

// Declaration
const { preferedIdentifier } = usePatient();
const {
  isProvincialInstalation,
  isProvincialInstalationPharmacysMode,
  isProvincialInstalationMobileClinic,
  isPharmacyDDDOrAPEOrDCP,
  isLocalInstalation,
} = useSystemConfig();
const { canBeEdited } = usePatientServiceIdentifier();
const emptyList = ref(false);
const selectedIdentifier = ref(new PatientServiceIdentifier());
const showAddEditEpisode = ref(false);
const serviceInfoVisible = ref(true);
const addVisible = ref(true);
const mainContainer = ref(true);
const bgColor = ref('bg-primary');
const title = ref('Serviços de Saúde da Farmácia');
const titleEmptyList = ref('Nenhum Serviço de Saúde Adicionado');
const showAddEditClinicalService = ref(false);

const isEditStep = ref(false);
const isCreateStep = ref(false);
const isCloseStep = ref(false);
const isReOpenStep = ref(false);

// Injection
const patient = inject('patient');

//Computed
const currIdentifier = computed(() => {
  if (preferedIdentifier(patient.value) !== null) {
    return patientServiceIdentifierService.identifierCurr(
      preferedIdentifier(patient.value).id,
      preferedIdentifier(patient.value).service_id
    );
  } else {
    return [];
  }
});

//Hook
onMounted(() => {
  console.log(isProvincialInstalation());
  console.log(isProvincialInstalationMobileClinic());
  /*
  console.log(isProvincialInstalation());
  console.log(isProvincialInstalationPharmacysMode());
  console.log(isProvincialInstalationMobileClinic());
  console.log(
    !isProvincialInstalation() || !isProvincialInstalationPharmacysMode()
  );
  */
});

//Method
const addClinicService = () => {
  selectedIdentifier.value = null;
  isCreateStep.value = true;
  isEditStep.value = false;
  isCloseStep.value = false;
  isReOpenStep.value = false;
  showAddEditClinicalService.value = true;
};
const close = () => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCloseStep.value = false;
  isReOpenStep.value = false;
  showAddEditClinicalService.value = false;
};

provide('showAddEditClinicalService', showAddEditClinicalService);
provide('isEditStep', isEditStep);
provide('isCreateStep', isCreateStep);
provide('isCloseStep', isCloseStep);
provide('isReOpenStep', isReOpenStep);
provide('addVisible', addVisible);
provide('mainContainer', mainContainer);
provide('bgColor', bgColor);
provide('titleEmptyList', titleEmptyList);
provide('title', title);
provide('curIdentifier', currIdentifier);
provide('close', close);
</script>

<style></style>
