<template>
  <div class="row q-mb-sm">
    <div class="col">
      <div class="row q-ml-lg">
        <div class="col-3 q-mt-sm">
          <q-btn
            outline
            round
            color="primary"
            size="xl"
            :icon="patient.gender == 'Feminino' ? 'female' : 'male'"
            @click="showPatientDetails"
          />
        </div>
        <div class="col q-pt-md">
          <div class="row q-mb-sm text-weight-bold text-h6 text-orange-7">
            {{ fullName(patient) }}
          </div>
          <div class="row text-subtitle2 text-grey-9">
            NID:
            <span class="text-subtitle2 text-primary">{{
              preferedIdentifierValue(patient)
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-5 text-center">
      <div class="q-mt-md q-pt-md text-subtitle1 text-grey-14">
        <slot>
          {{ title }}
        </slot>
      </div>
    </div>
    <div class="col"></div>
  </div>
</template>

<script setup>
import { usePatient } from 'src/composables/patient/patientMethods';
import { inject } from 'vue';

//Declaration
const { preferedIdentifierValue, fullName } = usePatient();
const patient = inject('patient');
const showPatientDetails = inject('showPatientDetails');
const title = inject('title');
</script>

<style></style>
