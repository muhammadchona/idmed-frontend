<template>
  <div>
    <TitleBar />
    <q-tabs
      v-model="tab"
      dense
      class="text-grey q-pt-md q-pl-md"
      active-color="primary"
      indicator-color="white"
      align="left"
    >
      <q-tab
        name="list"
        label="Listas"
        :class="tab === 'list' ? 'tab-menu' : ''"
      />
      <q-tab
        name="graph"
        label="Análise Gráfica"
        :class="tab === 'graph' ? 'tab-menu' : ''"
      />
    </q-tabs>
    <q-separator style="margin-top: -1px" />
    <MenuMobile v-if="!website" @changeTab="changeTab"></MenuMobile>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="list">
        <div class="row">
          <div
            class="col-3 q-ml-sm q-mr-sm"
            style="max-width: 500px"
            v-if="website"
          >
            <q-bar dark class="bg-primary text-white">
              <div class="col text-center text-weight-bold">Listagens</div>
            </q-bar>
          </div>
          <div class="col q-mr-sm">
            <q-bar dark class="bg-primary text-white">
              <div class="col text-center text-weight-bold">Resultados</div>
            </q-bar>
          </div>
        </div>

        <div class="row">
          <div
            class="col-3 q-ml-sm q-mr-sm panel"
            style="max-width: 500px"
            v-if="website"
          >
            <ListReportMenu @changeTab="changeTab" v-if="website" />
          </div>
          <div class="col q-mr-sm panel q-pa-sm">
            <q-scroll-area
              :thumb-style="thumbStyle"
              :content-style="contentStyle"
              :content-active-style="contentActiveStyle"
              style="height: 700px"
              class="q-pr-md"
            >
              <template v-for="comp in components" :key="comp.id">
                <component
                  :is="componentsList[comp.name]"
                  :selectedService="comp.clinicalService"
                  :id="comp.id"
                  :params="comp.params"
                  class="q-mb-sm"
                />
              </template>
            </q-scroll-area>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="graph">
        <div class="row">
          <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg panel"></div>
          <div class="col q-mr-lg panel"></div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, provide } from 'vue';
// import { uuid } from 'uuid'
import { uid, LocalStorage } from 'quasar';
import ClinicalService from '../../stores/models/ClinicalService/ClinicalService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
// components

import TitleBar from 'components/Shared/TitleBar.vue';
import MenuMobile from 'components/Reports/Menus/ListReportMenuMobile.vue';
import ListReportMenu from 'components/Reports/Menus/ListReportMenu.vue';

import ActivesInDrugStore from 'components/Reports/Patient/ActivesInDrugStore.vue';
import GuestList from 'components/Reports/Patient/GuestList.vue';
import ImportedPatientList from 'components/Reports/Patient/ImportedPatientList.vue';
import TransferedFrom from 'components/Reports/Patient/TransferedFrom.vue';
import TransferedTo from 'components/Reports/Patient/TransferedTo.vue';
import Mmia from 'components/Reports/ClinicManagement/Mmia.vue';
import ReferredPatients from 'components/Reports/ReferralManagement/ReferredPatients.vue';
import ReferredBackPatients from 'components/Reports/ReferralManagement/ReferredBackPatients.vue';
import ReferredPatientDispenseHistory from 'components/Reports/ReferralManagement/ReferredPatientDispenseHistory.vue';
import AbsentReferredPatients from 'components/Reports/ReferralManagement/AbsentReferredPatients.vue';
import ReceivedStock from 'components/Reports/stock/ReceivedStock.vue';
import UsedStock from 'components/Reports/stock/UsedStock.vue';
import ArvDailyRegister from 'components/Reports/monitoring/ArvDailyRegister.vue';
import AbsentPatients from 'components/Reports/ClinicManagement/AbsentPatients.vue';
import PatientHistory from 'components/Reports/ClinicManagement/PatientHistory.vue';
import clinicService from 'src/services/api/clinicService/clinicService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';

const componentsList = {
  ActivesInDrugStore,
  GuestList,
  ImportedPatientList,
  TransferedFrom,
  TransferedTo,
  Mmia,
  ReferredBackPatients,
  ReferredPatients,
  ReferredPatientDispenseHistory,
  AbsentPatients,
  AbsentReferredPatients,
  ReceivedStock,
  UsedStock,
  ArvDailyRegister,
  PatientHistory,
};

const { website, isDeskTop, isMobile } = useSystemUtils();
const title = ref('Relatórios');
const tab = ref('list');
const model = ref(null);
const activeTab = ref('');
const selectedService = ref(null);
const contentStyle = {
  backgroundColor: '#ffffff',
  color: '#555',
};

const contentActiveStyle = {
  backgroundColor: '#eee',
  color: 'black',
};

const thumbStyle = {
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#0ba58b',
  width: '5px',
  opacity: 0.75,
};

const components = ref([]);
const headerClass = 'list-header';
const bgColor = 'bg-primary';

onMounted(() => {
  const array = LocalStorage.getAllKeys();
  for (let index = 0; index < array.length; index++) {
    // check if is uuid
    if (array[index].substring(0, 6) === 'report') {
      console.log(LocalStorage.getItem(index));
      const item = LocalStorage.getItem(array[index]);
      selectedService.value =
        clinicalServiceService.getClinicalServicePersonalizedById(
          item.clinicalService
        );
      /* ClinicalService.query()
                                        .where('id', item.clinicalService)
                                        .first()*/
      changeTab(item.tabName, selectedService, item);
    }
  }
});

const changeTab = (tabName, selectedService, params) => {
  const uidValue = 'report' + uid();
  console.log(uidValue);
  const comp = {
    id: params === undefined ? uidValue : params.id,
    name: tabName,
    clinicalService: selectedService,
    params: params,
  };
  components.value.push(comp);
};

const clinicalServices = computed(() => {
  return ClinicalService.query().orderBy('code', 'desc').get();
});

const clinic = computed(() => {
  return clinicService.currClinic();
});

provide('currClinic', clinic);
provide('title', title);
</script>

<style lang="scss">
.panel {
  border: 1px solid $grey-13;
  border-radius: 0px;
}
.tab-menu {
  border-top: 1px solid $grey-13;
  border-left: 1px solid $grey-13;
  border-right: 1px solid $grey-13;
  border-radius: 0px;
}
.list-header {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
</style>
