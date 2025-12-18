<template>
  <div>
    <div class="text-center q-mb-md">
      <q-icon
        class="profile"
        :name="patient.gender == 'Feminino' ? 'female' : 'male'"
        size="120px"
        color="primary"
      />
    </div>
    <div class="">
      <div class="row items-center q-mb-sm">
        <q-icon name="person_outline" size="sm" />
        <span class="q-pl-sm text-subtitle2">Dados Pessoais</span>
      </div>
      <q-separator color="grey-13" size="1px" class="q-mb-sm" />
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Nome</div>
      <div class="col text-grey-10">{{ fullName(patient) }}</div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Idade</div>
      <div class="col text-grey-10">
        {{ idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) }}
        Anos
      </div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Sexo</div>
      <div class="col text-grey-10">{{ patient.gender }}</div>
    </div>

    <div class="q-mt-md">
      <div class="row items-center q-mb-sm">
        <q-icon name="house" size="sm" />
        <span class="q-pl-sm text-subtitle2">Endereço</span>
      </div>
      <q-separator color="grey-13" size="1px" class="q-mb-sm" />
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Província</div>
      <div class="col text-grey-10">
        {{
          patient.province !== null && patient.province !== undefined
            ? patient.province.description
            : ''
        }}
      </div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Distrito</div>
      <div class="col text-grey-10">
        {{
          patient.district !== null && patient.district !== undefined
            ? patient.district.description
            : ''
        }}
      </div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Posto Administrativo</div>
      <div class="col text-grey-10">
        {{ postoAdministrativoName(patient) }}
      </div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Bairro</div>
      <div class="col text-grey-10">{{ bairroName(patient) }}</div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Local Referência</div>
      <div class="col text-grey-10">{{ patient.addressReference }}</div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Morada</div>
      <div class="col text-grey-10">{{ patient.address }}</div>
    </div>

    <div class="q-mt-md">
      <div class="row items-center q-mb-sm">
        <q-icon name="call" size="sm" />
        <span class="q-pl-sm text-subtitle2">Contacto</span>
      </div>
      <q-separator color="grey-13" size="1px" class="q-mb-sm" />
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Principal</div>
      <div class="col text-grey-10">{{ patient.cellphone }}</div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Alternativo</div>
      <div class="col text-grey-10">
        {{ patient.alternativeCellphone }}
      </div>
    </div>
    <div class="row q-my-md" v-if="!isProvincialInstalation()">
      <q-btn
        unelevated
        color="orange-5"
        label="Editar"
        class="col"
        :disable="isEditDisabled"
        @click="editPatient"
      />
    </div>
    <div class="row q-my-md" v-if="!isProvincialInstalation()">
      <q-btn
        unelevated
        color="primary"
        label="Unir Duplicados"
        class="col"
        :disable="!canUniteDup"
        @click="mergeDuplicatePatient"
      />
    </div>
    <div class="row q-my-md" v-if="!isProvincialInstalation()">
      <q-btn
        unelevated
        color="blue"
        label="Imprimir Etiqueta"
        class="col"
        @click="generateBarcode"
        :loading="submitting"
      />
    </div>

    <q-dialog persistent v-model="showPatientRegister">
      <patientRegister />
    </q-dialog>
    <q-dialog persistent v-model="showMergeDuplicates">
      <mergeDuplicates />
    </q-dialog>
    <span></span>
  </div>
</template>

<script setup>
import { usePatient } from 'src/composables/patient/patientMethods';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import patientRegister from 'src/components/Patient/Register/PatientRegister.vue';
import mergeDuplicates from 'src/components/Patient/PatientPanel/MergeDuplicatePatients.vue';
import {
  inject,
  onMounted,
  provide,
  ref,
  computed,
  reactive,
  onBeforeUnmount,
} from 'vue';
import patientService from 'src/services/api/patientService/patientService';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService';
import PermissionService from 'src/services/api/user/PermissionService';
import BarcodeLabelPrint from '../../../services/reports/Patients/BarcodeLabelPrint';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
// Declaration
const {
  postoAdministrativoName,
  bairroName,
  fullName,
  hasNoObitOrTransferedForEpisode,
} = usePatient();
const { idadeCalculator, getDDMMYYYFromJSDate } = useDateUtils();
const { isProvincialInstalation } = useSystemConfig();
const { isOnline } = useSystemUtils();
const showPatientRegister = ref(false);
const showMergeDuplicates = ref(false);
const newPatient = ref(false);
const openMrsPatient = ref(false);
const submitting = ref(false);
//Injection
const patient = inject('patient');

// Hooks

onMounted(() => {
  init();
});

// Methods

const init = () => {
  if (patient.value === null) {
    patient.value = patientService.getPatientByID(
      localStorage.getItem('patientuuid')
    );
  }
};

const canUniteDup = computed(() => {
  if (isOnline.value) {
    return PermissionService.canPerformUiAction('patient', 'unitDuplicates');
  } else {
    return true;
  }
});

const editPatient = () => {
  showPatientRegister.value = true;
  newPatient.value = false;
};

const closePatient = () => {
  showPatientRegister.value = false;
  newPatient.value = false;
};

const closeDuplicates = () => {
  showMergeDuplicates.value = false;
};

const mergeDuplicatePatient = () => {
  showMergeDuplicates.value = true;
};

const closeMergePatient = () => {
  showMergeDuplicates.value = false;
  newPatient.value = false;
};

// Computed
const dataSources = computed(() => {
  return healthInformationSystemService.getAllActive();
});
const canEditPatient = computed(() => {
  return PermissionService.canPerformUiAction('patient', 'edit');
});

const patientHasObitOrTransferred = computed(() => {
  return patient.value ? hasNoObitOrTransferedForEpisode(patient.value) : false;
});

const isEditDisabled = computed(() => {
  if (canEditPatient.value && patientHasObitOrTransferred.value) {
    return false;
  } else {
    if (canEditPatient.value && !patientHasObitOrTransferred.value) {
      return true;
    }
  }
});
const generateBarcode = async () => {
  submitting.value = true;
  try {
    const psi =
      patientServiceIdentifierService.getPreferredIdentifierByPatientId(
        patient.value.id
      );

    const provinceStr = patient.value.province.description
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Call the barcode service method
    await BarcodeLabelPrint.downloadPDF(
      psi.value,
      provinceStr,
      patient.value.district.description,
      psi.clinic.clinicName,
      submitting
    );
  } catch (error) {
    console.error('Error generating barcode label:', error);
  }
};

provide('newPatient', newPatient);
provide('closePatient', closePatient);
provide('closeDuplicates', closeDuplicates);
provide('patient', patient);
provide('openMrsPatient', openMrsPatient);
provide('showPatientRegister', showPatientRegister);
provide('closeMergePatient', closeMergePatient);
provide('dataSources', dataSources);
</script>

<style lang="scss">
.profile {
  border: 1px solid $grey-4;
  border-radius: 10px;
}
</style>
