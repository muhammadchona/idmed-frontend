<template>
  <div>
    <ListHeader
      :addVisible="showAddButton"
      :mainContainer="true"
      bgColor="bg-primary"
      @expandLess="expandLess"
      @showAdd="
        (selectedVisitDetails = ''), (step = ''), (showAddPrescription = true)
      "
      >Prescrição
    </ListHeader>
    <div v-show="infoVisible">
      <EmptyList v-if="patientHasNoPrescriptio"
        >Nenhuma Prescrição Adicionada</EmptyList
      >
      <div v-if="flagGo">
        <span v-for="identifier in patient.identifiers" :key="identifier.id">
          <PrescriptionInfoContainer
            :identifier="identifier"
            @addNewPack="addNewPack"
            @editPack="editPack"
          />
        </span>
      </div>

      <q-dialog persistent v-model="showAddPrescription">
        <AddEditPrescription
          :patient="selectedPatient"
          :selectedVisitDetails="selectedVisitDetails"
          :stepp="step"
          @close="showAddPrescription = false"
        />
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import Episode from '../../../store/models/episode/Episode';
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails';
import Pack from '../../../store/models/packaging/Pack';
import Prescription from '../../../store/models/prescription/Prescription';
import PatientVisit from '../../../store/models/patientVisit/PatientVisit';
import AddEditPrescription from 'components/Patient/PatientPanel/AddEditPrescription.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
import PrescriptionInfoContainer from 'components/Patient/Prescription/PrescriptionInfoContainer.vue';
import { computed, inject, onMounted, ref } from 'vue';

//Declaration
const showAddPrescription = ref(false);
const infoVisible = ref(true);
const selectedVisitDetails = ref('');
const step = ref('');
const flagGoReady = ref(false);
const flagGo = ref(false);

// Inject
const patient = inject('patient');

//OnMouted
onMounted(() => {
  showloading();
  init();
});

// Computed
const patientHasNoPrescriptio = computed(() => {
  if (patient.identifiers.length <= 0) return true;
  return !patientHasEpisodes.value && !flagGo.value;
});
const showAddButton = computed(() => {
  return patientHasEpisodes.value && !patientHasClosedIdentifier.value;
});
const hasPrescription = computed(() => {
  return checkPrescription();
});
const identifiers = computed(() => {
  return patient.identifiers;
});
const patientHasEpisodes = computed(() => {
  return patient.hasEpisodes();
});
const patientHasClosedIdentifier = computed(() => {
  return patient.hasOneAndClosedIdentifier();
});

// Methods
const init = async () => {
  console.log('On PrescriptionInfo initialization');
  // if (mobile) {
  //   PatientVisit.localDbGetAll().then((visitList) => {
  //     visitList.forEach((visit) => {
  //       if (visit.patient.id === patient.id) {
  //         PatientVisit.insert({ data: visit });
  //       }
  //     });
  //   });
  //   flagGoReady.value = true;
  // }
  if (identifiers.value.length <= 0) {
    flagGoReady.value = true;
  } else {
    identifiers.value.forEach((identifier) => {
      if (mobile) {
        // const episodeList = Episode.query()
        //   .with('startStopReason')
        //   .with('patientServiceIdentifier')
        //   .with('patientVisitDetails.*')
        //   .where('patientServiceIdentifier_id', identifier.id)
        //   .get();
        // episodeList.forEach((episode) => {
        //   PatientVisitDetails.localDbGetAll().then((pvds) => {
        //     if (pvds.length > 0) {
        //       pvds.forEach((p) => {
        //         if (p.episode_id === episode.id) {
        //           PatientVisitDetails.insert({ data: p });
        //         }
        //         Prescription.localDbGetById(p.prescription_id).then(
        //           (prescription) => {
        //             Prescription.insert({ data: prescription });
        //           }
        //         );
        //         Pack.localDbGetById(p.pack_id).then((pack) => {
        //           Pack.insert({ data: pack });
        //         });
        //       });
        //     }
        //   });
        // });
      } else {
        Episode.apiGetAllByIdentifierId(identifier.id).then((resp) => {
          if (resp.response.data.length > 0) {
            identifiers.value.episodes = resp.response.data;
            identifiers.value.episodes.forEach((episode) => {
              PatientVisitDetails.apiGetLastByEpisodeId(episode.id).then(
                (resp) => {
                  if (resp.response.data) {
                    episode.patientVisitDetails[0] = resp.response.data;
                    loadVisitDetailsInfo(episode.patientVisitDetails, 0);
                  } else flagGoReady.value = true;
                }
              );
            });
          } else {
            flagGoReady.value = true;
          }
        });
      }
    });
  }
};

const loadVisitDetailsInfo = (visitDetails, i) => {
  if (visitDetails[i] !== undefined && visitDetails[i] !== null) {
    Prescription.apiFetchById(visitDetails[i].prescription.id).then((resp) => {
      visitDetails[i].prescription = resp.response.data;
      if (visitDetails[i].pack !== null) {
        Pack.apiFetchById(visitDetails[i].pack.id).then((resp) => {
          visitDetails[i].pack = resp.response.data;
          flagGoReady.value = true;
        });
      } else {
        flagGoReady.value = true;
      }
    });
  } else {
    flagGoReady.value = true;
  }
};

const checkPrescription = () => {
  const hasPresc = patient.identifiers.some((identifier) => {
    if (identifier.episodes.length > 0) {
      identifier.episodes.some((episode) => {
        return episode.patientVisitDetails.length > 0;
      });
    } else {
      return false;
    }
    return false;
  });
  return hasPresc;
};

const expandLess = (value) => {
  infoVisible.value = !value;
};

const addNewPack = (patientVisitDetails) => {
  selectedVisitDetails.value = patientVisitDetails;
  step.value = 'addNewPack';
  showAddPrescription.value = true;
};

const editPack = (patientVisitDetails) => {
  selectedVisitDetails.value = patientVisitDetails;
  step.value = 'editPack';
  showAddPrescription.value = true;
};

// watch: {
//   flagGoReady: function (newVal, oldVal) {
//     if (newVal) {
//       hideLoading()
//     }
//   }
// },
</script>

<style></style>
