<template>
  <div class="q-mt-lg">
    <TitleBar />
    <div class="q-mx-xl">
      <div class="row items-center q-my-md">
        <q-icon name="person_outline" size="sm" />
        <span class="q-pl-sm text-subtitle2">Informação inicial</span>
      </div>
      <div class="row">
        <q-input
          outlined
          ref="curGroupCode"
          @update:model-value="search()"
          v-model="curGroup.code"
          :value="curGroup.code"
          type="text"
          lazy-rules
          label="Numero do grupo"
          style="witdth: 350px"
          dense
        >
          <template
            v-slot:append
            v-if="
              curGroup.code !== null &&
              curGroup.code !== undefined &&
              curGroup.code !== ''
            "
          >
            <q-icon
              name="close"
              @click="curGroup.code = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>
        <q-input
          outlined
          ref="curGroupName"
          @update:model-value="search()"
          v-model="curGroup.name"
          :value="curGroup.name"
          type="text"
          lazy-rules
          label="Nome do grupo"
          style="witdth: 450px"
          class="q-ml-md"
          dense
        >
          <template
            v-slot:append
            v-if="
              curGroup.name !== null &&
              curGroup.name !== undefined &&
              curGroup.name !== ''
            "
          >
            <q-icon
              name="close"
              @click="curGroup.name = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>
      </div>
      <div class="q-mt-lg q-mb-md">
        <div class="row items-center q-mb-md">
          <q-icon name="search" size="sm" />
          <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
        </div>
        <q-separator color="grey-13" size="1px" />
      </div>
      <div>
        <q-scroll-area style="height: 460px">
          <q-table
            class="col"
            dense
            :rows="searchResults"
            :columns="columns"
            row-key="id"
          >
            <template v-slot:no-data="{ icon, filter }">
              <div
                class="full-width row flex-center text-primary q-gutter-sm text-body2"
              >
                <span> Sem resultados para visualizar </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template #body="props">
              <q-tr :props="props">
                <!--q-td key="order" :props="props">
                  </q-td-->
                <q-td key="code" :props="props">
                  {{ props.row.code }}
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="groupType" :props="props">
                  {{ props.row.groupType.description }}
                </q-td>
                <q-td key="service" :props="props">
                  {{ props.row.service.code }}
                </q-td>
                <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="groups"
                      @click="openGroup(props.row)"
                    >
                      <q-tooltip class="bg-primary">Visualizar</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-scroll-area>
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          class="q-mb-xl q-mr-xl"
          fab
          color="primary"
          icon="add"
          @click="showGroupRegister = true"
        />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showGroupRegister">
      <groupRegister @close="showGroupRegister = false" />
    </q-dialog>
  </div>
</template>

<script setup>
import {
  computed,
  inject,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';
import { SessionStorage } from 'quasar';
import Group from '../../stores/models/group/Group';
import { useRouter } from 'vue-router';
import groupTypeService from 'src/services/api/groupType/groupTypeService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import groupService from 'src/services/api/group/groupService';
import TitleBar from 'components/Shared/TitleBar.vue';
import groupRegister from 'components/Groups/AddEditGroup.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';

const columns = [
  { name: 'code', align: 'left', label: 'Número do grupo', sortable: false },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  { name: 'groupType', align: 'center', label: 'Tipo', sortable: false },
  {
    name: 'service',
    align: 'left',
    label: 'Serviço de Saúde',
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

//import Patient from 'src/stores/models/patient/Patient';

const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile, isOnline } = useSystemUtils();

//Declaration
const title = ref('Procurar ou adicionar Grupo');
const router = useRouter();
const searchField = ref('');
const filter = ref('');
const selected = ref([]);
const username = localStorage.getItem('user');
const searchResults = ref([]);
// const clinic = inject('clinic');
const curGroup = ref(new Group());
const showGroupRegister = ref(false);

const clinic = computed(() => {
  return clinicService.currClinic();
});

const step = ref('create');

onMounted(() => {
  console.log(isOnline.value);
  console.log(isMobile.value);
  if (isMobile.value) {
    groupTypeService.apiGetAll();
    clinicalServiceService.get(0);
    getAllGroupsOfClinic();
    searchResults.value = groupService.getAllGroups();
  } else {
    showloading();
    groupTypeService.apiGetAll();
    clinicalServiceService.get();
    getAllGroupsOfClinic();
    searchResults.value = groupService.getAllGroups();
    closeLoading();
    // curGroup = new Group()
  }
});

const getAllGroups = () => {
  searchResults.value = groupService.getAllGroups();
};

const getAllGroupsOfClinic = () => {
  const offset = 0;
  const max = 100;
  console.log('Clinica:' + clinic.value);
  groupService.apiGetAllByClinicId(clinic.value, offset, max);
  //  this.doGroupsGet(clinic.id, offset, max);
};

const search = () => {
  const groups = groupService.getAllGroups();
  searchResults.value = groups.filter((group) => {
    return (
      stringContains(group.code, curGroup.value.code) ||
      stringContains(group.name, curGroup.value.name)
    );
  });
};

const openGroup = (group) => {
  SessionStorage.set('selectedGroupId', group.id);
  // pull all selected group info
  router.push('/group/panel');
};

const stringContains = (stringToCheck, stringText) => {
  if (stringText === '') return false;
  return stringToCheck.toLowerCase().includes(stringText.toLowerCase());
};

provide('clinic', clinic);
provide('step', step);
provide('title', title);
// provide('refInput', curGroup.value.groupName);
</script>

<style></style>
