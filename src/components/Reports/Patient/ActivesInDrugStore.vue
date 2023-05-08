<template>
<div ref="filterDrugStoreSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Activos na Farmácia
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
import activePatients from '../../../reports/Patients/ActivePatients.ts'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import StartStopReason from 'src/store/models/startStopReason/StartStopReason'
// import Episode from 'src/store/models/episode/Episode'
import reportDatesParams from '../../../reports/ReportDatesParams'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
// import ReportDatesParams from '../../../reports/ReportDatesParams'
 import ActiveInDrugStore from 'src/store/models/report/patient/ActiveInDrugStore'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
import Patient from '../../../store/models/patient/Patient'
// import PrescriptionDetail from '../../../store/models/prescriptionDetails/PrescriptionDetail'
import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'
import Prescription from 'src/store/models/prescription/Prescription'
import TherapeuticLine from '../../../store/models/therapeuticLine/TherapeuticLine'
import mixinplatform from 'src/mixins/mixin-system-platform'
  export default {
    name: 'DrugStore',
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
      this.getStartStopReasonsToVuex()
    },
    components: {
      ListHeader: require('components/Shared/ListHeader.vue').default,
      FiltersInput: require('components/Reports/shared/FiltersInput.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
    },
    methods: {
      closeSection () {
        this.$refs.filterDrugStoreSection.remove()
      },
      initReportProcessing (params) {
        if (params.localOrOnline === 'online') {
          Report.apiInitActiveInDrugStoreProcessing(params).then(resp => {
            this.progress = resp.response.data.progress
            setTimeout(this.getProcessingStatus(params), 2)
          })
         // Pack.api().post('/receivedStockReport/initReportProcess', params)
        } else {
          this.getDataLocalDb(params)
        }
      },
      getProcessingStatus (params) {
        Report.getProcessingStatus('activePatientReport', params).then(resp => {
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
        if (this.website) {
          Report.api().get(`/activePatientReport/printReport/${id}`, { responseType: 'json' }).then(resp => {
            if (!resp.response.data[0]) {
              this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
            } else {
              const patientAux = resp.response.data[0]

              if (fileType === 'PDF') {
                activePatients.downloadPDF(
                  patientAux.province,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.response.data
                )
              } else {
                activePatients.downloadExcel(
                  patientAux.province,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.response.data
                )
              }
            }
        })
        } else {
          ActiveInDrugStore.localDbGetAll().then(reports => {
         const reportData = []
         reports.forEach(report => {
                 if (report.reportId === id) {
                  reportData.push(report)
                 }
            })
             const firstReg = reportData[0]
             if (fileType === 'PDF') {
                activePatients.downloadPDF(
                  firstReg.province,
                  moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                  reportData
                )
              }
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
       const result = patientVisitDetails.filter(patientVisitDetail => moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').format() >= reportParams.endDate)
          console.log(result)
          const sortedArray = result.sort((a, b) => { return a.patientVisit.visitDate - b.patientVisit.visitDate })
          console.log(sortedArray)
       const resultGroupedPatientVisits = this.groupedMapChild(sortedArray)
           console.log(resultGroupedPatientVisits)
          return resultGroupedPatientVisits
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
            const activePatient = new ActiveInDrugStore()
            activePatient.reportId = reportParams.id
          activePatient.year = reportParams.year
          activePatient.startDate = reportParams.startDate
          activePatient.endDate = reportParams.endDate
          activePatient.province = reportParams.clinic.province.description
          activePatient.description = reportParams.clinic.province.description
          PatientServiceIdentifier.localDbGetById(reportData[0].episode.patientServiceIdentifier.id).then(identifier => {
              if (identifier.service.id === reportParams.clinicalService && this.getStartStopReasonTypeById(reportData[0].episode.startStopReason.id).isStartReason === true) {
              const pack = reportData[0].pack
          const clinic = reportData[0].clinic
          activePatient.clinic = clinic.clinicName
          Patient.localDbGetById(reportData[0].patientVisit.patient.id).then(patient => {
           Prescription.localDbGetById(reportData[0].prescription.id).then(prescription => {
          TherapeuticRegimen.localDbGetById(prescription.prescriptionDetails[0].therapeuticRegimen.id).then(therapeuticRegimen => {
            TherapeuticLine.localDbGetById(prescription.prescriptionDetails[0].therapeuticLine.id).then(therapeuticLine => {
         activePatient.nid = identifier.value
         activePatient.firstNames = patient.firstNames
         activePatient.middleNames = patient.middleNames
          activePatient.lastNames = patient.lastNames
          activePatient.cellphone = patient.cellphone
        activePatient.patientType = prescription.patientType
         activePatient.pickupDate = pack.pickupDate
         activePatient.nextPickUpDate = pack.nextPickUpDate
         activePatient.therapeuticRegimen = therapeuticRegimen.description
         activePatient.therapeuticLine = therapeuticLine.description
         activePatient.age = this.idadeCalculator(patient.dateOfBirth)
         activePatient.id = uuidv4()
         ActiveInDrugStore.localDbAdd(activePatient)
         console.log(activePatient)
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
      getStartStopReasonTypeById (id) {
        return StartStopReason.query().where('id', id).first()
      },
      getStartStopReasonsToVuex () {
       StartStopReason.localDbGetAll().then(startStopReasons => {
        StartStopReason.insert({ data: startStopReasons })
       })
      },
      groupedMapChild (items) {
    return items.reduce(
        (entryMap, e) => entryMap.set(e.patientVisit.patient.id, [...(entryMap.get(e.patientVisit.patient.id) || []), e], console.log(e.patientVisit.patient.id)),
        new Map()
      )
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
