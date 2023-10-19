<template>
  <div style="width: 900px; max-width: 140vw">
    <q-card class="noRadius">
      <q-card-section class="bg-green-2">
        <div class="col text-bold text-grey-10 q-ml-sm text-center q-pt-sm">
          {{
            curIdentifier.service === null ||
            curIdentifier.service === undefined
              ? 'Sem Info'
              : curIdentifier.service.code
          }}
        </div>
      </q-card-section>
      <q-card-section class="row q-mt-lg">
        <div class="col bg-white q-pa-md">
          <div class="row">
            <div class="col text-grey-9 text-weight-medium text-bold">
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
            <div class="col text-grey-9 text-weight-medium text-bold">
              Regime Terapêutico:
            </div>
            <div
              v-if="prescription.prescriptionDetails !== null"
              class="col text-grey-8"
            >
              {{
                prescription.prescriptionDetails.length > 0
                  ? prescription.prescriptionDetails[0].therapeuticRegimen ===
                      null ||
                    prescription.prescriptionDetails[0].therapeuticRegimen ===
                      undefined
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
                prescription.prescriptionDetails[0].therapeuticLine === null ||
                prescription.prescriptionDetails[0].therapeuticLine ===
                  undefined
                  ? 'Sem Info'
                  : prescription.prescriptionDetails[0].therapeuticLine
                      .description
              }}
            </div>
            <div class="col text-grey-10">Clínico:</div>
            <div v-if="prescription.doctor !== null" class="col text-grey-8">
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
              Tipo de Dispensa:
            </div>
            <div
              v-if="prescription.prescriptionDetails[0].dispenseType !== null"
              class="col text-grey-8"
            >
              {{
                prescription.prescriptionDetails[0].dispenseType === null ||
                prescription.prescriptionDetails[0].dispenseType === undefined
                  ? 'Sem Info'
                  : prescription.prescriptionDetails[0].dispenseType.description
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
              Tipo de Paciente:
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
          <div class="row">
            <div class="col-3 text-grey-9 text-weight-medium">
              Altera Linha Terapêutica:
            </div>
            <div class="col text-grey-8">
              {{ prescription.patientType === 'N/A' ? 'Não' : 'Sim' }}
            </div>
            <div
              class="col-3 text-grey-9 text-weight-medium"
              v-if="prescription.patientType !== 'N/A'"
            >
              Motivo de Alteração:
            </div>
            <div
              class="col text-grey-8"
              v-if="prescription.patientType !== 'N/A'"
            >
              {{
                prescription.prescriptionDetails[0].reasonForUpdateDesc === null
                  ? prescription.prescriptionDetails[0].reasonForUpdate
                  : prescription.prescriptionDetails[0].reasonForUpdateDesc
              }}
            </div>
          </div>
          <div class="row">
            <div class="col-3 text-grey-9 text-weight-medium">
              Prescrição especial:
            </div>
            <div class="col text-grey-8">
              {{
                prescription.prescriptionDetails[0]
                  .spetialPrescriptionMotive !== null
                  ? 'Sim'
                  : 'Não'
              }}
            </div>
            <div
              class="col-3 text-grey-9 text-weight-medium"
              v-if="
                prescription.prescriptionDetails[0]
                  .spetialPrescriptionMotive !== null
              "
            >
              Motivo da prescrição especial:
            </div>
            <div
              class="col text-grey-8"
              v-if="
                prescription.prescriptionDetails[0]
                  .spetialPrescriptionMotive !== null
              "
            >
              {{
                prescription.prescriptionDetails[0].spetialPrescriptionMotive
              }}
            </div>
          </div>

          <div class="col text-grey-8 q-pt-lg">
            <q-banner
              dense
              inline-actions
              class="bg-grey-6 text-white q-pa-none"
            >
              <span class="text-bold text-subtitle1 vertical-middle q-pl-md"
                >Medicamentos Prescritos</span
              >
            </q-banner>
            <q-table
              flat
              bordered
              dense
              hide-bottom
              :rows="prescription.prescribedDrugs"
              :columns="columns"
              row-key="id"
            >
              <template #body="props">
                <q-tr no-hover :props="props">
                  <q-td key="drug" :props="props">
                    {{
                      getDrugById(props.row.drug.id) !== null &&
                      getDrugById(props.row.drug.id) !== undefined
                        ? getDrugById(props.row.drug.id).name
                        : ''
                    }}
                  </q-td>
                  <q-td key="dosage" :props="props">
                    {{
                      'Tomar ' +
                        props.row.amtPerTime +
                        ' ' +
                        getDrugById(props.row.drug.id).form !==
                        null &&
                      getDrugById(props.row.drug.id).form !== undefined
                        ? getDrugById(props.row.drug.id).form.description
                        : '' +
                          ' ' +
                          props.row.timesPerDay +
                          ' vez(es)' +
                          ' por ' +
                          props.row.form
                    }}
                  </q-td>
                  <q-td auto-width key="packs" :props="props">
                    {{
                      getQtyPrescribed(props.row, prescription.duration.weeks) >
                      0
                        ? getQtyPrescribed(
                            props.row,
                            prescription.duration.weeks
                          )
                        : 1
                    }}
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Fechar" color="red" @click="close" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { computed, inject, onMounted, provide, reactive, ref } from 'vue';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods';
import drugService from 'src/services/api/drugService/drugService';
const { remainigDuration, remainigDurationInWeeks } = usePrescription();
const { getQtyPrescribed } = usePrescribedDrug();

const columns = [
  {
    name: 'drug',
    align: 'left',
    field: (row) => row.drug.name,
    label: 'Medicamento',
    sortable: true,
  },
  {
    name: 'dosage',
    align: 'left',
    field: (row) =>
      'Tomar ' +
      row.amtPerTime +
      ' ' +
      row.drug.form.description +
      ' ' +
      row.timesPerDay +
      ' vez(es)' +
      ' por ' +
      row.form,
    label: 'Toma',
    sortable: false,
  },
  {
    name: 'packs',
    align: 'center',
    style: 'width: 20px',
    field: (row) =>
      getQtyPrescribed(row, prescription.value.duration.weeks) > 0
        ? getQtyPrescribed(row, prescription.value.duration.weeks)
        : 1,
    label: 'Quantidade em (Frascos)',
    sortable: false,
  },
];

const patient = inject('patient');
const curIdentifier = inject('curIdentifier');
const prescription = inject('prescription');
const showPrescriptionDetails = inject('showPrescriptionDetails');

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};

const close = () => {
  showPrescriptionDetails.value = false;
};

const getDrugById = (drugID) => {
  return drugService.getCleanDrugById(drugID);
};

const validadeColor = computed(() => {
  if (prescription.value !== null && remainigDuration(prescription.value) > 0) {
    return 'text-primary';
  } else {
    return 'text-red';
  }
});
</script>

<style>
.noRadius {
  border-radius: 0px;
}
</style>
