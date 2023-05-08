<template>
  <div> <q-table
            class="col"
            dense
            :rows="inventories"
            :columns="columns"
            :filter="filter"
            row-key="id"
            >
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                style="width: 400px"
                debounce="300"
                v-model="filter"
                placeholder="Pesquisar">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template #header="props">
                  <q-tr class="text-left bg-grey-3"  :props="props">
                    <q-th v-if="false" style="width: 70px"  >{{columns[0].label}}</q-th>
                    <q-th class="col" >{{columns[1].label}}</q-th>
                    <q-th class="text-center" >{{columns[2].label}}</q-th>
                    <q-th class="text-center" >{{columns[3].label}}</q-th>
                    <q-th class="text-center" >{{columns[4].label}}</q-th>
                    <q-th class="text-center" >{{columns[5].label}}</q-th>
                  </q-tr>
            </template>
            <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                <span>
                  Sem resultados para visualizar
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td v-if="false" key="order" :props="props">
                </q-td>
                <q-td key="generic" :props="props">
                  {{props.row.getInventoryType()}}
                </q-td>
                <q-td key="startDate" :props="props">
                  {{props.row.getFormatedStartDate()}}
                </q-td>
                <q-td key="endDate" :props="props">
                  {{props.row.getFormatedEndDate()}}
                </q-td>
                <q-td key="open" :props="props">
                  <q-chip :color="props.row.getChipColor()" text-color="white">
                    {{props.row.getInventoryStatus()}}
                  </q-chip>
                </q-td>
                <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn flat round
                    color="amber-8"
                    icon="list_alt"
                    @click="openFile(props.row)">
                    <q-tooltip class="bg-amber-5">{{props.row.open ? 'Abrir Ficha' : 'Visualizar Ficha'}}</q-tooltip>
                  </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
        </q-table>
  </div>
</template>

<script>
import { SessionStorage } from 'quasar'
import Inventory from '../../../store/models/stockinventory/Inventory'
import { ref } from 'vue'
import { InventoryStockAdjustment } from 'src/store/models/stockadjustment/InventoryStockAdjustment'

const columns = [
  { name: 'order', required: true, label: 'Ordem', align: 'left', sortable: false },
  { name: 'generic', align: 'left', label: 'Tipo de Inventário', sortable: true },
  { name: 'startDate', align: 'center', label: 'Data de Abertura', sortable: false },
  { name: 'endDate', align: 'center', label: 'Data de Fecho', sortable: true },
  { name: 'open', align: 'center', label: 'Estado', sortable: true },
  { name: 'options', align: 'center', label: 'Opções', sortable: false }
]
export default {
  data () {
    const filter = ref('')
    return {
      filter,
      columns
    }
  },
  methods: {
    openFile (inventory) {
      if (this.mobile) {
        // Inserir no VueX inventory e InvstockAdj
        Inventory.deleteAll()
        Inventory.localDbGetAll().then(item => {
        Inventory.insert({
          data: item
        })
        })
        InventoryStockAdjustment.deleteAll()
        InventoryStockAdjustment.insert({
          data: inventory.adjustments
        })
      }
      SessionStorage.set('currInventory', inventory)
      this.$router.push('/stock/inventory')
    }
  },
  mounted () {
   if (this.website) {
    Inventory.apiGetAll(0, 300)
    }
  },
  computed: {
    inventories () {
      return Inventory.query()
                      .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                      .with('adjustments')
                      .orderBy('open', 'desc')
                      .orderBy('startDate', 'desc')
                      .get()
    }
  }
}
</script>

<style>

</style>
