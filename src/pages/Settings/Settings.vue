<template>
  <div class="q-pa-md">
    <div class="q-mt-lg" v-if="mobile">

      <!-- <TitleBar>Administração</TitleBar> -->
      <div class="text-left">
        <div class="q-my-md text-subtitle1 text-grey-14">
          <q-btn flat @click="drawer = !drawer" round dense icon="menu"></q-btn>Administração
        </div>
        <q-separator color="grey-13" size="1px"/>
      </div>

      <q-drawer
        v-model="drawer"
        :width="300"
        :breakpoint="500"
        overlay
        bordered
        behavior="mobile"
      >
          <q-scroll-area class="fit">

            <q-list padding>
              <div v-for="(menuItem, index) in tabs" :key="index">
                <q-item clickable :active="menuItem.label === activeMenu"  @click="changeMenu(menuItem.label)" v-ripple>
                  <q-item-section avatar>
                    <q-icon :name="menuItem.icon"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    {{ menuItem.label }}
                  </q-item-section>
                </q-item>
                <q-separator :key="'sep' + index" v-if="menuItem.separator"></q-separator>
              </div>
            </q-list>

          </q-scroll-area>
      </q-drawer>

      <div>
        <q-scroll-area style="height: 565px">
          <clinics v-if="activeMenu === 'Farmácias'"> </clinics>
          <clinicSectors v-if="activeMenu === 'Sector Clínico'"> </clinicSectors>
          <doctor v-if="activeMenu === 'Clínicos'"> </doctor>
          <drug v-if="activeMenu === 'Medicamentos'"> </drug>
          <therapeuticRegimen v-if="activeMenu === 'Regime Terapêutico'"> </therapeuticRegimen>
          <clinicalServices v-if="activeMenu === 'Serviço Clínico'"> </clinicalServices>
          <identifierType v-if="activeMenu === 'Tipo de Identificador'"> </identifierType>
          <interoperability v-if="activeMenu === 'Interoperabilidade'"> </interoperability>
          <users v-if="activeMenu === 'Utilizadores'"> </users>
          <roles v-if="activeMenu === 'Perfis'"> </roles>
        </q-scroll-area>
      </div>
    </div>

    <q-splitter
      v-if="website"
      v-model="splitterModel">
      <template v-slot:before>
       <q-tabs
          v-model="selectedTab"
         vertical
         class="text-teal">
          <q-tab v-for="tab in tabs" :key="tab.name" v-bind="tab" />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="selectedTab"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel name="clinic">
            <div class="text-h4 q-mb-md"></div>
            <clinics> </clinics>
          </q-tab-panel>

          <!--q-tab-panel name="national_clinic">
            <div class="text-h4 q-mb-md"></div>
            <nationalClinic> </nationalClinic>
          </q-tab-panel-->

          <q-tab-panel name="clinic_sector">
            <div class="text-h4 q-mb-md"></div>
            <clinicSectors> </clinicSectors>
          </q-tab-panel>
          <q-tab-panel name="doctor">
            <div class="text-h4 q-mb-md"></div>
             <doctor> </doctor>
          </q-tab-panel>
            <q-tab-panel name="drugs">
            <div class="text-h4 q-mb-md"></div>
             <drug> </drug>
          </q-tab-panel>
              <q-tab-panel name="clinical_service">
            <div class="text-h4 q-mb-md"></div>
             <clinicalServices> </clinicalServices>
          </q-tab-panel>
          <q-tab-panel name="therapeutic_regimen">
            <div class="text-h4 q-mb-md"></div>
             <therapeuticRegimen> </therapeuticRegimen>
          </q-tab-panel>
          <q-tab-panel name="identifier_type">
            <div class="text-h4 q-mb-md"></div>
             <identifierType />
          </q-tab-panel>
          <q-tab-panel name="interoperability">
            <div class="text-h4 q-mb-md"></div>
             <interoperability> </interoperability>
          </q-tab-panel>
            <q-tab-panel name="users">
            <div class="text-h4 q-mb-md"></div>
             <users> </users>
          </q-tab-panel>
           <q-tab-panel name="roles">
            <div class="text-h4 q-mb-md"></div>
             <roles> </roles>
          </q-tab-panel>
        </q-tab-panels>
      </template>

    </q-splitter>
  </div>
</template>
<script>
import { ref } from 'vue'
import mixinplatform from 'src/mixins/mixin-system-platform'

const tabs = [
  // { name: 'national_clinic', icon: 'local_convenience_store', label: 'Unidade Sanitaria' },
  { name: 'clinic', icon: 'local_hospital', label: 'Farmácias', separator: true },
  { name: 'clinic_sector', icon: 'local_pharmacy', label: 'Sector Clínico', separator: true },
  { name: 'doctor', icon: 'psychology', label: 'Clínicos', separator: true },
  { name: 'drugs', icon: 'medication', label: 'Medicamentos', separator: true },
  { name: 'therapeutic_regimen', icon: 'healing', label: 'Regime Terapêutico', separator: true },
  { name: 'clinical_service', icon: 'local_pharmacy', label: 'Serviço Clínico', separator: true },
  { name: 'identifier_type', icon: 'pin', label: 'Tipo de Identificador', separator: true },
  { name: 'interoperability', icon: 'online_prediction', label: 'Interoperabilidade', separator: true },
  { name: 'users', icon: 'people', label: 'Utilizadores', separator: true },
  { name: 'roles', icon: 'manage_accounts', label: 'Perfis', separator: true }
]
export default {
  mixins: [mixinplatform],
  setup () {
    return {
    //  tabs: ref('national_clinic'),
      activeMenu: ref('Farmácias'),
      selectedTab: ref('clinic'),
      drawer: ref(false),
      tabs,
      splitterModel: ref(15)
    }
  },
   components: {
      // TitleBar: require('components/Shared/TitleBar.vue').default,
       doctor: require('components/Settings/Doctor/Doctors.vue').default,
    // AddClinic: require('components/Settings/AddClinic.vue').default
       drug: require('components/Settings/Drug/Drugs.vue').default,
       clinicSectors: require('components/Settings/ClinicSector/ClinicSectors.vue').default,
      //  nationalClinic: require('components/Settings/NationalClinic/NationalClinics.vue').default,
       clinics: require('components/Settings/Clinic/Clinics.vue').default,
       clinicalServices: require('components/Settings/ClinicalService/ClinicalService.vue').default,
       therapeuticRegimen: require('components/Settings/TherapeuticRegimen/TherapeuticRegimens.vue').default,
       interoperability: require('components/Settings/Interoperability/His.vue').default,
      identifierType: require('components/Settings/IdentifierType/IdentifierTypeList.vue').default,
       users: require('components/Settings/User/Users.vue').default,
        roles: require('components/Settings/User/Roles.vue').default
    },
    methods: {
      changeMenu (label) {
        this.activeMenu = label
        this.drawer = false
      }
    }
}
</script>
<style>

</style>
