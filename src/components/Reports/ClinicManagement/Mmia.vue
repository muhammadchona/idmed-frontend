<template>
<div ref="filterMmiaSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Mapa Mensal de Informação de ARV (MMIA)
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
import { ref } from 'vue'
import { LocalStorage } from 'quasar'
import mmiaReport from '../../../reports/ClinicManagement/Mmia.ts'
  export default {
    name: 'DrugStore',
    props: ['selectedService', 'menuSelected', 'id'],
    setup () {
      return {
        totalRecords: ref(0),
        qtyProcessed: ref(0),
        periodType: { id: 2, description: 'Mensal', code: 'MONTH' },
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
        LocalStorage.remove(this.id)
        this.$refs.filterMmiaSection.remove()
      },
      initReportProcessing (params) {
        console.log(params)
        if (params.periodType === 'MONTH') {
          Report.apiInitMmiaProcessing(params).then(resp => {
            this.progress = resp.response.data.progress
            setTimeout(this.getProcessingStatus(params), 2)
          })
        } else {
          this.displayAlert('error', 'O período seleccionado não é aplicavel a este relatório, por favor seleccionar o período [Mensal]')
        }
      },
      getProcessingStatus (params) {
        Report.getProcessingStatus('mmiaReport', params).then(resp => {
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
        if (fileType === 'PDF') {
          mmiaReport.downloadPDF(id).then(resp => {
            if (resp === 204) this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
          })
        } else {
          mmiaReport.downloadExcel(id).then(resp => {
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
