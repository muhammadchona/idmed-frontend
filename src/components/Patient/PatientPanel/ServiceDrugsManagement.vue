<template>
  <div>
    <PrescriptionDrugsListHeader
      :addVisible="true"
      :mainContainer="false"
      bgColor="bg-grey-6"
    >
      Medicamentos para
      {{ curIdentifier.service.code }}
    </PrescriptionDrugsListHeader>
    <div class="col prescription-box q-pa-md q-mb-md">
      <q-table
        class="col"
        dense
        :rows="curPack.packagedDrugs"
        :columns="columns"
        row-key="id"
        hide-bottom
        flat
      >
        <template #header="props">
          <q-tr class="text-left bg-green-2" :props="props">
            <q-th>{{ columns[0].label }}</q-th>
            <q-th>{{ columns[1].label }}</q-th>
            <q-th>{{ columns[2].label }}</q-th>

            <q-th>{{ columns[3].label }}</q-th>
            <q-th v-if="!curPatientVisitDetail.createPackLater">{{
              columns[4].label
            }}</q-th>
            <q-th v-if="!curPatientVisitDetail.createPackLater">{{
              columns[5].label
            }}</q-th>
          </q-tr>
        </template>
        <template #body="props">
          <q-tr no-hover :props="props">
            <div class="hidden">{{ qtySupplied(props.row) }}</div>
            <q-td
              :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
              key="drug"
              :props="props"
            >
              {{
                getDrugById(props.row.drug.id) !== null &&
                getDrugById(props.row.drug.id) !== undefined
                  ? getDrugById(props.row.drug.id).name
                  : ''
              }}
            </q-td>
            <q-td
              :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
              key="dosage"
              :props="props"
            >
              {{
                getDrugById(props.row.drug.id) !== null &&
                getDrugById(props.row.drug.id) !== undefined
                  ? ' Toma ' +
                    props.row.amtPerTime +
                    '   ' +
                    // getDrugById(props.row.drug.id).defaultTimes +
                    ' - ' +
                    // getDrugById(props.row.drug.id).defaultTreatment +
                    props.row.timesPerDay +
                    ' vez(es) por ' +
                    getDrugById(props.row.drug.id).defaultPeriodTreatment
                  : ''
              }}
            </q-td>
            <q-td
              :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
              v-if="!curPatientVisitDetail.createPackLater"
              auto-width
              key="packs"
              :props="props"
            >
              {{ props.row.quantitySupplied }}
            </q-td>
            <q-td key="quantityRemain" :props="props">
              {{
                Math.floor(
                  getQtyRemain(props.row, curPrescription.duration.weeks) /
                    props.row.drug.packSize
                )
              }}
              ({{ getQtyRemain(props.row, curPrescription.duration.weeks) }})
            </q-td>
            <q-td
              :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
              v-if="!curPatientVisitDetail.createPackLater"
              key="nextPickUpDate"
              :props="props"
            >
              <div class="row">
                <q-toggle
                  v-model="props.row.toContinue"
                  :disable="qtySuppliedFlag === -1 || validateDispense"
                  label="Continua"
                />
              </div>
            </q-td>
            <q-td key="options" :props="props">
              <q-btn
                flat
                :disable="validateDispense"
                round
                color="red"
                icon="delete"
                @click="deleteRow(props.row)"
              />
              <q-btn
                v-if="qtySuppliedFlag === -1"
                flat
                round
                :disable="validateDispense"
                color="red"
                icon="info"
              >
                <q-tooltip
                  class="bg-red"
                  :offset="[10, 10]"
                  transition-show="flip-right"
                  transition-hide="flip-left"
                >
                  <strong><em> Medicamento sem stock </em></strong>
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="row reverse q-mb-sm q-mt-sm q-gutter-sm">
      <q-btn
        v-if="!validateDispense"
        unelevated
        color="primary"
        :disable="validateDispense"
        label="Validar Dispensa"
        class="all-pointer-events"
        @click="addPatientVisitDetail()"
      />
      <q-btn
        v-if="validateDispense"
        unelevated
        color="red"
        :disable="!validateDispense"
        label="Invalidar Dispensa"
        class="all-pointer-events"
        @click="removePatientVisitDetail()"
      />
    </div>
    <q-dialog persistent v-model="showAddEditDrug">
      <AddEditPrescribedDrug />
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, provide, reactive, ref } from 'vue';
import AddEditPrescribedDrug from 'components/Patient/PatientPanel/AddEditPrescribedDrug.vue';
import PrescriptionDrugsListHeader from 'components/Patient/Prescription/PrescriptionDrugsListHeader.vue';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods';
import StockService from 'src/services/api/stockService/StockService';
import moment from 'moment';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import drugService from 'src/services/api/drugService/drugService';
import { v4 as uuidv4 } from 'uuid';
//Declaration
const { getQtyPrescribed } = usePrescribedDrug();
const { alertSucess, alertError, alertInfo } = useSwal();
const { remainigDurationInWeeks } = usePrescription();
const { getQtyRemain } = usePrescribedDrug();
const columns = [
  {
    name: 'drug',
    align: 'left',
    field: 'row.drug.name',
    label: 'Medicamento',
    sortable: true,
  },
  {
    name: 'dosage',
    align: 'left',
    field: 'row.amtPerTime',
    label: 'Toma',
    sortable: false,
  },
  {
    name: 'packs',
    align: 'center',
    style: 'width: 20px',
    field: 'row.quantitySupplied',
    label: 'Quantidade em (Frascos)',
    sortable: false,
  },
  {
    name: 'quantityRemain',
    align: 'center',
    field: 'quantityRemain',
    label: 'Sobra em Frasco(Unidade)',
    sortable: false,
  },
  {
    name: 'nextPickUpDate',
    align: 'left',
    field: 'row.toContinue',
    label: 'Próx. Levantamento',
    sortable: false,
  },

  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const showAddEditDrug = ref(false);
const submittingPrescribedDrug = reactive(ref(false));
const nextPUpDate = ref('');
const pickupDate = ref('');
const nums = ref(
  Array(4)
    .fill()
    .map((x, i) => i + 1)
);
const drugsDuration = ref('');
const qtySuppliedFlag = ref(0);

// Injection
const curPrescription = inject('curPrescription');
const curPatientVisitDetail = inject('curPatientVisitDetail');
const curPack = inject('curPack');
const validateDispense = inject('validateDispense');
const addPatientVisitDetail = inject('addPatientVisitDetail');
const removePatientVisitDetail = inject('removePatientVisitDetail');
const curIdentifier = inject('curIdentifier');
//Methods
const deleteRow = (row) => {
  const i = curPack.value.packagedDrugs
    .map((toRemove) => toRemove.id)
    .indexOf(row.id);
  curPack.value.packagedDrugs.splice(i, 1);
};

const addPackagedDrug = async (prescribedDrug) => {
  const packagedDrug = new PackagedDrug({ id: uuidv4() });

  packagedDrug.amtPerTime = prescribedDrug.amtPerTime;
  packagedDrug.timesPerDay = prescribedDrug.timesPerDay;
  packagedDrug.form = prescribedDrug.form;
  packagedDrug.drug = prescribedDrug.drug;
  packagedDrug.drug_id = prescribedDrug.drug.id;

  const packagedDruggExists = curPack.value.packagedDrugs.some((item) => {
    return item.drug.id === prescribedDrug.drug.id;
  });

  if (!packagedDruggExists) {
    const hasStock = await checkStock(packagedDrug);

    if (hasStock) {
      if (
        drugsDuration.value.weeks >
        remainigDurationInWeeks(curPrescription.value)
      ) {
        alertError(
          'error',
          'O Período para o qual pretende efectuar a dispensa é maior que o período remanescente nesta prescrição [' +
            Number(remainigDurationInWeeks(curPrescription.value) / 4) +
            ' mes(es)]'
        );
      } else {
        showAddEditDrug.value = false;
        curPack.value.packagedDrugs.push(packagedDrug);
      }
    } else {
      alertError(
        'O medicamento seleccionado não possui stock suficiente para dispensar até a data da dispensa'
      );
    }
  } else {
    alertError(
      'O medicamento ja existe na lista dos medicamentos por dispensar.'
    );
  }
  submittingPrescribedDrug.value = false;
};
const getDrugById = (drugID) => {
  return drugService.getCleanDrugById(drugID);
};

const qtySupplied = async (packagedDrug) => {
  const item = await checkStock(packagedDrug);
  if (item) {
    qtySuppliedFlag.value = packagedDrug.quantitySupplied;
  } else {
    qtySuppliedFlag.value = -1;
  }
  return qtySuppliedFlag.value;
};
const checkStock = async (packagedDrug) => {
  packagedDrug.drug = getDrugById(packagedDrug.drug.id);
  const qtytoDispense = getQtyPrescribed(
    packagedDrug,
    curPack.value.weeksSupply
  );
  packagedDrug.quantitySupplied = qtytoDispense;
  const resp = await StockService.checkStockStatus(
    packagedDrug.drug.id,
    curPack.value.pickupDate,
    qtytoDispense
  );
  return resp;
};

// Computed
provide('showAddEditDrug', showAddEditDrug);
provide('addPrescribedDrug', addPackagedDrug);
provide('submittingPrescribedDrug', submittingPrescribedDrug);
</script>

<style></style>
