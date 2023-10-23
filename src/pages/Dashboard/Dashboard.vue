<template>
  <div>
    <Charts />
  </div>
</template>

<script setup>
import { ref, onMounted, provide, computed } from 'vue';
import clinicServiceService from 'src/services/api/clinicService/clinicService.ts';

/*Variables*/
const dataLoaded = ref(false);

/*Components im port*/
import Charts from 'src/components/Dashboard/ApexCharts/Charts.vue';

/*Hooks*/
onMounted(() => {
  dataLoaded.value = true;
});
const currClinic = computed(() => {
  return clinicServiceService.currClinic();
});

/*provides*/
provide('dataLoaded', dataLoaded);
provide('currClinic', currClinic);
</script>

<style></style>
