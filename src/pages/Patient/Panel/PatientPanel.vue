<template>
  <div>
    <InfoTitleBar v-if="!website" />
    <TitleBar v-else />
    <div class="row q-mt-md" v-if="patient !== null">
      <q-drawer
        v-model="showPatientInfo"
        :width="405"
        :breakpoint="500"
        overlay
        bordered
        behavior="mobile"
        class="bg-grey-1 q-pl-md q-py-md"
        v-if="!website"
      >
        <q-scroll-area
          :thumb-style="thumbStyle"
          :content-style="contentStyle"
          :content-active-style="contentActiveStyle"
          style="height: 690px"
          class="q-pr-md"
        >
          <PatientInfo />
        </q-scroll-area>
      </q-drawer>
      <div
        v-else
        class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg panel"
        style="max-width: 500px"
      >
        <PatientInfo />
      </div>
      <div class="col q-mx-lg">
        <q-toolbar
          v-if="!website"
          class="bg-primary text-white q-mb-sm rounded-borders"
        >
          <div class="col text-center">
            <q-tabs v-model="tab" shrink>
              <q-tab name="clinicService" label="Serviços de Saúde" />
              <q-tab name="prescription" label="Prescrição" />
              <q-tab name="screening" label="Atenção Farmacêutica" />
            </q-tabs>
          </div>
        </q-toolbar>
        <!-- <div class="" v-if="!website">
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="clinicService">
              <q-scroll-area
                :thumb-style="thumbStyle"
                :content-style="contentStyle"
                :content-active-style="contentActiveStyle"
                style="height: 440px"
                class="q-pr-md"
              >
                <ClinicServiceInfo class="q-mb-lg" />
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="prescription">
              <q-scroll-area
                :thumb-style="thumbStyle"
                :content-style="contentStyle"
                :content-active-style="contentActiveStyle"
                style="height: 440px"
                class="q-pr-md"
              >
                <PrescriptionInfo class="q-mb-lg" />
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="screening">
              <q-scroll-area
                :thumb-style="thumbStyle"
                :content-style="contentStyle"
                :content-active-style="contentActiveStyle"
                style="height: 440px"
                class="q-pr-md"
              >
                <PharmaceuticalAtentionInfo :selectedPatient="patient" />
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div> -->
        <q-scroll-area
          :thumb-style="thumbStyle"
          :content-style="contentStyle"
          :content-active-style="contentActiveStyle"
          style="height: 700px"
          class="q-pr-md"
          v-if="website"
        >
          <ClinicServiceInfo v-if="website" class="q-mb-lg" />
          <!-- <PrescriptionInfo v-if="website && isInitialized" class="q-mb-lg" /> -->
          <PharmaceuticalAtentionInfo v-if="website" />
        </q-scroll-area>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, provide, inject, ref, reactive } from 'vue';
import patientService from 'src/services/api/patientService/patientService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import TitleBar from 'src/components/Shared/TitleBar.vue';
import InfoTitleBar from 'components/Patient/PatientPanel/PanelTitleBar.vue';
import PatientInfo from 'components/Patient/PatientPanel/PatientInfo.vue';
import ClinicServiceInfo from 'components/Patient/PatientPanel/ClinicServicesInfo.vue';
// import PrescriptionInfo from 'components/Patient/PatientPanel/PrescriptionInfo.vue';
import PharmaceuticalAtentionInfo from 'components/Patient/PatientPanel/PharmaceuticalAtentionInfo.vue';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import { useOnline } from 'src/composables/shared/loadParams/online';

//Declarations
const { website, isDeskTop, isMobile } = useSystemUtils();
const tab = ref('clinicService');
// const patient = reactive(ref(new Patient()));
const showPatientInfo = ref(false);
const title = ref('Detalhe do Utente/Paciente');
const contentStyle = ref({
  backgroundColor: '#ffffff',
  color: '#555',
});

const contentActiveStyle = ref({
  backgroundColor: '#eee',
  color: 'black',
});
const thumbStyle = ref({
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#0ba58b',
  width: '5px',
  opacity: 0.75,
});

// Hook
onMounted(() => {
  init();
});

// Methods

const init = async () => {
  if (!website.value) {
    // this.showPatientInfo = ref(true);
    // await PatientServiceIdentifier.localDbGetAll().then((identifiers) => {
    //   identifiers.forEach((identifier) => {
    //     if (identifier.patient.id === this.patient.id) {
    //       PatientServiceIdentifier.insert({ data: identifier });
    //       const episodeList = Episode.query()
    //         .with('startStopReason')
    //         .with('patientServiceIdentifier')
    //         .with('patientVisitDetails.*')
    //         .where('patientServiceIdentifier_id', identifier.id)
    //         .get();
    //       episodeList.forEach((episode) => {
    //         PatientVisitDetails.localDbGetAll().then((pvds) => {
    //           pvds.forEach((p) => {
    //             if (p.episode_id === episode.id) {
    //               PatientVisitDetails.insert({ data: p });
    //             }
    //             Prescription.localDbGetById(p.prescription_id).then(
    //               (prescription) => {
    //                 Prescription.insert({ data: prescription });
    //               }
    //             );
    //             Pack.localDbGetById(p.pack_id).then((pack) => {
    //               Pack.insert({ data: pack });
    //             });
    //           });
    //         });
    //       });
    //     }
    //   });
    // });
    // await Episode.localDbGetAll().then((episodes) => {
    //   Episode.insert({ data: episodes });
    // });
    // await PatientVisit.localDbGetAll().then((pvList) => {
    //   pvList.forEach((pv) => {
    //     if (pv.patient_id === this.patient.id) {
    //       PatientVisit.insert({ data: pv });
    //     }
    //   });
    // });
    // this.loadParamsToVueX();
    // Province.localDbGetAll().then((provinceList) => {
    //   Province.insertOrUpdate({ data: provinceList });
    // });
    // PostoAdministrativo.localDbGetAll().then((items) => {
    //   PostoAdministrativo.insertOrUpdate({ data: items });
    // });
    // Localidade.localDbGetAll().then((items) => {
    //   Localidade.insertOrUpdate({ data: items });
    // });
  } else {
    if (patient.value === null) {
      patient.value = patientService.getPatientByID(
        localStorage.getItem('patientuuid')
      );
    } else {
      patientVisitService.apiGetAllByPatientId(patient.value.id);
    }
  }
};
const showPatientDetails = () => {
  console.log('showPatientDetails');
  showPatientInfo.value = !showPatientInfo.value;
};

// Computed
const contentHeight = computed(() => {
  if (!website) return 'height: 400px;';
  return 'height: 700px;';
});

const patient = computed(() => {
  return patientService.getPatientByID(localStorage.getItem('patientuuid'));
});

provide('title', title);
provide('patient', patient);
provide('website', website);
provide('showPatientDetails', showPatientDetails);
</script>

<style lang="scss">
.panel {
  border: 1px solid $grey-13;
  border-radius: 10px;
}
</style>
