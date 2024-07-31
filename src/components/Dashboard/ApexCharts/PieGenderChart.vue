<template>
  <div class="relative-position">
    <div v-if="loaded">
      <apexchart
        style="max-width: 100%"
        height="612"
        type="donut"
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
import { ref, watch, onMounted, computed, inject } from 'vue';
import apexchart from 'vue3-apexcharts';
import reportService from 'src/services/api/report/ReportService.ts';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

const { isOnline } = useSystemUtils();
const { isProvincialInstalation } = useSystemConfig();

const clinic = inject('currClinic');
const loaded = computed(() => !loading.value);
const serviceCode = inject('serviceCode');
const year = inject('year');

const loading = ref(false);
const series = ref([]);
const chartOptions = {
  labels: ['Feminino', 'Masculino'],
  colors: ['#FF1493', '#0096FF'],
  animations: {
    enabled: true,
    easing: 'easeinout',
    speed: 2000,
  },
  title: {
    text: 'Percentual de Pacientes activos no Serviço ' + serviceCode.value,
    align: 'center',
    offsetY: 12,
    style: {
      color: '#000000',
      fontSize: '0.5vw',
    },
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '22px',
            fontFamily: 'Rubik',
            color: '#dfsda',
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: '16px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: undefined,
            offsetY: 16,
            formatter: function (val) {
              return val;
            },
          },
          total: {
            show: true,
            label: 'Total',
            color: '#373d3f',
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => {
                return a + b;
              }, 0);
            },
          },
        },
      },
    },
  },
};

const getActivePatientPercentage = () => {
  loading.value = true;

  if (isProvincialInstalation()) {
    reportService
      .getActivePatientPercentage(
        year.value,
        clinic.value, // Alterar para carregar a partir da Povincia
        serviceCode.value
      )
      .then((resp) => {
        const response = [];
        if (isOnline.value) {
          response.value = resp.data;
        } else {
          response.value = resp;
        }
        if (response.value.length > 0) {
          series.value[0] =
            response.value[0] !== undefined ? response.value[0].quantity : 0;
          series.value[1] =
            response.value[1] !== undefined ? response.value[1].quantity : 0;
        } else {
          series.value[0] = 0;
          series.value[1] = 0;
        }
        loading.value = false;
      });
  } else {
    reportService
      .getActivePatientPercentage(
        year.value,
        clinic.value.id,
        serviceCode.value
      )
      .then((resp) => {
        const response = [];
        if (isOnline.value) {
          response.value = resp.data;
        } else {
          response.value = resp;
        }
        if (response.value.length > 0) {
          series.value[0] =
            response.value[0] !== undefined ? response.value[0].quantity : 0;
          series.value[1] =
            response.value[1] !== undefined ? response.value[1].quantity : 0;
        } else {
          series.value[0] = 0;
          series.value[1] = 0;
        }
        loading.value = false;
      });
  }
};

onMounted(() => {
  getActivePatientPercentage();
});

watch([serviceCode, year], () => {
  getActivePatientPercentage();
  chartOptions.title = {
    ...chartOptions.title,
    ...{
      text: 'Percentual de Pacientes activos no Serviço ' + serviceCode.value,
      align: 'center',
      offsetY: 12,
      style: {
        color: '#000000',
        fontSize: '0.5vw',
      },
    },
  };
});
</script>
