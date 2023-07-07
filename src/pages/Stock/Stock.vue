<template>
  <div>
    <Index />
  </div>
</template>

<script setup>


import { onMounted } from 'vue';
import StockCenterService from 'src/services/api/stockCenterService/StockCenterService';
import StockService from 'src/services/api/stockService/StockService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';

import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';

import Index from 'src/components/Stock/Index.vue';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';


const { isMobile, isOnline } = useSystemUtils(); 


const init = () => {
  // copoia o stock do localbase para o VueX
 if (isOnline.value) {
    const offset = 0;
    StockCenterService.get(offset);
    StockService.get(offset);
    StockOperationTypeService.get(offset);
    ReferedStockMovimentService.get(offset);
    DestroyedStockService.get(offset);
    StockEntranceService.get(offset)
    InventoryStockAdjustmentService.get(offset);
    InventoryService.get(offset);
    StockEntranceService.get(offset);
 }  
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
