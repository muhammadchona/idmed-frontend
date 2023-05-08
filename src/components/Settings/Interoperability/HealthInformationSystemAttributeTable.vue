<template>
    <q-table
      :rows="this.rows"
      :columns="columns"
      :filter="filter"
      virtual-scroll>
      <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                <span>
                  Sem resultados para visualizar
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
        <template v-slot:body="props">
            <q-tr :props="props">
            <q-td key="interoperabilityType" :props="props">
                {{ props.row.interoperabilityType === null ? '': props.row.interoperabilityType.description }}
            </q-td>
            <q-td key="value" :props="props">
              <q-input v-model="props.row.value" dense autofocus counter :disable="viewMode" />
            </q-td>
            </q-tr>
        </template>
    </q-table>

</template>
<script>
import { ref } from 'vue'

export default {
  props: ['rows', 'columns', 'viewMode'],
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
