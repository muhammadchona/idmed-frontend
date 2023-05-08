<template>
  <div>
    <TitleBar>Gestão de Stock</TitleBar>
    <div class="q-px-xl q-mx-xl q-mt-md">
      <q-tabs
        v-model="tab"
        align="left"
        dense
        inline-label
        class=""
      >
        <q-tab name="stock" label="Stock" />
        <q-tab name="entrance"  label="Entrada" />
        <q-tab name="inventory" label="Inventário" />
      </q-tabs>
      <q-separator color="grey-13" size="1px"/>
      <div class="q-mt-md">
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="stock">
              <StockTable :isCharts= false />
            </q-tab-panel>
            <q-tab-panel name="entrance">
                <EntranceTable />
            </q-tab-panel>
            <q-tab-panel name="inventory">
              <InventoryTable />
            </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <q-page-sticky v-if="tab !== 'stock'" position="bottom-right" :offset="[18, 18]">
        <q-btn class="q-mb-xl q-mr-xl" fab color="primary" icon="add" @click="add"/>
    </q-page-sticky>
    <q-dialog persistent v-model="createEntrance">
        <EntranceRegister
          :createEntrance="createEntrance"
          @close="createEntrance = false" />
    </q-dialog>
    <q-dialog persistent v-model="createInventory">
        <InventoryRegister
          @close="createInventory = false" />
    </q-dialog>
    <q-dialog v-model="alert.visible" persistent>
      <Dialog :type="alert.type" @closeDialog="closeDialog" @commitOperation="closeInventory">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{alert.msg}} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import StockEntrance from '../../store/models/stockentrance/StockEntrance'
import Inventory from '../../store/models/stockinventory/Inventory'
import mixinplatform from 'src/mixins/mixin-system-platform'
import db from 'src/store/localbase'

export default {
     mixins: [mixinplatform],
  data () {
    return {
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      tab: ref('stock'),
      createEntrance: false,
      createInventory: false
    }
  },
  methods: {
    displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
    },
    add () {
      if (this.tab === 'entrance') {
        this.createEntrance = true
      } else {
        const inventory = Inventory.query().where('open', true).first()
        if (inventory !== null) {
          this.displayAlert('error', 'Existe registado um inventário ainda aberto, por favor termine o mesmo antes de iniciar um novo inventário.')
        } else {
          this.createInventory = true
        }
      }
    },
    getAllStockOfClinic () {
      const offset = 0
      const max = 100
      this.doStockEntranceGet(this.clinic.id, offset, max)
    },
    doStockEntranceGet (clinicId, offset, max) {
       if (this.mobile) {
      StockEntrance.apiGetAllByClinicId(clinicId, offset, max).then(resp => {
        console.log(resp.response.data)
            if (resp.response.data.length > 0) {
              offset = offset + max
              setTimeout(this.doStockEntranceGet(clinicId, offset, max), 2)
            }
        }).catch(error => {
            console.log(error)
        })
       } else {
         db.newDb().collection('stockEntrance').get().then(stockEntrance => {
                StockEntrance.insert(
                  {
                    data: stockEntrance
                  })
              })
              this.rowData = StockEntrance.all()
                  }
    }
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    TitleBar: require('components/Shared/TitleBar.vue').default,
    StockTable: require('components/Stock/StockTable.vue').default,
    EntranceRegister: require('components/Stock/Entrance/EntranceRegister.vue').default,
    EntranceTable: require('components/Stock/Entrance/EntranceTable.vue').default,
    InventoryTable: require('components/Stock/Inventory/InventoryTable.vue').default,
    InventoryRegister: require('components/Stock/Inventory/InventoryRegister.vue').default
  }

}
</script>

<style>

</style>
