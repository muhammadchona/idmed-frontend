<template>
  <div>
    <q-expansion-item
      dense
      header-class="bg-grey-6 text-white text-bold vertical-middle q-pl-md"
      expand-icon-class="text-white"
      default-opened
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="medication" />
        </q-item-section>

        <q-item-section>
          {{
            curIdentifier.service === null ||
            curIdentifier.service === undefined
              ? 'Sem Info'
              : curIdentifier.service.code + ': ' + curIdentifier.value
          }}
        </q-item-section>
      </template>

      <div v-show="infoVisible">
        <q-card class="noRadius">
          <q-card-section class="row q-pa-none">
            <div class="col-5 bg-white q-pa-md">
              <div class="row">
                <div class="col text-grey-9 text-weight-medium">
                  Data da Prescrição:
                </div>
                <div v-if="prescription !== null" class="col text-grey-8">
                  {{
                    prescription.prescriptionDate === null ||
                    prescription.prescriptionDate === undefined
                      ? 'Sem Info'
                      : formatDate(prescription.prescriptionDate)
                  }}
                </div>
                <div class="col text-grey-9 text-weight-medium">
                  Regime Terapêutico:
                </div>
                <div class="col text-grey-8">
                  {{
                    prescription.prescriptionDetails[0].therapeuticRegimen ===
                      null ||
                    prescription.prescriptionDetails[0].therapeuticRegimen ===
                      undefined
                      ? 'Sem Info'
                      : prescription.prescriptionDetails[0].therapeuticRegimen
                          .description
                  }}
                </div>
              </div>
              <div class="row">
                <div
                  v-if="
                    prescription.prescriptionDetails[0].therapeuticLine !== null
                  "
                  class="col text-grey-9 text-weight-medium"
                >
                  Linha Terapêutica:
                </div>
                <div
                  v-if="
                    prescription.prescriptionDetails[0].therapeuticLine !== null
                  "
                  class="col text-grey-8"
                >
                  {{
                    prescription.prescriptionDetails[0].therapeuticLine ===
                      null ||
                    prescription.prescriptionDetails[0].therapeuticLine ===
                      undefined
                      ? 'Sem Info'
                      : prescription.prescriptionDetails[0].therapeuticLine
                          .description
                  }}
                </div>
                <div class="col text-grey-10">Clínico:</div>
                <div
                  v-if="prescription.doctor !== null"
                  class="col text-grey-8"
                >
                  {{
                    prescription.doctor === null ||
                    prescription.doctor === undefined
                      ? 'Sem Info'
                      : prescription.doctor.fullName
                  }}
                </div>
              </div>
              <div class="row">
                <div class="col text-grey-9 text-weight-medium">
                  Tipo Dispensa:
                </div>
                <div
                  v-if="
                    prescription.prescriptionDetails[0].dispenseType !== null
                  "
                  class="col text-grey-8"
                >
                  {{
                    prescription.prescriptionDetails[0].dispenseType === null ||
                    prescription.prescriptionDetails[0].dispenseType ===
                      undefined
                      ? 'Sem Info'
                      : prescription.prescriptionDetails[0].dispenseType
                          .description
                  }}
                </div>
                <div class="col text-grey-9 text-weight-medium">Validade:</div>
                <div class="col" :class="validadeColor">
                  {{
                    prescription.leftDuration === null ||
                    prescription.leftDuration === undefined
                      ? 'Sem Info'
                      : prescription.leftDuration
                  }}
                  mes(es)
                </div>
              </div>
              <div class="row">
                <div class="col text-grey-9 text-weight-medium">Duração:</div>
                <div class="col text-grey-8">
                  {{
                    prescription === null ||
                    prescription === undefined ||
                    prescription.duration === null
                      ? 'Sem Info'
                      : prescription.duration.description
                  }}
                </div>
                <div class="col text-grey-9 text-weight-medium">
                  Tipo Paciente:
                </div>
                <div class="col text-grey-8">
                  {{
                    prescription === null ||
                    prescription === undefined ||
                    prescription.patientStatus === null
                      ? 'Sem Info'
                      : prescription.patientStatus
                  }}
                </div>
              </div>
              <q-separator />
              <div class="row q-my-md">
                <q-space />
                <q-btn
                  v-if="!isClosed"
                  unelevated
                  color="red"
                  label="Remover"
                  @click="removePrescription()"
                  class="float-right q-ml-sm"
                />
              </div>
            </div>
            <div class="col q-py-md">
              <ListHeader
                :addVisible="!isClosed && prescription.leftDuration !== 0"
                :title="'Dispensa'"
                bgColor="bg-primary"
                @showAdd="$emit('addNewPack', patientVisit.value)"
              ></ListHeader>
              <EmptyList v-if="lastPackOnPrescription === null"
                >Nenhum registo de Levantamentos</EmptyList
              >
              <span v-else>
                <PackInfo
                  :editPack="editPack"
                  :removePack="removePack"
                  :isClosed="isClosed"
                  :pack="lastPackOnPrescription"
                />
              </span>
            </div>
          </q-card-section>
        </q-card>
        <EmptyList v-if="prescription === null || prescription === undefined"
          >Nenhuma Prescrição Adicionada para o serviço
          {{
            curIdentifier.service === null ||
            curIdentifier.service === undefined
              ? 'Sem Info'
              : curIdentifier.service.code
          }}</EmptyList
        >
      </div>
    </q-expansion-item>
    <q-separator />
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
import PackInfo from 'components/Patient/Prescription/PackInfo.vue';
import Pack from 'src/stores/models/packaging/Pack';
import episodeService from 'src/services/api/episode/episodeService';
import Prescription from 'src/stores/models/prescription/Prescription';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService';
import prescribedDrugService from 'src/services/api/prescribedDrug/prescribedDrugService';
import packService from 'src/services/api/pack/packService';
import packagedDrugService from 'src/services/api/packagedDrug/packagedDrugService';
import { useEspisode } from 'src/composables/episode/episodeMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import Episode from 'src/stores/models/episode/Episode';

