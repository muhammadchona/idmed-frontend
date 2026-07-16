<template>
  <div :class="{ 'tablet-service-drugs': isMobile }">
    <PrescriptionDrugsListHeader
      :addVisible="true"
      :mainContainer="false"
      bgColor="bg-grey-6"
    >
      Medicamentos para
      {{ curIdentifier.service.code }}
    </PrescriptionDrugsListHeader>
    <div class="col prescription-box q-pa-md q-mb-md service-drugs-table-box">
      <q-table
        class="col service-drugs-table"
        dense
        :rows="curPack.packagedDrugs"
        :columns="columns"
        row-key="id"
        hide-bottom
        flat
      >
        <template #header="props">
          <q-tr class="text-center bg-green-2" :props="props">
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
            <q-td :props="props" :style="{ color: props.row.color }" key="drug">
              <template v-if="isMobile">
                {{ getMobileDrugDisplay(props.row).name }}
              </template>
              <template v-else>{{
                getDrugById(props.row.drug.id) !== null &&
                getDrugById(props.row.drug.id) !== undefined
                  ? getDrugById(props.row.drug.id).name.includes(
                      String(
                        getDrugFirstLevelById(props.row.drug.id).form
                          .description
                      ).substring(0, 4)
                    )
                    ? getDrugById(props.row.drug.id).name
                    : getDrugById(props.row.drug.id).name +
                      ' - (' +
                      getDrugById(props.row.drug.id).packSize +
                      ' ' +
                      String(
                        getDrugFirstLevelById(props.row.drug.id).form
                          .description
                      ).substring(0, 4) +
                      ')'
                  : ''
              }}</template>
            </q-td>
            <q-td
              :props="props"
              :style="{ color: props.row.color }"
              key="dosage"
            >
              <template v-if="isMobile">
                {{ getMobileDrugDisplay(props.row).dosage }}
              </template>
              <template v-else>{{
                getDrugById(props.row.drug.id) !== null &&
                getDrugById(props.row.drug.id) !== undefined
                  ? getDrugFirstLevelById(props.row.drug.id).form !== null &&
                    getDrugFirstLevelById(props.row.drug.id).form !== undefined
                    ? getDrugFirstLevelById(props.row.drug.id).form.howToUse +
                      ' ' +
                      props.row.amtPerTime +
                      '   ' +
                      getDrugFirstLevelById(props.row.drug.id).form.unit +
                      ' - ' +
                      props.row.timesPerDay +
                      ' vez(es) por ' +
                      props.row.form
                    : 'Tomar' +
                      ' ' +
                      props.row.amtPerTime +
                      '   ' +
                      ' - ' +
                      props.row.timesPerDay +
                      ' vez(es) por ' +
                      props.row.form
                  : ''
              }}</template>
            </q-td>
            <q-td
              :style="{ color: props.row.color }"
              :props="props"
              v-if="!curPatientVisitDetail.createPackLater"
              auto-width
              key="packs"
            >
              {{ props.row.quantitySupplied }}
              <em v-if="isMobile">
                {{ getMobileDrugDisplay(props.row).quantityUnit }}
              </em>
              <em
                v-else-if="
                  getDrugFirstLevelById(props.row.drug.id).clinicalService
                    .code === 'TARV'
                "
              >
                Frasco(s)</em
              >
              <em v-else
                >{{
                  getDrugFirstLevelById(props.row.drug.id).form.description
                }}(s)</em
              >
            </q-td>
            <q-td
              :style="{ color: props.row.color }"
              key="quantityRemain"
              :props="props"
            >
              <em v-if="isMobile">
                {{ getMobileDrugDisplay(props.row).remaining }}
              </em>
              <em
                v-else-if="
                  getDrugFirstLevelById(props.row.drug.id).clinicalService
                    .code === 'TARV'
                "
              >
                {{
                  Math.floor(
                    getQtyRemain(props.row, curPrescription.duration.weeks) /
                      props.row.drug.packSize
                  )
                }}
                Frasco(s) e
                {{
                  getQtyRemain(props.row, curPrescription.duration.weeks) +
                  ' ' +
                  getDrugFirstLevelById(props.row.drug.id).form.unit
                }}
              </em>
              <em v-else>
                {{
                  Math.floor(
                    getQtyRemain(props.row, curPrescription.duration.weeks) /
                      props.row.drug.packSize
                  )
                }}
                {{
                  getDrugFirstLevelById(props.row.drug.id).form.description
                }}(s)
              </em>
            </q-td>
            <q-td
              :style="{ color: props.row.color }"
              v-if="!curPatientVisitDetail.createPackLater"
              key="nextPickUpDate"
              :props="props"
            >
              <div class="row">
                <q-toggle
                  v-model="props.row.toContinue"
                  :disable="props.row.color === 'red' || validateDispense"
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
                v-if="props.row.color === 'red'"
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
                  <strong
                    ><em>
                      Medicamento sem stock ou por expirar brevemente
                    </em></strong
                  >
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
        :loading="submittingValidateDispense"
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
import {
  inject,
  onMounted,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue';
import AddEditPrescribedDrug from 'components/Patient/PatientPanel/AddEditPrescribedDrug.vue';
import PrescriptionDrugsListHeader from 'components/Patient/Prescription/PrescriptionDrugsListHeader.vue';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods';
import StockService from 'src/services/api/stockService/StockService';

import { useSwal } from 'src/composables/shared/dialog/dialog';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import drugService from 'src/services/api/drugService/drugService';
import formService from 'src/services/api/formService/formService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import { useDrug } from 'src/composables/drug/drugMethods';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import moment from 'moment';
const { isOnline, isMobile, website } = useSystemUtils();
//Declaration
const { getQtyPrescribed } = usePrescribedDrug();
const { alertError } = useSwal();
const { remainigDurationInWeeks } = usePrescription();
const { getQtyRemain } = usePrescribedDrug();
const { getDrugFirstLevelById } = useDrug();
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
    label: 'Quantidade',
    sortable: false,
  },
  {
    name: 'quantityRemain',
    align: 'center',
    field: 'quantityRemain',
    label: 'Sobra',
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

const qtySuppliedFlag = ref(0);
const drugsDuration = ref('');
const mobileDrugDisplayCache = shallowRef(new Map());
// Injection
const curPrescription = inject('curPrescription');
const curPatientVisitDetail = inject('curPatientVisitDetail');
const curPrescriptionDetail = inject('curPrescriptionDetail');
const curPack = inject('curPack');
const validateDispense = inject('validateDispense');
const addPatientVisitDetail = inject('addPatientVisitDetail');
const removePatientVisitDetail = inject('removePatientVisitDetail');
const curIdentifier = inject('curIdentifier');
const submittingValidateDispense = inject('submittingValidateDispense');
const lastPrescription = inject('lastPrescription');
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

const getMobileDrugDisplay = (packagedDrug) => {
  const cacheKey = packagedDrug.id;
  const cached = mobileDrugDisplayCache.value.get(cacheKey);
  if (cached) return cached;

  const drug = getDrugById(packagedDrug.drug.id);
  const form = formService.getFormById(drug.form_id);
  const clinicalService =
    clinicalServiceService.getClinicalServiceById(drug.clinical_service_id);
  const formPrefix = String(form.description).substring(0, 4);
  const remaining = getQtyRemain(
    packagedDrug,
    curPrescription.value.duration.weeks
  );
  const isTarv = clinicalService.code === 'TARV';

  const display = {
    name: drug
      ? drug.name.includes(formPrefix)
        ? drug.name
        : `${drug.name} - (${drug.packSize} ${formPrefix})`
      : '',
    dosage: drug
      ? form
        ? `${form.howToUse} ${packagedDrug.amtPerTime}   ${form.unit} - ${packagedDrug.timesPerDay} vez(es) por ${packagedDrug.form}`
        : `Tomar ${packagedDrug.amtPerTime}    - ${packagedDrug.timesPerDay} vez(es) por ${packagedDrug.form}`
      : '',
    quantityUnit: isTarv ? 'Frasco(s)' : `${form.description}(s)`,
    remaining: isTarv
      ? `${Math.floor(remaining / packagedDrug.drug.packSize)} Frasco(s) e ${remaining} ${form.unit}`
      : `${Math.floor(remaining / packagedDrug.drug.packSize)} ${form.description}(s)`,
  };

  mobileDrugDisplayCache.value.set(cacheKey, display);
  return display;
};

const checkStock = async (packagedDrug) => {
  const qtytoDispense = getQtyPrescribed(
    packagedDrug,
    curPack.value.weeksSupply
  );
  packagedDrug.drug = getDrugById(packagedDrug.drug.id);
  packagedDrug.quantitySupplied = qtytoDispense;
  if (isOnline.value) {
    const resp = await StockService.checkStockStatus(
      packagedDrug.drug.id,
      curPack.value.pickupDate,
      qtytoDispense,
      clinicService.currClinic().id,
      curPack.value.weeksSupply
    );
    qtySuppliedFlag.value = resp;
    return resp;
  } else {
    let qtyInStock = 0;
    const stocks = await StockService.getStockByDrug(
      packagedDrug.drug.id,
      clinicService.currClinic().id
    );
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
  }
};

const checkStockList = async () => {
  try {
    curPack.value.packagedDrugs.map((row) => ({
      ...row,
      color: row.color || '',
    }));
    for (let i = 0; i < curPack.value.packagedDrugs.length; i++) {
      const isValidStock = await checkStock(curPack.value.packagedDrugs[i]);
      curPack.value.packagedDrugs[i].color = isValidStock ? 'black' : 'red';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(async () => {
  checkStockList();
});

watch(
  () => curPack.value.weeksSupply,
  async (oldp, newp) => {
    if (oldp !== newp) {
      checkStockList();
    }
  }
);

// Computed
provide('showAddEditDrug', showAddEditDrug);
provide('addPrescribedDrug', addPackagedDrug);
provide('submittingPrescribedDrug', submittingPrescribedDrug);
provide('curPatientVisitDetail', curPatientVisitDetail);
provide('curPrescriptionDetail', curPrescriptionDetail);
provide('curPrescription', curPrescription);
provide('lastPrescription', lastPrescription);
</script>

<style lang="scss">
.tablet-service-drugs {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.tablet-service-drugs .service-drugs-table-box {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 4px 6px !important;
  margin-bottom: 3px !important;
}

.tablet-service-drugs .service-drugs-table,
.tablet-service-drugs .q-table__middle {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.tablet-service-drugs .q-table {
  width: 100% !important;
  table-layout: fixed;
}

.tablet-service-drugs .q-table th,
.tablet-service-drugs .q-table td {
  height: 32px;
  padding: 3px 5px;
  font-size: 11px;
  line-height: 1.15;
  white-space: normal;
  overflow-wrap: anywhere;
}

.tablet-service-drugs .q-banner {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.tablet-service-drugs .q-banner__content,
.tablet-service-drugs .q-banner__actions {
  min-width: 0;
  padding-top: 2px;
  padding-bottom: 2px;
}

.tablet-service-drugs .q-banner .q-field {
  width: 170px !important;
  min-width: 0;
}

.tablet-service-drugs .q-mt-sm {
  margin-top: 3px !important;
}

.tablet-service-drugs .q-mb-sm {
  margin-bottom: 3px !important;
}
</style>
