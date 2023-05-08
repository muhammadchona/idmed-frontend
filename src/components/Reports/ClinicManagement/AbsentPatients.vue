<template>
<div ref="filterDrugStoreSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Pacientes Faltosos ao levantamento
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section  class="col" >
            <FiltersInput
              :id="id"
              :clinicalService="selectedService"
              :totalRecords="totalRecords"
              :qtyProcessed="qtyProcessed"
              :reportType="report"
              :progress="progress"
              :tabName="name"
              :params="params"
              @generateReport="generateReport"
              @initReportProcessing="initReportProcessing"
            />
        </q-item-section>
    </q-item>
  </div>
   <q-dialog persistent v-model="alert.visible">
    <Dialog :type="alert.type" @closeDialog="closeDialog">
      <template v-slot:title> Informação</template>
      <template v-slot:msg> {{alert.msg}} </template>
    </Dialog>
  </q-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import Report from 'src/store/models/report/Report'
import { LocalStorage, SessionStorage } from 'quasar'
import { ref } from 'vue'
import absentPatientsTs from '../../../reports/ClinicManagement/AbsentPatients.ts'
// import { v4 as uuidv4 } from 'uuid'
import reportDatesParams from '../../../reports/ReportDatesParams'
// import AbsentPatientReport from 'src/store/models/report/pharmacyManagement/AbsentPatientReport'
// import Pack from 'src/store/models/packaging/Pack'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
import Patient from '../../../store/models/patient/Patient'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
import AbsentPatientReport from 'src/store/models/report/pharmacyManagement/AbsentPatientReport'
import mixinplatform from 'src/mixins/mixin-system-platform'
  export default {
    name: 'AbsentPatients',
    props: ['selectedService', 'menuSelected', 'id', 'params'],
    mixins: [mixinplatform],
    setup () {
      return {
        totalRecords: ref(0),
        qtyProcessed: ref(0),
        report: 'FALTOSOS_AO_LEVANTAMENTO',
        progress: ref(0),
        name: 'AbsentPatients',
         alert: ref({
          type: '',
          visible: false,
          msg: ''
        })
      }
    },
    mounted () {
         if (this.params) {
          (this.getProcessingStatus(this.params))
        }
    },
    components: {
      ListHeader: require('components/Shared/ListHeader.vue').default,
      FiltersInput: require('components/Reports/shared/FiltersInput.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
    },
    methods: {
      closeSection () {
         Report.api().delete(`/absentPatientsReport/delete/${this.id}`)
        this.$refs.filterDrugStoreSection.remove()
        LocalStorage.remove(this.id)
        SessionStorage.remove(this.id)
      },
      initReportProcessing (params) {
        if (params.localOrOnline === 'online') {
          Report.api().post('/absentPatientsReport/initReportProcess', params).then((response) => {
         setTimeout(this.getProcessingStatus(params), 2)
      })
        } else {
          this.getDataLocalDb(params)
        }
      },
      getProcessingStatus (params) {
        if (this.website) {
        Report.getProcessingStatus('absentPatientsReport', params).then(resp => {
          this.progress = resp.response.data.progress
          if (this.progress < 100) {
            setTimeout(this.getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      }
      },
      generateReport (id, fileType) {
            Report.api().get(`/absentPatientsReport/printReport/${id}/${fileType}`, { responseType: 'json' }).then(resp => {
              if (!resp.response.data[0]) {
              this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
            } else {
              const patientAux = resp.response.data[0]
              if (fileType === 'PDF') {
                absentPatientsTs.downloadPDF(
                  patientAux.clinic,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.response.data
                )
              } else {
                absentPatientsTs.downloadExcel(
                  patientAux.clinic,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.response.data
                )
              }
            }
            })
      },
      getDataLocalDb (params) {
        const reportParams = reportDatesParams.determineStartEndDate(params)
        console.log(reportParams)
        PatientVisitDetails.localDbGetAll().then(patientVisitDetails => {
          console.log(patientVisitDetails)
       const result = patientVisitDetails.filter(patientVisitDetail => patientVisitDetail.pack.nextPickUpDate >= reportParams.startDate && moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').format() <= reportParams.endDate)
          console.log(result)
          return result
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
          PatientServiceIdentifier.localDbGetById(reportData.episode.patientServiceIdentifier.id).then(identifier => {
          if (identifier.service.id === reportParams.clinicalService) {
           // console.log(reportData.pack.nextPickUpDate)
            console.log(moment(reportData.pack.nextPickUpDate, 'YYYY-MM-DD').add(3, 'days'))
          //  const newDate = moment(reportData.pack.nextPickUpDate).add(3, 'd')
          //  console.log(newDate.format())
            const absentPatientReport = new AbsentPatientReport()
            Patient.localDbGetById(reportData.patientVisit.patient.id).then(patient => {
              absentPatientReport.nid = identifier.value
              absentPatientReport.firstNames = patient.firstNames + ' ' + patient.lastNames
              absentPatientReport.cellphone = patient.cellphone
              absentPatientReport.dateBackUs = ''
              absentPatientReport.dateMissedPickUp = reportData.pack.nextPickUpDate
              absentPatientReport.dateIdentifiedAbandonment = ''
              absentPatientReport.returnedPickUp = ''
              console.log(absentPatientReport)
            })
          }
        })
          })
        })
          this.progress = 100
          params.progress = 100
      },
        displayAlert (type, msg) {
        this.alert.type = type
        this.alert.msg = msg
        this.alert.visible = true
      },
      closeDialog () {
        this.alert.visible = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  .param-container {
    border-bottom: 1px dashed $grey-13;
    border-left: 1px dashed $grey-13;
    border-right: 1px dashed $grey-13;
    border-radius: 0px 0px 5px 5px;
  }
</style>
