<template>
  <div class="relative-position">
  <div
      v-if="loaded">
      <apexchart
      style="max-width: 100%; "
      type="donut"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
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

export default {
  props: ['serviceCode', 'year'],
  emits: ['update:serviceCode'],
      Nmap: new Map(),
      Nmap1: new Map(),
     components: {
    apexchart: VueApexCharts
  },
  data () {
    const loading = ref(false)
    return {
      loading,
      series: [],
       chartOptions: {
        labels: ['Masculino', 'Feminino'],
        colors: ['#0096FF', '#FF1493'],
          animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 2000
        },
      title: {
          text: 'Percentual de Pacientes activos no Serviço ' + this.serviceCode,
          align: 'center',
          style: {
            color: '#000000',
            fontSize: '13px'
          }
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
                  offsetY: -10
                },
                value: {
                  show: true,
                  fontSize: '16px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  color: undefined,
                  offsetY: 16,
                  formatter: function (val) {
                    return val
                  }
                },
                total: {
                  show: true,
                  label: 'Total',
                  color: '#373d3f',
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce((a, b) => {
                      return a + b
                    }, 0)
                  }
                }
              }
            }
          }
        }
       }
    }
  },
  methods: {
      getActivePatientPercentage () {
        this.loading = true
          Report.apiGetActivePatientPercentage(this.year, this.clinic.id, this.serviceCode).then(resp => {
            console.log(resp.response.data)
            if (resp.response.data.length > 0) {
              this.series[0] = resp.response.data[0] !== undefined ? resp.response.data[0].quantity : 0
              this.series[1] = resp.response.data[1] !== undefined ? resp.response.data[1].quantity : 0
            } else {
              this.series[0] = 0
              this.series[1] = 0
            }
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
  created () {
    this.getActivePatientPercentage()
  },
  watch: {
   serviceCode: function (newVal, oldVal) {
      this.getActivePatientPercentage()
      this.chartOptions = {
            ...this.chartOptions,
            ...{
          title: {
            text: 'Percentual de Pacientes activos no Serviço ' + this.serviceCode,
            align: 'center',
            style: {
              color: '#000000'
            }
          }
        }
      }
    },
    year: function (newVal, oldVal) { this.getActivePatientPercentage() }
  }
}

</script>
