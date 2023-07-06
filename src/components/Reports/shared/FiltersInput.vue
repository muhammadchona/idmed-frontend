<template>
            <form @submit.prevent="validateFilersReport" >
            <div class="row">
              <div class="col row q-pt-md">
                    <q-select
                      dense outlined
                      v-if="isProvincialLevel"
                      disable
                      class="col q-mr-md"
                      :options="provinces"
                      v-model="reportParams.province"
                      ref="province"
                      option-value="id"
                      option-label="description"
                      label="Província" />

                    <q-select
                      class="col q-mr-md"
                      v-if="isProvincialLevel"
                      dense outlined
                      :options="districts"
                      v-model="reportParams.district"
                      ref="district"
                      option-value="id"
                      option-label="description"
                      label="Distrito"
                      :disable="initProcessing" />

                    <q-select
                      class="col q-mr-md"
                      dense outlined
                      :disable="isClinicLevel"
                      :options="clinics"
                      v-model="reportParams.clinic"
                      ref="clinic"
                      option-value="id"
                      option-label="clinicName"
                      label="Farmácia"
                       />

                    <q-select
                      class="col q-mr-md"
                      dense outlined
                      :options="periodTypeList"
                      v-model="periodTypeSelect"
                      ref="period"
                      option-value="code"
                      option-label="description"
                      @update:model-value="val => onPeriodoChange(val)"
                        :rules="[ val => ( val != null) || ' Por favor indique o período']"
                      lazy-rules
                      label="Período *"
                      :disable="initProcessing" />

                     <div  class="row q-mb-md" v-if="reportParams.periodTypeView !== null && reportParams.periodTypeView.id ===1">
                        <q-input
                          dense
                          outlined
                          :disable="initProcessing"
                          class="col q-mr-sm"
                          v-model="reportParams.startDateParam"
                          :rules="[val => !!val || 'Por favor indique a data de início']"
                          ref="startDate"
                          label="Data Início">
                          <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                  <q-date v-model="reportParams.startDateParam"  mask="DD-MM-YYYY">
                                  <div class="row items-center justify-end">
                                      <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                  </q-date>
                              </q-popup-proxy>
                              </q-icon>
                          </template>
                        </q-input>
                        <q-input
                         style="width: 100px"
                          dense
                          outlined
                          :disable="initProcessing"
                          ref="endDate"
                          class="col q-mr-sm"
                          v-model="reportParams.endDateParam"
                          :rules="[val => !!val || 'Por favor indique a data de fim']"
                          label="Data Fim">
                          <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                  <q-date v-model="reportParams.endDateParam"
                                  mask="DD-MM-YYYY"
                                   :options="blockDataFutura">
                                  <div class="row items-center justify-end">
                                      <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                  </q-date>
                              </q-popup-proxy>
                              </q-icon>
                          </template>
                        </q-input>
                    </div>

                    <MonthlyPeriod
                      v-else-if="reportParams.periodTypeView !== null && reportParams.periodTypeView.id ===2"
                      :initProcessing="initProcessing"
                      @setSelectedMonth="setSelectedPeriod"
                      @setSelectedYearMonth="setSelectedYear"
                      @errorCount="errorCount"
                      ref="periodoRef"/>

                    <QuarterlyPeriod
                      v-else-if="reportParams.periodTypeView !== null && reportParams.periodTypeView.id ===3"
                      :initProcessing="initProcessing"
                      @setSelectedQuarter="setSelectedPeriod"
                      @setSelectedYearQuarter="setSelectedYear"
                      @errorCount="errorCount"
                      ref="quarterlyPeriod"/>

                    <SemesterPeriod
                      v-else-if="reportParams.periodTypeView !== null && reportParams.periodTypeView.id ===4"
                      :initProcessing="initProcessing"
                      @setSelectedSemester="setSelectedPeriod"
                      @setSelectedSemesterYear="setSelectedYear"
                      @errorCount="errorCount"
                      ref="semesterPeriod" />

                    <AnnualPeriod
                    :initProcessing="initProcessing"
                      v-else-if="reportParams.periodTypeView !== null && reportParams.periodTypeView.id ===5"
                      @setSelectedYearAnnual="setSelectedYear"
                      @errorCount="errorCount"
                      ref="annualPeriod"/>

                      <div v-if="!website" class="row q-ml-md">
                        <div class="col">
                          <q-radio dense v-model="reportParams.localOrOnline" val="local" label="Local" class="col q-mr-md"/>
                          <q-radio dense v-model="reportParams.localOrOnline" val="online" label="Online"  class="col q-mr-md" />
                        </div>
                      </div>

                    <div class="">
                      <q-btn
                      type="submit"
                      ref="submitForm"
                      class="gt-xs"
                        :color="!processingTerminated ? 'green-6' : 'grey-6'"
                        :disable="initProcessing"
                        dense
                        rounded
                        icon="chevron_right"
                      >
                        <q-tooltip class="bg-primary">Processar o Relatório</q-tooltip>
                      </q-btn>
                    </div>
                    <div class="q-mr-md q-pt-xs items-center" style="width: 250px;">
                      <q-linear-progress class="col q-mx-md" size="25px" stripe rounded :value="progress" color="red">
                        <div class="absolute-full flex flex-center">
                            <q-badge color="white" text-color="accent" :label="progressLabel1" />
                        </div>
                      </q-linear-progress>
                    </div>
              </div>

              <div class="row q-ml-md">
                <div class="col">
                  <q-btn :color="processingTerminated ? 'green-6' : 'grey-6'" class="row gt-xs" flat dense icon="article" :disable="!processingTerminated" @click.stop="generateReport('XLS')">
                    <q-tooltip class="bg-primary">Imprimir Excel</q-tooltip>
                    .Xls
                </q-btn>
                <q-btn :color="processingTerminated ? 'green-6' : 'grey-6'" class="gt-xs" flat dense  @click.stop="generateReport('PDF')" :disable="!processingTerminated" icon="article" title=".pdf">
                  <q-tooltip class="bg-primary">Imprimmir Pdf</q-tooltip>
                  .Pdf
                  </q-btn>
                </div>
              </div>
            </div>
           </form>
