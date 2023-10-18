<template>
<form @submit.prevent="submitForm" >
     <div class="row q-mb-md">
          <q-input
          class="col q-mr-md"
            dense
            :disable="initProcessing"
            outlined
            v-model="yearAnnualPeriod"
            type="number"
            label="Ano"
            @update:model-value="(val) => setSelectedYearAnnual(val)"
            :rules="[val => !!val || ' Por favor indique o ano']"
            ref="annualPeriodRef"
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

  let yearAnnualPeriod = ref(new Date().getFullYear())
  const annualPeriodRef = ref(null)

  const submitForm = () => {
    let errorCountAux = 0
    annualPeriodRef.value.validate()
    if (annualPeriodRef.value.hasError) errorCountAux++
    errorCount(errorCountAux)
  }

  const setSelectedYearAnnual = (year) => {
    reportParams.value.year = year
  }

  onMounted(() => {
    if(reportParams.value){
      serviceAux.value = clinicalServiceService.getClinicalServicePersonalizedById(reportParams.value.clinicalService)
      resultFromLocalStorage.value = true
      yearAnnualPeriod.value = reportParams.value.year
    }
  })

    // export default {
    //     props: ['errorCount'],
    //     data () {
    //             return {
    //                 yearAnnualPeriod: new Date().getFullYear(),
    //                 semestres: [
    //                     { id: 1, description: 'Semestre 1' },
    //                     { id: 2, description: 'Semestre 2' }
    //                     ]
    //                     }
    //         },
    //     methods: {
    //         setSelectedYearAnnual () {
    //         this.$emit('setSelectedYearAnnual', this.yearAnnualPeriod)
    //         },
    //         submitForm () {
    //             let errorCountAux = 0
    //             this.$refs.yearAnnualPeriod.validate()
    //             if (this.$refs.yearAnnualPeriod.hasError) errorCountAux++
    //           this.$emit('errorCount', errorCountAux)
    //           }
    //         }
    //        }
</script>
