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
          <div class="row">
            <nameInput
              v-model="doctor.firstnames"
              ref="nome"
              :disable="onlyView"
            />
            <lastNameInput
              v-model="doctor.lastname"
              class="q-ml-md"
              ref="apelido"
              :disable="onlyView"
            />
          </div>
          <div class="row q-mt-md">
            <q-select
              class="col"
              dense
              outlined
              v-model="doctor.gender"
              :options="genders"
              ref="gender"
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
              ref="clinic"
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
          <PhoneField
            v-model="doctor.telephone"
            dense
            label="Principal"
            :disable="onlyView"
          />
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
          label="Submeter"
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

/*injects*/
const selectedDoctor = inject('selectedDoctor');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const showDoctorRegistrationScreen = inject('showDoctorRegistrationScreen');

/*Hooks*/
const doctor = computed(() => {
  return selectedDoctor.value;
});

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
  //     this.$refs.nome.$refs.ref.validate()
  //     this.$refs.apelido.$refs.ref.validate()
  //   this.$refs.gender.validate()
  //     this.$refs.clinic.validate()
  // if (!this.$refs.nome.$refs.ref.hasError && !this.$refs.apelido.$refs.ref.hasError && !this.$refs.gender.hasError && !this.$refs.clinic.hasError) {
  submitDoctor();
  // }
};

const submitDoctor = () => {
  submitting.value = true;
  doctor.value.active = true;
  // if (this.mobile) {
  //   console.log('Mobile')
  //   if (!this.isEditStep) {
  //     console.log('Create')
  //     this.doctor.syncStatus = 'R'
  //     console.log(this.doctor)
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
    console.log('Create Step_Online_Mode');
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
  if (isEditStep) {
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
