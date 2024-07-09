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
import StockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import StockDistributorBatchService from 'src/services/api/stockDistributorBatchService/StockDistributorBatchService';
import DrugDistributorService from 'src/services/api/drugDistributorService/DrugDistributorService';

onMounted(() => {
  const clinic = clinicService.currClinic();
  StockAlertService.apiGetStockAlertAll(clinic.id);

  StockDistributorBatchService.get(0);
  DrugDistributorService.get(0);
  StockDistributorService.get(0);
  StockService.get(0, clinic.id);

  ReferedStockMovimentService.getAllByClinic(clinic.id, 0);
  DestroyedStockService.getAllByClinic(clinic.id, 0);
  InventoryStockAdjustmentService.getAllByClinic(clinic.id, 0);
  InventoryService.getAllByClinic(clinic.id, 0);
  StockEntranceService.apiGetAllByClinicId(clinic.id, 0, 100);
});
</script>

<style></style>
