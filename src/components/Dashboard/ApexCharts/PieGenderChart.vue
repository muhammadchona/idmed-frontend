<template>
  <div class="relative-position">
    <div v-if="loaded">
      <apexchart
        style="max-width: 100%"
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
import { ref, watch, onMounted, computed, watchEffect, inject } from "vue";
import apexchart from "vue3-apexcharts";
import reportService from "src/services/api/report/reportService.ts";

const clinic = inject("currClinic");
const loaded = computed(() => !loading.value);
const serviceCode = inject("serviceCode");
const year = inject("year");

const loading = ref(false);
const series = ref([]);
const chartOptions = {
  labels: ["Masculino", "Feminino"],
  colors: ["#0096FF", "#FF1493"],
  animations: {
    enabled: true,
    easing: "easeinout",
    speed: 2000,
  },
  title: {
    text: "Percentual de Pacientes activos no Serviço " + serviceCode.value,
    align: "center",
    style: {
      color: "#000000",
      fontSize: "13px",
    },
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "22px",
            fontFamily: "Rubik",
            color: "#dfsda",
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "16px",
            fontFamily: "Helvetica, Arial, sans-serif",
            color: undefined,
            offsetY: 16,
            formatter: function (val) {
              return val;
            },
          },
          total: {
            show: true,
            label: "Total",
            color: "#373d3f",
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
  reportService
    .getActivePatientPercentage(year.value, clinic.value.id, serviceCode.value)
    .then((resp) => {
      if (resp.data.length > 0) {
        series.value[0] = resp.data[0] !== undefined ? resp.data[0].quantity : 0;
        series.value[1] = resp.data[1] !== undefined ? resp.data[1].quantity : 0;
      } else {
        series.value[0] = 0;
        series.value[1] = 0;
      }
      loading.value = false;
    });
};

onMounted(() => {
  getActivePatientPercentage();
});

watch([serviceCode, year], () => {
  getActivePatientPercentage();
  chartOptions.title = {
    ...chartOptions.title,
    ...{
      text: "Percentual de Pacientes activos no Serviço " + serviceCode.value,
      align: "center",
      style: {
        color: "#000000",
      },
    },
  };
});
</script>
