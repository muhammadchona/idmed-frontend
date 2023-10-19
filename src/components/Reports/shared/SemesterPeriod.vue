<template>
<form @submit.prevent="submitForm" >
     <div class="row q-mb-md">
        <q-select
            class="col q-mr-md"
            dense outlined
            transition-show="flip-up"
            transition-hide="flip-down"
            :options="semesters"
            v-model="semester"
            ref="semesterPeriodRef"
            option-value="id"
            option-label="description"
            :rules="[val => !!val || ' Por favor indique o Semestre']"
            lazy-rules
            label="Semestre"
            @update:model-value="(val) => setSelectedSemester(val)"
             :disable="initProcessing"
            />

             <q-input
             :disable="initProcessing"
              class="col q-mr-md"
                dense
                outlined
                ref="yearSemesterPeriodRef"
                type="number"
                :rules="[val => !!val || ' Por favor indique o ano']"
                v-model="yearSemesterPeriod"
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

const semester = ref(null)
let yearSemesterPeriod = ref(new Date().getFullYear())
const semesters = ref([
    { id: 1, description: 'Semestre 1' },
    { id: 2, description: 'Semestre 2' }
])

const semesterPeriodRef = ref(null)
const yearSemesterPeriodRef = ref(null)

    const submitForm = () => {
      let errorCountAux = 0
      semesterPeriodRef.value.validate()
      if (semesterPeriodRef.value.hasError) errorCountAux++
      yearSemesterPeriodRef.value.validate()
      if (yearSemesterPeriodRef.value.hasError) errorCountAux++
      errorCount(errorCountAux)
    }

    const setSelectedSemester = (selectedSemester) => {    
        reportParams.value.monthSemesterQuarterView = selectedSemester;
        reportParams.value.period = selectedSemester.id;
    };

    const setSelectedYear = (year) => {
      reportParams.value.year = year
    }

    onMounted(() => {
      if(reportParams.value){
        serviceAux.value = clinicalServiceService.getClinicalServicePersonalizedById(reportParams.value.clinicalService)
        resultFromLocalStorage.value = true
        yearSemesterPeriod.value = reportParams.value.year
        semester.value = reportParams.value.monthSemesterQuarterView
      }
    })
</script>