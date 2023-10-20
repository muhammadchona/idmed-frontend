<template>
<form @submit.prevent="submitForm" >
     <div class="row q-mb-md">
        <q-select
            class="col q-mr-md"
            dense outlined
            transition-show="flip-up"
            transition-hide="flip-down"
            :options="months"
            v-model="month"
            ref="monthlyPeriodRef"
            option-value="id"
            option-label="description"
            :rules="[val => !!val || 'Por favor indique o Mês']"
            lazy-rules
            label="Mês"
            :disable="initProcessing"
            @update:model-value="(val) => setSelectedMonth(val)"
            />
             <q-input
             :disable="initProcessing"
              class="col q-mr-md"
                dense
                outlined
                v-model="yearMonthlyPeriod"
                @update:model-value="(val) => setSelectedYear(val)"
                type="number"
                ref="yearMonthlyPeriodRef"
                :rules="[val => !!val || 'Por favor indique o ano']"
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

let yearMonthlyPeriod = ref(parseInt(new Date().getFullYear()))
const monthlyPeriodRef = ref(null)
const yearMonthlyPeriodRef = ref(null)
const month = ref(null)
const months = ref([
    { id: 1, description: 'Janeiro' },
    { id: 2, description: 'Fevereiro' },
    { id: 3, description: 'Março' },
    { id: 4, description: 'Abril' },
    { id: 5, description: 'Maio' },
    { id: 6, description: 'Junho' },
    { id: 7, description: 'Julho' },
    { id: 8, description: 'Agosto' },
    { id: 9, description: 'Setembro' },
    { id: 10, description: 'Outubro' },
    { id: 11, description: 'Novembro' },
    { id: 12, description: 'Dezembro' }
    ])

    const submitForm = () => {
      let errorCountAux = 0
      monthlyPeriodRef.value.validate()
      if (monthlyPeriodRef.value.hasError) errorCountAux++
      yearMonthlyPeriodRef.value.validate()
      if (yearMonthlyPeriodRef.value.hasError) errorCountAux++
      errorCount(errorCountAux)
    }

    const setSelectedMonth = (selectedMonth) => {    
      reportParams.value.monthSemesterQuarterView = selectedMonth;
      reportParams.value.period = selectedMonth.id;
    };

    const setSelectedYear = (year) => {
      reportParams.value.year = year
    }

    onMounted(() => {
    if(reportParams.value.id){
        serviceAux.value = clinicalServiceService.getClinicalServicePersonalizedById(reportParams.value.clinicalService)
        resultFromLocalStorage.value = true
        yearMonthlyPeriod.value = reportParams.value.year
        month.value = reportParams.value.monthSemesterQuarterView
    }
})

</script>