<template>
  <q-page class="flex flex-center">
    <div class="">
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
        <div class="col" v-if="menusVisible('Grupos')">
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
        <div class="col col-sm-3" />
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
// import Clinic from '../../store/models/clinic/Clinic';
// import mixinplatform from 'src/mixins/mixin-system-platform';
// import mixinutils from 'src/mixins/mixin-utils';
// import SynchronizationService from 'src/services/Synchronization/SynchronizationService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useOnline } from 'src/composables/shared/loadParams/online';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { computed, onMounted } from 'vue';
import clinicService from 'src/services/api/clinicService/clinicService';
// import clinicService from 'src/services/api/clinicService/clinicService';

// mixins: [mixinplatform, mixinutils],
// components: {},
// methods: {
const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile } = useSystemUtils();

const { loadSettingParams } = useOnline();

const init = () => {
  showloading();
  if (website.value) {
    loadSettingParams;
    // this.loadWebRegimensToVueX();
    // this.loadWebDrugsToVueX();
    // this.loadWebStockToVueX();
    // this.showloading();
    // this.loadWebParamsToVueX();
  } else {
    if (this.isAppSyncDone) {
      this.showloading();
      this.loadParamsToVueX();
    }
  }
};

const menusVisible = (name) => {
  const menus = localStorage.getItem('role_menus');
  if (menus !== null)
    if (!menus.includes(name)) {
      return false;
    } else {
      return true;
    }
};

onMounted(() => {
  if (website.value) {
    showloading();
    loadSettingParams();
  }
  // SynchronizationService.doGetDrugFileMobile(this.currClinic.id, 0, 100)
  // SynchronizationService.doGetAllStockAlert(this.currClinic.id, 0, 100)
  // init();
  setTimeout(() => {
    console.log(website.value);

    // if (isWeb.value) {
    //      console.log(this.isAppSyncDone);
    //   if (!this.isAppSyncDone) {
    //     SynchronizationService.start(this.$q, this.currClinic.id);
    //   } else {
    //     hideLoading();
    //   }
    // }
    closeLoading();
  }, 3000);
});
</script>

<style></style>
