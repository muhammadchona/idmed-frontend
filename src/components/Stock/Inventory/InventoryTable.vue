<template>
  <div>
    <q-table
      class="col"
      dense
      :rows="inventories"
      :columns="columns"
      :filter="filter"
      row-key="id"
    >
      <template v-slot:top-right>
        <q-input
          outlined
          dense
          style="width: 400px"
          debounce="300"
          v-model="filter"
          placeholder="Pesquisar"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template #header="props">
        <q-tr class="text-left bg-grey-3" :props="props">
          <q-th v-if="false" style="width: 70px">{{ columns[0].label }}</q-th>
          <q-th class="col">{{ columns[1].label }}</q-th>
          <q-th class="text-center">{{ columns[2].label }}</q-th>
          <q-th class="text-center">{{ columns[3].label }}</q-th>
          <q-th class="text-center">{{ columns[4].label }}</q-th>
          <q-th class="text-center">{{ columns[5].label }}</q-th>
        </q-tr>
      </template>
      <template v-slot:no-data="{ icon, filter }">
        <div
          class="full-width row flex-center text-primary q-gutter-sm text-body2"
        >
          <span> Sem resultados para visualizar </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td v-if="false" key="order" :props="props"> </q-td>
          <q-td key="generic" :props="props">
            {{ inventoryMethod.getInventoryType(props.row) }}
          </q-td>
          <q-td key="startDate" :props="props">
            {{ inventoryMethod.getFormatedStartDate(props.row) }}
          </q-td>
          <q-td key="endDate" :props="props">
            {{ inventoryMethod.getFormatedEndDate(props.row) }}
          </q-td>
          <q-td key="open" :props="props">
            <q-chip
              :color="inventoryMethod.getChipColor(props.row)"
              text-color="white"
            >
              {{ inventoryMethod.getInventoryStatus(props.row) }}
            </q-chip>
          </q-td>
          <q-td key="options" :props="props">
            <div class="col">
              <q-btn
                flat
                round
                color="amber-8"
                icon="list_alt"
                @click="openFile(props.row)"
              >
                <q-tooltip class="bg-amber-5">{{
                  props.row.open ? 'Abrir Ficha' : 'Visualizar Ficha'
                }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import Inventory from '../../../stores/models/stockinventory/Inventory';
import { ref, onMounted, computed } from 'vue';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import { useInventory } from 'src/composables/inventory/InvnetoryMethod';
import { useMediaQuery } from '@vueuse/core';
import { useRouter } from 'vue-router';
import clinicService from 'src/services/api/clinicService/clinicService';

const inventoryMethod = useInventory();
const isWebScreen = useMediaQuery('(min-width: 1024px)');
const mobile = computed(() => (isWebScreen.value ? false : true));

const columns = [
  {
    name: 'order',
    required: true,
    label: 'Ordem',
    align: 'left',
    sortable: false,
  },
  {
    name: 'generic',
    align: 'left',
    label: 'Tipo de Inventário',
    sortable: true,
  },
  {
    name: 'startDate',
    align: 'center',
    label: 'Data de Abertura',
    sortable: false,
  },
  { name: 'endDate', align: 'center', label: 'Data de Fecho', sortable: true },
  { name: 'open', align: 'center', label: 'Estado', sortable: true },
  { name: 'options', align: 'center', label: 'Opções', sortable: false },
];
const router = useRouter();
const filter = ref('');

const openFile = (inventory) => {
  if (mobile.value) {
    // Inserir no VueX inventory e InvstockAdj
    Inventory.deleteAll();
    Inventory.localDbGetAll().then((item) => {
      Inventory.insert({
        data: item,
      });
    });
    InventoryStockAdjustment.deleteAll();
    InventoryStockAdjustment.insert({
      data: inventory.adjustments,
    });
  }

  localStorage.setItem('currInventory', inventory.id);
  router.push('/stock/inventory');
};

onMounted(() => {
  if (!mobile.value) {
    InventoryService.apiGetAllByClinicId(clinicService.currClinic().id, 0, 300);
  }
});

const inventories = computed(() => {
  return InventoryService.getInventories();
});
</script>

<style>
</style>
