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
            ref="semesterPeriod"
            option-value="id"
            option-label="description"
            :rules="[val => !!val || ' Por favor indique o Semestre']"
            lazy-rules
            label="Semestre"
             @blur="setSelectedSemester()"
             :disable="initProcessing"
            />

             <q-input
             :disable="initProcessing"
              class="col q-mr-md"
                dense
                outlined
                type="number"
                :rules="[val => !!val || ' Por favor indique o ano']"
                v-model="yearSemesterPeriod"
                @blur="setSelectedSemesterYear()"
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
                    semester: '',
                    yearSemesterPeriod: new Date().getFullYear(),
                    model: ref(new Date().getFullYear()),
                    semesters: [
                        { id: 1, description: 'Semestre 1' },
                        { id: 2, description: 'Semestre 2' }
                        ]
                        }
            },
        methods: {
                setSelectedSemester () {
                this.$emit('setSelectedSemester', this.semester)
        },
                setSelectedSemesterYear () {
                this.$emit('setSelectedSemesterYear', this.yearSemesterPeriod)
        },
        submitForm () {
              let errorCountAux = 0
              this.$refs.semesterPeriod.validate()
              if (this.$refs.semesterPeriod.hasError) errorCountAux++
              this.$refs.yearSemesterPeriod.validate()
              if (this.$refs.yearSemesterPeriod.hasError) errorCountAux++
              this.$emit('errorCount', errorCountAux)
              }
            }
            }
</script>
