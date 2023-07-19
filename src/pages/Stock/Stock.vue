<template>
  <div>
    <Index />
  </div>
</template>

<script setup>


import { onMounted } from 'vue';

import Index from 'src/components/Stock/Index.vue';

import StockAlertService from 'src/services/api/stockAlertService/StockAlertService';
import clinicService from 'src/services/api/clinicService/clinicService';



onMounted(() => {
  const clinic = clinicService.currClinic()
  StockAlertService.apiGetStockAlertAll( clinic.id)
});


</script>

<style></style>
