<template>
<div ref="filterReceivedStockSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Stock Recebido
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
import ReceivedStockReport from 'src/reports/stock/ReceivedStockReport.ts'
import { LocalStorage } from 'quasar'
import { ref } from 'vue'
import Stock from 'src/store/models/stock/Stock'
import { v4 as uuidv4 } from 'uuid'
import reportDatesParams from '../../../reports/ReportDatesParams'
import StockReceivedReport from 'src/store/models/report/stock/StockReceivedReport'
  export default {
    name: 'ReceivedStock',
    props: ['selectedService', 'menuSelected', 'id'],
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
    computed: {
    },
    components: {
      ListHeader: require('components/Shared/ListHeader.vue').default,
      FiltersInput: require('components/Reports/shared/FiltersInput.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
    },
    methods: {
      closeSection () {
        this.$refs.filterReceivedStockSection.remove()
        this.$refs.filterDrugStoreSection.remove()
        LocalStorage.remove(this.id)
      },
      initReportProcessing (params) {
        if (params.localOrOnline === 'online') {
          Report.apiInitReceivedStockProcessing(params).then(resp => {
            console.log(resp.response.data.progress)
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
        Report.getProcessingStatus('stockReportTemp', params).then(resp => {
          this.progress = resp.response.data.progress
          if (this.progress < 100) {
            setTimeout(this.getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      },
      generateReport (id, fileType, params) {
        // UID da tab corrent
      if (fileType === 'PDF') {
           ReceivedStockReport.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) this.displayAlert('error', 'Nao existem Dados para o periodo selecionado')
               })
        } else if (fileType === 'XLS') {
           ReceivedStockReport.downloadExcel(id, fileType, params).then(resp => {
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
       Stock.localDbGetAll().then(stocks => {
          console.log(stocks)
       const result = stocks.filter(stock => (stock.entrance.dateReceived >= reportParams.startDate && stock.entrance.dateReceived <= reportParams.endDate) && stock.drug.clinicalService.id === reportParams.clinicalService)
          console.log(result)
          return result
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
            const stockReceived = new StockReceivedReport()
            stockReceived.reportId = reportParams.id
          // patientHistory.period = reportParams.periodTypeView
          stockReceived.year = reportParams.year
          stockReceived.startDate = reportParams.startDate
          stockReceived.endDate = reportParams.endDate
          stockReceived.orderNumber = reportData.entrance.orderNumber
          stockReceived.drugName = reportData.drug.name
          stockReceived.expiryDate = reportData.expireDate
          stockReceived.dateReceived = reportData.entrance.dateReceived
          stockReceived.unitsReceived = reportData.unitsReceived
          stockReceived.manufacture = reportData.manufacture
          stockReceived.batchNumber = reportData.batchNumber
          stockReceived.id = uuidv4()
          StockReceivedReport.localDbAdd(stockReceived)
         console.log(stockReceived)
        })
          })
          this.progress = 100
          params.progress = 100
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
