<template>
<form @submit.prevent="submitForm" >
     <div class="row q-mb-md">
        <q-select
            class="col q-mr-md"
            dense outlined
            :options="months"
            v-model="month"
            ref="monthlyPeriod"
            option-value="id"
            option-label="description"
            :rules="[val => !!val || 'Por favor indique o Mês']"
            lazy-rules
            @update:model-value="(val) => setSelectedMonth(val)"
            label="Mês"
            :disable="initProcessing"
            />
             <q-input
             :disable="initProcessing"
              class="col q-mr-md"
                dense
                outlined
                v-model="yearMonthlyPeriod"
                @update:model-value="(val) => setSelectedYear(val)"
                type="number"
                ref="yearMonthlyPeriod"
                :rules="[val => !!val || 'Por favor indique o ano']"
            />
       </div>
</form>
  </template>
<script setup>
import { ref, inject, onMounted } from 'vue'
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';

    export default {
      props: ['initProcessing', 'errorCount'],
        data () {
            return {
              yearMonthlyPeriod: new Date().getFullYear(),
              month: '',
            model: ref(new Date().getFullYear()),
                    months: [
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
                        ]
                        }
            },
            methods: {
              setSelectedMonth () {
                this.$emit('setSelectedMonth', this.month)
              },
              setSelectedYearMonth () {
                this.$emit('setSelectedYearMonth', this.yearMonthlyPeriod)
              },
              submitForm () {
              let errorCountAux = 0
              this.$refs.monthlyPeriod.validate()
              if (this.$refs.monthlyPeriod.hasError) errorCountAux++
              this.$refs.yearMonthlyPeriod.validate()
              if (this.$refs.yearMonthlyPeriod.hasError) errorCountAux++
              this.$emit('errorCount', errorCountAux)
              }
          }
            }
</script>
        yearMonthlyPeriod = reportParams.value.year
        month.value = reportParams.value.monthSemesterQuarterView
      }
    })

</script>