//Declaration
const { website } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const { isCloseEpisode, isDCReferenceEpisode } = useEspisode();
const { alertSucess, alertError, alertInfo } = useSwal();
const infoVisible = ref(true);
const isPatientActive = ref(false);
const selectedPack = ref(new Pack());
const showAddEditEpisode = ref(false);

//props
const props = defineProps(['identifierId']);

// Inject
const patient = inject('patient');

//Hook
onMounted(() => {
  showloading();
  init();
});
//Methods
const init = () => {
  closeLoading();
};
const expandLess = (value) => {
  this.infoVisible = !value;
};
const checkPatientStatusOnService = () => {
  if (this.curIdentifier.endDate !== '') {
    this.isPatientActive = true;
  }
};
const editPack = () => {
  this.$emit('editPack', this.patientVisitDetais);
};
const removePack = () => {
  this.displayAlert('confirmation', 'Deseja mesmo remover esta dispensa?');
};
const callRemovePackAlert = () => {
  if (this.mobile) {
    //MobileCode
  } else {
    PatientVisitDetails.apiDelete(this.patientVisitDetais).then((resp) => {
      PatientVisitDetails.delete(this.patientVisitDetais.id);
      this.displayAlert('info', 'Operação efectuada com sucesso.');
    });
  }
};
const removePrescription = () => {
  if (lastPackOnPrescription.value !== null) {
    alertError(
      'Esta prescrição ja possui registo de dispensas associados, remova primeiro as dispensas.'
    );
  } else {
    alertWarningAction('Deseja remover a Prescrição?').then((result) => {
      console.log(result);
      if (result) {
        prescriptionService
          .delete(prescription.value.id)
          .then((resp) => {
            closeLoading();
            console.log(resp);
            alertSucess('Prescrição removida com sucesso');
          })
          .catch((error) => {
            closeLoading();
            console.log(error);
            alertError('Aconteceu um erro ao gravar a Prescrição');
          });
      } else {
        closeLoading();
        alertInfo('Operação cancelada');
      }
    });
    // remotion code
  }
};
const commitOperation = () => {
  callRemovePackAlert();
};
const reloadPrescriptionDetails = async (id) => {
  await PrescriptionDetail.apiFetchById(id);
};
const reloadPrescription = async (id) => {
  await Prescription.apiFetchById(id);
};
const getRemainigDuration = () => {
  if (this.prescription === null) return null;
  // if (this.prescription.patientVisitDetails.length <= 0) {
  //   this.prescription.patientVisitDetails = PatientVisitDetails.query()
  //     .with('pack')
  //     .where('prescription_id', this.prescription.id)
  //     .get();
  // }
  return this.prescription.remainigDuration();
};
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};

// Computed
const curIdentifier = computed(() => {
  return patientServiceIdentifierService.identifierCurr(props.identifierId);
});

const validadeColor = computed(() => {
  if (prescription.value !== null && prescription.value.leftDuration > 0) {
    return 'text-primary';
  } else {
    return 'text-red';
  }
});
const lastPackOnPrescription = computed(() => {
  return packService.getLastPackFromPatientVisitAndPrescription(
    prescription.value.id
  );
});
const prescription = computed(() => {
  if (patientVisit.value !== null) {
    return prescriptionService.getLastPrescriptionFromPatientVisit(
      patientVisit.value.id
    );
  } else {
    return new Prescription();
  }
});
const patientVisit = computed(() => {
  if (lastStartEpisode.value !== null) {
    return patientVisitService.getLastFromEpisode(lastStartEpisode.value.id);
  } else {
    return new PatientVisit();
  }
});

const lastStartEpisode = computed(() => {
  if (curIdentifier.value !== null) {
    return episodeService.getLastStartEpisodeWithPrescription(
      curIdentifier.value.id
    );
  } else {
    return new Episode();
  }
});
const lastEpisode = computed(() => {
  if (curIdentifier.value !== null) {
    return episodeService.lastEpisodeByIdentifier(curIdentifier.value.id);
  } else {
    return new Episode();
  }
});
const showEndDetails = computed(() => {
  return (
    lastEpisode.value !== null &&
    isCloseEpisode(lastEpisode.value) &&
    !isDCReferenceEpisode(lastEpisode.value)
  );
});
const headerColor = computed(() => {
  if (!showEndDetails.value) {
    return 'bg-grey-6';
  } else {
    return 'bg-red-7';
  }
});
const isClosed = computed(() => {
  return showEndDetails.value;
});

// Methods

const getPatientVisitDetails = (episodeId) => {
  patientVisitDetailsService.apiGetAllByEpisodeId(episodeId, 0, 100);
};
const getPrescriptionDetails = (prescriptionId) => {
  prescriptionDetailsService.apiGetAllByPrescriptionId(prescriptionId);
};
const getPrescribedDrugs = (prescriptionId) => {
  prescribedDrugService.apiGetAllByPrescriptionId(prescriptionId);
};
const getPackageDrugs = (packId) => {
  packagedDrugService.apiGetAllByPackId(packId);
};

//Provide
provide('lastPackOnPrescription', lastPackOnPrescription);
provide('isClosed', isClosed);
</script>

<style>
.noRadius {
  border-radius: 0px;
}
</style>
