<template>
  <div class="row">
    <div class="col">
      <q-table
        style="max-width: 100%"
        :rows="rows"
        :columns="columnsGender"
        class="my-sticky-header-table text-color-white"
        title="Alerta de Stock"
      >
        <template v-slot:body="props">
          <q-tr v-bind="props">
            <q-td key="drug" v-bind="props">
              {{ props.row.drug }}
            </q-td>
            <q-td key="avgConsuption" v-bind="props">
              {{ props.row.avgConsuption }}
            </q-td>
            <q-td key="balance" v-bind="props">
              {{ props.row.balance }}
            </q-td>
            <q-td key="state" v-bind="props">
              <q-chip
                :color="getConsuptionRelatedColor(props.row.state)"
                text-color="white"
              >
                {{ props.row.state }}
              </q-chip>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue';
import reportService from 'src/services/api/report/reportService.ts';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isOnline } = useSystemUtils();

const columnsGender = [
  {
    name: 'drug',
    required: true,
    label: 'Medicamento',
    align: 'left',
    field: (row) => row.drug,
    format: (val) => `${val}`,
  },
  {
    name: 'avgConsuption',
    required: true,
    label: 'Média de Consumo Mensal',
    align: 'left',
    field: (row) => row.avgConsuption,
    format: (val) => `${val}`,
  },
  {
    name: 'balance',
    required: true,
    label: 'Saldo atual',
    align: 'left',
    field: (row) => row.balance,
    format: (val) => `${val}`,
  },
  {
    name: 'state',
    required: true,
    label: 'Estado',
    align: 'left',
    field: (row) => row.state,
    format: (val) => `${val}`,
  },
];

const rowData = ref([]);

const currClinic = inject('currClinic');
const serviceCode = inject('serviceCode');
const year = inject('year');

const getStockAlert = () => {
  reportService.getStockAlert(currClinic.value.id, serviceCode.value).then((resp) => {
      if (isOnline.value) {
        rowData.value = resp.data
      } else {
        rowData.value = resp
      }
  });
};

const getConsuptionRelatedColor = (state) => {
  if (state === 'Sem Consumo') {
    return 'blue';
  } else if (state === 'Ruptura de Stock') {
    return 'red';
  } else if (state === 'Acima do Consumo Máximo') {
    return 'info';
  } else {
    return 'primary';
  }
};

const rows = computed(() => {
  return rowData.value;
});

onMounted(() => {
  getStockAlert();
});

watch([serviceCode, year], () => {
  getStockAlert();
});
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $light-green-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