</template>

<script setup>
import Province from '../../../stores/models/province/Province'
import Clinic from '../../../stores/models/clinic/Clinic'
import { onMounted, ref, computed, inject } from 'vue'
import { LocalStorage, SessionStorage, date } from 'quasar'
import moment from 'moment'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

import SemesterPeriod from 'components/Reports/shared/SemesterPeriod.vue'   
 import MonthlyPeriod from 'components/Reports/shared/MonthlyPeriod.vue'   
   import  QuarterlyPeriod from 'components/Reports/shared/QuarterlyPeriod.vue'   
   import  AnnualPeriod from 'components/Reports/shared/AnnualPeriod.vue'

   const { website, isDeskTop, isMobile } = useSystemUtils();
   const props = defineProps(['clinicalService', 'menuSelected', 'id', 'progress', 'reportType', 'progressValue', 'applicablePeriods', 'tabName', 'params'])
   const $emit = defineEmits(['initReportProcessing','updateProgressBar','generateReport' ])

   const currClinic = inject('currClinic')
   const progress1 = ref(0)
   const period = ref('')
   const endDate = ref(null)
   const startDate = ref(null)
   const periodoRef = ref('')
   const quarterlyPeriod = ref('')
   const semesterPeriod = ref('')
   const annualPeriod = ref('')
   const submitForm = ref('')


   

      const  reportParams = ref({
          id: null,
          provinceId: null,
          districtId: null,
          clinicId: null,
          clinic: null,
          province: null,
          district: null,
          endDateParam: null,
          startDateParam: null,
          clinicalService: null,
          year: new Date().getFullYear(),
          period: null,
          periodTypeView: null,
          reportType: null,
          progress: 0,
          localOrOnline: '',
          startDate: null,
          endDate: null,
          online: true
        })

      const  periodTypeList =  ref([
          { id: 1, description: 'Especifico', code: 'SPECIFIC' },
          { id: 2, description: 'Mensal', code: 'MONTH' },
          { id: 3, description: 'Trimestral', code: 'QUARTER' },
          { id: 4, description: 'Semestral', code: 'SEMESTER' },
          { id: 5, description: 'Anual', code: 'ANNUAL' }
        ])
        const initProcessing =  ref(false)
        const errorCountAux = 0

        const periodTypeSelect = reportParams.value.periodTypeView
    onMounted( () => {
     //  init()
      initParams()
      if (props.params) {
          reportParams.value = props.params
        }
    })
    
    const processingTerminated = computed(() =>{
        return props.progress >= 100
      })

      const progressLabel1  = computed (() => {
        return props.progress + '%'
      })

      const provinces = computed(() => {
          return Province.query().with('districts').has('code').get()
      })

      const districts =(() => {
        
          if (reportParams.value.province !== null) {
            return props.province.districts
          } else {
              return null
        }
      })

      const clinics=  computed(()=> {
          if (reportParams.value.district !== null) {
            return Clinic.query().with('districts').where('district_id', reportParams.value.districtId).get()
          } else {
              return null
          }
      })

      const isProvincialLevel=computed( () => {
        return false
      })

      const isClinicLevel= computed( () => {
        return true
      })

     

    const   currProvince  = computed(() =>{
        return Province.query().with('districts').where('id', SessionStorage.getItem('currProvince').id).first()
      })

        const blockDataFutura =  (date) => {
         const data= ref(moment(date).format('YYYY/MM/DD'))
            return data.value <= moment(new Date()).format('YYYY/MM/DD')
        }

     /* const init=  ()=> {
        if (   applicablePeriods !== null) {
          //    periodTypeList = ref(   applicablePeriods)
        }
      } */

      const errorCount = (value) => {
           errorCountAux = value
      console.log(value)
   }

   const   validateFilersReport=  () => {
        let countErr = 0
            period.value.validate()
            if (period.value.hasError) {
              countErr++
            }
           if (endDate.value !== undefined && endDate.value !== null) {
            endDate.value.validate()
            countErr = endDate.value.hasError ? countErr + 1 : countErr
           }
           if (startDate.value !== undefined && startDate.value !== null) {
            startDate.value.validate()
            countErr = startDate.value.hasError ? countErr + 1 : countErr
           }
           const ref = periodoRef.value !== null && periodoRef.value !== undefined ? periodoRef : quarterlyPeriod.value !== null && quarterlyPeriod.value !== undefined ? quarterlyPeriod : semesterPeriod.value !== null && semesterPeriod.value !== undefined ? semesterPeriod : annualPeriod.value !== null && annualPeriod.value !== undefined ? annualPeriod : null
           if (ref !== null) {
            submitForm.value.click()
            /* $refs.periodoRef.$refs.monthlyPeriod.validate()
            errorCount = $refs.periodoRef.$refs.monthlyPeriod.hasError ? errorCount + 1 : errorCount
            $refs.periodoRef.$refs.monthlyPeriod.validate()
            errorCount = $refs.periodoRef.$refs.yearMonthlyPeriod.hasError ? errorCount + 1 : errorCount */
           }
            if (countErr === 0 && errorCountAux === 0) {
                processReport()
            }
        }

      const onPeriodoChange= (val)=> {
        reportParams.value.provinceId = null
        reportParams.value.districtId = null
        reportParams.value.endDateParam = null
        reportParams.value.startDateParam = null
        reportParams.value.year = new Date().getFullYear()
        reportParams.value.period = null
        reportParams.value.periodTypeView = val
        reportParams.value.progress = 0
      }

      const initParams = ()=> {
        if (isClinicLevel.value) {
          reportParams.value.clinicId = currClinic.value.id
          reportParams.value.clinic = currClinic.value
        } else {
          reportParams.value.provinceId = currClinic.value.province.id
          reportParams.value.province = currClinic.value.province
        }
        if (!website) {
        reportParams.value.localOrOnline = 'local'
        } else {
          reportParams.value.localOrOnline = 'online'
        }
        console.log(reportParams)
      }

      const setSelectedYear= (year)=> {
        reportParams.value.year = year
      }

      const setSelectedPeriod= (selectedPeriod)=> {
        reportParams.value.period = selectedPeriod.id
      }

      const processReport=  ()=> {
          reportParams.value.id = props.id
          reportParams.value.clinicalService = props.clinicalService.id
          if (reportParams.value.periodTypeView !== null) {
            reportParams.value.periodType = reportParams.value.periodTypeView.code
          }
          if (props.reportType !== null) {
            reportParams.value.reportType = props.reportType
          }
          if (reportParams.value.district !== null) {
             reportParams.value.districtId = reportParams.value.district.id
           }
  
          saveParams()
          console.log(reportParams.value)
          initProcessing.value = true
          $emit('initReportProcessing', reportParams.value)
          $emit('updateProgressBar', progress1.value)

      }

      const saveParams= ()=> {
        reportParams.value.tabName = props.tabName
       const jsonPar = JSON.parse(JSON.stringify(reportParams.value))
       reportParams.value.clinic = null
       
        LocalStorage.set(reportParams.value.id,jsonPar)
      }

      const generateReport= (fileType)=> {
        $emit('generateReport', props.id, fileType, reportParams.value)
      }

      const initReportProcessing= ()=> {
        $emit('initReportProcessing', reportParams.value)
      }

      const updateProgressBar=  ()=> {
        progress1.value = progressValue
      }

      const getWidthDateByPlatform =()=> {
        if (website) {
         return 'width: 20%'
        } else {
        return 'width: 100px'
        }
      }

</script>

<style>
    .fild-radius {
        border-radius: 5px;
    }
</style>
