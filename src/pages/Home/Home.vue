<template>
  <q-page class="flex flex-center">
    <div class="" v-if="!isProvincialInstalation()">
      <div class="row q-pa-xl q-gutter-xl">
        <div class="col" v-if="menusVisible('Pacientes')">
          <router-link :to="`/patients`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/patientsButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="bg-pink-4 text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Pacientes/Utentes
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
        <div
          class="col"
          v-if="
            menusVisible('Grupos') && !isProvincialInstalation() && isOnline
          "
        >
          <router-link :to="`/group/search`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/groupsButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="bg-blue text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Grupos
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
        <div class="col" v-if="menusVisible('Stock')">
          <router-link :to="`/stock`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/stockButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="bg-blue text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Stock
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
      </div>
      <div class="row">
        <div class="col col-sm-3"></div>
        <div class="col" v-if="menusVisible('Dashboard')">
          <router-link :to="`/dashboard`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/dashboardButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Dashboard
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
        <div class="col" v-if="menusVisible('Relatorios')">
          <router-link :to="`/reports`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/reportsButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Relatórios
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
        <div
          class="col-2"
          v-if="
            menusVisible('Administração') &&
            !isProvincialInstalation() &&
            isOnline
          "
        >
          <router-link :to="`/settings`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/settingsButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="bg-blue text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Administração
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
      </div>
    </div>
    <div class="" v-else>
      <div class="row q-pa-xl q-gutter-xl">
        <div class="col" v-if="menusVisible('Pacientes')">
          <router-link :to="`/patients`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/patientsButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="bg-pink-4 text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Pacientes/Utentes
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
        <div class="col" v-if="menusVisible('Dashboard')">
          <router-link :to="`/dashboard`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/dashboardButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Dashboard
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
      </div>
      <div class="row">
        <div class="col"></div>
        <div class="col" v-if="menusVisible('Relatorios')">
          <router-link :to="`/reports`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/reportsButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Relatórios
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
        <div class="col-2" v-if="menusVisible('Administração')">
          <router-link :to="`/settings`">
            <q-btn round>
              <q-avatar size="190px">
                <img src="~assets/settingsButton.png" />
              </q-avatar>
              <q-tooltip
                content-class="bg-blue text-white shadow-4"
                :offset="[10, 10]"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Administração
              </q-tooltip>
            </q-btn>
          </router-link>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useOnline } from 'src/composables/shared/loadParams/online';
import { useOffline } from 'src/composables/shared/loadParamsToOffline/offline';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { computed, onMounted, watch, inject } from 'vue';
import clinicService from 'src/services/api/clinicService/clinicService';
import patientService from 'src/services/api/patientService/patientService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import sysConfigsService from 'src/services/api/systemConfigs/systemConfigsService.ts';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import DrugDistributorService from 'src/services/api/drugDistributorService/DrugDistributorService';

const { closeLoading, showloading } = useLoading();
const { website, isMobile, isOnline } = useSystemUtils();
const { isProvincialInstalation } = useSystemConfig();

const { loadSettingParams, loadPatientData } = useOnline();

const {
  loadPatientDataToOffline,
  loadSettingParamsToOffline,
  loadSettingParamsInOfflineMode,
} = useOffline();
const { alertWarningTitle } = useSwal();

const stockDistributionCount = inject('stockDistributionCount');
let codeExecuted = false;

const clinic = computed(() => {
  return clinicService.currClinic();
});

const isClinicSector = computed(() => {
  return clinicService.isClinicSector(clinic.value);
});

const isPrivatePharmacy = computed(() => {
  return clinicService.isPrivatePharmacy(clinic.value);
});

const getStockDistributionCount = (clinic) => {
  DrugDistributorService.getDistributionsByStatus(clinic.id, 'P').then(
    (list) => {
      stockDistributionCount.value = list.length;
      localStorage.setItem(
        'stockDistributionCount',
        stockDistributionCount.value
      );
    }
  );
};

const menusVisible = (name) => {
  const menus = sessionStorage.getItem('role_menus');
  if (menus !== null)
    if (!menus.includes(name)) {
      return false;
    } else {
      return true;
    }
};

onMounted(async () => {
  if (website.value || (isMobile.value && isOnline.value)) {
    showloading();
    loadSettingParams();
  } else {
    await patientService.getMobile();
    console.log(patientService.getAllFromStorage().length);
    if (patientService.getAllFromStorage().length <= 0) {
      showloading();
      loadSettingParamsToOffline();
      //  loadSettingParamsInOfflineMode();
      setTimeout(() => {
        loadPatientDataToOffline();
      }, 5000);
    } else {
      loadSettingParams();
    }
  }
  // loadSettingParamsToOffline();
  /// loadPatientDataToOffline();
});

watch(clinic, () => {
  const config = sysConfigsService.getInstallationType();
  if (!codeExecuted) {
    codeExecuted = true;
    InventoryService.isInventoryPeriod(clinic.value.id).then((resp) => {
      const isInventoryPeriod = resp;

      if (isInventoryPeriod && config.value === 'LOCAL') {
        alertWarningTitle(
          'Lembrete de Inventário',
          'Último inventário foi feito há mais de 28 dias. Por favor, efectue um novo inventário!'
        );
      }
    });
    // getStockDistributionCount(clinic.value);
  }
});
</script>

<style></style>
