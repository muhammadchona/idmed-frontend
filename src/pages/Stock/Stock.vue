<template>
  <div>
    <Index />
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, provide } from 'vue';

import Index from 'src/components/Stock/Index.vue';

import StockAlertService from 'src/services/api/stockAlertService/StockAlertService';
import clinicService from 'src/services/api/clinicService/clinicService';
import StockService from 'src/services/api/stockService/StockService';

import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';

import InventoryService from 'src/services/api/inventoryService/InventoryService';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import StockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import StockDistributorBatchService from 'src/services/api/stockDistributorBatchService/StockDistributorBatchService';
import DrugDistributorService from 'src/services/api/drugDistributorService/DrugDistributorService';
import stockLevelService from 'src/services/api/stockLevelService/stockLevelService';

const isExecutedStockAlert = ref(false);
const isExecutedInventory = ref(false);
const isExecutedEntrance = ref(false);
const isExecutedDistributor = ref(false);

onMounted(() => {
  const clinic = clinicService.currClinic();
  StockAlertService.apiGetStockAlertAll(clinic.id).then(() => {
    isExecutedStockAlert.value = true;
  });
  StockDistributorBatchService.get(0);
  DrugDistributorService.get(0);
  StockDistributorService.get(0).then(() => {
    isExecutedDistributor.value = true;
  });
  StockService.getStockDistributorWeb(clinic.id, 0);
  StockService.get(0, clinic.id);
  stockLevelService.get(0);

  ReferedStockMovimentService.getAllByClinic(clinic.id, 0);
  DestroyedStockService.getAllByClinic(clinic.id, 0);
  InventoryStockAdjustmentService.getAllByClinic(clinic.id, 0);
  InventoryService.getAllByClinic(clinic.id, 0).then(() => {
    isExecutedInventory.value = true;
  });
  StockEntranceService.apiGetAllByClinicId(clinic.id, 0, 100).then(() => {
    isExecutedEntrance.value = true;
  });
});
provide('isExecutedStockAlert', isExecutedStockAlert);
provide('isExecutedInventory', isExecutedInventory);
provide('isExecutedEntrance', isExecutedEntrance);
provide('isExecutedDistributor', isExecutedDistributor);
</script>

<style></style>
