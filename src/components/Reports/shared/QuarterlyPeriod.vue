<template>
<form @submit.prevent="submitForm" >
     <div class="row q-mb-md">
        <q-select
            class="col q-mr-md"
            dense outlined
            transition-show="flip-up"
            transition-hide="flip-down"
            :options="quarters"
             v-model="quarter"
            ref="quarterlyPeriodRef"
            option-value="id"
            option-label="description"
            :rules="[val => !!val || 'Por favor indique o Trimestre']"
            lazy-rules
            label="Trimestre"
            @update:model-value="(val) => setSelectedQuarter(val)"
            :disable="initProcessing"
            />

             <q-input
             :disable="initProcessing"
              class="col q-mr-md"
                dense
                outlined
                type="number"
                ref="yearQuarterlyPeriodRef"
                :rules="[val => !!val || 'Por favor indique o ano']"
                v-model="yearQuarterlyPeriod"
                @update:model-value="(val) => setSelectedYear(val)"
            />
       </div>
    </form>
  </template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';

const initProcessing = inject('initProcessing')
const reportParams = inject('reportParams')
const errorCount = inject('errorCount')
const resultFromLocalStorage = inject('resultFromLocalStorage')
const serviceAux = inject('serviceAux')

const quarter = ref(null)
let yearQuarterlyPeriod = ref(new Date().getFullYear())
const quarters = ref([
                        { id: 1, description: 'Trimestre 1' },
                        { id: 2, description: 'Trimestre 2' },
                        { id: 3, description: 'Trimestre 3' },
                        { id: 4, description: 'Trimestre 4' }
                        ])
const quarterlyPeriodRef = ref(null)
const yearQuarterlyPeriodRef = ref(null)

const submitForm = () => {
    let errorCountAux = 0
    quarterlyPeriodRef.value.validate()
    if (quarterlyPeriodRef.value.hasError) errorCountAux++
    yearQuarterlyPeriodRef.value.validate()
    if (yearQuarterlyPeriodRef.value.hasError) errorCountAux++
    errorCount(errorCountAux)
}

const setSelectedQuarter = (selectedQuarter) => {    
    reportParams.value.monthSemesterQuarterView = selectedQuarter;
    reportParams.value.period = selectedQuarter.id;
};

const setSelectedYear = (year) => {
    reportParams.value.year = year
}

onMounted(() => {
    if(reportParams.value){
        serviceAux.value = clinicalServiceService.getClinicalServicePersonalizedById(reportParams.value.clinicalService)
        resultFromLocalStorage.value = true
        yearQuarterlyPeriod.value = reportParams.value.year
        quarter.value = reportParams.value.monthSemesterQuarterView
    }
})

</script>

<!-- <script>
    import { ref } from 'vue'
    export default {
        props: ['initProcessing', 'errorCount'],
        data () {
                return {
                    quarter: '',
                    yearQuarterlyPeriod: new Date().getFullYear(),
                    model: ref(new Date().getFullYear()),
                    quarters: [
                        { id: 1, description: 'Trimestre 1' },
                        { id: 2, description: 'Trimestre 2' },
                        { id: 3, description: 'Trimestre 3' },
                        { id: 3, description: 'Trimestre 4' }
                        ]
                        }
            },
        methods: {
                setSelectedQuarter () {
                     this.$emit('setSelectedQuarter', this.quarter)
                 },
                setSelectedYearQuarter () {
                    this.$emit('setSelectedYearQuarter', this.yearQuarterlyPeriod)
                 },
                 submitForm () {
                    let errorCountAux = 0
              this.$refs.quarterlyPeriod.validate()
              if (this.$refs.quarterlyPeriod.hasError) errorCountAux++
              this.$refs.quarterlyPeriod.validate()
              if (this.$refs.yearQuarterlyPeriod.hasError) errorCountAux++
              this.$emit('errorCount', errorCountAux)
              }
            }
            }
</script> -->
