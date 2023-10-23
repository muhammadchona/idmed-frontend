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
            :rules="[(val) => codeRules(val)]"
            ref="phonePrinciparRef"
            maxlength="12"
            type="tel"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="phone_android" />
            </template>
          </q-input>
          <q-input
            outlined
            v-model="doctor.email"
            dense
            class="col q-ml-md"
            :disable="onlyView"
            label="Email"
            ref="emailRef"
            :rules="[(val) => isValidEmail(val)]"
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
import { ref, inject, computed } from 'vue';
import doctorService from 'src/services/api/doctorService/doctorService.ts';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { alertSucess, alertError } = useSwal();

/*Declarations*/
const { closeLoading, showloading } = useLoading();
const submitting = ref(false);
const genders = ref(['Masculino', 'Feminino']);
const nomeRef = ref(null);
const apelidoRef = ref(null);
const clinicRef = ref(null);
const genderRef = ref(null);
const phonePrinciparRef = ref(null);
const emailRef = ref(null);

/*injects*/
const doctor = inject('selectedDoctor');
const viewMode = inject('viewMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const showDoctorRegistrationScreen = inject('showDoctorRegistrationScreen');

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

const clinics = computed(() => {
  return clinicService.getAllClinics();
});

/*Methods*/
const isValidEmail = (val) => {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  if (val !== null && val !== undefined) {
    if (!emailPattern.test(val)) return 'Email Invalido';
  }
};

const validateDoctor = () => {
  nomeRef.value.validate();
  apelidoRef.value.validate();
  genderRef.value.validate();
  clinicRef.value.validate();
  phonePrinciparRef.value.validate();
  emailRef.value.validate();
  if (
    !nomeRef.value.hasError &&
    !apelidoRef.value.hasError &&
    !genderRef.value.hasError &&
    !clinicRef.value.hasError &&
    !phonePrinciparRef.value.hasError &&
    !emailRef.value.hasError
  ) {
    submitDoctor();
  } else {
    submitting.value = false;
  }
};

const codeRules = (val) => {
  if (val !== null && val !== undefined) {
    if (val.length < 9) {
      return 'O  contacto  deve ter no mínimo 3 caracteres';
    }
  }
};

const submitDoctor = () => {
  showloading();
  submitting.value = true;
  doctor.value.active = true;
  if (isCreateStep.value) {
    if (doctor.value.clinic !== null) {
      doctor.value.clinic_id = doctor.value.clinic.id;
    }
    doctorService
      .post(doctor.value)
      .then(() => {
        closeLoading();
        alertSucess('Clínico registado com sucesso');
        submitting.value = false;
        showDoctorRegistrationScreen.value = false;
      })
      .catch((error) => {
        console.log(error);
        alertError(
          'Aconteceu um erro inesperado ao registar o Sector Clínico.'
        );
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
      .then(() => {
        closeLoading();
        alertSucess('Clínico actualizado com sucesso.');
        submitting.value = false;
        showDoctorRegistrationScreen.value = false;
      })
      .catch((error) => {
        console.log(error);
        alertError('Aconteceu um erro inesperado ao actualizar o Clínico.');
        submitting.value = false;
        showDoctorRegistrationScreen.value = false;
      });
  }
  // }
};
</script>

<style></style>
