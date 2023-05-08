<template>
<div class="relative-position">
  <apexchart
    style="max-width: 100%; "
    height="500"
    type="line"
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
 import VueApexCharts from 'vue3-apexcharts'
 import { ref } from 'vue'
import Clinic from '../../../store/models/clinic/Clinic'
import Report from 'src/store/models/report/Report'
import { SessionStorage } from 'quasar'
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
        colors: ['#6a0dad', '#AAFF00'],
         title: {
          text: 'Total de Pacientes no Serviço ' + this.serviceCode + '\n que iniciaram o levantamento',
          size: 10,
          align: 'center',
          offsetY: -3,
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
     getPatientsFirstDispenseByAge () {
      this.loading = true
      const fm = { name: 'Criancas', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
      const ms = { name: 'Adultos', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }

      Report.apiGetPatientsFirstDispenseByAge(this.year, this.clinic.id, this.serviceCode).then(resp => {
        console.log(resp.response.data)
        for (let i = 1; i <= 12; i++) {
          resp.response.data.forEach((item) => {
            if (item.faixa === 'MENOR' && item.month === i) {
              fm.data[i - 1] = item.quantity
            } else if (item.faixa === 'ADULTO' && item.month === i) {
              ms.data[i - 1] = item.quantity
            }
          })
        }
        this.series = []
        this.series[0] = fm
        this.series[1] = ms
        this.loading = false
      })
    }
  },
   watch: {
   serviceCode: function (newVal, oldVal) {
     this.getPatientsFirstDispenseByAge()
        },
    year: function (newVal, oldVal) {
      this.getPatientsFirstDispenseByAge()
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
    created () {
      this.getPatientsFirstDispenseByAge()
    }
}

</script>
