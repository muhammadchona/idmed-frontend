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
                  currClinic !== undefined ? currClinic.clinicName : ''
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
              v-if="menusVisible('Administração')"
              exact
              :to="'/settings'"
              name="settings"
              icon="settings"
              label="Administração"
            />
            <q-route-tab
              v-if="activateMigration"
              exact
              :to="'/migration'"
              name="migration"
              icon="branding_watermark"
              label="Migração"
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
                  {{ this.username }}
                </div>
              </div>
            </template>
            <!--<user-info>-->
            <q-list style="width: 190px">
              <q-item>
                <q-item-section avatar>
                  <q-avatar icon="account_circle"> </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">
                    <div class="">{{ this.username }}</div>
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
              <!--q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section avatar>
                      <q-avatar icon="mdi-account"  />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label lines="1">Perfil</q-item-label>
                      <q-item-label caption>Vizualizar o Perfil</q-item-label>
                    </q-item-section>
                  </q-item-->

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
            <!--</user-info>-->
          </q-btn-dropdown>

          <!--div class="absolute-right items-center q-mt-sm">
                        <q-btn flat icon="account_circle" label=""> <span class="text-weight-bolder"> {{}}</span>
                            <q-menu
                            transition-show="scale"
                            transition-hide="scale">
                            <q-list style="min-width: 100px">
                                <q-item clickable>
                                    <q-item-section>Perfil</q-item-section>
                                </q-item>
                                <q-item to="/Logout" clickable>
                                    <q-item-section>Sair</q-item-section>
                                </q-item>
                            </q-list>
                            </q-menu>
                        </q-btn>
                    </div-->
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

<script>
import { defineComponent, ref } from 'vue';
import { Notify } from 'quasar';
import SystemConfigs from '../store/models/systemConfigs/SystemConfigs.js';
import mixinplatform from 'src/mixins/mixin-system-platform';
import mixinutils from 'src/mixins/mixin-utils';
import SynchronizationService from 'src/services/Synchronization/SynchronizationService';
import isOnline from 'is-online';
// import schedule from 'node-schedule'
import mixinEncryption from 'src/mixins/mixin-encryption';
// import mixinIsOnline from 'src/mixins/mixin-is-online'
const schedule = require('node-schedule');
export default defineComponent({
  name: 'MainLayout',
  mixins: [mixinplatform, mixinEncryption, mixinutils],
  setup() {
    return {
      leftDrawerOpen: false,
      userInfoOpen: false,
      onMainClick: '',
      onItemClick: '',
      username: localStorage.getItem('user'),
      tab: ref('home'),
      // menusVisible: true,
      menusArray: [
        'Tela Inicial',
        'Pacientes',
        'Grupos',
        'Stock',
        'Dashboard',
        'Administracao',
        'Migracao',
      ],
    };
  },
  mounted() {
    console.log(this.website);
    if (this.website) {
      //  SystemConfigs.apiGetAll()
    }
    // this.getRolesToMenu()
    if (this.mobile) {
      this.schedulerSync();
    }
  },
  computed: {
    activateMigration() {
      if (this.migrationConfig === null) return false;
      return this.migrationConfig.value === 'true';
    },
    migrationConfig() {
      return SystemConfigs.query()
        .where('key', 'ACTIVATE_DATA_MIGRATION')
        .first();
    },
  },
  components: {},
  methods: {
    menusVisible(name) {
      const menus = localStorage.getItem('role_menus');
      if (menus !== null) {
        if (!menus.includes(name)) {
          return false;
        } else {
          return true;
        }
      }
    },
    schedulerSync() {
      schedule.scheduleJob('0 * * * *', () => {
        this.sync();
      });
    },
    async sync() {
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
          } else {
            localStorage.setItem('isSyncronizing', 'true');
            const userPass = localStorage.getItem('sync_pass');
            const decryptedPass = this.decryptPlainText(userPass);
            SynchronizationService.send(decryptedPass);
          }
        } else if (resp === false) {
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
    },
  },
});
</script>
