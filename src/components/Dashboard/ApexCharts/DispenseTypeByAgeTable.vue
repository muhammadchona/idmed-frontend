<template>
  <div class="row">
    <div class="col">
      <q-table
        style="max-width: 100%"
        :rows="rowData"
        :columns="columnsGender"
        class="my-sticky-header-table text-color-white"
        :title="tableTitle + serviceCode"
        hide-bottom
      >
        <template v-slot:body="props">
          <q-tr v-bind="props">
            <q-td key="dispenseType" v-bind="props">
              {{ props.row.dispenseType }}
            </q-td>
            <q-td key="adulto" v-bind="props">
              {{ props.row.adulto }}
            </q-td>
            <q-td key="menor" v-bind="props">
              {{ props.row.menor }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, inject, watch } from 'vue';
import reportService from 'src/services/api/report/ReportService.ts';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

const { isOnline } = useSystemUtils();

const columnsGender = [
  {
    name: 'dispenseType',
    required: true,
    label: 'Tipo de Dispensa',
    align: 'left',
    field: (row) => row.dispenseType,
    format: (val) => `${val}`,
  },
  {
    name: 'adulto',
    required: true,
    label: 'Adulto',
    align: 'left',
    field: (row) => row.adulto,
    format: (val) => `${val}`,
  },
  {
    name: 'menor',
    required: true,
    label: 'Criança',
    align: 'left',
    field: (row) => row.menor,
    format: (val) => `${val}`,
  },
];
const { isProvincialInstalation, localProvincialInstalationCode } =
  useSystemConfig();
const serviceCode = inject('serviceCode');
const year = inject('year');
const clinic = inject('currClinic');
const rowData = ref([]);
const tableTitle = ref('Total de dispensas por Idade no Serviço ');

function getDispenseByAge() {
  if (isProvincialInstalation) {
    reportService
      .getDispenseByAge(
        year.value,
        localProvincialInstalationCode(),
        serviceCode.value
      )
      .then((resp) => {
        if (isOnline.value) {
          rowData.value = resp.data;
        } else {
          rowData.value = resp;
        }
      });
  } else {
    reportService
      .getDispenseByAge(year.value, clinic.value.id, serviceCode.value)
      .then((resp) => {
        if (isOnline.value) {
          rowData.value = resp.data;
        } else {
          rowData.value = resp;
        }
      });
  }
}

watch([serviceCode, year], () => {
  getDispenseByAge();
});

onMounted(() => {
  getDispenseByAge();
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
