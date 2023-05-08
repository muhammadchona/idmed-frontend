<template>
  <div class="q-pa-md" style="width: 900px; max-width: 90vw;">
    <q-table
      title="Monitoria e Reforço de Adesão"
      :rows="monithoringQuestions"
      :columns="columns"
      row-key="question"
      :separator="separator"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      virtual-scroll
      hide-bottom
         table-header-class="text-white"
        class="my-sticky-header-table"
        title-class="text-bold text-white">
        <template v-slot:body="props">
         <q-tr :props="props">
            <q-td key="question" v-if="props.row.code === '01' || props.row.code == '03' " >
             {{props.row.question}}
            </q-td>
            <q-td key="question" v-if="props.row.code === '02'  && viewLateDaysWithout ||
                  props.row.code === '04'  && viewLateMotives " align="left">
               {{props.row.question}}
            </q-td>
              <q-td key="completed" v-if="props.row.code !== '02' && props.row.code !== '04' && props.row.code !== '05'" align="right">
                <q-radio   v-model="props.row.completed" val=true @update:model-value="handleInput(props.row)" :disable="onlyView"/>
            </q-td>
             <q-td key="completed" v-if="props.row.code !== '02' && props.row.code !== '04' &&   props.row.code !== '05'"  align="left">
                <q-radio   v-model="props.row.completed" val=false @update:model-value="handleInput(props.row)" :disable="onlyView"/>
            </q-td>
             <q-td key="days" v-if="props.row.code === '02'  && viewLateDaysWithout ||
                  props.row.code === '04'  && viewLateMotives " align="left">
                <q-input
              v-if="props.row.code === '02' && viewLateDaysWithout"
              :disable="onlyView"
      v-model.number="props.row.days"
      type="number"
      @update:model-value="handleInput(props.row)"
    />
    <q-input
              v-if="props.row.code === '04' && viewLateMotives"
               :disable="onlyView"
      v-model.number="props.row.days"
      type="number"
      @update:model-value="handleInput(props.row)"
    />
            </q-td>
             <q-td key="question" v-if="props.row.code === '05' && viewLateMotives">
                  <q-input filled v-if="!onlyView" v-model="props.row.text" label="Motivos" @update:model-value="handleInput(props.row)" />
                   <q-input v-if="onlyView" :disable="onlyView" filled v-model="props.row.text" label="Motivos" @update:model-value="handleInput(props.row)" />
            </q-td>
         </q-tr>
        </template>
    </q-table>
    <q-card>
    <q-card-actions align="right" class="q-mb-md q-mr-sm" v-if="onlyView">
                <q-btn label="Sair" color="red" @click="$emit('close')" align="right" />
     </q-card-actions>
    </q-card>
  </div>
</template>
<script>
import AdherenceScreening from '../../../store/models/screening/AdherenceScreening'
// import { ref } from 'vue'
const columns = [
  {
    name: 'question',
    required: true,
    label: 'Perguntas de Monitoria e Reforço a Adesão',
    align: 'left',
    field: row => row.question,
    format: val => `${val}`
  },
  { name: 'sim', label: 'Sim', field: row => row.completed, align: 'right' },
  { name: 'nao', label: 'Não', field: row => row.completed, align: 'left' }
]

const monithoringQuestions = [
        {
           question: 'O paciente veio na data marcada ?',
           completed: false,
            code: '01'
         },
         {
           question: 'Se não, quantos dias de atraso completou o paciente ?',
           completed: false,
            code: '02',
            days: ''
         },
          {
           question: 'Nos ultimos 2 meses teria se esquecido de tomar os seus medicamentos algum dia na sua hora habitual ?',
           completed: false,
            code: '03',
            date: ''
         },
          {
           question: 'Quantos dias passou da hora sem tomar os medicamentos ?',
           completed: false,
            code: '04',
            days: ''
         },
          {
           question: '',
           completed: false,
            code: '05',
            date: '',
            text: ''
         }
]
// let viewLateMotives
export default {
     props: ['selectedAdherenceTracing', 'onlyView'],
    data () {
        return {
            columns,
           monithoringQuestions,
           // rows: ref(this.monithoringQuestionsCopy),
           adherenceScreening: new AdherenceScreening(),
           viewLateDaysWithout: false,
            viewLateMotives: false
        }
    },
    methods: {
         handleInput (row) {
   switch (row.code) {
    case '01':
      this.adherenceScreening.hasPatientCameCorrectDate = row.completed
      if (row.completed === 'false') {
       this.viewLateDaysWithout = true
      } else {
      this.viewLateDaysWithout = false
       this.adherenceScreening.daysWithoutMedicine = 0
      }
      break
      case '02':
        if (this.adherenceScreening.hasPatientCameCorrectDate === 'false') {
         this.adherenceScreening.daysWithoutMedicine = row.days
        } else {
          this.adherenceScreening.daysWithoutMedicine = 0
        }
      break
     case '03':
      this.adherenceScreening.patientForgotMedicine = row.completed
      if (row.completed === 'true') {
       this.viewLateMotives = true
      } else {
      this.viewLateMotives = false
      this.adherenceScreening.lateDays = 0
      }
      break
       case '04':
         if (this.adherenceScreening.patientForgotMedicine === 'true') {
         this.adherenceScreening.lateDays = row.days
        } else {
          this.adherenceScreening.lateDays = 0
        }
      break
      case '05':
      this.adherenceScreening.lateMotives = row.text
      break
  default:
    console.log('Sorry, we are out of .')
   }
    this.$emit('adherenceScreening', this.adherenceScreening)
    },
    addingValueToArray () {
       if (this.selectedAdherenceTracing) {
           monithoringQuestions.forEach(monithoringQuestion => {
              if (monithoringQuestion.code === '01') monithoringQuestion.completed = String(this.selectedAdherenceTracing.hasPatientCameCorrectDate)
              if (monithoringQuestion.code === '02') monithoringQuestion.days = this.selectedAdherenceTracing.daysWithoutMedicine
            if (monithoringQuestion.code === '03') monithoringQuestion.completed = String(this.selectedAdherenceTracing.patientForgotMedicine)
            if (monithoringQuestion.code === '04') monithoringQuestion.days = this.selectedAdherenceTracing.lateDays
            if (monithoringQuestion.code === '05') monithoringQuestion.text = this.selectedAdherenceTracing.lateMotives
          })
          if (!this.selectedAdherenceTracing.hasPatientCameCorrectDate) {
             this.viewLateDaysWithout = true
          }
          if (this.selectedAdherenceTracing.patientForgotMedicine) {
             this.viewLateMotives = true
          }
    }
    }
    },
    created () {
       this.addingValueToArray()
    },
    components: {
    },
    mounted () {
    },
    computed: {
    }
}
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */

  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: primary

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 0px
</style>
