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
            ref="quarterlyPeriod"
            option-value="id"
            option-label="description"
            :rules="[val => !!val || 'Por favor indique o Trimestre']"
            lazy-rules
            label="Trimestre"
            @blur="setSelectedQuarter()"
            :disable="initProcessing"
            />

             <q-input
             :disable="initProcessing"
              class="col q-mr-md"
                dense
                outlined
                type="number"
                ref="yearQuarterlyPeriod"
                :rules="[val => !!val || 'Por favor indique o ano']"
                v-model="yearQuarterlyPeriod"
                @blur="setSelectedYearQuarter()"
            />
       </div>
    </form>
  </template>

<script>
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
</script>
