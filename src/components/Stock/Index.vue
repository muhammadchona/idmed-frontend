<template>
  <div>
    <TitleBar>Gestão de Stock</TitleBar>
    <div class="q-px-xl q-mx-xl q-mt-md">
      <q-tabs v-model="tab" align="left" dense inline-label class="">
        <q-tab name="stock" label="Stock" />
        <q-tab name="entrance" label="Entrada" />
        <q-tab name="inventory" label="Inventário" />
      </q-tabs>
      <q-separator color="grey-13" size="1px" />
      <div class="q-mt-md">
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="stock">
            <StockTable :isCharts="false" />
          </q-tab-panel>
          <q-tab-panel name="entrance">
            <EntranceTable />
          </q-tab-panel>
          <q-tab-panel name="inventory">
            <InventoryTable />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <q-page-sticky
      v-if="tab !== 'stock'"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        class="q-mb-xl q-mr-xl"
        fab
        color="primary"
        icon="add"
        @click="add"
      />
    </q-page-sticky>
    <q-dialog persistent v-model="createEntrance">
      <EntranceRegister
        :createEntrance="createEntrance"
        @close="createEntrance = false"
      />
    </q-dialog>
    <q-dialog persistent v-model="createInventory">
      <InventoryRegister
        :createInventory="createInventory"
        @close="createInventory = false"
      />
    </q-dialog>
    <q-dialog v-model="alert.visible" persistent>
      <Dialog
        :type="alert.type"
        @closeDialog="closeDialog"
        @commitOperation="closeInventory"
      >
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import StockEntranceMethod from 'src/methods/stockEntrance/StockEntranceMethod';

import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

// Components
import Dialog from 'components/Shared/Dialog/Dialog.vue';
import TitleBar from 'components/Shared/TitleBar.vue';
import StockTable from 'components/Stock/StockTable.vue';
import EntranceRegister from 'components/Stock/Entrance/EntranceRegister.vue';
import EntranceTable from 'components/Stock/Entrance/EntranceTable.vue';
import InventoryTable from 'components/Stock/Inventory/InventoryTable.vue';
import InventoryRegister from 'components/Stock/Inventory/InventoryRegister.vue';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import clinicService from 'src/services/api/clinicService/clinicService';
import drugService from 'src/services/api/drugService/drugService';

const { closeLoading, showloading } = useLoading();
const { alertError } = useSwal();

provide('isCharts', false);

const alert = ref({
  type: '',
  visible: false,
  msg: '',
});
const tab = ref('stock');
const createEntrance = ref(false);
const createInventory = ref(false);

const add = () => {
  if (tab.value === 'entrance') {
    createEntrance.value = true;
  } else {
    const inventory = InventoryService.getOpenInventory();
    if (inventory !== null) {
      alertError(
        'error',
        'Existe registado um inventário ainda aberto, por favor termine o mesmo antes de iniciar um novo inventário.'
      );
    } else {
      createInventory.value = true;
    }
  }
  //
};

const getAllStockOfClinic = () => {
  const offset = 0;
  doStockEntranceGet(clinic.value.id, offset);
};

const doStockEntranceGet = (clinicId, offset) => {
  if (mobile.value) {
    StockEntranceService.apiGetAllByClinicId(clinicId, offset)
      .then((resp) => {
        console.log(resp.response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    rowData = StockEntranceMethod.localDbGetAll();
  }
};
const clinic = computed(() => {
  return clinicService.currClinic();
});
const activeDrugs = computed(() => {
  return drugService.getActiveDrugs();
});
provide('currClinic', clinic);
provide('activeDrugs', activeDrugs);
</script>

<style>
</style>
