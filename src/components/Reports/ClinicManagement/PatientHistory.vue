<template>
<div ref="filterDPatientHistorySection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Histórico de Levantamento
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section  class="col" >
            <FiltersInput
              :id="id"
              :typeService="selectedService"
              :progress="progress"
              :clinicalService="selectedService"
              :applicablePeriods="periodType"
              @generateReport="generateReport"
              @initReportProcessing="initReportProcessing"
            />
        </q-item-section>
    </q-item>
    <q-dialog persistent v-model="alert.visible">
    <Dialog :type="alert.type" @closeDialog="closeDialog">
      <template v-slot:title> Informação</template>
      <template v-slot:msg> {{alert.msg}} </template>
    </Dialog>
  </q-dialog>
  </div>
  </div>
</template>

<script>
 import moment from 'moment'
import Report from 'src/store/models/report/Report'
import { LocalStorage } from 'quasar'
import { ref } from 'vue'
 import patientHistoryTS from '../../../reports/ClinicManagement/PatientHistory.ts'
// import db from 'src/store/localbase'
 import reportDatesParams from '../../../reports/ReportDatesParams'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
// import ReportDatesParams from '../../../reports/ReportDatesParams'
 import PatientHistoryReport from 'src/store/models/report/pharmacyManagement/PatientHistoryReport'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
import Patient from '../../../store/models/patient/Patient'
// import PrescriptionDetail from '../../../store/models/prescriptionDetails/PrescriptionDetail'
import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'
import DispenseType from '../../../store/models/dispenseType/DispenseType'
import Prescription from 'src/store/models/prescription/Prescription'
 import DispenseMode from 'src/store/models/dispenseMode/DispenseMode'
import ClinicalService from '../../../store/models/ClinicalService/ClinicalService'
import { v4 as uuidv4 } from 'uuid'
import mixinplatform from 'src/mixins/mixin-system-platform'
  export default {
    name: 'PatientHistory',
    props: ['selectedService', 'menuSelected', 'id'],
    mixins: [mixinplatform],
    setup () {
     return {
        totalRecords: ref(0),
        qtyProcessed: ref(0),
        alert: ref({
          type: '',
          visible: false,
          msg: ''
        }),
        progress: ref(0)
      }
    },
    mounted () {
    },
    components: {
      ListHeader: require('components/Shared/ListHeader.vue').default,
      FiltersInput: require('components/Reports/shared/FiltersInput.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
    },
    methods: {
      closeSection () {
        this.$refs.filterDPatientHistorySection.remove()
        if (this.mobile) {
          PatientHistoryReport.localDbGetByReportId().then(reports => {
      //   const reportData = []
         reports.forEach(report => {
                 if (report.reportId === this.id) {
                  // reportData.push(report)
                  PatientHistoryReport.localDbDeleteById(report.reportId)
                 }
            })
        })
        }
      },
      initReportProcessing (params) {
        if (params.localOrOnline === 'online') {
            Report.apiInitPatientsHistryProcessing(params).then(resp => {
            this.progress = resp.response.data.progress
            setTimeout(this.getProcessingStatus(params), 2)
          })
          } else {
            reportDatesParams.determineStartEndDate(params)
          console.log(params)
          this.getDataLocalDb(params)
          }
        },
      getProcessingStatus (params) {
        Report.getProcessingStatus('historicoLevantamentoReport', params).then(resp => {
          this.progress = resp.response.data.progress
          if (this.progress < 100) {
            setTimeout(this.getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      },
      generateReport (id, fileType) {
         //  UID da tab corrente
        if (this.website) {
          Report.api().get(`/historicoLevantamentoReport/printReport/${id}/${fileType}`, { responseType: 'json' }).then(resp => {
           if (!resp.response.data[0]) {
              this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
            } else {
              const firstReg = resp.response.data[0]
              if (fileType === 'PDF') {
                patientHistoryTS.downloadPDF(
                  firstReg.province,
                  moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                  resp.response.data
                )
              } else {
                patientHistoryTS.downloadExcel(
                  firstReg.province,
                  moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                  resp.response.data
                )
              }
            }
            })
        } else {
          PatientHistoryReport.localDbGetByReportId(id).then(reports => {
         const reportData = []
         reports.forEach(report => {
                 if (report.reportId === id) {
                  reportData.push(report)
                 }
            })
             const firstReg = reportData[0]
            patientHistoryTS.downloadPDF(
                   '',
                    moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                reportData)
        })
        }
      },
    getDataLocalDb (params) {
        const reportParams = reportDatesParams.determineStartEndDate(params)
        console.log(reportParams)
       PatientVisitDetails.localDbGetAll().then(patientVisitDetails => {
          console.log(patientVisitDetails)
       const result = patientVisitDetails.filter(patientVisitDetail => patientVisitDetail.patientVisit.visitDate >= reportParams.startDate && patientVisitDetail.patientVisit.visitDate <= reportParams.endDate)
          console.log(result)
          return result
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
            const patientHistory = new PatientHistoryReport()
          patientHistory.reportId = reportParams.id
          // patientHistory.period = reportParams.periodTypeView
          patientHistory.year = reportParams.year
          patientHistory.startDate = reportParams.startDate
          patientHistory.endDate = reportParams.endDate
          PatientServiceIdentifier.localDbGetById(reportData.episode.patientServiceIdentifier.id).then(identifier => {
              // const serviceIdentifier = identifier
              const pack = reportData.pack
          const clinic = reportData.clinic
           ClinicalService.localDbGetById(identifier.service.id).then(clinicalService => {
          Patient.localDbGetById(reportData.patientVisit.patient.id).then(patient => {
           Prescription.localDbGetById(reportData.prescription.id).then(prescription => {
          TherapeuticRegimen.localDbGetById(prescription.prescriptionDetails[0].therapeuticRegimen.id).then(therapeuticRegimen => {
           DispenseType.localDbGetById(prescription.prescriptionDetails[0].dispenseType.id).then(dispenseType => {
            DispenseMode.localDbGetById(pack.dispenseMode.id).then(dispenseMode => {
          // const episode = reportData.episode
         // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)
          patientHistory.nid = identifier.value
          patientHistory.firstNames = patient.firstNames
          patientHistory.middleNames = patient.middleNames
          patientHistory.lastNames = patient.lastNames
          patientHistory.cellphone = patient.cellphone
         // patientHistory.tipoTarv =
         patientHistory.pickUpDate = pack.pickupDate
         patientHistory.nexPickUpDate = pack.nextPickUpDate
         patientHistory.therapeuticalRegimen = therapeuticRegimen.description
         patientHistory.dispenseType = dispenseType.description
         patientHistory.age = this.idadeCalculator(patient.dateOfBirth)
         patientHistory.dispenseMode = dispenseMode.description
         patientHistory.clinicalService = clinicalService.description
         patientHistory.clinic = clinic.clinicName
         patientHistory.id = uuidv4()
         PatientHistoryReport.localDbAdd(patientHistory)
         console.log(patientHistory)
        })
        })
          })
               })
          })
        })
      })
         // const clinicalService = ClinicalService.localDbGetById(patientServiceIdentifier.service.id)
        // patientHistory.patientType =
          })
          }
          )
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
      },
      idadeCalculator (birthDate) {
            if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
               const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD')
               const todayDate = moment(new Date())
               const idade = todayDate.diff(utentBirthDate, 'years')
               console.log(idade)
              return idade
            }
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
