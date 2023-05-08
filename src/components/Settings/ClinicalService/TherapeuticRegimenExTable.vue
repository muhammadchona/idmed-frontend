<template>
    <q-table
      :rows="this.rows"
      :columns="columns"
      :filter="filter"
      virtual-scroll>
        <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
                </q-input>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
            <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
          </q-td>
            <q-td auto-width key="selected">
             <q-checkbox  v-model="props.row.selected" @click="props.row.selected=true"/>
          </q-td>
            <q-td key="code" :props="props">
                {{ props.row.code }}
            </q-td>
            <q-td key="description" :props="props">
                {{ props.row.description }}
            </q-td>
            </q-tr>
             <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
           <q-table
      title="Medicamentos"
      :rows="props.row.drugs"
      :columns="columnDrugs"
      row-key="fnmCode"
        />
          </q-td>
        </q-tr>
        </template>
    </q-table>

</template>
<script>
import { ref } from 'vue'

const columnDrugs = [
  { name: 'code', required: true, label: 'Nome', align: 'left', field: row => row.fnmCode, format: val => `${val}`, sortable: true }
]

export default {
  props: ['rows', 'columns'],
  emits: ['update:appointment'],
  setup () {
    const selected = ref([])
    const lastIndex = ref(null)
    const tableRef = ref(null)
    return {
        valOption: ref(true),
        lastIndex,
        tableRef,
        selected,
        filter: '',
        columnDrugs,
         selection: ref([''])
    }
  },
 computed: {
  },
  methods: {
  },
  mounted () {
  },
    components: {
  }
}
</script>
