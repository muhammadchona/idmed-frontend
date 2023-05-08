<template>
<div>
  <Index />
</div>
</template>

<script>
import { QSpinnerBall, SessionStorage } from 'quasar'
import Clinic from '../../store/models/clinic/Clinic'
import StockEntrance from '../../store/models/stockentrance/StockEntrance'
import StockCenter from '../../store/models/stockcenter/StockCenter'
import Stock from '../../store/models/stock/Stock'
 import { InventoryStockAdjustment } from '../../store/models/stockadjustment/InventoryStockAdjustment'
import StockOperationType from '../../store/models/stockoperation/StockOperationType'
import ReferedStockMoviment from '../../store/models/stockrefered/ReferedStockMoviment'
import DestroyedStock from '../../store/models/stockdestruction/DestroyedStock'
import Province from '../../store/models/province/Province'
import Drug from '../../store/models/drug/Drug'
import mixinplatform from 'src/mixins/mixin-system-platform'
import Inventory from '../../store/models/stockinventory/Inventory'
import PackagedDrugStock from '../../store/models/packagedDrug/PackagedDrugStock'
export default {
  mixins: [mixinplatform],
  components: {
    Index: require('components/Stock/Index.vue').default
  },
  methods: {
    init () {
   // copoia o stock do localbase para o VueX
     if (this.mobile) {
        Stock.localDbGetAll().then(stocks => {
            stocks.forEach(item => {
              Stock.delete(item.id)
                            Stock.insert({
                              data: item
                            })
                      })
                  })
        Inventory.localDbGetAll().then(inventories => {
                          inventories.forEach(item => {
                            Inventory.delete(item.id)
                            Inventory.insert({
                              data: item
                            })
                          })
                            })

        StockEntrance.localDbGetAll().then(stockEntrances => {
          stockEntrances.forEach((item) => {
            StockEntrance.delete(item.id)
            StockEntrance.insert({
                              data: item
                            })
          })
          }).then(item => {
              Clinic.insert({
              data: SessionStorage.getItem('currClinic')
            })
          })

          StockCenter.localDbGetAll().then(stockCenters => {
            stockCenters.forEach((item) => {
              StockCenter.update({ where: item.id, data: item })
            })
          })
          StockOperationType.localDbGetAll().then(stockOperationTypes => {
             stockOperationTypes.forEach((item) => {
              StockOperationType.update({ where: item.id, data: item })
            })
                  })
         Drug.localDbGetAll().then(drugs => {
          drugs.forEach((drug) => {
            Drug.update({ where: drug.id, data: drug })
          })
        })
      } else {
          const offset = 0
          const max = 300
          StockCenter.apiGetAll(offset, max)
          Stock.apiGetAll(offset, max)
          StockOperationType.apiGetAll(offset, max)
          ReferedStockMoviment.apiGetAll(offset, max)
          DestroyedStock.apiGetAll(offset, max)
          Drug.apiGetAll(offset, max)
          Province.apiGetAll(offset, max)
          this.getAllStockOfClinic()
          InventoryStockAdjustment.apiGetAll(offset, max)
          PackagedDrugStock.apiGetAll(offset, max)
        }
    },
   getAllStockOfClinic () {
      const offset = 0
      const max = 100
      this.doStockEntranceGet(this.clinic.id, offset, max)
    },
    doStockEntranceGet (clinicId, offset, max) {
      StockEntrance.apiGetAllByClinicId(clinicId, offset, max).then(resp => {
        console.log(resp.response.data)
            if (resp.response.data.length > 0) {
              offset = offset + max
              setTimeout(this.doStockEntranceGet(clinicId, offset, max), 2)
            }
        }).catch(error => {
            console.log(error)
        })
    }
  },
  mounted () {
    this.init()
  },
  created () {
    this.$q.loading.show({
    message: 'Carregando ...',
    spinnerColor: 'grey-4',
    spinner: QSpinnerBall
  })

  setTimeout(() => {
    this.$q.loading.hide()
  }, 600)
  },
  computed: {
    clinic: {
      get () {
        return new Clinic(SessionStorage.getItem('currClinic'))
      }
    }
  }

}
</script>

<style>

</style>
