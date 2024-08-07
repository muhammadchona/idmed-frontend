<template>
  <q-banner
    dense
    inline-actions
    :class="[bgColor]"
    class="text-white q-pa-none"
  >
    <div class="row">
      <div class="col">
        <q-select
          class="q-ma-sm items-center"
          bg-color="white"
          dense
          outlined
          style="max-width: 300px"
          ref="clinicalService"
          v-model="selectedService"
          :options="clinicalServices"
          option-value="id"
          option-label="code"
          label="Serviço de Saúde"
        />
      </div>
      <q-list v-if="selectedService !== null">
        <div v-if="selectedService.code === 'TARV'">
          <q-btn-group push> </q-btn-group>
          <q-btn-dropdown
            color="orange-6"
            v-for="menu in menu"
            :key="menu.id"
            :label="menu.description"
            header-class="bg-green-1 text-black"
            class="q-ma-sm"
          >
            <q-list bordered separator>
              <q-item
                v-for="(item, index) in menu.menuItem"
                :key="index"
                clickable
                v-ripple
                :active="true"
                v-close-popup
                class="bg-orange-1 q-ma-sm text-black"
                @click="changeTab(item.tabName)"
              >
                <q-item-section> {{ item.description }} </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        <div v-else class="items-center col">
          <q-banner rounded class="bg-orange-1 text-left text-orange-10">
            Nenhum Relatório assossiado ao Serviço de Saúde Seleccionado!.
          </q-banner>
        </div>
      </q-list>
      <div v-else class="items-center col q-ma-sm">
        <q-banner rounded class="bg-orange-1 text-left text-orange-10">
          Nenhum Serviço de Saúde foi Seleccionado!.
        </q-banner>
      </div>
    </div>
  </q-banner>
</template>

<script setup>
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import { computed, ref } from 'vue';

const emit = defineEmits(['changeTab']);

const currTab = ref('');
const selectedService = ref(null);
const menu = [
  {
    description: 'Pacientes',
    id: 1,
    menuItem: [
      { description: 'Activos na Farmácia', tabName: 'ActivesInDrugStore' },
      //  { description: 'Lista de transferidos PARA', tabName: 'TransferedTo' },
      //  { description: 'Lista de transferidos DE', tabName: 'TransferedFrom' },
      //  { description: 'Lista de Visitantes', tabName: 'GuestList' },
      //  { description: 'Lista de pacientes importados de outros Sistemas', tabName: 'ImportedPatientList' }
      {
        description: 'Lista de Pacientes Com Rastreio de TB',
        tabName: 'TBScreening',
      },
      {
        description: 'Lista de Pacientes Rastreados para RAM',
        tabName: 'RAMScreening',
      },
      {
        description: 'Lista de Pacientes Monitorados Para Adesão',
        tabName: 'PatientsMonitoredForAdherence',
      },
      {
        description: 'Lista de Pacientes Rastreados Para Gravidez',
        tabName: 'PatientWithPregnancyScreening',
      },
    ],
  },
  {
    description: 'Gestão de Farmácia',
    id: 2,
    menuItem: [
      {
        description: 'Lista de Pacientes Faltosos ao Levantamento',
        tabName: 'AbsentPatients',
      },
      {
        description: 'Mapa Mensal de Informação de ARV (MMIA)',
        tabName: 'Mmia',
      },
      //  { description: 'Lista de transferidos DE', tabName: 'TransferedFrom' },
      //  { description: 'Lista de Visitantes', tabName: 'GuestList' },
      //  { description: 'Lista de pacientes importados de outros Sistemas', tabName: 'ImportedPatientList' },
      { description: 'Histórico de Levantamentos', tabName: 'PatientHistory' },
      {
        description:
          "Lista de Pacientes Faltosos ao Levantamento de ARV's para APSS",
        tabName: 'AbsentPatientsAPSS',
      },
      {
        description: 'Lista de Dispensas por Frascos',
        tabName: 'PacksByDrugBottles',
      },
    ],
  },
  {
    description: 'Referências',
    id: 3,
    menuItem: [
      {
        description: 'Lista de Pacientes Referidos Para outras Farmacias',
        tabName: 'ReferredPatients',
      },
      {
        description: 'Lista de Pacientes que voltaram da Referencia',
        tabName: 'ReferredBackPatients',
      },
      {
        description:
          'Lista de Pacientes referidos faltosos em outras Farmacias',
        tabName: 'AbsentReferredPatients',
      },
      {
        description: 'Historico de Levantamentos de Pacientes Referidos',
        tabName: 'ReferredPatientDispenseHistory',
      },
    ],
  },
  {
    description: 'Stock',
    id: 4,
    menuItem: [
      { description: 'Lista de Stock Recebido', tabName: 'ReceivedStock' },
      { description: 'Lista de Stock Usado', tabName: 'UsedStock' },
    ],
  },
  {
    description: 'Monitoria e Avaliação',
    id: 5,
    menuItem: [
      {
        description: 'Lista de Registro Diário de ARV',
        tabName: 'ArvDailyRegister',
      },
      {
        description: 'Lista de Dispensas nao sicronizadas',
        tabName: 'NotSynchronizedPackToServer',
      },
    ],
  },
];

const changeTab = (tabName) => {
  currTab.value = tabName;
  emit('changeTab', tabName, selectedService.value);
};

const clinicalServices = computed(() => {
  return clinicalServiceService.getAllClinicalServices();
});
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
