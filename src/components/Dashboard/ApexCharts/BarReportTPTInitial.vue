<template>
   <div class="q-pa-md">
    <apexchart
      style="max-width: 100%; "
        height="500"
        type="bar"
        :options="chartOptions"
        :series="series"
      >
      </apexchart>
   </div>
</template>

<script>
 import VueApexCharts from 'vue3-apexcharts'
 import moment from 'moment'
 // import { QSpinnerBall } from 'quasar'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
const monthsX = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEC']
const toDateStr = str => new Date(str.replace(/^(\d+)\/(\d+)\/(\d+)$/, '$2/$1/$3'))
const monthsEng = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const latestPrescriptions = []
export default {
      mapInitialMonthly: new Map(),
      mapEndQuarterly: new Map(),
       monthsX,
       toDateStr,
       monthsEng,
        components: {
    apexchart: VueApexCharts
  },
  data: function () {
    return {
      latestPrescriptions,
      chartOptions: { // ApexCharts options
        chart: {
          id: 'vue-chart-bar'
        },
        colors: ['#F44336', '#13c185', '#13a6c1'],
         animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
         title: {
          text: 'Inicios e Terminos de Tratamento',
          align: 'center',
          style: {
            color: '#000000'
          }
          },
           plotOptions: {
              bar: {
                borderRadius: 10
              }
           },
   stroke: {
    show: true,
    curve: 'smooth',
    lineCap: 'butt',
    colors: undefined,
    width: 2,
    dashArray: 0
},
fill: {
          opacity: 2
        },
         tooltip: {
          y: {
            formatter: function (val) {
              return val
            }
          }
         },
      dataLabels: {
          enabled: true
        },
         xaxis: {
      categories: [...monthsX]
      }
        }
      }
  },
  methods: {
      getInitialTreatmentByMonth () {
       const monthsPresent = []
   const map = this.patientTPInitial.reduce((a, b) => {
  const m = toDateStr(b.startDate).getMonth()
  a[m] = (a[m] || 0) + 1
  monthsPresent.push(monthsEng[+m])
     return a
}, {})
   let result = Object.entries(map).map(([key, data]) => ({ data, key: monthsEng[+key] }))
   const monthsNot = monthsEng.filter(item => !monthsPresent.includes(item))
   for (const item of monthsNot) {
     result.push(({ data: 0, key: item }))
   }
  result = result.sort(function (a, b) {
  // sort based on the value in the monthNames object
  return +moment(a.key, 'MMM') - moment(b.key, 'MMM')
})
  return result
  },
    getEndTreatmentByMonth () {
       const monthsPresent = []
        let result = []
       if (this.patientTPTEnd.length > 0) {
   const map = this.patientTPTEnd.reduce((a, b) => {
  const m = toDateStr(b.endDate).getMonth()
  a[m] = (a[m] || 0) + 1
  monthsPresent.push(monthsEng[+m])
     return a
}, {})
   result = Object.entries(map).map(([key, data]) => ({ data, key: monthsEng[+key] }))
   const monthsNot = monthsEng.filter(item => !monthsPresent.includes(item))
   for (const item of monthsNot) {
     result.push(({ data: 0, key: item }))
   }
  result = result.sort(function (a, b) {
  // sort based on the value in the monthNames object
  return +moment(a.key, 'MMM') - moment(b.key, 'MMM')
})
  }
  return result
  }
  },
  computed: {
        patientTPInitial () {
         return PatientServiceIdentifier.query()
                           .with('identifierType')
                            .with('service')
                             .where((patientServiceIdentifier) => {
                                 return patientServiceIdentifier.endDate === ''
                              })
                             .whereHas('service', (query) => {
                              query.where((service) => {
                                 return service.code === 'TPT'
                              })
                              })
                             .get()
         },
         patientTPTEnd () {
         return PatientServiceIdentifier.query()
                           .with('identifierType')
                            .with('service')
                             .where((patientServiceIdentifier) => {
                                 return patientServiceIdentifier.endDate !== null
                              })
                             .whereHas('service', (query) => {
                              query.where((service) => {
                                 return service.code === 'TPT'
                              })
                              })
                              .get()
         },
       series () {
       const mapIter = this.mapInitialMonthly.values()
         const arrPending = []
       for (const item of mapIter) {
         arrPending.push(item.data)
         }
           const mapIter1 = this.mapEndQuarterly.values()
         const arrDone = []
       for (const item of mapIter1) {
         arrDone.push(item.data)
         }
    return [
       {
        name: 'Inicio',
        data: [...arrPending]
      },
      {
        name: 'Termino',
        data: [...arrDone]
      }
    ]
    }
  },
    created () {
    /*  this.$q.loading.show({
      message: 'Carregando ...',
      spinnerColor: 'grey-4',
      spinner: QSpinnerBall
      // delay: 400 // ms
    }) */
    //  this.loadData()
  //   this.getLastPatientTarvPrescription()
   //   console.log(this.allDispensePrescriptions)
   //    console.log(this.quarterlyDispensePrescriptions)
        this.mapInitialMonthly = this.getInitialTreatmentByMonth()
    this.mapEndQuarterly = this.getEndTreatmentByMonth()
    }
}
</script>

<style lang="scss">
    .graph-conainer {
      border: 3px solid $grey-13;
      border-radius: 0px;
    }
</style>
