<template>
  <div>
    <TitleBar>Relatórios</TitleBar>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey q-pt-md q-pl-md"
      active-color="primary"
      indicator-color="white"
      align="left"
    >
      <q-tab name="list" label="Listas" :class='tab === "list" ? "tab-menu" : ""'/>
      <q-tab name="graph" label="Análise Gráfica" :class='tab === "graph" ? "tab-menu" : ""' />
    </q-tabs>
    <q-separator style="margin-top: -1px"/>
   <MenuMobile  v-if="mobile"  @changeTab="changeTab"></MenuMobile>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="list">

        <div class="row" >
          <div class="col-3   q-ml-sm q-mr-sm" style="max-width: 500px" v-if="website">
              <q-bar dark class="bg-primary text-white">
                  <div class="col text-center text-weight-bold">
                   Listagens
                  </div>
            </q-bar>
          </div>
          <div class="col q-mr-sm">
                   <q-bar dark class="bg-primary text-white">
                  <div class="col text-center text-weight-bold">
                   Resultados
                  </div>
            </q-bar>
          </div>
        </div>

        <div class="row">
          <div class="col-3  q-ml-sm q-mr-sm panel" style="max-width: 500px"  v-if="website">
            <ListReportMenu
              @changeTab="changeTab"
              v-if="website"
            />

          </div>
          <div class="col q-mr-sm panel q-pa-sm">
            <q-scroll-area
              :thumb-style="thumbStyle"
              :content-style="contentStyle"
              :content-active-style="contentActiveStyle"
              style="height: 700px;"
              class="q-pr-md"
            >
              <template v-for="comp in components"
              :key="comp.id"
              >
                <component
                    :is="comp.name"
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
          <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg panel">
          </div>
          <div class="col q-mr-lg panel">
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import { ref } from 'vue'
// import { uuid } from 'uuid'
import { uid, LocalStorage } from 'quasar'
import ClinicalService from '../../store/models/ClinicalService/ClinicalService'
import mixinSystemPlatform from '../../mixins/mixin-system-platform'
export default {
  mixins: [mixinSystemPlatform],
  setup () {
    return {
      tab: ref('list'),
      model: ref(null),
      activeTab: ref(''),
      selectedService: null,
      contentStyle: {
        backgroundColor: '#ffffff',
        color: '#555'
      },

      contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      },

      thumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#0ba58b',
        width: '5px',
        opacity: 0.75
      }
    }
  },
  data () {
    return {
      components: [],
      headerClass: 'list-header',
      bgColor: 'bg-primary'
    }
  },
  components: {
     TitleBar: require('components/Shared/TitleBar.vue').default,
     ActivesInDrugStore: require('components/Reports/Patient/ActivesInDrugStore.vue').default,
     GuestList: require('components/Reports/Patient/GuestList.vue').default,
     ImportedPatientList: require('components/Reports/Patient/ImportedPatientList.vue').default,
     TransferedFrom: require('components/Reports/Patient/TransferedFrom.vue').default,
     TransferedTo: require('components/Reports/Patient/TransferedTo.vue').default,
     ListReportMenu: require('components/Reports/Menus/ListReportMenu.vue').default,
     Mmia: require('components/Reports/ClinicManagement/Mmia.vue').default,
     ReferredPatients: require('components/Reports/ReferralManagement/ReferredPatients.vue').default,
     ReferredBackPatients: require('components/Reports/ReferralManagement/ReferredBackPatients.vue').default,
     ReferredPatientDispenseHistory: require('components/Reports/ReferralManagement/ReferredPatientDispenseHistory.vue').default,
     AbsentReferredPatients: require('components/Reports/ReferralManagement/AbsentReferredPatients.vue').default,
     ReceivedStock: require('components/Reports/stock/ReceivedStock.vue').default,
     UsedStock: require('components/Reports/stock/UsedStock.vue').default,
     ArvDailyRegister: require('components/Reports/monitoring/ArvDailyRegister.vue').default,
     AbsentPatients: require('components/Reports/ClinicManagement/AbsentPatients.vue').default,
     PatientHistory: require('components/Reports/ClinicManagement/PatientHistory.vue').default,
     MenuMobile: require('components/Reports/Menus/ListReportMenuMobile.vue').default
    },
      mounted () {
     const array = LocalStorage.getAllKeys()
     for (let index = 0; index < array.length; index++) {
     // check if is uuid
        if (array[index].substring(0, 6) === 'report') {
      console.log(LocalStorage.getItem(index))
       const item = LocalStorage.getItem(array[index])
        this.selectedService = ClinicalService.query()
                                        .where('id', item.clinicalService)
                                        .first()
      this.changeTab(item.tabName, this.selectedService, item)
        }
 }
 console.log(this.mobile)
        console.log(this.website)
  },
    methods: {
     changeTab (tabName, selectedService, params) {
        const uidValue = 'report' + uid()
        console.log(uidValue)
        const comp = { id: params === undefined ? uidValue : params.id, name: tabName, clinicalService: selectedService, params: params }
        this.components.push(comp)
        }
    },
    computed: {
    clinicalServices: {
      get () {
        return ClinicalService.query()
                              .orderBy('code', 'desc')
                              .get()
      }
    }
  }
}
</script>

<style lang="scss">
  .panel {
    border: 1px solid $grey-13;
    border-radius: 0px
  }
  .tab-menu {
    border-top: 1px solid $grey-13;
    border-left: 1px solid $grey-13;
    border-right: 1px solid $grey-13;
    border-radius: 0px
  }
  .list-header {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}
</style>
