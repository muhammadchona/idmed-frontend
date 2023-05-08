<template>
<div ref="filterArvDailyRegisterSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Registro Diário de ARV
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

import Report from 'src/store/models/report/Report'
import ArvDailyRegisterReport from 'src/reports/monitoring/ArvDailyRegisterReport.ts'
import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'
import DispenseType from '../../../store/models/dispenseType/DispenseType'
import Prescription from 'src/store/models/prescription/Prescription'
import TherapeuticLine from '../../../store/models/therapeuticLine/TherapeuticLine'
import ClinicalService from '../../../store/models/ClinicalService/ClinicalService'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
import Patient from '../../../store/models/patient/Patient'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
import ArvDailyRegisterTempReport from 'src/store/models/report/monitoring/ArvDailyRegisterTempReport'
import reportDatesParams from '../../../reports/ReportDatesParams'
import { v4 as uuidv4 } from 'uuid'
 import { LocalStorage } from 'quasar'
import { ref } from 'vue'
import mixinutils from 'src/mixins/mixin-utils'
import Pack from 'src/store/models/packaging/Pack'
import Drug from 'src/store/models/drug/Drug'
import StartStopReason from 'src/store/models/startStopReason/StartStopReason'
import mixinSystemPlatform from 'src/mixins/mixin-system-platform'
  export default {
    name: 'ArvDailyRegister',
    props: ['selectedService', 'menuSelected', 'id'],
    mixins: [mixinutils, mixinSystemPlatform],
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
      this.getStartStopReasonsToVuex()
    },
    components: {
      ListHeader: require('components/Shared/ListHeader.vue').default,
      FiltersInput: require('components/Reports/shared/FiltersInput.vue').default
    },
    methods: {
      closeSection () {
        this.$refs.filterArvDailyRegisterSection.remove()
      },
      initReportProcessing (params) {
        if (params.localOrOnline === 'online') {
          Report.apiInitArvDailyRegisterProcessing(params).then(resp => {
            this.progress = resp.response.data.progress
            setTimeout(this.getProcessingStatus(params), 2)
          })
        } else {
          this.getDataLocalDb(params)
        }
     //  this.getDataLocalDb(params)
      },
      getProcessingStatus (params) {
        Report.getProcessingStatus('arvDailyRegisterReportTemp', params).then(resp => {
          this.progress = resp.response.data.progress
          if (this.progress < 100) {
            setTimeout(this.getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
       /*
        this.getDataLocalDb(params)
        */
      },
      generateReport (id, fileType, params) {
        // UID da tab corrent
          if (fileType === 'PDF') {
           ArvDailyRegisterReport.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
               })
        } else if (fileType === 'XLS') {
           ArvDailyRegisterReport.downloadExcel(id, fileType, params).then(resp => {
                  if (resp === 204) this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
               })
        }
      },
      displayAlert (type, msg) {
        this.alert.type = type
        this.alert.msg = msg
        this.alert.visible = true
      },
      closeDialog () {
        this.alert.visible = false
      },
      getDataLocalDb (params) {
        const reportParams = reportDatesParams.determineStartEndDate(params)
        console.log(reportParams)
       PatientVisitDetails.localDbGetAll().then(patientVisitDetails => {
          console.log(patientVisitDetails)
       const result = patientVisitDetails.filter(patientVisitDetail => patientVisitDetail.patientVisit.visitDate >= reportParams.startDate && patientVisitDetail.patientVisit.visitDate <= reportParams.endDate && patientVisitDetail.clinicId === reportParams.clinicId)
          console.log(result)
          return result
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
          PatientServiceIdentifier.localDbGetById(reportData.episode.patientServiceIdentifier.id).then(identifier => {
            if (identifier.service.id === reportParams.clinicalService) {
            const arvDailyRegisterReport = new ArvDailyRegisterTempReport()
            arvDailyRegisterReport.reportId = reportParams.id
          // arvDailyRegisterReport.period = reportParams.periodTypeView
          arvDailyRegisterReport.year = reportParams.year
          arvDailyRegisterReport.startDate = reportParams.startDate
          arvDailyRegisterReport.endDate = reportParams.endDate
              const pack = reportData.pack
          const clinic = reportData.clinic
          Patient.localDbGetById(reportData.patientVisit.patient.id).then(patient => {
           Prescription.localDbGetById(reportData.prescription.id).then(prescription => {
          TherapeuticRegimen.localDbGetById(prescription.prescriptionDetails[0].therapeuticRegimen.id).then(therapeuticRegimen => {
           DispenseType.localDbGetById(prescription.prescriptionDetails[0].dispenseType.id).then(dispenseType => {
              TherapeuticLine.localDbGetById(prescription.prescriptionDetails[0].therapeuticLine.id).then(therapeuticLine => {
          arvDailyRegisterReport.nid = identifier.value
          arvDailyRegisterReport.patientName = patient.firstNames + ' ' + patient.middleNames + ' ' + patient.lastNames
          arvDailyRegisterReport.patientType = prescription.patientType
          arvDailyRegisterReport.startReason = this.getStartStopReasonTypeById(reportData.episode.startStopReason.id).reason
          const age = this.idadeCalculator(patient.dateOfBirth)
           console.log(age)
          arvDailyRegisterReport.ageGroup_0_4 = (age >= 0 && age < 4 ? 'Sim' : 'Nao')
          arvDailyRegisterReport.ageGroup_5_9 = (age >= 5 && age <= 9 ? 'Sim' : 'Nao')
          arvDailyRegisterReport.ageGroup_10_14 = (age >= 10 && age <= 14 ? 'Sim' : 'Nao')
         arvDailyRegisterReport.ageGroup_Greater_than_15 = (age >= 15 ? 'Sim' : 'Nao')
         arvDailyRegisterReport.pickUpDate = pack.pickupDate
         arvDailyRegisterReport.nexPickUpDate = pack.nextPickUpDate
         arvDailyRegisterReport.regime = therapeuticRegimen.description
         arvDailyRegisterReport.dispensationType = dispenseType.description
         arvDailyRegisterReport.therapeuticLine = therapeuticLine.description
         arvDailyRegisterReport.clinic = clinic.clinicName
         arvDailyRegisterReport.prep = (this.getClinicalServiceById(reportParams.clinicalService).code === 'PREP' ? 'Sim' : '')
         arvDailyRegisterReport.ppe = (this.getClinicalServiceById(reportParams.clinicalService).code === 'PPE' ? 'Sim' : '')
         const drugQuantityTemps = []
         // getSubReportDrugs
         Pack.localDbGetById(reportData.packId).then(pack => {
          pack.packagedDrugs.forEach(packagedDrug => {
             Drug.localDbGetById(packagedDrug.drug.id).then(drug => {
              const drugQuantityTemp = {}
              drugQuantityTemp.drugName = drug.name
              drugQuantityTemp.quantity = packagedDrug.quantitySupplied
              console.log(drugQuantityTemp)
             drugQuantityTemps.push(drugQuantityTemp)
             return drugQuantityTemps
            }).then(drugQuantityTemps => {
              console.log(drugQuantityTemps)
            arvDailyRegisterReport.drugQuantityTemps = drugQuantityTemps
            arvDailyRegisterReport.id = uuidv4()
         ArvDailyRegisterTempReport.localDbAdd(arvDailyRegisterReport)
         console.log(arvDailyRegisterReport)
            })
            })
         })
        })
        })
               })
          })
        })
            }
      })
          })
          this.progress = 100
          params.progress = 100
          }
          )
      },
      getClinicalServiceById (id) {
        return ClinicalService.query().where('id', id).first()
      },
      getStartStopReasonTypeById (id) {
        return StartStopReason.query().where('id', id).first()
      },
      getStartStopReasonsToVuex () {
       StartStopReason.localDbGetAll().then(startStopReasons => {
        StartStopReason.insert({ data: startStopReasons })
       })
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
