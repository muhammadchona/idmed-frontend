<template>
  <div>
    <q-table
      class="col"
      dense
      :rows="inventories"
      :columns="columns"
      :filter="filter"
      row-key="id"
      :loading="loading"
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
            {{ inventoryMethod.getformatedUTCDate(props.row) }}
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
                :loading="submitting"
                flat
                round
                color="amber-8"
                icon="list_alt"
                @click="
                  submitting = true;
                  openFile(props.row);
                "
              >
                <q-tooltip class="bg-amber-5">{{
                  props.row.open ? 'Abrir Inventário' : 'Visualizar Inventário'
                }}</q-tooltip>
              </q-btn>
              <q-btn
                :loading="submittingDetails"
                flat
                round
                color="primary"
                icon="search"
                @click="
                  submittingDetails = true;
                  showInventoryDetails(props.row);
                "
              >
                <q-tooltip class="bg-primary">
                  Visualizar Medicamentos
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>
  </div>

  <q-dialog persistent v-model="showDrugsDetails">
    <inventoryDetails
      @close="
        showDrugsDetails = false;
        submittingDetails = false;
      "
    />
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, provide } from 'vue';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import { useInventory } from 'src/composables/inventory/InvnetoryMethod';
import { useRouter } from 'vue-router';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import inventoryDetails from 'components/Stock/Inventory/InventoryDetails.vue';
import { useInventoryStockAdjustment } from 'src/composables/stockAdjustment/InventoryStockAdjustmentMethod';

const inventoryDetailsMethod = useInventoryStockAdjustment();

const submitting = ref(false);
const submittingDetails = ref(false);
const inventoryMethod = useInventory();
const { isMobile, isOnline } = useSystemUtils();
const { showloading, closeLoading } = useLoading();
const loading = ref(true);

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
const showDrugsDetails = ref(false);
const inventoryDetail = ref(null);

const openFile = (inventory) => {
  showloading();
  localStorage.setItem('currInventory', inventory.id);
  router.push('/stock/inventory');
};

/*Methods*/
const showInventoryDetails = (inventory) => {
  // showloading();
  inventoryDetail.value = inventory;
  // localStorage.setItem('currInventoryDetails', inventory);
  // const lista = inventoryDetailsMethod.getInventoryDetailsById(inventory);
  // console.log('Lista: ', lista);
  // clinic.value = clinicParam;
  // viewMode.value = true;
  // editMode.value = false;
  showDrugsDetails.value = true;
  //closeLoading();
};

onMounted(() => {
  if (isOnline.value) {
    InventoryService.apiGetAllByClinicId(clinicService.currClinic().id, 0, 300);
  }
});

const inventories = computed(() => {
  const list = InventoryService.getInventories();
  if (list.length >= 0) {
    loading.value = false;
  }
  return list;
});

provide('inventoryDetail', inventoryDetail);
</script>

<style></style>
