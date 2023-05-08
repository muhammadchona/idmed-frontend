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
                      v-model="reportParams.periodTypeView"
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

                      <div v-if="mobile" class="row q-ml-md">
                        <div class="col">
                          <q-radio dense v-model="reportParams.localOrOnline" val="local" label="Local" class="col q-mr-md"/>
                          <q-radio dense v-model="reportParams.localOrOnline" val="online" label="Online"  class="col q-mr-md" />
                        </div>
                      </div>

                    <div class="">
                      <q-btn
                      type="submit"
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
                      <q-linear-progress class="col q-mx-md" size="25px" stripe rounded :value="this.progress" color="red">
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

<script>
import Province from '../../../store/models/province/Province'
import Clinic from '../../../store/models/clinic/Clinic'
import { ref } from 'vue'
import { LocalStorage, SessionStorage, date } from 'quasar'
import moment from 'moment'
import mixinSystemPlatform from 'src/mixins/mixin-system-platform'
// import ReportDatesParams from '../../../reports/ReportDatesParams'
// import moment from 'moment'
export default {
    props: ['clinicalService', 'menuSelected', 'id', 'progress', 'reportType', 'progressValue', 'applicablePeriods', 'tabName', 'params'],
    mixins: [mixinSystemPlatform],
    data () {
      const progress1 = ref(0)
      return {
        reportParams: {
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
        },
        periodTypeList: ref([
          { id: 1, description: 'Especifico', code: 'SPECIFIC' },
          { id: 2, description: 'Mensal', code: 'MONTH' },
          { id: 3, description: 'Trimestral', code: 'QUARTER' },
          { id: 4, description: 'Semestral', code: 'SEMESTER' },
          { id: 5, description: 'Anual', code: 'ANNUAL' }
        ]),
        progress1,
        initProcessing: false,
        errorCountAux: 0
      }
    },
    created () {
      this.init()
      this.initParams()
    },
      mounted () {
        console.log(this.mobile)
        console.log(this.website)
        if (this.params) {
          this.reportParams = this.params
       //   this.progress = this.params.progress
        //  this.periodTypeView = this.params.periodTypeView
        //  this.reportParams.startDateParam = this.params.startDateParam
        }
    },
    computed: {
      processingTerminated () {
        return this.progress >= 100
      },
      progressLabel1 () {
        console.log(this.progress)
        return this.progress + '%'
      },
      provinces: {
        get () {
          return Province.query().with('districts').has('code').get()
        }
      },
      districts: {
        get () {
          if (this.reportParams.province !== null) {
            return this.province.districts
          } else {
              return null
          }
        }
      },
      clinics: {
        get () {
          if (this.reportParams.district !== null) {
            return Clinic.query().with('districts').where('district_id', this.reportParams.districtId).get()
          } else {
              return null
          }
        }
      },
      isProvincialLevel () {
        return false
      },
      isClinicLevel () {
        return true
      },
      currClinic () {
        if (SessionStorage.getItem('currClinic') === null || SessionStorage.getItem('currClinic').id === null) {
          const clinic = Clinic.query()
                                .with('province.*')
                                .with('facilityType.*')
                                .with('district.*')
                                .with('sectors.*')
                                .where('mainClinic', true)
                                .first()
           SessionStorage.set('currClinic', clinic)
           return clinic
        } else {
          return new Clinic(SessionStorage.getItem('currClinic'))
        }
      },
      currProvince () {
        return Province.query().with('districts').where('id', SessionStorage.getItem('currProvince').id).first()
      }
    },
    methods: {
       date: ref(moment(date).format('YYYY/MM/DD')),
        blockDataFutura (date) {
            return date <= moment(new Date()).format('YYYY/MM/DD')
        },
      init () {
        if (this.applicablePeriods !== null) {
          // this.periodTypeList = ref(this.applicablePeriods)
        }
      },
      errorCount (value) {
        this.errorCountAux = value
      console.log(value)
   },
      validateFilersReport () {
        let countErr = 0
            this.$refs.period.validate()
            if (this.$refs.period.hasError) {
              countErr++
            }
           if (this.$refs.endDate !== undefined && this.$refs.endDate !== null) {
            this.$refs.endDate.validate()
            countErr = this.$refs.endDate.hasError ? countErr + 1 : countErr
           }
           if (this.$refs.startDate !== undefined && this.$refs.startDate !== null) {
            this.$refs.startDate.validate()
            countErr = this.$refs.startDate.hasError ? countErr + 1 : countErr
           }
           const ref = this.$refs.periodoRef !== null && this.$refs.periodoRef !== undefined ? this.$refs.periodoRef : this.$refs.quarterlyPeriod !== null && this.$refs.quarterlyPeriod !== undefined ? this.$refs.quarterlyPeriod : this.$refs.semesterPeriod !== null && this.$refs.semesterPeriod !== undefined ? this.$refs.semesterPeriod : this.$refs.annualPeriod !== null && this.$refs.annualPeriod !== undefined ? this.$refs.annualPeriod : null
           if (ref !== null) {
            ref.submitForm()
            /* this.$refs.periodoRef.$refs.monthlyPeriod.validate()
            errorCount = this.$refs.periodoRef.$refs.monthlyPeriod.hasError ? errorCount + 1 : errorCount
            this.$refs.periodoRef.$refs.monthlyPeriod.validate()
            errorCount = this.$refs.periodoRef.$refs.yearMonthlyPeriod.hasError ? errorCount + 1 : errorCount */
           }
            if (countErr === 0 && this.errorCountAux === 0) {
                this.processReport()
            }
        },
      onPeriodoChange (val) {
        this.reportParams.provinceId = null
        this.reportParams.districtId = null
        this.reportParams.endDateParam = null
        this.reportParams.startDateParam = null
        this.reportParams.year = new Date().getFullYear()
        this.reportParams.period = null
        this.reportParams.periodTypeView = val
        this.reportParams.progress = 0
      },
      initParams () {
        if (this.isClinicLevel) {
          console.log('trsteee' + this.currClinic)
          this.reportParams.clinicId = this.currClinic.id
          this.reportParams.clinic = this.currClinic
        } else {
          this.reportParams.provinceId = this.currClinic.province.id
          this.reportParams.province = this.currClinic.province
        }
        if (this.mobile) {
        this.reportParams.localOrOnline = 'local'
        } else {
          this.reportParams.localOrOnline = 'online'
        }
        console.log(this.reportParams)
      },
      setSelectedYear (year) {
        this.reportParams.year = year
      },
       setSelectedPeriod (selectedPeriod) {
        this.reportParams.period = selectedPeriod.id
      },
      processReport () {
          this.reportParams.id = this.id
          this.reportParams.clinicalService = this.clinicalService.id
          if (this.reportParams.periodTypeView !== null) {
            this.reportParams.periodType = this.reportParams.periodTypeView.code
          }
          if (this.reportType !== null) {
            this.reportParams.reportType = this.reportType
          }
          if (this.reportParams.district !== null) {
             this.reportParams.districtId = this.reportParams.district.id
           }
        //   this.reportParams.clinicId = this.currClinic.id
     //     this.reportParams.clinic = this.currClinic
          this.saveParams()
          console.log(this.reportParams)
          this.initProcessing = true
          this.$emit('initReportProcessing', this.reportParams)
          this.$emit('updateProgressBar', this.progress1)
          // ReportDatesParams.determineStartEndDate(this.reportParams)
         // this.updateProgressBar()
      },
      saveParams () {
        this.reportParams.tabName = this.tabName
       // this.reportParams.id = 'report' + this.reportParams.id
        LocalStorage.set(this.reportParams.id, this.reportParams)
      },
      generateReport (fileType) {
        this.$emit('generateReport', this.id, fileType, this.reportParams)
      },
      initReportProcessing () {
        this.$emit('initReportProcessing', this.reportParams)
      },
      updateProgressBar () {
        this.progress1 = this.progressValue
      },
      getWidthDateByPlatform () {
        if (this.website) {
         return 'width: 20%'
        } else {
        return 'width: 100px'
        }
      }
    },
    components: {
      //  SpecificPeriod: require('components/Reports/shared/SpecificPeriod.vue').default,
       SemesterPeriod: require('components/Reports/shared/SemesterPeriod.vue').default,
       MonthlyPeriod: require('components/Reports/shared/MonthlyPeriod.vue').default,
       QuarterlyPeriod: require('components/Reports/shared/QuarterlyPeriod.vue').default,
       AnnualPeriod: require('components/Reports/shared/AnnualPeriod.vue').default
    }

}
</script>

<style>
    .fild-radius {
        border-radius: 5px;
    }
</style>
