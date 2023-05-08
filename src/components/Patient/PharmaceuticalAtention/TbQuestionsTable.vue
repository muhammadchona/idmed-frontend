<template>
  <div class="q-pa-md">
    <q-table
      title="Rastreio de Tuberculose"
      :rows="tbQuestions"
      :columns="columns"
      row-key="question"
      :separator="separator"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      virtual-scroll
        hide-bottom
        table-header-class="text-white"
        class="my-sticky-header-table"
        title-class="text-bold text-white"
    >
     <template v-slot:body="props">
            <q-tr :props="props">
            <q-td key="question" v-if="props.row.code !== '03'">
             {{props.row.question}}
            </q-td>
             <q-td key="date" v-if="props.row.code === '03' && this.visible === true">
                  <q-input
                        dense
                        outlined
                        class="col"
                        v-model="props.row.date"
                        mask="date"
                        :rules="['date']"
                         :disable="onlyView"
                         @update:model-value="handleInput(props.row)"
                        label="Data de Inicio de Tratamento de Tuberculose">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="props.row.date" :options="optionsNonFutureDate"  @update:model-value="handleInput(props.row)">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
            </q-td>
            <q-td key="answer" v-if="props.row.code !== '03'" align="right">
                <q-radio   v-model="props.row.answer" val=true @update:model-value="handleInput(props.row)" :disable="onlyView"/>
            </q-td>
             <q-td key="answer" v-if="props.row.code !== '03'" align="left">
                <q-radio   v-model="props.row.answer" val=false @update:model-value="handleInput(props.row)" :disable="onlyView"/>
            </q-td>
            </q-tr>
        </template>
    </q-table>
   <q-table
      :rows="tbQuestion2"
      :columns="columns2"
      row-key="question"
      :separator="separator"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      virtual-scroll
        hide-bottom
       table-header-class="text-white"
        class="my-sticky-header-table"
            title-class="text-white"
    >
     <template v-slot:body="props">
            <q-tr :props="props">
            <q-td key="question" >
             {{props.row.question}}
            </q-td>
            <q-td key="answer" align="right">
                <q-radio   v-model="props.row.answer" val=true @update:model-value="handleInput(props.row)" :disable="onlyView"/>
            </q-td>
             <q-td key="answer" align="left">
                <q-radio   v-model="props.row.answer"  val=false  @update:model-value="handleInput(props.row)" :disable="onlyView"/>
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
import TBScreening from '../../../store/models/screening/TBScreening'
import moment from 'moment'
const columns = [
  {
    name: 'question',
    required: true,
    label: 'Perguntas de Rastreio de Tuberculose',
    align: 'left',
    field: row => row.question,
    format: val => `${val}`
  },
  { name: 'sim', label: 'Sim', field: row => row.answer, align: 'right' },
  { name: 'nao', label: 'Não', field: row => row.answer, align: 'left' }
]
const columns2 = [
  {
    name: 'question',
    required: true,
    label: 'Sinais e Sintomas sugestivos a TB',
    align: 'left',
    field: row => row.question,
    format: val => `${val}`
  },
  { name: 'sim', label: 'Sim', field: row => row.answer, align: 'right' },
  { name: 'nao', label: 'Não', field: row => row.answer, align: 'left' }
]

const tbQuestions = [
        {
           question: 'Está Actualmente em tratamento Profilático com Isoniazida(TPI)?',
           answer: false,
            code: '01'
         },
         {
           question: 'Está em tratamento de tuberculose(TB)?',
           answer: false,
            code: '02'
         },
          {
           question: '',
           answer: true,
            code: '03',
            date: ''
         }
]

