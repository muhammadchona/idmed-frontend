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
            <q-th v-if="!curPatientVisitDetail.createPackLater">{{
              columns[2].label
            }}</q-th>
            <q-th v-if="!curPatientVisitDetail.createPackLater">{{
              columns[3].label
            }}</q-th>
            <q-th>{{ columns[4].label }}</q-th>
          </q-tr>
        </template>
        <template #body="props">
          <q-tr no-hover :props="props">
            <q-td
              :style="
                qtySupplied(props.row) === -1 ? 'color: red' : ' color: black'
              "
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
              :style="
                qtySupplied(props.row) === -1 ? 'color: red' : ' color: black'
              "
              key="dosage"
              :props="props"
            >
              {{
                getDrugById(props.row.drug.id) !== null &&
                getDrugById(props.row.drug.id) !== undefined
                  ? ' Toma ' +
                    getDrugById(props.row.drug.id).defaultTimes +
                    ' - ' +
                    getDrugById(props.row.drug.id).defaultTreatment +
                    ' vez(es) por ' +
                    getDrugById(props.row.drug.id).defaultPeriodTreatment
                  : ''
              }}
            </q-td>
            <q-td
              :style="
                qtySupplied(props.row) === -1 ? 'color: red' : ' color: black'
              "
              v-if="!curPatientVisitDetail.createPackLater"
              auto-width
              key="packs"
              :props="props"
            >
              {{ props.row.quantitySupplied }}
            </q-td>
            <q-td
              :style="
                qtySupplied(props.row) === -1 ? 'color: red' : ' color: black'
              "
              v-if="!curPatientVisitDetail.createPackLater"
              key="nextPickUpDate"
              :props="props"
            >
              <div class="row">
                <q-toggle
                  v-model="props.row.toContinue"
                  :disable="qtySupplied(props.row) === -1 || validateDispense"
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
                v-if="qtySupplied(props.row) === -1"
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
import { computed, inject, onMounted, provide, ref } from 'vue';
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

//Declaration
const { getQtyPrescribed } = usePrescribedDrug();
const { alertSucess, alertError, alertInfo } = useSwal();
const { remainigDurationInWeeks } = usePrescription();
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
    name: 'nextPickUpDate',
    align: 'left',
    field: 'row.toContinue',
    label: 'Próx. Levantamento',
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const showAddEditDrug = ref(false);
const nextPUpDate = ref('');
const pickupDate = ref('');
const nums = ref(
  Array(4)
    .fill()
    .map((x, i) => i + 1)
);
const drugsDuration = ref('');

// Injection
const curPatientVisit = inject('curPatientVisit');
const curPrescription = inject('curPrescription');
const curPrescriptionDetail = inject('curPrescriptionDetail');
const curPatientVisitDetail = inject('curPatientVisitDetail');
const curPack = inject('curPack');
const isNewPrescription = inject('isNewPrescription');
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

const addPackagedDrug = (prescribedDrug) => {
  const packagedDrug = new PackagedDrug();

  packagedDrug.amtPerTime = prescribedDrug.amtPerTime;
  packagedDrug.timesPerDay = prescribedDrug.timesPerDay;
  packagedDrug.form = prescribedDrug.form;
  packagedDrug.drug = prescribedDrug.drug;
  packagedDrug.drug_id = prescribedDrug.drug.id;

  const packagedDruggExists = curPack.value.packagedDrugs.some((item) => {
    return item.drug.id === prescribedDrug.drug.id;
  });

  if (!packagedDruggExists) {
    const hasStock = checkStock(packagedDrug);

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
};
const getDrugById = (drugID) => {
  return drugService.getCleanDrugById(drugID);
};

const qtySupplied = (packagedDrug) => {
  if (checkStock(packagedDrug)) {
    return packagedDrug.quantitySupplied;
  } else {
    return -1;
  }
};
const checkStock = (packagedDrug) => {
  let qtyInStock = 0;
  packagedDrug.drug = getDrugById(packagedDrug.drug.id);
  const qtytoDispense = getQtyPrescribed(
    packagedDrug,
    curPack.value.weeksSupply
  );
  packagedDrug.quantitySupplied = qtytoDispense;
  const stocks = StockService.getStockByDrug(packagedDrug.drug.id);
  const validStock = stocks.filter((item) => {
    return moment(item.expireDate) >= moment(curPack.value.pickupDate);
  });
  if (validStock.length <= 0) {
    return false;
  } else {
    validStock.forEach((item) => {
      qtyInStock = Number(qtyInStock + item.stockMoviment);
    });
    if (qtyInStock < qtytoDispense) {
      return false;
    } else {
      return true;
    }
  }
};

// Computed
provide('showAddEditDrug', showAddEditDrug);
provide('addPrescribedDrug', addPackagedDrug);
</script>

<style></style>
