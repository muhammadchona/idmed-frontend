<template>
  <div>
    <apexchart
      style="max-width: 100%"
      height="500"
      type="radialBar"
      :options="chartOptions"
      :series="series"
    />
    <div class="column items-center">
      <q-table
        flat
        separator="vertical"
        :rows="rows"
        :columns="columns"
        row-key="name"
        hide-bottom
      >
      </q-table>
    </div>
  </div>
</template>

<script setup>
import apexchart from 'vue3-apexcharts';
import { ref, computed, watch } from 'vue';
const columns = [
  {
    name: 'total',
    align: 'center',
    label: 'Total',
    field: 'total',
    sortable: true,
  },
  { name: 'migrated', label: 'Migrados', field: 'migrated', sortable: true },
  { name: 'rejected', label: 'Rejeitados', field: 'rejected' },
];

//props: ['data'],
const props = defineProps(['data']);
const series = ref([
  {
    name: 'series-1',
    data: [0],
  },
]);

const chartOptions = ref({
  chart: {
    height: 350,
    type: 'radialBar',
    offsetY: -10,
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      dataLabels: {
        name: {
          fontSize: '16px',
          color: undefined,
          offsetY: 120,
        },
        value: {
          offsetY: 76,
          fontSize: '22px',
          color: undefined,
          formatter: function (val) {
            return val + '%';
          },
        },
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      shadeIntensity: 0.15,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 65, 91],
    },
  },
  stroke: {
    dashArray: 4,
  },
  labels: ['Pacientes'],
});

watch(
  () => props.data,
  (newVal, oldVal) => {
    console.log(newVal);
    series.value[0] = newVal.stage_progress.toFixed(2);
  }
);

const rows = computed(() => {
  return [
    {
      total: props.data !== null ? props.data.total_records : 0,
      migrated: props.data !== null ? props.data.total_migrated : 0,
      rejected: props.data !== null ? props.data.total_rejcted : 0,
    },
  ];
});
</script>

<style></style>
