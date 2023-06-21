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
    
  </div>
  </div>
</template>

<script setup>

import Report from 'src/services/api/report/ReportService'
import ArvDailyRegisterReport from 'src/services/reports/monitoring/ArvDailyRegisterReport.ts'
import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen'
import DispenseType from '../../../stores/models/dispenseType/DispenseType'
import Prescription from 'src/stores/models/prescription/Prescription'
import TherapeuticLine from '../../../stores/models/therapeuticLine/TherapeuticLine'
import ClinicalService from '../../../stores/models/ClinicalService/ClinicalService'
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier'
import Patient from '../../../stores/models/patient/Patient'
import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails'
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport'
import reportDatesParams from 'src/services/reports/ReportDatesParams'
import { v4 as uuidv4 } from 'uuid'
 import { LocalStorage } from 'quasar'
import { ref, onMounted } from 'vue'
import Pack from 'src/stores/models/packaging/Pack'
import Drug from 'src/stores/models/drug/Drug'
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason'

//compontes
import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';  

const { website, isDeskTop, isMobile } = useSystemUtils(); 
const { alertSucess, alertError, alertWarningAction } = useSwal();
const filterArvDailyRegisterSection = ref('')
    

    const name = 'ArvDailyRegister'
    const props = defineProps(['selectedService', 'menuSelected', 'id'])
    const totalRecords= ref(0)
    const qtyProcessed = ref(0)
     const progress = ref(0)

    onMounted(() => {
     // getStartStopReasonsToVuex()
    })

     const closeSection = () =>{
        filterArvDailyRegisterSection.value.remove()
      }
   const  initReportProcessing = (params) => {
        if (params.localOrOnline === 'online') {
          Report.apiInitReportProcess('arvDailyRegisterReportTemp', params).then(resp => {
            progress.value = resp.data.progress
            setTimeout(getProcessingStatus(params), 2)
          })
        } else {
          getDataLocalDb(params)
        }
     //  getDataLocalDb(params)
      }

     const getProcessingStatus = (params) => {
        Report.getProcessingStatus('arvDailyRegisterReportTemp', params).then(resp => {
          progress.value = resp.data.progress
          if (progress.value < 100) {
            setTimeout(getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
       /*
        getDataLocalDb(params)
        */
      }

     const generateReport = (id, fileType, params) => {
        // UID da tab corrent
          if (fileType === 'PDF') {
           ArvDailyRegisterReport.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) alertError( 'Nao existem Dados para o periodo selecionado')
               })
        } else if (fileType === 'XLS') {
           ArvDailyRegisterReport.downloadExcel(id, fileType, params).then(resp => {
                  if (resp === 204) alertError( 'Nao existem Dados para o periodo selecionado')
               })
        }
      }

      const getDataLocalDb  = (params) => {
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
          arvDailyRegisterReport.startReason = getStartStopReasonTypeById(reportData.episode.startStopReason.id).reason
          const age = idadeCalculator(patient.dateOfBirth)
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
         arvDailyRegisterReport.prep = (getClinicalServiceById(reportParams.clinicalService).code === 'PREP' ? 'Sim' : '')
         arvDailyRegisterReport.ppe = (getClinicalServiceById(reportParams.clinicalService).code === 'PPE' ? 'Sim' : '')
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
          progress.value = 100
          params.progress = 100
          }
          )
      }

     const  getClinicalServiceById = (id) =>  {
        return ClinicalService.query().where('id', id).first()
      }

      const getStartStopReasonTypeById = (id) => {
        return StartStopReason.query().where('id', id).first()
      }

      const getStartStopReasonsToVuex = () => {
       StartStopReason.localDbGetAll().then(startStopReasons => {
        StartStopReason.insert({ data: startStopReasons })
       })
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
