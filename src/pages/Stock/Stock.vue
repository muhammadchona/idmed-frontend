<template>
  <div>
    <Index />
  </div>
</template>

<script setup>


import { onBeforeMount, onMounted } from 'vue';

import Index from 'src/components/Stock/Index.vue';

import StockAlertService from 'src/services/api/stockAlertService/StockAlertService';
import clinicService from 'src/services/api/clinicService/clinicService';
import StockService from 'src/services/api/stockService/StockService';

import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';

import InventoryService from 'src/services/api/inventoryService/InventoryService';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';


onMounted(() => {
  const clinic = clinicService.currClinic()
  StockAlertService.apiGetStockAlertAll( clinic.id)
});

onBeforeMount(() => {
   StockService.get(0);
    ReferedStockMovimentService.get(0);
     DestroyedStockService.get(0);
    StockEntranceService.get(0)
    InventoryStockAdjustmentService.get(0);
    InventoryService.get(0);
    StockEntranceService.get(0);
})


</script>

<style></style>
