<template>
  <div>
    <q-table
      class="col"
      dense
      :rows="stockDistributors"
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
          placeholder="Pesquisar pela ordem de distribuicao"
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
          <q-td key="creationDate" :props="props">
            {{ formatDate(props.row.creationDate) }}
          </q-td>
          <q-td key="options" :props="props">
            <div class="col">
              <q-btn
                flat
                round
                color="amber-8"
                icon="reorder"
                @click="viewStockConfirmation(props.row)"
              >
                <q-tooltip class="bg-amber-5">Visualizar Ordem</q-tooltip>
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
</template>

<script setup>
import { date } from 'quasar';
import { ref, computed, inject } from 'vue';
import stockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import { useRouter } from 'vue-router';

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
    name: 'creationDate',
    align: 'center',
    label: 'Data de Criacao',
    sortable: false,
  },
  { name: 'options', align: 'center', label: 'Opções', sortable: false },
];
const filter = ref('');
const router = useRouter();
const loading = ref(true);
const clinic = inject('currClinic');

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};
const viewStockConfirmation = (stockDistributor) => {
  stockDistributor.clinic = null;
  localStorage.setItem(
    'currStockConfirmDistributor',
    JSON.stringify(stockDistributor.id)
  );
  router.push('/stock/stockConfirmation');
};

const stockDistributors = computed(() => {
  const list = stockDistributorService.getStockDistributorConfirmation(
    clinic.value.id
  );
  if (list.length >= 0) {
    loading.value = false;
  }
  return list;
});
</script>
