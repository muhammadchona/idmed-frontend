<template>
   <div id="year-quarter">
    <apexchart
    ref="chart"
    @dataPointSelection="dataPointSelectionHandler"
  style="max-width: 100%; "
  height="500"
  type="bar"
  :options="chartOptions"
  :series="series"
></apexchart>
  <div id="chart-quarter" v-if="isTARV">
        <apexchart type="bar" height="400" ref="chartQuarter" :options="chartOptionsWeekly" :series="seriesWeekly"></apexchart>
      </div>
   </div>
</template>

<script>
 import VueApexCharts from 'vue3-apexcharts'
 import moment from 'moment'
import DispenseType from '../../../store/models/dispenseType/DispenseType'
 // import { QSpinnerBall } from 'quasar'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
import { ref } from 'vue'
// import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
const monthsX = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEC']
const weeksX = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5']
const toDateStr = str => new Date(str.replace(/^(\d+)\/(\d+)\/(\d+)$/, '$2/$1/$3'))
const monthsEng = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const latestPrescriptions = []
 let initialDataPointIndex = -1
export default {
      props: ['serviceCode', 'dataLoaded'],
      emits: ['update:serviceCode'],
      mapDispenseMonthly: new Map(),
      mapDispenseQuarterly: new Map(),
      mapDispenseSemestraly: new Map(),
      arrDispenseMonthlyWeekly: new Map(),
      arrDispenseQuarterlyWeekly: new Map(),
      arrDispenseSemestralyWeekly: new Map(),
       monthsX,
       toDateStr,
       monthsEng,
        components: {
    apexchart: VueApexCharts
  },
  data: function () {
    return {
      latestPrescriptions,
       isTARV: ref(false),
         weeksMonthsMontly: [],
       weeksMonthsQuarterly: [],
        weeksMonthsSemestraly: [],
      chartOptions: { // ApexCharts options
        chart: {
          id: 'chart',
          events: {
                dataPointSelection: function (event, chartContext, config) {
              console.log(chartContext, config)
               },
                selection: function (chartContext, { xaxis, yaxis }) {
           console.log(xaxis, xaxis)
                    }
              }
        },
        colors: ['#F44336', '#13c185', '#13a6c1'],
         animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
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
   states: {
              normal: {
                filter: {
                  type: 'desaturate'
                }
              },
              active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                  type: 'darken',
                  value: 1
                }
              }
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
      },
      series: [{
          name: 'series-1',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }],
      seriesWeekly: [{
          name: 'series-1',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }],
          chartOptionsWeekly: { // ApexCharts options
        chart: {
          id: 'chart'
         },
        colors: ['#F44336', '#13c185', '#13a6c1'],
         animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
         title: {
          text: 'Tipo de Dispensa Detalhado',
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
      categories: [...weeksX]
      }
      }
      }
  },
  methods: {
      getLastPrescriptionsMonthlyByMonth () {
       const monthsPresent = []
   const map = this.monthlyDispensePrescriptions.reduce((a, b) => {
     console.log(a)
  const m = toDateStr(b.prescription.prescriptionDate).getMonth()
   const day = toDateStr(b.prescription.prescriptionDate).getDate()
   const weekOfMonth = Math.ceil(day / 7)
  a[m] = (a[m] || 0) + 1
   const monthAndWeek = [+m + ' ' + weekOfMonth]
  this.weeksMonthsMontly.push(monthAndWeek)
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
    getLastPrescriptionsQuarterlyByMonth () {
       const monthsPresent = []
   const map = this.quarterlyDispensePrescriptions.reduce((a, b) => {
  const m = toDateStr(b.prescription.prescriptionDate).getMonth()
    const day = toDateStr(b.prescription.prescriptionDate).getDate()
   const weekOfMonth = Math.ceil(day / 7)
  a[m] = (a[m] || 0) + 1
   const monthAndWeek = [+m + ' ' + weekOfMonth]
  this.weeksMonthsQuarterly.push(monthAndWeek)
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
    getLastPrescriptionsSemestralByMonth () {
       const monthsPresent = []
   const map = this.semestralDispensePrescriptions.reduce((a, b) => {
  const m = toDateStr(b.prescription.prescriptionDate).getMonth()
  const day = toDateStr(b.prescription.prescriptionDate).getDate()
   const weekOfMonth = Math.ceil(day / 7)
  a[m] = (a[m] || 0) + 1
   const monthAndWeek = [+m + ' ' + weekOfMonth]
  this.weeksMonthsSemestraly.push(monthAndWeek)
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
    getWeekNumbersByMonth (month, weeksMonths) {
   // let week1 =0
     const weeksPresent = []
   const week = [1, 2, 3, 4, 5]
       const weeksMonth = []
      for (const item of weeksMonths) {
      const str = item.toString()
      const monthWeek = parseInt(str.substring(0, str.indexOf(' ')))
      if (month === monthWeek) {
       weeksMonth.push(item)
      }
   }
     const weeksMonthss = weeksMonth.reduce((a, b) => {
      const str = b.toString()
  //    const monthWeek = parseInt(str.substring(0, str.indexOf(' ')))
           const week = str.substring(str.indexOf(' ') + 1)
         // const week1 = b.substring(b.indexOf(' ') + 1)
          a[week] = (a[week] || 0) + 1
           weeksPresent.push(parseInt(week))
         return a
     }, {})
     console.log(weeksMonthss)
      let result = Object.entries(weeksMonthss).map(([key, data]) => ({ data, key: key }))
       const weeksNot = week.filter(item => !weeksPresent.includes(item))
   for (const item of weeksNot) {
     result.push(({ data: 0, key: item }))
   }
   result = result.sort(function (a, b) {
  // sort based on the value in the monthNames object
  return a.key > b.key
})
   console.log(result)
    return result
  },
   getDispenseTypeId (id) {
      return DispenseType.find(id)
  },
       getLastPatientTarvPrescription () {
         this.latestPrescriptions = []
          const patientVisitDetails = PatientVisitDetails.query()
                            .with('patientVisit')
                             .with('prescription')
                            .with('prescription.prescriptionDetails')
                             .with('prescription.prescriptionDetails.dispenseType')
                            .with('patientVisit.patient')
                            .with('episode.patientServiceIdentifier.service')
                              .get()
                     const patientVisitDetailsTarv = patientVisitDetails.filter((patientVisitDetail) => {
                  return patientVisitDetail.episode.patientServiceIdentifier.service !== null ? patientVisitDetail.episode.patientServiceIdentifier.service.code === this.serviceCode : false
                })
              patientVisitDetailsTarv.forEach(patientVisitDetail => {
             //  let patient = patientVisitDetail.patientVisit.patient
                if (this.latestPrescriptions.length === 0) {
                  this.latestPrescriptions.push(patientVisitDetail)
                } else {
               const visit = this.latestPrescriptions.filter(x => x.patientVisit.patient.id === patientVisitDetail.patientVisit.patient.id)
                if (visit.length > 0) {
                  const index = this.latestPrescriptions.map(x => {
                              return x.Id
                                 }).indexOf(visit[0].id)
                      const prescriptionDate = visit[0].prescription.prescriptionDate
                     // console.log(visit.prescription.prescriptionDate)
                   if (moment(prescriptionDate).isBefore(patientVisitDetail.prescription.prescriptionDate)) {
                        this.latestPrescriptions.splice(index, 1)
                         this.latestPrescriptions.push(patientVisitDetail)
                   }
                } else {
                     this.latestPrescriptions.push(patientVisitDetail)
                }
             }
              })
              if (patientVisitDetailsTarv.length === 0) {
                this.latestPrescriptions = []
              }
         return this.latestPrescriptions
          },
          updateChart () {
             const arrPending = []
             const arrDone = []
             const arrConfirmed = []
         if (this.mapDispenseMonthly !== undefined) {
       const mapIter = this.mapDispenseMonthly.values()
       for (const item of mapIter) {
         arrPending.push(item.data)
         }
         }
           if (this.mapDispenseQuarterly !== undefined) {
           const mapIter1 = this.mapDispenseQuarterly.values()
       for (const item of mapIter1) {
         arrDone.push(item.data)
         }
           }
   if (this.mapDispenseSemestraly !== undefined) {
           const mapIter2 = this.mapDispenseSemestraly.values()
       for (const item of mapIter2) {
         arrConfirmed.push(item.data)
         }
   }
  // this.chartOptions.title.text = 'Total de pacientes registados no Serviço ' + this.serviceCode
  // console.log(this.chartOptions.title.text)
          this.chartOptions = {
            ...this.chartOptions,
            ...{
         title: {
          text: 'Total de pacientes registados no Serviço ' + this.serviceCode,
          align: 'center',
          style: {
            color: '#000000'
          }
          }
 }
 }
          console.log(this.chartOptions.title.text)
    this.series = [
       {
        name: 'Dispensa Mensal',
        data: [...arrPending]
      },
      {
        name: 'Dispensa Trimestral',
        data: [...arrDone]
      },
       {
        name: 'Dispensa Semestral',
        data: [...arrConfirmed]
      }
    ]
          },
            updateChartWeekly (month) {
             const arrPending = []
             const arrDone = []
             const arrConfirmed = []
         if (this.arrDispenseMonthlyWeekly !== undefined) {
       const mapIter = this.arrDispenseMonthlyWeekly.values()
       for (const item of mapIter) {
         arrPending.push(item.data)
         }
         }
           if (this.arrDispenseQuarterlyWeekly !== undefined) {
           const mapIter1 = this.arrDispenseQuarterlyWeekly.values()
       for (const item of mapIter1) {
         arrDone.push(item.data)
         }
           }
   if (this.arrDispenseSemestralyWeekly !== undefined) {
           const mapIter2 = this.arrDispenseSemestralyWeekly.values()
       for (const item of mapIter2) {
         arrConfirmed.push(item.data)
         }
   }
    this.seriesWeekly = [
       {
        name: 'Dispensa Mensal',
        data: [...arrPending]
      },
      {
        name: 'Dispensa Trimestral',
        data: [...arrDone]
      },
       {
        name: 'Dispensa Semestral',
        data: [...arrConfirmed]
      }
    ]
    this.chartOptionsWeekly.title.text = 'Gráfico Estatistico de Tipos de Dispensa Detalhado Semanalmente do Mes de - ' + monthsX[month]
          },
  dataPointSelectionHandler (e, chartContext, config) {
    console.log(chartContext, config)
      //   const quarterChartEl = document.querySelector('#chart-quarter')
        //          const yearChartEl = document.querySelector('#year-quarter')
       //  const initialDataPointIndex = -1
        if (config.dataPointIndex >= 0) {
          const dataPointIndex = config.dataPointIndex
                if (initialDataPointIndex === config.dataPointIndex) {
                   this.isTARV = false
                   initialDataPointIndex = -1
                } else {
              initialDataPointIndex = config.dataPointIndex
              this.isTARV = true
       this.arrDispenseMonthlyWeekly = this.getWeekNumbersByMonth(dataPointIndex, this.weeksMonthsMontly)
       this.arrDispenseQuarterlyWeekly = this.getWeekNumbersByMonth(dataPointIndex, this.weeksMonthsQuarterly)
       this.arrDispenseSemestralyWeekly = this.getWeekNumbersByMonth(dataPointIndex, this.weeksMonthsSemestraly)
          this.updateChartWeekly(dataPointIndex)
                }
                    }
  }
  },
  computed: {
         monthlyDispensePrescriptions () {
        return this.latestPrescriptions.filter((latestVisitDetails) => {
                  return latestVisitDetails.prescription.prescriptionDetails[0].dispenseType.code === 'DM' && latestVisitDetails.episode.patientServiceIdentifier.service.code === this.serviceCode
                })
      },
       quarterlyDispensePrescriptions () {
          return this.latestPrescriptions.filter((latestVisitDetails) => {
                  return latestVisitDetails.prescription.prescriptionDetails[0].dispenseType.code === 'DT' && latestVisitDetails.episode.patientServiceIdentifier.service.code === this.serviceCode
                })
      },
       semestralDispensePrescriptions () {
         return this.latestPrescriptions.filter((latestVisitDetails) => {
                  return latestVisitDetails.prescription.prescriptionDetails[0].dispenseType.code === 'DS' && latestVisitDetails.episode.patientServiceIdentifier.service.code === this.serviceCode
                })
      }
  },
    created () {
    // this.loadData()
    },
     mounted () {
  //    this.updateChart()
    //  this.$q.loading.hide()
    },
     watch: {
   serviceCode: function (newVal, oldVal) {
       //   console.log('Prop changed: ', newVal, ' | was: ', oldVal)
      this.weeksMonthsMontly = []
       this.weeksMonthsQuarterly = []
        this.weeksMonthsSemestraly = []
            this.getLastPatientTarvPrescription()
      console.log(this.allDispensePrescriptions)
   //    console.log(this.quarterlyDispensePrescriptions)
        this.mapDispenseMonthly = this.getLastPrescriptionsMonthlyByMonth()
    this.mapDispenseQuarterly = this.getLastPrescriptionsQuarterlyByMonth()
    this.mapDispenseSemestraly = this.getLastPrescriptionsSemestralByMonth()
        this.updateChart()
        },
         dataLoaded: function (newVal, oldVal) {
          console.log('Prop changed: ', newVal, ' | was: ', oldVal)
           this.getLastPatientTarvPrescription()
      console.log(this.allDispensePrescriptions)
   //    console.log(this.quarterlyDispensePrescriptions)
        this.mapDispenseMonthly = this.getLastPrescriptionsMonthlyByMonth()
    this.mapDispenseQuarterly = this.getLastPrescriptionsQuarterlyByMonth()
    this.mapDispenseSemestraly = this.getLastPrescriptionsSemestralByMonth()
    this.updateChart()
        }
     }
}
</script>
