<template>
  <div>
    <search />
  </div>
</template>

<script setup>
import { computed, onMounted, provide, reactive, ref } from 'vue';
import clinicService from 'src/services/api/clinicService/clinicService';
import search from 'components/Patient/Search.vue';
import Patient from 'src/stores/models/patient/Patient';
import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService';
import { useLoading } from 'src/composables/shared/loading/loading';

const { showloading, closeLoading } = useLoading();
const currPatient = reactive(ref(new Patient()));

onMounted(() => {
  showloading();
  saveDefaultHIS();
});

const clinic = computed(() => {
  return clinicService.currClinic();
});

const dataSources = computed(() => {
  return healthInformationSystemService.getAllActive();
});

const saveDefaultHIS = () => {
  const defaultHIS = {
    id: '-1',
    abbreviation: 'iDMED',
    description: 'iDMED',
    active: true,
  };
  healthInformationSystemService.localSave(defaultHIS);
  closeLoading();
};

provide('clinic', clinic);
provide('dataSources', dataSources);
provide('currPatient', currPatient);
</script>

<style></style>
