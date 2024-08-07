<template>
  <q-layout view="lHh Lpr lFf">
    <div>
      <q-header>
        <q-toolbar>
          <q-avatar size="100px">
            <img class="bg-white" src="../assets/LogoiDMED.png" />
          </q-avatar>

          <q-toolbar-title
            class="text-bold text-italic"
            style="font-family: 'Gill Sans'; font-size: 35px"
          >
            <q-item-section>
              <q-item-label
                class="text-bold text-italic"
                style="font-family: 'Gill Sans'; font-size: 35px"
                >iDMED</q-item-label
              >
              <q-item-label
                class="text-bold text-italic"
                style="font-family: 'Gill Sans'; font-size: 25px"
                >{{
                  currClinic !== null
                    ? currClinic.parentClinic_id !== undefined
                      ? currClinic.parentClinic.clinicName +
                        ' - ' +
                        currClinic.clinicName
                      : currClinic.clinicName
                    : currProvince !== null
                    ? 'Provincia - ' + currProvince.description
                    : ''
                }}
              </q-item-label>
            </q-item-section>
          </q-toolbar-title>
          <q-tabs
            class="absolute-center"
            no-caps
            v-model="tab"
            active-color="orange"
            indicator-color="orange"
            align="justify"
            narrow-indicator
          >
            <q-route-tab
              exact
              default
              :to="'/home'"
              name="home"
              icon="home"
              label="Inicial"
            />
            <q-route-tab
              v-if="menusVisible('Pacientes')"
              exact
              :to="'/patients'"
              name="patients"
              icon="person_outline"
              label="Pacientes/Utentes"
            />
            <q-route-tab
              v-if="
                menusVisible('Grupos') && !isProvincialInstalation() && isOnline
              "
              exact
              :to="'/group/search'"
              name="groups"
              icon="groups"
              label="Grupos"
            />
            <q-route-tab
              v-if="
                menusVisible('Stock') &&
                (!isProvincialInstalation() ||
                  isProvincialInstalationPharmacysMode() ||
                  isProvincialInstalationMobileClinic)
              "
              exact
              :to="'/stock'"
              name="stock"
              icon="shopping_cart"
              label="Stock"
            >
              <q-badge
                color="red"
                floating
                transparent
                v-if="stockDistributionCount > 0"
              >
                {{ stockDistributionCount }}
              </q-badge>
            </q-route-tab>
            <q-route-tab
              v-if="menusVisible('Dashboard')"
              exact
              :to="'/dashboard'"
              name="dashboard"
              icon="dashboard"
              label="Dashboard"
            />
            <q-route-tab
              v-if="menusVisible('Relatorios')"
              exact
              :to="'/reports'"
              name="reports"
              icon="insert_chart_outlined"
              label="Relatórios"
            />
            <q-route-tab
              v-if="menusVisible('Administração') && isOnline"
              exact
              :to="'/settings'"
              name="settings"
              icon="settings"
              label="Administração"
            />
            <q-route-tab
              v-if="
                menusVisible('Migração') &&
                activateMigration &&
                website &&
                !isProvincialInstalation()
              "
              exact
              :to="'/migration'"
              name="migration"
              icon="branding_watermark"
              label="Migração"
            />
            <q-route-tab
              v-if="
                menusVisible('DCProvedor') &&
                !isProvincialInstalation() &&
                website
              "
              exact
              :to="'/loadfiledc'"
              name="migration"
              icon="connect_without_contact"
              label="DC pelo Provedor"
            />
          </q-tabs>
          <q-btn-dropdown
            unelevated
            v-model="userInfoOpen"
            no-caps
            @click="onMainClick"
          >
            <template v-slot:label>
              <div class="row items-center no-wrap">
                <q-avatar size="lg" icon="account_circle"> </q-avatar>
                <div class="text-center q-pa-sm">
                  {{ username }}
                </div>
              </div>
            </template>
            <q-list style="width: 190px">
              <q-item>
                <q-item-section avatar>
                  <q-avatar icon="account_circle"> </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">
                    <div class="">{{ username }}</div>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-if="mobile">
                <q-item-section avatar clickable @click="sync()">
                  <q-avatar icon="sync"> </q-avatar>
                </q-item-section>
                <q-item-section clickable @click="sync()"
                  >Sincronizar</q-item-section
                >
              </q-item>
              <q-item clickable v-if="mobile">
                <q-item-section avatar clickable @click="sync()">
                  <q-avatar icon="delete"> </q-avatar>
                </q-item-section>
                <q-item-section clickable @click="wipeDataMobile()"
                  >Limpar Dados</q-item-section
                >
              </q-item>
              <q-separator spaced />
              <q-item clickable v-close-popup @click="onItemClick" to="/Logout">
                <q-item-section avatar>
                  <q-avatar icon="mdi-logout" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sair</q-item-label>
                  <q-item-label caption>Sair do Sistema</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-toolbar>
      </q-header>
    </div>
    <q-page-container>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  onBeforeUnmount,
  provide,
  onBeforeMount,
} from 'vue';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { sendData } from 'src/services/Mobile/SendInfo';
import useNotify from 'src/composables/shared/notify/UseNotify';
import provinceService from 'src/services/api/provinceService/provinceService';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import DrugDistributorService from 'src/services/api/drugDistributorService/DrugDistributorService';
import { useOffline } from 'src/composables/shared/loadParamsToOffline/offline';
import { wipeData } from 'src/services/Mobile/WipeData';
const { website } = useSystemUtils();
const {
  isProvincialInstalation,
  isProvincialInstalationPharmacysMode,
  isProvincialInstalationMobileClinic,
} = useSystemConfig();
const userInfoOpen = ref(false);
const onMainClick = ref('');
const onItemClick = ref('');
const username = ref(sessionStorage.getItem('user'));
const tab = ref('home');
const mobile = ref(false);

