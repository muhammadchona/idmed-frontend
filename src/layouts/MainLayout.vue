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
                  currClinic !== null ? currClinic.clinicName : ''
                }}</q-item-label
              >
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
              v-if="menusVisible('Grupos')"
              exact
              :to="'/group/search'"
              name="groups"
              icon="groups"
              label="Grupos"
            />
            <q-route-tab
              v-if="menusVisible('Stock')"
              exact
              :to="'/stock'"
              name="stock"
              icon="shopping_cart"
              label="Stock"
            />
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
              v-if="activateMigration && website"
              exact
              :to="'/migration'"
              name="migration"
              icon="branding_watermark"
              label="Migração"
            />
            <q-route-tab
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
import { computed, onMounted, ref } from 'vue';
import { Notify } from 'quasar';
import { useMediaQuery } from '@vueuse/core';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { sendData } from 'src/services/SendInfo';
const { website } = useSystemUtils();
const userInfoOpen = ref(false);
const onMainClick = ref('');
const onItemClick = ref('');
const username = ref(localStorage.getItem('user'));
const tab = ref('home');
const mobile = ref(false);

const { isOnline } = useSystemUtils();
const { sendDataToBackEnd, getPatientsToSend, getGroupsToSend } = sendData();

onMounted(() => {
  if (website.value || isOnline.value) {
    mobile.value = false;
    systemConfigsService.apiGetAll();
  } else {
    mobile.value = true;
  }
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

const menusVisible = (name) => {
  const menus = localStorage.getItem('role_menus');
  if (menus !== null) {
    if (!menus.includes(name)) {
      return false;
    } else {
      return true;
    }
  }
};

const sync = async () => {
  /*
  await isOnline().then((resp) => {
    if (resp === true) {
      if (localStorage.getItem('isSyncronizing') === 'true') {
        Notify.create({
          icon: 'announcement',
          message: 'Já Existe uma sincronização em curso.',
          type: 'warning',
          progress: true,
          timeout: 3000,
          position: 'top',
          color: 'warning',
          textColor: 'white',
          classes: 'glossy',
        });
      }
    } else if (resp === false) {
      //  const userPass = localStorage.getItem('sync_pass')
      //     const decryptedPass = this.decryptPlainText(userPass)
      //       SynchronizationService.send(decryptedPass)
      sendDataToBackEnd();
      Notify.create({
        icon: 'announcement',
        message:
          'Nao Possui conectividade com a internet , Sincronização nao efectuda',
        type: 'negative',
        progress: true,
        timeout: 3000,
        position: 'top',
        color: 'negative',
        textColor: 'white',
        classes: 'glossy',
      });
    }
  });
  */
  getGroupsToSend();
  getPatientsToSend();
};
</script>
