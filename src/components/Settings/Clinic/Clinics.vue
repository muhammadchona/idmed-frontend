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
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <q-dialog persistent v-model="showClinicRegistrationScreen">
      <addClinic
        :selectedClinic="clinic"
        :stepp="step"
        :editMode="editMode"
        @close="showClinicRegistrationScreen = false"
      />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import { inject, ref, onMounted, computed } from 'vue';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import provinceService from 'src/services/api/provinceService/provinceService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

/*Components Import*/
import addClinic from 'src/components/Settings/Clinic/AddClinic.vue';

/*Declarations*/
const showClinicRegistrationScreen = ref(false);

/*injects*/
const step = inject('step');
const clinic = inject('clinic');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const filter = ref('');
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

/*Methods*/
const visualizeClinic = (clinicParam) => {
  clinic.value = clinicParam;
  viewMode.value = true;
  editMode.value = false;
  showClinicRegistrationScreen.value = true;
};

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
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
});
</script>
