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
      <div class="col-5 text-grey-9">Gênero</div>
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
        {{ patient.province.description }}
      </div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Distrito</div>
      <div class="col text-grey-10">
        {{ patient.district.description }}
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
    <div class="row q-my-md">
      <q-btn
        unelevated
        color="orange-5"
        label="Editar"
        class="col"
        @click="editPatient()"
      />
    </div>
    <div class="row">
      <q-btn unelevated color="primary" label="Unir Duplicados" class="col" />
    </div>
    <q-dialog persistent v-model="showPatientRegister">
      <patientRegister
        :pa="patient"
        :clinic="clinic"
        :stepp="step"
        @close="showPatientRegister = false"
      />
    </q-dialog>
    <span></span>
  </div>
</template>

<script setup>
import { usePatient } from 'src/composables/patient/patientMethods';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
// import patientRegister from 'src/components/Patient/Register/PatientRegister.vue';
import { computed, inject, onMounted, ref } from 'vue';
import patientService from 'src/services/api/patientService/patientService';

// Declaration
const { postoAdministrativoName, bairroName, fullName } = usePatient();
const { idadeCalculator, getDDMMYYYFromJSDate } = useDateUtils();
const { website, isDeskTop, isMobile } = useSystemUtils();
const showPatientRegister = ref(false);

//Injection
const clinic = inject('clinic');
const patient = inject('patient');

// Hooks

onMounted(() => {
  init();
});

// Methods

const init = () => {
  //changeToDisplayStep();
  // if (isMobile) {
  //   Province.localDbGetAll().then((idTypes) => {
  //     Province.insertOrUpdate({ data: idTypes });
  //   });
  // }
  if (patient.value === null) {
    patient.value = patientService.getPatientByID(
      localStorage.getItem('patientuuid')
    );
  }
};
const editPatient = () => {
  //changeToEditStep();
  showPatientRegister.value = true;
};
</script>

<style lang="scss">
.profile {
  border: 1px solid $grey-4;
  border-radius: 10px;
}
</style>
