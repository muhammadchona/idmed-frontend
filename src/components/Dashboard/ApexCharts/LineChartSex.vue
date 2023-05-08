<template>
<div style="width: 850px; min-height: 200px; linear-gradient( 135deg, #343E59 10%, #2B2D3E 40%)" class="relative-position">
  <apexchart
    style="max-width: 100%; "
    height="500"
    type="area"
    :options="chartOptions"
    :series="series"
  ></apexchart>
  <div v-if="!loaded" class="absolute-center">
        <q-spinner-ball
          color="primary"
          size="xl"
        />
      </div>
</div>
</template>

<script>
import { SessionStorage } from 'quasar'
import { ref } from 'vue'
 import VueApexCharts from 'vue3-apexcharts'
import Clinic from '../../../store/models/clinic/Clinic'
import Report from 'src/store/models/report/Report'
const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export default {
    props: ['serviceCode', 'year'],
     emits: ['update:serviceCode'],
      Nmap: new Map(),
      NmapChild: new Map(),
      month,
  components: {
    apexchart: VueApexCharts
  },
  data: function () {
    const loading = ref(false)
    return {
      loading,
      chartOptions: { // ApexCharts options
        chart: {
          id: 'vue-chart-line',
          toolbar: {
        show: true,
        offsetY: 7
        }
        },
        colors: ['#0096FF', '#FF1493'],
         title: {
          text: 'Total de Pacientes no Serviço ' + this.serviceCode + ' que iniciaram o levantamento',
          align: 'center',
          style: {
            color: '#000000',
            fontSize: '13px'
          }
          },
           animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
            stroke: {
    show: true,
    curve: 'smooth',
    lineCap: 'butt',
    colors: undefined,
    width: 5,
    dashArray: 0,
    markers: {
    size: 1
}
},
tooltip: {
          y: {
            formatter: function (val) {
              return val
            }
          }
         },
      dataLabels: {
          enabled: false
        },
          xaxis: {
      categories: [...month]
      }
    },
      series: [{
          name: 'series-1',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }]
      }
  },
  methods: {
    getPatientsFirstDispenseByGender () {
    this.loading = true
      const fm = { name: 'Feminino', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
      const ms = { name: 'Masculino', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }

      Report.apiGetPatientsFirstDispenseByGender(this.year, this.clinic.id, this.serviceCode).then(resp => {
        console.log(resp.response.data)
        for (let i = 1; i <= 12; i++) {
          resp.response.data.forEach((item) => {
            if (item.gender === 'Feminino' && item.month === i) {
              fm.data[i - 1] = item.quantity
            } else if (item.gender === 'Masculino' && item.month === i) {
              ms.data[i - 1] = item.quantity
            }
          })
        }
        this.series = []
        this.series[0] = ms
        this.series[1] = fm
        this.loading = false
      })
    }
  },
  computed: {
    clinic () {
      return Clinic.query()
                  .where('id', SessionStorage.getItem('currClinic').id)
                  .first()
    },
    loaded () {
      return !this.loading
    }
  },
  watch: {
    serviceCode: function (newVal, oldVal) {
      this.getPatientsFirstDispenseByGender()
    },
    year: function (newVal, oldVal) {
      this.getPatientsFirstDispenseByGender()
    }
  },
  created () {
    this.getPatientsFirstDispenseByGender()
  }
}

</script>
