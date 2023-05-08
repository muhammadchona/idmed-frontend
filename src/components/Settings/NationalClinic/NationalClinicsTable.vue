<template>
<div>
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
            <q-td key="nationalClinicName" :props="props">
                {{ props.row.facilityName }}
            </q-td>
            <q-td key="code" :props="props">
                {{ props.row.code }}
            </q-td>
             <q-td key="telephone" :props="props">
                {{ props.row.telephone }}
            </q-td>
             <q-td key="facilityType" :props="props">
                {{ props.row.facilityType.description }}
            </q-td>
            <q-td key="province" :props="props">
                {{ props.row.province.description }}
            </q-td>
                  <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn flat round
                    color="amber-8"
                    icon="edit"
                   @click="showNationalClinicRegistrationScreen = true">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                  <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="goToPatientPanel(props.row)">
                    <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                  </q-btn>
                  </div>
                  </q-td>
            </q-tr>
        </template>
    </q-table>
         <q-dialog persistent v-model="showNationalClinicRegistrationScreen">
          <addNationalClinic
            @close="showNationalClinicRegistrationScreen = false" />
      </q-dialog>
</div>
</template>
<script>
import { ref } from 'vue'

export default {
  props: ['rows', 'columns', 'updateClinicAppoitment'],
  // emits: ['update:showNationalClinicRegistrationScreen'],
  setup () {
    const selected = ref([])
    const lastIndex = ref(null)
    const tableRef = ref(null)
    return {
        valOption: ref(true),
        lastIndex,
        tableRef,
        selected,
        showNationalClinicRegistrationScreen: false,
        filter: ''
    }
  },
 computed: {
  },
  methods: {
       editNationalClinic (nationalClinic) {
          this.showNationalClinicRegistrationScreen = true
        this.nationalClinic = Object.assign({}, nationalClinic)
      }
  },
  mounted () {
  },
    components: {
      addNationalClinic: require('components/Settings/NationalClinic/AddNationalClinic.vue').default
  }
}
</script>