const tbQuestion2 = [
     {
           question: 'Está com tosse a duas semanas?',
           answer: false,
            code: '04'
        },
        {
            question: 'Teve febres nas ultimas duas semanas ?',
            answer: false,
            code: '05'
        },
        {
           question: 'Perdeu peso >1.5 kg no ultimo mês?',
           answer: false,
           code: '06'
        },
        {
           question: 'Tem suado muito a noite?',
           answer: false,
            code: '07'
         },
        {
           question: 'Teve cansaco ou fadiga nas ultimas duas semanas ?',
           answer: false,
            code: '08'
        },
        {
         question: 'Tem um parente em casa que está a fazer tratamento de TB ?',
         answer: false,
         code: '09'
        }
]
export default {
    props: ['selectedTbTracing', 'onlyView'],
    data () {
        return {
            columns,
           tbQuestions,
           tbQuestion2,
           columns2,
           visible: false,
           tbScreening: new TBScreening(),
           optionsNonFutureDate (date) {
              return date <= moment().format('YYYY/MM/DD')
        }
        }
    },
    methods: {
    handleInput (row) {
      switch (row.code) {
        case '01':
          this.tbScreening.treatmentTPI = row.answer
          break
        case '02':
          this.tbScreening.treatmentTB = row.answer
          if (row.answer === 'true') {
          this.visible = true
          } else {
            this.visible = false
          }
          break
          case '03':
          if (this.tbScreening.treatmentTB === 'true') {
            this.tbScreening.startTreatmentDate = moment(row.date).format('YYYY-MM-DD')
          } else {
            this.tbScreening.startTreatmentDate = ''
          }
          break
        case '04':
          this.tbScreening.cough = row.answer
          break
          case '05':
          this.tbScreening.fever = row.answer
          break
          case '06':
          this.tbScreening.losingWeight = row.answer
          break
            case '07':
          this.tbScreening.sweating = row.answer
          break
          case '08':
          this.tbScreening.fatigueOrTirednessLastTwoWeeks = row.answer
          break
          case '09':
          this.tbScreening.parentTBTreatment = row.answer
          break
      default:
    console.log('Sorry, we are out of .')
   }
    this.$emit('tbScreening', this.tbScreening)
    },
    addingValueToArray () {
       if (this.selectedTbTracing !== null && this.selectedTbTracing !== undefined) {
      tbQuestions.forEach(tbQuestion => {
           if (tbQuestion.code === '01') tbQuestion.answer = String(this.selectedTbTracing.treatmentTPI)
            if (tbQuestion.code === '02') tbQuestion.answer = String(this.selectedTbTracing.treatmentTB)
            if (this.selectedTbTracing.treatmentTB === true) {
           this.visible = true
           if (tbQuestion.code === '03') tbQuestion.date = this.selectedTbTracing.startTreatmentDate
            } else {
               this.visible = false
            }
          })

           tbQuestion2.forEach(tbQuestion => {
            if (tbQuestion.code === '04') tbQuestion.answer = String(this.selectedTbTracing.cough)
            if (tbQuestion.code === '05') tbQuestion.answer = String(this.selectedTbTracing.fever)
            if (tbQuestion.code === '06') tbQuestion.answer = String(this.selectedTbTracing.losingWeight)
            if (tbQuestion.code === '07') tbQuestion.answer = String(this.selectedTbTracing.sweating)
            if (tbQuestion.code === '08') tbQuestion.answer = String(this.selectedTbTracing.fatigueOrTirednessLastTwoWeeks)
            if (tbQuestion.code === '09') tbQuestion.answer = String(this.selectedTbTracing.parentTBTreatment)
          })
           this.tbScreening = Object.assign({}, this.selectedTbTracing)
           this.$emit('tbScreening', this.tbScreening)
    } else {
      tbQuestions.forEach(tbQuestion => {
            if (tbQuestion.code === '01') tbQuestion.answer = false
            if (tbQuestion.code === '02') tbQuestion.answer = false
            if (tbQuestion.code === '03') tbQuestion.date = ''
          })

           tbQuestion2.forEach(tbQuestion => {
            if (tbQuestion.code === '04') tbQuestion.answer = false
            if (tbQuestion.code === '05') tbQuestion.answer = false
            if (tbQuestion.code === '06') tbQuestion.answer = false
            if (tbQuestion.code === '07') tbQuestion.answer = false
            if (tbQuestion.code === '08') tbQuestion.answer = false
            if (tbQuestion.code === '09') tbQuestion.answer = false
          })
           this.tbScreening = Object.assign({}, this.selectedTbTracing)
           this.$emit('tbScreening', this.tbScreening)
    }
    }
    },
    created () {
       this.addingValueToArray()
    },
    components: {
    },
    mounted () {
      this.addingValueToArray()
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
    background-color: #26A69A

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
