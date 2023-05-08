<template>
<div ref="filterDrugStoreSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Voltaram da Referencia
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

import Report from 'src/store/models/report/Report'
import { LocalStorage } from 'quasar'
import { ref } from 'vue'
import referredBackPatients from '../../../reports/ReferralManagement/ReferredBackPatients.ts'
  export default {
    name: 'ReferredBackPatients',
    props: ['selectedService', 'menuSelected', 'id', 'params'],
    setup () {
      return {
        totalRecords: ref(0),
        qtyProcessed: ref(0),
        report: 'VOLTOU_REFERENCIA',
        progress: ref(0),
        name: 'ReferredBackPatients',
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
        Report.api().delete(`/referredPatientsReport/delete/${this.id}`)
        this.$refs.filterDrugStoreSection.remove()
        LocalStorage.remove(this.id)
      },
      initReportProcessing (params) {
         Report.api().post('/referredPatientsReport/initReportProcess', params).then((response) => {
        // reset your component inputs like textInput to null
        // or your custom route redirect with vue-router
         setTimeout(this.getProcessingStatus(params), 2)
      })
      },
       getProcessingStatus (params) {
        Report.getProcessingStatus('referredPatientsReport', params).then(resp => {
          console.log(resp.response.data.progress)
          this.progress = resp.response.data.progress
          console.log(this.progress)
          if (this.progress < 100) {
            setTimeout(this.getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      },
        generateReport (id, fileType, params) {
        // UID da tab corrente
        console.log('UUID da tab seleccionada:', id)
        /*
       // console.log(Pack.api().get('/referredPatientsReport/printReport/'+ id).toString)
            Report.api().get(`/referredPatientsReport/printReport/${id}/${this.report}/${fileType}`,
            { responseType: 'blob' }).then(resp => {
              console.log(resp)
              console.log(resp.response.data)
               if (resp.response.status === 204) {
             this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
              } else {
                const file = new Blob([resp.response.data], { type: 'application/' + fileType })
        const fileURL = URL.createObjectURL(file)
          const link = document.createElement('a')
          link.href = fileURL
         link.setAttribute('download', 'PacientesReferidosDeVolta.' + fileType)
          document.body.appendChild(link)
          link.click()
          }
            })
            */
             if (fileType === 'PDF') {
               referredBackPatients.downloadPDF(params).then(resp => {
                  if (resp === 204) this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
               })
            } else {
               referredBackPatients.downloadExcel(params).then(resp => {
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
