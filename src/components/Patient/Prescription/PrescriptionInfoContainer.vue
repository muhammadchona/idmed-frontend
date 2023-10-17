<template>
  <div>
    <q-expansion-item
      dense
      header-class="bg-grey-6 text-white text-bold vertical-middle q-pl-md"
      expand-icon-class="text-white"
      :default-opened="curIdentifier.service.code === 'TARV' || !website"
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
          {{
            isPatientActiveGroupMember !== null &&
            isPatientActiveGroupMember !== undefined
              ? ' - [Paciente esta associado ao Grupo: ' +
                isPatientActiveGroupMember.groupType.description +
                ' - ' +
                isPatientActiveGroupMember.name +
                ']'
              : ''
          }}
        </q-item-section>
      </template>
      <div v-show="infoVisible">
        <EmptyList v-if="prescription === null || prescription === undefined"
          >Nenhuma Prescrição Adicionada para o serviço
          {{
            curIdentifier.service === null ||
            curIdentifier.service === undefined
              ? 'Sem Info'
              : curIdentifier.service.code
          }}</EmptyList
        >
        <q-card class="noRadius" v-else>
          <q-card-section class="row q-pa-none">
            <div class="col-5 bg-white q-pa-md">
              <div class="row">
                <div class="col text-grey-9 text-weight-medium">
                  Data da Prescrição:
                </div>
                <div class="col text-grey-8">
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
                <div
                  v-if="prescription.prescriptionDetails !== null"
                  class="col text-grey-8"
                >
                  {{
                    prescription.prescriptionDetails.length > 0
                      ? prescription.prescriptionDetails[0]
                          .therapeuticRegimen === null ||
                        prescription.prescriptionDetails[0]
                          .therapeuticRegimen === undefined
                        ? 'Sem Info'
                        : prescription.prescriptionDetails[0].therapeuticRegimen
                            .description
                      : ''
                  }}
                </div>
              </div>
              <div v-if="prescription.prescriptionDetails !== null" class="row">
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
              <div v-if="prescription !== null" class="row">
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
                    prescription === null || prescription === undefined
                      ? 'Sem Info'
                      : remainigDuration(prescription)
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
                  unelevated
                  color="blue"
                  label="Ver Detalhes"
                  @click="showPrescriptionDetailView"
                  class="float-right q-ml-sm"
                />
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
              <q-banner
                dense
                inline-actions
                class="bg-primary text-white q-pa-none"
                v-if="prescription !== null"
              >
                <span class="text-bold text-subtitle1 vertical-middle q-pl-md">
                  <slot> Dispensa</slot>
                </span>

                <template v-slot:action>
                  <div class="q-gutter-x-md">
                    <q-btn
                      dense
                      flat
                      :loading="loadingFilaPDF"
                      color="white"
                      icon="print"
                      :label="
                        curIdentifier.service.code === 'TARV'
                          ? 'FILA'
                          : curIdentifier.service.code === 'TPT'
                          ? 'FILT'
                          : curIdentifier.service.code === 'PREP'
                          ? 'FILP'
                          : 'Ficha'
                      "
                      @click="printFilaReport(curIdentifier)"
                    />
                    <q-btn
                      v-if="!isClosed && remainigDuration(prescription) !== 0"
                      dense
                      flat
                      round
                      color="white"
                      icon="add"
                      class="float-right"
                      @click="editPrescriptionOption"
                    />
                  </div>
                </template>
              </q-banner>
              <EmptyList v-if="lastPackOnPrescription === null"
                >Nenhum registo de Levantamentos</EmptyList
              >
              <span v-else>
                <PackInfo />
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-expansion-item>
    <q-separator />
    <q-dialog persistent v-model="showPrescriptionDetails">
      <PrescriptionDetailsView />
    </q-dialog>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { computed, inject, onMounted, provide, reactive, ref } from 'vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import EmptyList from 'components/Shared/ListEmpty.vue';
import PackInfo from 'components/Patient/Prescription/PackInfo.vue';
import episodeService from 'src/services/api/episode/episodeService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import packService from 'src/services/api/pack/packService';
import filaReport from 'src/services/reports/Patients/filaReport';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import groupService from 'src/services/api/group/groupService';
import PrescriptionDetailsView from 'components/Patient/Prescription/PrescriptionDetailsView.vue';

//Declaration
const { website } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const { isCloseEpisode, isDCReferenceEpisode } = useEpisode();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { remainigDuration, remainigDurationInWeeks } = usePrescription();
const infoVisible = ref(true);
const loadingFilaPDF = reactive(ref(false));
const showPrescriptionDetails = ref(false);

//props
const props = defineProps(['identifierId', 'serviceId']);

// Inject
const editPrescriptionOption = inject('editPrescriptionOption');
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

