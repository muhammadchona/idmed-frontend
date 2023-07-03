<template>
  <div>
    <Index />
  </div>
</template>

<script setup>

import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';

import { onMounted } from 'vue';
import StockCenterService from 'src/services/api/stockCenterService/StockCenterService';
import StockService from 'src/services/api/stockService/StockService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';

import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';

import Index from 'src/components/Stock/Index.vue';
import InventoryService from 'src/services/api/inventoryService/InventoryService';


const init = () => {
  // copoia o stock do localbase para o VueX
 
    const offset = 0;
    StockCenterService.get(offset);
    StockService.get(offset);
    StockOperationTypeService.get(offset);
    ReferedStockMovimentService.get(offset);

    DestroyedStockService.get(offset);
    //  DrugSe.apiGetAll(offset, max)
    getAllStockOfClinic();
    InventoryStockAdjustmentService.get(offset);
    // packagedDrugStockService.get(offset)
    InventoryService.get(offset);
    StockEntranceService.get(offset);
  
};

const getAllStockOfClinic = () => {
  const offset = 0;
  const max = 100;
  //  doStockEntranceGet(clinic.value.id, offset, max)
};

const doStockEntranceGet = (clinicId, offset, max) => {
  StockEntranceService.apiGetAllByClinicId(clinicId, offset, max)
    .then((resp) => {
      console.log(resp.response.data);
      if (resp.response.data.length > 0) {
        offset = offset + max;
        setTimeout(doStockEntranceGet(clinicId, offset, max), 2);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

onMounted(() => {
  init();
});

setTimeout(() => {
  // this.$q.loading.hide()
}, 600);
</script>

<style></style>
