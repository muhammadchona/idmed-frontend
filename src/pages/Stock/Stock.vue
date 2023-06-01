<template>
  <div>
    <Index />
  </div>
</template>

<script setup>
import Clinic from 'src/stores/models/clinic/Clinic';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import StockCenter from 'src/stores/models/stockcenter/StockCenter';
import Stock from 'src/stores/models/stock/Stock';
import StockOperationType from 'src/stores/models/stockoperation/StockOperationType';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';
import Inventory from 'src/stores/models/stockinventory/Inventory';

import { onMounted, computed } from 'vue';
import StockCenterService from 'src/services/api/stockCenterService/StockCenterService';
import StockService from 'src/services/api/stockService/StockService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';

import { useMediaQuery } from '@vueuse/core';
import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';

import Index from 'src/components/Stock/Index.vue';
import InventoryService from 'src/services/api/inventoryService/InventoryService';

const isWebScreen = useMediaQuery('(min-width: 1024px)');
const mobile = computed(() => (isWebScreen.value ? false : true));

const init = () => {
  // copoia o stock do localbase para o VueX
  if (mobile.value) {
    Stock.localDbGetAll().then((stocks) => {
      stocks.forEach((item) => {
        Stock.delete(item.id);
        Stock.insert({
          data: item,
        });
      });
    });
    Inventory.localDbGetAll().then((inventories) => {
      inventories.forEach((item) => {
        Inventory.delete(item.id);
        Inventory.insert({
          data: item,
        });
      });
    });

    StockEntrance.localDbGetAll()
      .then((stockEntrances) => {
        stockEntrances.forEach((item) => {
          StockEntrance.delete(item.id);
          StockEntrance.insert({
            data: item,
          });
        });
      })
      .then((item) => {
        Clinic.insert({
          data: SessionStorage.getItem('currClinic'),
        });
      });

    StockCenter.localDbGetAll().then((stockCenters) => {
      stockCenters.forEach((item) => {
        StockCenter.update({ where: item.id, data: item });
      });
    });
    StockOperationType.localDbGetAll().then((stockOperationTypes) => {
      stockOperationTypes.forEach((item) => {
        StockOperationType.update({ where: item.id, data: item });
      });
    });
    Drug.localDbGetAll().then((drugs) => {
      drugs.forEach((drug) => {
        Drug.update({ where: drug.id, data: drug });
      });
    });
  } else {
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
  }
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

<style>
</style>
