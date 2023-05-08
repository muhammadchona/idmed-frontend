<template>
<form @submit.prevent="submitForm" >
     <div class="row q-mb-md">
             <q-input
              class="col q-mr-md"
                dense
                outlined
                v-model="yearAnnualPeriod"
                type="number"
                label="Ano"
                @blur="setSelectedYearAnnual()"
                :rules="[val => !!val || ' Por favor indique o ano']"
                ref="annualPeriod"
            />
       </div>
    </form>
  </template>

<script>

    export default {
        props: ['errorCount'],
        data () {
                return {
                    yearAnnualPeriod: new Date().getFullYear(),
                    semestres: [
                        { id: 1, description: 'Semestre 1' },
                        { id: 2, description: 'Semestre 2' }
                        ]
                        }
            },
        methods: {
            setSelectedYearAnnual () {
            this.$emit('setSelectedYearAnnual', this.yearAnnualPeriod)
            },
            submitForm () {
                let errorCountAux = 0
                this.$refs.yearAnnualPeriod.validate()
                if (this.$refs.yearAnnualPeriod.hasError) errorCountAux++
              this.$emit('errorCount', errorCountAux)
              }
            }
           }
</script>
