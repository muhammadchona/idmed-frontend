<template>
  <div>Logout</div>
</template>
<script>
import { SessionStorage } from 'quasar';
import UsersService from 'src/services/UsersService';
import StockService from 'src/services/api/stockService/StockService';
import StockReferenceAdjustmentService from 'src/services/api/stockAdjustment/StockReferenceAdjustmentService';
import StockDestructionAdjustmentService from 'src/services/api/stockAdjustment/StockDestructionAdjustmentService';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';

export default {
  data() {
    return {};
  },
  created: function () {
    UsersService.logout();
    StockService.deleteAllFromStorage();
    StockReferenceAdjustmentService.deleteAllFromStorage();
    StockDestructionAdjustmentService.deleteAllFromStorage();
    InventoryStockAdjustmentService.deleteAllFromStorage();
    InventoryService.deleteAllFromStorage();
    SessionStorage.clear();
    sessionStorage.setItem('user', null);
    sessionStorage.setItem('id_token', null);
    sessionStorage.setItem('refresh_token', null);
    localStorage.setItem('activeTabStock', '');
    sessionStorage.setItem('Btoa', '');
    localStorage.setItem('currInventory', '');
    this.$router.push({ path: '/Login' });
  },
};
</script>