const removePack = () => {
  let isPatientVisitRemoveble = true;
  if (
    patientVisit.value.tbScreenings.length > 0 ||
    patientVisit.value.pregnancyScreenings.length > 0 ||
    patientVisit.value.adherenceScreenings.length > 0 ||
    patientVisit.value.ramScreenings.length > 0 ||
    patientVisit.value.vitalSignsScreenings.length > 0
  ) {
    isPatientVisitRemoveble = false;
  }
  alertWarningAction('Deseja remover a Dispensa?').then((result) => {
    if (result) {
      if (
        isPatientVisitRemoveble &&
        patientVisit.value.patientVisitDetails.length <= 1
      ) {
        let packIdToRemove = lastPatientVisitDetails.value.pack.id;
        let prescriptionToRemove =
          lastPatientVisitDetails.value.prescription.id;
        let countPatientVisitDetailsByPrescription =
          patientVisitDetailsService.getAllPatientVisitByPrescriptioId(
            prescriptionToRemove
          );
        patientVisitService
          .delete(patientVisit.value.id)
          .then((resp) => {
            packService.removeFromStorage(packIdToRemove);
            if (countPatientVisitDetailsByPrescription.length <= 1) {
              prescriptionService.removeFromStorage(prescriptionToRemove);
            }
            closeLoading();
            console.log(resp);
            alertSucess('Dispensa removida com sucesso');
          })
          .catch((error) => {
            closeLoading();
            console.log(error);
            alertError('Aconteceu um erro ao remover a Dispensa');
          });
      } else {
        let packIdToRemove = lastPatientVisitDetails.value.pack.id;
        let prescriptionToRemove =
          lastPatientVisitDetails.value.prescription.id;
        let countPatientVisitDetailsByPrescription =
          patientVisitDetailsService.getAllPatientVisitByPrescriptioId(
            prescriptionToRemove
          );
        patientVisitDetailsService
          .delete(lastPatientVisitDetails.value.id)
          .then((resp) => {
            packService.removeFromStorage(packIdToRemove);
            if (countPatientVisitDetailsByPrescription.length <= 1) {
              prescriptionService.removeFromStorage(prescriptionToRemove);
            }
            closeLoading();
            console.log(resp);
            alertSucess('Dispensa removida com sucesso');
          })
          .catch((error) => {
            closeLoading();
            console.log(error);
            alertError('Aconteceu um erro ao remover a Dispensa');
          });
      }
    } else {
      closeLoading();
      alertInfo('Operação cancelada');
    }
  });
};
const removePrescription = () => {
  if (lastPackOnPrescription.value !== null) {
    alertError(
      'Esta prescrição ja possui registo de dispensas associados, remova primeiro as dispensas.'
    );
  } else {
    alertWarningAction('Deseja remover a Prescrição?').then((result) => {
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
  }
};

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};

const printFilaReport = (patientServiceIdentifier) => {
  filaReport.downloadPDF(
    patient.value,
    patientServiceIdentifier,
    loadingFilaPDF
  );
};

// Computed
const curIdentifier = computed(() => {
  return patientServiceIdentifierService.identifierCurr(
    props.identifierId,
    props.serviceId
  );
});

const validadeColor = computed(() => {
  if (prescription.value !== null && remainigDuration(prescription.value) > 0) {
    return 'text-primary';
  } else {
    return 'text-red';
  }
});
const lastPackOnPrescription = computed(() => {
  if (prescription.value !== null) {
    return packService.getLastPackFromPatientVisitAndPrescription(
      prescription.value.id
    );
  } else {
    return null;
  }
});
const prescription = computed(() => {
  if (lastPatientVisitDetails.value !== null) {
    return prescriptionService.getLastPrescriptionFromPatientVisitDetails(
      lastPatientVisitDetails.value.prescription.id
    );
  } else {
    return null;
  }
});

const patientVisit = computed(() => {
  const listPatietVisitIds = [];
  if (lastStartEpisode.value !== null && lastStartEpisode.value !== undefined) {
    const listPatietVisitDetails =
      patientVisitDetailsService.getAllPatientVisitDetailsFromEpisode(
        lastStartEpisode.value.id
      );

    if (
      listPatietVisitDetails !== null &&
      listPatietVisitDetails !== undefined
    ) {
      listPatietVisitDetails.forEach((patientvisitdetails) => {
        listPatietVisitIds.push(patientvisitdetails.patient_visit_id);
      });
    }
    return patientVisitService.getLastFromPatientVisitList(listPatietVisitIds);
  } else {
    return null;
  }
});

const lastPatientVisitDetails = computed(() => {
  if (patientVisit.value !== null && patientVisit.value !== undefined) {
    return patientVisitDetailsService.getLastPatientVisitDetailFromPatientVisitAndEpisode(
      patientVisit.value.id,
      lastStartEpisode.value.id
    );
  } else {
    return null;
  }
});

const lastStartEpisode = computed(() => {
  if (curIdentifier.value !== null) {
    return episodeService.getLastStartEpisodeWithPrescription(
      curIdentifier.value.id
    );
  } else {
    return null;
  }
});

const lastEpisode = computed(() => {
  if (curIdentifier.value !== null) {
    return episodeService.lastEpisodeByIdentifier(curIdentifier.value.id);
  } else {
    return [];
  }
});
const showEndDetails = computed(() => {
  return (
    lastEpisode.value !== null &&
    isCloseEpisode(lastEpisode.value) &&
    !isDCReferenceEpisode(lastEpisode.value)
  );
});

const isClosed = computed(() => {
  return showEndDetails.value;
});

const isPatientActiveGroupMember = computed(() => {
  return groupService.getGroupByPatientAndService(
    patient.value.id,
    props.serviceId
  );
});

const showPrescriptionDetailView = () => {
  showPrescriptionDetails.value = true;
};

//Provide
provide('lastPackOnPrescription', lastPackOnPrescription);
provide('isClosed', isClosed);
provide('removePack', removePack);
provide('curIdentifier', curIdentifier);
provide('prescription', prescription);
provide('showPrescriptionDetails', showPrescriptionDetails);
provide('validadeColor', validadeColor);
</script>

<style>
.noRadius {
  border-radius: 0px;
}
</style>
