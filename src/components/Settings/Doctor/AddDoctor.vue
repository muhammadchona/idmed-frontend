<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="psychology" size="sm" />
          <span class="q-pl-sm text-subtitle2">Clínico</span>
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form @submit.prevent="validateDoctor">
      <q-card-section class="q-px-md">
        <div class="q-mt-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="person_outline" size="sm" />
            <span class="q-pl-sm text-subtitle2">Dados Pessoais</span>
          </div>
          <q-separator color="grey-13" size="1px" />
        </div>

        <div class="q-mt-md">
          <div class="row q-mt-md">
            <q-input
              v-model="doctor.firstnames"
              ref="nomeRef"
              :disable="onlyView"
              outlined
              label="Nome *"
              dense
              class="col"
              :rules="[(val) => !!val || 'Por favor indicar o nome']"
              lazy-rules
            />
            <q-input
              v-model="doctor.lastname"
              class="col q-ml-md"
              ref="apelidoRef"
              :disable="onlyView"
              outlined
              label="Apelido *"
              dense
              :rules="[(val) => !!val || 'Por favor indicar o nome']"
              lazy-rules
            />
          </div>
          <div class="row q-mt-md">
            <q-select
              class="col"
              dense
              outlined
              v-model="doctor.gender"
              :options="genders"
              ref="genderRef"
              :rules="[(val) => val != null || ' Por favor indique o genero']"
              label="Género *"
              :disable="onlyView"
            />
          </div>
          <div class="row q-mt-md">
            <q-select
              class="col"
              dense
              outlined
              v-model="doctor.clinic"
              use-input
              disable
              input-debounce="0"
              :options="clinics"
              option-value="id"
              option-label="clinicName"
              ref="clinicRef"
              :rules="[(val) => val != null || ' Por favor indique a Farmácia']"
              label="Farmácias"
            />
          </div>
        </div>

        <div class="q-mt-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="call" size="sm" />
            <span class="q-pl-sm text-subtitle2">Contacto</span>
          </div>
          <q-separator color="grey-13" size="1px" />
        </div>
        <div class="row q-mt-md">
          <q-input
            v-model="doctor.telephone"
            dense
            label="Principal"
            :disable="onlyView"
            outlined
            class="col"
            ref="phonePrinciparRef"
            maxlength="12"
            type="tel"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="phone_android" />
            </template>
          </q-input>
          <emailInput
            v-model="doctor.email"
            dense
            class="q-ml-md"
            :disable="onlyView"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="$emit('close')" />
        <q-btn
          type="submit"
          :loading="submitting"
          @click.once="submitting = true"
          label="GRAVAR"
          color="primary"
          v-if="!onlyView"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*Imports*/
import Clinic from '../../../stores/models/clinic/Clinic';
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import Doctor from '../../../stores/models/doctor/Doctor';
import doctorService from 'src/services/api/doctorService/doctorService.ts';
import clinicService from 'src/services/api/clinicService/clinicService.ts';

/*Components import*/
import PhoneField from 'src/components/Shared/Input/PhoneField.vue';
import nameInput from 'src/components/Shared/FirstNameInput.vue';
import lastNameInput from 'src/components/Shared/LastNameInput.vue';
import emailInput from 'src/components/Shared/EmailInput.vue';

/*Declarations*/
const stringOptions = ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'];
const submitting = ref(false);
const genders = ref(['Masculino', 'Feminino']);
const nomeRef = ref(null);
const apelidoRef = ref(null);
const clinicRef = ref(null);
const genderRef = ref(null);
const phonePrinciparRef = ref(null);

/*injects*/
const doctor = inject('selectedDoctor');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const showDoctorRegistrationScreen = inject('showDoctorRegistrationScreen');

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

const doctors = computed(() => {
  return doctorService.getAlldoctors();
});

const clinics = computed(() => {
  return clinicService.getAllClinics();
});

/*Methods*/
const validateDoctor = () => {
  nomeRef.value.validate();
  apelidoRef.value.validate();
  genderRef.value.validate();
  clinicRef.value.validate();
  phonePrinciparRef.value.validate();
  if (
    !nomeRef.value.hasError &&
    !apelidoRef.value.hasError &&
    !genderRef.value.hasError &&
    !clinicRef.value.hasError &&
    !phonePrinciparRef.value.hasError
  ) {
    submitDoctor();
  }
};

const submitDoctor = () => {
  submitting.value = true;
  doctor.value.active = true;
  // if (this.mobile) {
  //   if (!this.isEditStep) {
  //     this.doctor.syncStatus = 'R'
  //     Doctor.localDbAdd(JSON.parse(JSON.stringify(this.doctor)))
  //     Doctor.insert({ data: this.doctor })
  //     this.closeDialog()
  //     this.displayAlert('info', !this.isEditStep ? 'Clínico adicionado com sucesso.' : 'Clínico actualizado com sucesso.')
  //   } else {
  //       if (this.doctor.syncStatus !== 'R') this.doctor.syncStatus = 'U'
  //       const doctorUpdate = new Doctor(JSON.parse(JSON.stringify((this.doctor))))
  //       Doctor.localDbUpdate(doctorUpdate)
  //       this.closeDialog()
  //       this.displayAlert('info', !this.isEditStep ? 'Clínico adicionado com sucesso.' : 'Clínico actualizado com sucesso.')
  //   }
  // } else {
  if (isCreateStep.value) {
    if (doctor.value.clinic !== null) {
      doctor.value.clinic_id = doctor.value.clinic.id;
    }
    doctorService
      .post(doctor.value)
      .then((resp) => {
        submitting.value = false;
        showDoctorRegistrationScreen.value = false;
      })
      .catch((error) => {
        submitting.value = false;
        showDoctorRegistrationScreen.value = false;
      });
  }
  if (isEditStep.value) {
    if (doctor.value.clinic !== null) {
      doctor.value.clinic_id = doctor.value.clinic.id;
    }

    doctorService
      .patch(doctor.value.id, doctor.value)
      .then((resp) => {
        submitting.value = false;
        showDoctorRegistrationScreen.value = false;
      })
      .catch((error) => {
        submitting.value = false;
        showDoctorRegistrationScreen.value = false;
      });
  }
  // }
};
</script>

<style></style>
