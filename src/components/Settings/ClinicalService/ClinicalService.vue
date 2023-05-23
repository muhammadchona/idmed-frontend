<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Serviço Clínico
    </div>
    <div class="">
      <q-table :rows="clinicalServices" :columns="columns" :filter="filter">
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
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
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
                  v-if="props.row.active === true"
                  @click="editClinicService(props.row)"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeClinicalService(props.row)"
                >
                  <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  :color="getColorActive(props.row)"
                  :icon="getIconActive(props.row)"
                  @click.stop="promptToConfirm(props.row)"
                >
                  <q-tooltip :class="getTooltipClass(props.row)">{{
                    props.row.active ? 'Inactivar' : 'Activar'
                  }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="absolute-bottomg">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          size="xl"
          fab
          icon="add"
          @click="addClinicService"
          color="primary"
        />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showClinicServiceRegistrationScreen">
      <addClinicalService
        @close="showClinicServiceRegistrationScreen = false"
      />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import { ref, inject, onMounted, computed, reactive, provide } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import ClinicalService from '../../../stores/models/ClinicalService/ClinicalService';
import formService from 'src/services/api/formService/formService.ts';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService.ts';
import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService.ts';
import clinicalServiceAttrTypeService from 'src/services/api/clinicalServiceAttrTypeService/ClinicalServiceAttrTypeService.ts';
import clinicalServiceAttrService from 'src/services/api/clinicalServiceAttributeService/clinicalServiceAttributeService.ts';

/*Components imports*/
import addClinicalService from 'src/components/Settings/ClinicalService/AddClinicalService.vue';

/*Declarations*/
const { alertWarningAction } = useSwal();
const columns = [
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
    name: 'description',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.description,
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
const clinicalService = reactive(
  ref(clinicalServiceService.newInstanceEntity())
);
const showClinicServiceRegistrationScreen = ref(false);
const filter = ref('');

/*injects*/
const step = inject('step');
const clinic = inject('clinic');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');

/*Hooks*/
const clinicalServices = computed(() => {
  return clinicalServiceService.getAllClinicalServices();
});

const forms = computed(() => {
  return formService.getAllForms();
});

/*Provides*/
provide('stepp', step);
// provide('drugs', drugs);
provide('selectedClinicalService', clinicalService);
provide(
  'showClinicServiceRegistrationScreen',
  showClinicServiceRegistrationScreen
);

onMounted(() => {
  isEditStep.value = false;
  isCreateStep.value = false;
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
  formService.get(0);
  clinicalServiceService.get(0);
  clinicalServiceAttrTypeService.get(0);
  clinicalServiceAttrService.get(0);
  therapeuticalRegimenService.get(0);
});

/*methods*/
const getIconActive = (clinicalService) => {
  if (clinicalService.active) {
    return 'stop_circle';
  } else if (!clinicalService.active) {
    return 'play_circle';
  }
};
const getColorActive = (clinicalService) => {
  if (clinicalService.active) {
    return 'red';
  } else if (!clinicalService.active) {
    return 'green';
  }
};
const getTooltipClass = (clinicalService) => {
  if (clinicalService.active) {
    return 'bg-red-5';
  } else if (!clinicalService.active) {
    return 'bg-green-5';
  }
};
const editClinicService = (clinicalServiceParam) => {
  isCreateStep.value = false;
  isEditStep.value = true;
  clinicalService.value = clinicalServiceParam;
  step.value = 'edit';
  showClinicServiceRegistrationScreen.value = true;
  editMode.value = true;
  viewMode.value = false;
};
// addClinicService() {
//   this.clinicalService = new ClinicalService();
//   this.step = 'create';
//   this.showClinicServiceRegistrationScreen = true;
//   this.editMode = false;
//   this.viewMode = false;
// },
// visualizeClinicalService(clinicalService) {
//   this.clinicalService = Object.assign({}, clinicalService);
//   this.viewMode = true;
//   this.showClinicServiceRegistrationScreen = true;
//   this.editMode = false;
// },
// promptToConfirm(clinicalService) {
//   this.$q
//     .dialog({
//       title: 'Confirmação',
//       message: clinicalService.active
//         ? 'Deseja Inactivar o Serviço Clínico?'
//         : 'Deseja Activar o Serviço Clínico?',
//       cancel: true,
//       persistent: true,
//     })
//     .onOk(() => {
//       let operation = '';
//       if (clinicalService.active) {
//         clinicalService.active = false;
//         operation = 'inactivado';
//       } else if (!clinicalService.active) {
//         clinicalService.active = true;
//         operation = 'activado';
//       }
//       console.log(clinicalService);
//       if (this.mobile) {
//         console.log('FrontEnd');
//         if (clinicalService.syncStatus !== 'R')
//           clinicalService.syncStatus = 'U';
//         ClinicalService.localDbAdd(
//           JSON.parse(JSON.stringify(clinicalService))
//         );
//         ClinicalService.insertOrUpdate({ data: clinicalService });
//         this.displayAlert(
//           'info',
//           `Servico Clínico ${operation} com sucesso`
//         );
//       } else {
//         console.log('BackEnd');
//         clinicalService.therapeuticRegimens = [];
//         ClinicalService.apiUpdate(clinicalService)
//           .then((resp) => {
//             this.displayAlert(
//               'info',
//               `Servico Clínico ${operation} com sucesso`
//             );
//           })
//           .catch((error) => {
//             this.displayAlert('error', error);
//           });
//       }
//     });
// },
// displayAlert(type, msg) {
//   this.alert.type = type;
//   this.alert.msg = msg;
//   this.alert.visible = true;
// },
// closeDialog() {
//   if (this.alert.type === 'info') {
//     this.$emit('close');
//   }
// },
</script>