const { notifyError } = useNotify();
const { isOnline } = useSystemUtils();
const { getPatientsToSend, getGroupsToSend } = sendData();
const { getPatientsVisitToWipe } = wipeData();
const {
  loadPatientDataToOffline,
  loadSettingParamsToOffline,
  loadSettingParamsInOfflineMode,
} = useOffline();
const stockDistributionCount = ref(0);

const logoutTimer = ref(null);

// Função para fazer o logout
const logout = () => {
  sessionStorage.removeItem('authUser');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('refresh_token');
  // localStorage.removeItem('password');
  // localStorage.removeItem('tokenExpiration');
  window.location.reload();
};

const removeFromLocalStorage = () => {
  localStorage.removeItem('authUser');
  localStorage.removeItem('user');
  localStorage.removeItem('username');
  localStorage.removeItem('refresh_token');
};

const resetTimer = () => {
  clearTimeout(logoutTimer.value);
  setTimer();
};

const warningMessage = () => {
  sessionStorage.setItem('tokenExpiration', 0);
  logout();
};

const setTimer = () => {
  logoutTimer.value = setTimeout(warningMessage, 1200 * 1000); // 20 min
};

onMounted(() => {
  if (website.value || isOnline.value) {
    mobile.value = false;
    systemConfigsService.apiGetAll();
  } else {
    mobile.value = true;
  }

  // Definir os eventos e adicionar os ouvintes
  const events = [
    'click',
    'mousemove',
    'mousedown',
    'scroll',
    'keypress',
    'load',
  ];

  events.forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  // Inicie o timer após definir os eventos
  setTimer();
});

// Define o hook onBeforeUnmount para destruir o timer quando o componente for desmontado
onBeforeUnmount(() => {
  // Certifique-se de limpar o timer antes de desmontar o componente
  clearTimeout(logoutTimer.value);
});

const activateMigration = computed(() => {
  if (migrationConfig.value === null) return false;
  return migrationConfig.value.value === 'true';
});
const migrationConfig = computed(() => {
  return systemConfigsService.getActiveDataMigration();
});

const currClinic = computed(() => {
  return clinicService.currClinic();
});

/*
const stockDistributionCount = computed(() => {
  return localStorage.getItem('stockDistributionCount');
});
*/
const currProvince = computed(() => {
  const instalationType = systemConfigsService.getInstallationType();
  if (instalationType.value === 'PROVINCIAL') {
    return provinceService.getAllProvincesByCode(instalationType.description);
  } else return null;
});

const menusVisible = (name) => {
  const menus = sessionStorage.getItem('role_menus');
  if (menus !== null) {
    if (!menus.includes(name)) {
      return false;
    } else {
      return true;
    }
  }
};

const sync = async () => {
  // getGroupsToSend();
  getPatientsToSend();
};

const wipeDataMobile = async () => {
  // getGroupsToSend();
  getPatientsVisitToWipe();
};
provide('stockDistributionCount', stockDistributionCount);
</script>
