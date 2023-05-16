<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Farmácias
    </div>

    <div class="">
      <q-table
        :rows="clinics"
        :columns="columns"
        :filter="filter"
        rowsPerPage="5"
        row-key="id"
        :rows-per-page-options="[5, 10]"
      >
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Procurar"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:no-data="{ icon, filter }">
          <div
            class="full-width row flex-center text-primary q-gutter-sm text-body2"
          >
            <span> Sem resultados para visualizar </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="clinicName" :props="props">
              {{ props.row.clinicName }}
            </q-td>
            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>
            <q-td key="province" :props="props">
              {{
                props.row.province !== undefined && props.row.province !== null
                  ? props.row.province.description
                  : ''
              }}
            </q-td>
            <q-td key="district" :props="props">
              {{
                props.row.district !== undefined && props.row.district !== null
                  ? props.row.district.description
                  : ''
              }}
            </q-td>
            <q-td key="active" :props="props">
              {{ props.row.active ? 'Sim' : 'Nao' }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <q-btn
                  flat
                  round
                  color="amber-8"
                  icon="edit"
                  v-if="props.row.active === true && this.showAddButton"
                  @click="editClinic(props.row)"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeClinic(props.row)"
                >
                  <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                </q-btn>
                <!-- <q-btn
                  flat
                  round
                  class="q-ml-md"
                  :color="getColorActive(props.row)"
                  :icon="getIconActive(props.row)"
                  @click.stop="promptToConfirm(props.row)"
                  v-if="this.showAddButton"
                >
                  <q-tooltip :class="getTooltipClass(props.row)">{{
                    props.row.active ? 'Inactivar' : 'Activar'
                  }}</q-tooltip>
                </q-btn> -->
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- <div class="absolute-bottomg" v-if="showAddButton">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn size="xl" fab icon="add" @click="addClinic" color="primary" />
      </q-page-sticky>
    </div> -->

    <q-dialog persistent v-model="showClinicRegistrationScreen">
      <addClinic
        :selectedClinic="clinic"
        :stepp="step"
        :editMode="editMode"
        @close="showClinicRegistrationScreen = false"
      />
    </q-dialog>
    <!--
    <q-dialog v-model="alert.visible">
      <Dialog :type="alert.type" @closeDialog="closeDialog">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog> -->
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import Clinic from '../../../stores/models/clinic/Clinic';
import { inject, ref, onMounted, computed } from 'vue';
// // import mixinplatform from 'src/mixins/mixin-system-platform';
// // import mixinutils from 'src/mixins/mixin-utils';
// // import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import Province from 'src/stores/models/province/Province';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import provinceService from 'src/services/api/provinceService/provinceService.ts';
import stockService from 'src/services/api/stockService/StockService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';

// /*Components Import*/
import addClinic from 'src/components/Settings/Clinic/AddClinic.vue';
// import Dialog from 'src/components/Shared/Dialog/Dialog.vue';

// /*Variables*/
// // mixins = [mixinplatform, mixinutils];
const { alertSucess, alertError, alertWarning } = useSwal();
const $q = useQuasar();
const showClinicRegistrationScreen = ref(false);

/*injects*/
const step = inject('step');
const clinic = inject('clinic');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
// const configs = inject('systemConfigs');

// const alert = ref({
//           type = '',
//           visible = false,
//           msg = ''
//         });
const filter = ref('');
// const showAddButton = ref(false);
const columns = [
  {
    name: 'clinicName',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.clinicName,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'code',
    required: true,
    label: 'Código',
    align: 'left',
    field: (row) => row.code,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'province',
    required: true,
    label: 'Província',
    align: 'left',
    field: (row) => row.province.description,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'district',
    required: true,
    label: 'Distrito',
    align: 'left',
    field: (row) =>
      row.district !== undefined && row.district !== null
        ? row.district.description
        : 'Não Definido',
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'active',
    required: true,
    label: 'Activo',
    align: 'left',
    field: (row) => row.active,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

// /*Methods*/
// const getAllClinics = (offset) => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   Clinic.api()
//     .get('/clinic?offset=' + offset + '&max=100')
//     .then((resp) => {
//       offset = offset + 100;
//       if (resp.response.data.length > 0) {
//         setTimeout(this.getAllClinics(offset), 2);
//       } else {
//         let listaFinal = [];
//         let orderedList = [];
//         const mapaListas = new Map();
//         const clinics = Clinic.query()
//           .with('province')
//           .with('district.province')
//           .with('facilityType')
//           .has('code')
//           .get();
//         Province.all().forEach((prov) => {
//           listaFinal = clinics
//             .filter((x) => x.province.description === prov.description)
//             .sort((a, b) => a.clinicName.localeCompare(b.clinicName));
//           if (
//             listaFinal.length > 0 &&
//             prov !== 'undefined' &&
//             prov !== undefined
//           ) {
//             mapaListas.set(prov.description, listaFinal);
//           }
//         });
//         const ascMap = new Map([...mapaListas.entries()].sort());
//         const lista = [...ascMap.values()];
//         lista.forEach((item) => {
//           orderedList = orderedList.concat(item);
//         });
//         this.clinics = orderedList;
//         this.hideLoading();
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };
// const getIconActive = (clinic) => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   if (clinic.active) {
//     return 'stop_circle';
//   } else if (!clinic.active) {
//     return 'play_circle';
//   }
// };
// const getColorActive = (clinic) => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   if (clinic.active) {
//     return 'red';
//   } else if (!clinic.active) {
//     return 'green';
//   }
// };
// const getTooltipClassv = (clinic) => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   if (clinic.active) {
//     return 'bg-red-5';
//   } else if (!clinic.active) {
//     return 'bg-green-5';
//   }
// };
// const editClinic = (clinicParam) => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   clinic.value = Object.assign({}, clinicParam);
//   step.value = 'edit';
//   showClinicRegistrationScreen.value = true;
//   editMode.value = true;
//   viewMode.value = false;
// };
// addClinic = () => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   clinic.value = new Clinic();
//   step.value = 'create';
//   showClinicRegistrationScreen.value = true;
//   editMode.value = false;
//   viewMode.value = false;
// };
const visualizeClinic = (clinicParam) => {
  // ESTE METODO DEVERA SAIR DAQUI
  clinic.value = Object.assign({}, clinicParam);
  viewMode.value = true;
  editMode.value = false;
  showClinicRegistrationScreen.value = true;
};
// const promptToConfirm = (clinic) => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   let msg = '';
//   $q.dialog({
//     title: 'Confirmação',
//     message: clinic.active
//       ? 'Deseja Inactivar a Farmácia?'
//       : 'Deseja Activar a Farmácia?',
//     cancel: true,
//     persistent: true,
//   }).onOk(() => {
//     if (clinic.value.active) {
//       clinic.value.active = false;
//       msg = 'Farmácia inactivada com sucesso.';
//     } else if (!clinic.value.active) {
//       clinic.value.active = true;
//       msg = 'Farmácia activada com sucesso.';
//     }
//     if (this.mobile) {
//       if (clinic.value.syncStatus !== 'R') clinic.value.syncStatus = 'U';
//       clinicService.localDbAdd(JSON.parse(JSON.stringify(clinic)));
//       clinicService.insertOrUpdate({ data: clinic });
//       displayAlert('info', msg);
//     } else {
//       Clinic.apiUpdate(clinic)
//         .then((resp) => {
//           this.displayAlert('info', msg);
//         })
//         .catch((error) => {
//           this.displayAlert('error', error);
//         });
//     }
//   });
// };
// const displayAlert = (type, msg) => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   alert.value.type = type;
//   alert.value.msg = msg;
//   alert.value.visible = true;
// };
// const closeDialog = () => {
//   // ESTE METODO DEVERA SAIR DAQUI
//   if (alert.value.type === 'info') {
//     this.$emit('close');
//   }
// };

/*Hooks*/
const allProvinces = computed(() => {
  return provinceService.getAllProvinces();
});

const nonOrderedClinics = computed(() => {
  return clinicService.getAllClinics();
});

const clinics = computed(() => {
  return clinicService.getAllClinicsOrdered(
    allProvinces.value,
    nonOrderedClinics.value
  );
});
onMounted(() => {
  clinicService.get(0);
  // console.log(stockService.get(0));
  // showAddButton.value = true;
});
// onMounted(async () => {
//   showloading();
//   const offset = 0;
//   getAllClinics(offset);
//   if (configs.value === 'PROVINCIAL') {
//     showAddButton.value = true;
//   }
// });
</script>
