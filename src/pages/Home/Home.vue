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

<script>
import Clinic from '../../store/models/clinic/Clinic'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import SynchronizationService from 'src/services/Synchronization/SynchronizationService'
export default {
  mixins: [mixinplatform, mixinutils],
  components: {},
  methods: {
    init () {
      // this.showloading()
      if (this.website) {
        this.loadWebRegimensToVueX()
        this.loadWebDrugsToVueX()
        this.loadWebStockToVueX()
        this.showloading()
        this.loadWebParamsToVueX()
      } else {
        if (this.isAppSyncDone) {
          this.showloading()
          this.loadParamsToVueX()
        }
      }
    },
    menusVisible (name) {
      const menus = localStorage.getItem('role_menus')
      if (!menus.includes(name)) {
        return false
      } else {
        return true
      }
    },
    loadClinics () {
      Clinic.localDbGetAll().then((clinics) => {
        console.log(clinics)
        Clinic.insertOrUpdate({ data: clinics })
      })
    }
  },
  mounted () {
     // SynchronizationService.doGetDrugFileMobile(this.currClinic.id, 0, 100)
        // SynchronizationService.doGetAllStockAlert(this.currClinic.id, 0, 100)
    this.init()
    setTimeout(() => {
      if (this.mobile) {
        console.log(this.isAppSyncDone)
        if (!this.isAppSyncDone) {
          SynchronizationService.start(this.$q, this.currClinic.id)
        } else {
          this.hideLoading()
        }
      }
    }, 3000)
  },
  created () {
   // this.showloading()
  }
}
</script>

<style></style>
