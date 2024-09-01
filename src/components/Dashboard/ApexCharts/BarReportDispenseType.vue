<template>
  <div class="relative-position">
    <div v-if="loaded">
      <apexchart
        style="max-width: 100%"
        height="500"
        type="bar"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
    <div v-if="!loaded" class="absolute-center">
      <q-spinner-ball color="primary" size="xl" />
    </div>
  </div>
</template>

<script setup>
import apexchart from 'vue3-apexcharts';
import { ref, watch, onMounted, inject, computed } from 'vue';
import reportService from 'src/services/api/report/ReportService.ts';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

const serviceCode = inject('serviceCode');
const year = inject('year');
const currClinic = inject('currClinic');
const { isOnline } = useSystemUtils();
const { isProvincialInstalation, localProvincialInstalationCode } =
  useSystemConfig();

const monthsX = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEC',
];

const loading = ref(false);

const chartOptions = {
  chart: {
    id: 'vue-chart-bar',
  },
  colors: ['#F44336', '#ff6600', '#13c185', '#13a6c1'],
  animations: {
    enabled: true,
    easing: 'easeinout',
    speed: 2000,
  },
  title: {
    text:
      'Total Mensal de Pacientes com Levantamentos no Serviço ' +
      serviceCode.value,
    align: 'center',
    offsetY: 12,
    style: {
      color: '#000000',
      fontSize: '14px',
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
    },
  },
  stroke: {
    show: true,
    curve: 'smooth',
    lineCap: 'butt',
    colors: undefined,
    width: 2,
    dashArray: 0,
  },
  fill: {
    opacity: 2,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val;
      },
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '14px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 'bold',
      colors: [
        function ({ seriesIndex, dataPointIndex, w }) {
          if (w.config.series[seriesIndex].data[dataPointIndex] > 100) {
            return '#ffffff';
          } else {
            return '#000000';
          }
        },
      ],
    },
  },
  xaxis: {
    categories: [...monthsX],
  },
};

const series = ref([
  {
    name: 'series-1',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
]);

const loaded = computed(() => {
  return !loading.value;
});

const getRegisteredPatientByDispenseType = () => {
  loading.value = true;
  const dms = {
    name: 'Dispensa Mensal',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  const db = {
    name: 'Dispensa Bimestral',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  const dts = {
    name: 'Dispensa Trimestral',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  const dss = {
    name: 'Dispensa Semestral',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  if (isProvincialInstalation()) {
    reportService
      .getRegisteredPatientByDispenseType(
        year.value,
        localProvincialInstalationCode(),
        serviceCode.value
      )
      .then((resp) => {
        const response = [];
        if (isOnline.value) {
          response.value = resp.data;
        } else {
          response.value = resp;
        }
        for (let i = 1; i <= 12; i++) {
          response.value.forEach((item) => {
            if (
              (item.dispense_type === 'DM' || item.dispense_type === 'FRM') &&
              item.month === i
            ) {
              dms.data[i - 1] = item.quantity;
            } else if (item.dispense_type === 'DT' && item.month === i) {
              dts.data[i - 1] = item.quantity;
            } else if (item.dispense_type === 'DS' && item.month === i) {
              dss.data[i - 1] = item.quantity;
            } else if (item.dispense_type === 'DB' && item.month === i) {
              db.data[i - 1] = item.quantity;
            }
          });
        }
        series.value = [dms, db, dts, dss];
        loading.value = false;
      });
  } else {
    reportService
      .getRegisteredPatientByDispenseType(
        year.value,
        currClinic.value.id,
        serviceCode.value
      )
      .then((resp) => {
        const response = [];
        if (isOnline.value) {
          response.value = resp.data;
        } else {
          response.value = resp;
        }
        for (let i = 1; i <= 12; i++) {
          response.value.forEach((item) => {
            if (
              (item.dispense_type === 'DM' || item.dispense_type === 'FRM') &&
              item.month === i
            ) {
              dms.data[i - 1] = item.quantity;
            } else if (item.dispense_type === 'DT' && item.month === i) {
              dts.data[i - 1] = item.quantity;
            } else if (item.dispense_type === 'DS' && item.month === i) {
              dss.data[i - 1] = item.quantity;
            } else if (item.dispense_type === 'DB' && item.month === i) {
              db.data[i - 1] = item.quantity;
            }
          });
        }
        series.value = [dms, db, dts, dss];
        loading.value = false;
      });
  }
};

onMounted(() => {
  getRegisteredPatientByDispenseType();
});

watch([year, serviceCode], () => {
  getRegisteredPatientByDispenseType();
  chartOptions.title = {
    ...chartOptions.title,
    ...{
      text:
        'Total de Pacientes com Levantamentos no Serviço ' + serviceCode.value,
      align: 'center',
      offsetY: 12,
      style: {
        color: '#000000',
        fontSize: '14px',
      },
    },
  };
});

// watch([() => serviceCode.value, () => year], () => {
//   getRegisteredPatientByDispenseType();
// });
</script>
