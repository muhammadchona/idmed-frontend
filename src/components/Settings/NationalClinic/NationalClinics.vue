<template>
    <div>
        <div class="">
                 <!-- <nationalClinicsTable  :rows="getNationalClinicos" :columns="columns"  :showNationalClinicRegistrationScreen="showNationalClinicRegistrationScreen" /> -->
         <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
        Unidade Sanitaria
        </div>
        <q-table
         style="height: 700px"
     :rows="getNationalClinicos"
      :columns="columns"
      :filter="filter"
       :rows-per-page-options="[0]"
      virtual-scroll>
        <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
                </q-input>
        </template>
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
                     v-if="props.row.active === true"
                   @click="editNationalClinic(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                 <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="visualizeNationalClinic(props.row)">
                    <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                    </q-btn>
                     <q-btn flat round
                      class="q-ml-md"
                      :color="getColorActive(props.row)"
                      :icon="getIconActive(props.row)"
                      @click.stop="promptToConfirm(props.row)"
                     >
                     <q-tooltip class="bg-green-5">{{props.row.active ? 'Inactivar': 'Activar'}}</q-tooltip>
                     </q-btn>
                  </div>
                  </q-td>
            </q-tr>
        </template>
    </q-table>
        </div>
         <div class="absolute-bottomg">
              <q-page-sticky position="bottom-right" :offset="[18, 18]">
                <q-btn size="xl" fab icon="add" @click="addNationalClinic" color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showNationalClinicRegistrationScreen">
          <addNationalClinic
          :selectedNationalClinic="nationalClinic"
          :onlyView="viewMode"
            @close="showNationalClinicRegistrationScreen = false" />
      </q-dialog>
    </div>
</template>
<script>
import { useQuasar } from 'quasar'
import NationalClinic from '../../../store/models/nationalClinic/NationalClinic'
import { ref } from 'vue'

const columns = [
  { name: 'nationalClinicName', required: true, label: 'Nome', align: 'left', field: row => row.clinicName, format: val => `${val}`, sortable: true },
  { name: 'code', required: true, label: 'Código', align: 'left', field: row => row.code, format: val => `${val}`, sortable: true },
   { name: 'telephone', required: true, label: 'Telefone', align: 'left', field: row => row.telephone, format: val => `${val}`, sortable: true },
   { name: 'facilityType', required: true, label: 'Tipo de Instalacao', align: 'left', field: row => row.facilityType.description, format: val => `${val}`, sortable: true },
  { name: 'province', required: true, label: 'Provincia', align: 'left', field: row => row.province.description, format: val => `${val}`, sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  data () {
    const $q = useQuasar()

    return {
        columns,
        $q,
         showNationalClinicRegistrationScreen: false,
         viewMode: false,
         filter: ref('')
    }
  },
 computed: {
      getNationalClinicos () {
          return NationalClinic.query()
                           .with('province.districts')
                           .with('facilityType')
                          .get()
      }
  },
  methods: {
     getIconActive (nationalClinic) {
           if (nationalClinic.active) {
              return 'stop_circle'
              } else if (!nationalClinic.active) {
              return 'play_circle'
              }
       },
       getColorActive (nationalClinic) {
           if (nationalClinic.active) {
              return 'red'
              } else if (!nationalClinic.active) {
              return 'green'
              }
       },
    getNationalClinics () {
            NationalClinic.api().get('/nationalClinic')
       },
       editNationalClinic (nationalClinic) {
        this.nationalClinic = Object.assign({}, nationalClinic)
          this.viewMode = false
         this.showNationalClinicRegistrationScreen = true
      },
       addNationalClinic () {
          this.viewMode = false
          this.nationalClinic = new NationalClinic()
         this.showNationalClinicRegistrationScreen = true
      },
       visualizeNationalClinic (nationalClinic) {
          this.nationalClinic = Object.assign({}, nationalClinic)
         this.viewMode = true
           this.showNationalClinicRegistrationScreen = true
      },
      promptToConfirm (nationalClinic) {
           let msg = ''
             nationalClinic.province.districts = []
            this.$q.dialog({ title: 'Confirm', message: nationalClinic.active ? 'Deseja Inactivar a Unidade Sanitária?' : 'Deseja Activar a Unidade Sanitária?', cancel: true, persistent: true }).onOk(() => {
              if (nationalClinic.active) {
                nationalClinic.active = false
                  msg = 'Unidade Sanitária inactivada com sucesso.'
              } else if (!nationalClinic.active) {
                  nationalClinic.active = true
                     msg = 'Unidade Sanitária activado com sucesso.'
              }
             NationalClinic.apiSave(nationalClinic).then(resp => {
                this.$emit('nationalClinic', msg)
            }).catch(error => {
              console.log(nationalClinic.id)
                console.log(error)
            })
        })
      }
  },
  mounted () {
    this.getNationalClinics()
  },
  components: {
     addNationalClinic: require('components/Settings/NationalClinic/AddNationalClinic.vue').default
  //   nationalClinicsTable: require('components/Settings/NationalClinic/NationalClinicsTable.vue').default
  }
}
</script>
