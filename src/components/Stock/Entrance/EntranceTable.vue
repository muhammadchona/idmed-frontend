<template>
  <div>
    <q-table
      class="col"
      dense
      :rows="stockEntrances"
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
          placeholder="Pesquisar pela guia"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template #header="props">
        <q-tr class="text-left bg-grey-3" :props="props">
          <q-th v-if="false" style="width: 100px">{{ columns[0].label }}</q-th>
          <q-th class="col">{{ columns[1].label }}</q-th>
          <q-th class="text-center">{{ columns[2].label }}</q-th>
          <q-th class="text-center">{{ columns[3].label }}</q-th>
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
          <q-td key="orderNumber" :props="props">
            {{ props.row.orderNumber }}
          </q-td>
          <q-td key="dateReceived" :props="props">
            {{ formatDate(props.row.dateReceived) }}
          </q-td>
          <q-td key="options" :props="props">
            <div class="col">
              <q-btn
                flat
                round
                color="amber-8"
                icon="reorder"
                @click="editStockEntrance(props.row)"
              >
                <q-tooltip class="bg-amber-5">Visualizar Guia</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { ref, computed } from 'vue';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import { useRouter } from 'vue-router';
import { useLoading } from 'src/composables/shared/loading/loading';

const columns = [
  {
    name: 'order',
    required: true,
    label: 'Ordem',
    align: 'left',
    sortable: false,
  },
  {
    name: 'orderNumber',
    align: 'left',
    label: 'Nr. de Guia',
    field: (row) => row.orderNumber,
    sortable: true,
  },
  {
    name: 'dateReceived',
    align: 'center',
    label: 'Data de Entrada',
    sortable: false,
  },
  { name: 'options', align: 'center', label: 'Opções', sortable: false },
];
const filter = ref('');
const router = useRouter();

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};
const editStockEntrance = (entrance) => {
  localStorage.setItem('currStockEntrance', JSON.stringify(entrance));
  router.push('/stock/entrance');
};

const stockEntrances = computed(() => {
  return StockEntranceService.getStockEntrances();
});
</script>
