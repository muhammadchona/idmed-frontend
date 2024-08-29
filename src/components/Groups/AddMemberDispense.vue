<template>
  <ListHeader
    :mainContainer="true"
    :expandVisible="true"
    @expand="expand"
    bgColor="bg-primary"
    >{{ usePatient().preferedIdentifier(member.patient).value }} -
    {{ usePatient().fullName(member.patient) }}
  </ListHeader>
  <div v-if="infoVisible">
    <span class="text-bold text-subtitle1 vertical-middle q-pl-md"
      >Medicamentos Prescritos</span
    >
    <q-table
      flat
      bordered
      dense
      hide-bottom
      v-if="showDispensesData"
      :rows="
        member.groupMemberPrescriptions[0] !== undefined &&
        member.groupMemberPrescriptions[0] !== null
          ? member.groupMemberPrescriptions[0].prescription !== undefined
            ? member.groupMemberPrescriptions[0].prescription.prescribedDrugs
            : []
          : useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
              .prescription.prescribedDrugs
      "
      :columns="columns1"
      row-key="id"
    >
      <template #body="props">
        <q-tr no-hover :props="props">
          <q-td key="drug" :props="props">
            {{ props.row.drug.name }}
          </q-td>

          <q-td key="dosage" :props="props">
            {{
              'Tomar ' +
              props.row.amtPerTime +
              ' ' +
              getForm(props.row.drug.form_id).description +
              ' ' +
              props.row.timesPerDay +
              ' vez(es)' +
              ' por ' +
              props.row.form
            }}
          </q-td>

          <q-td auto-width key="packs" :props="props">
            {{
              usePrescribedDrug().getQtyPrescribed(
                props.row,
                member.groupMemberPrescriptions[0] !== undefined &&
                  member.groupMemberPrescriptions[0] !== null
                  ? member.groupMemberPrescriptions[0].prescription.duration
                      .weeks
                  : useEpisode().lastVisit(
                      member.patient.identifiers[0].episodes[0]
                    ).prescription.duration.weeks
              ) > 0
                ? usePrescribedDrug().getQtyPrescribed(
                    props.row,
                    member.groupMemberPrescriptions[0] !== undefined &&
                      member.groupMemberPrescriptions[0] !== null
                      ? member.groupMemberPrescriptions[0].prescription.duration
                          .weeks
                      : useEpisode().lastVisit(
                          member.patient.identifiers[0].episodes[0]
                        ).prescription.duration.weeks
                  )
                : 1
            }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-separator color="grey-13" size="1px" class="q-mb-sm" />
  </div>
  <div class="col" v-if="infoVisible">
    <ListHeader
      :addVisible="true"
      :mainContainer="true"
      :addButtonActions="() => openAddPrescribedDrugForm()"
      bgColor="bg-primary"
    >
    </ListHeader>
    <q-table
      class="col"
      dense
      flat
      :rows="
        membersDispenses.get(member) !== undefined
          ? membersDispenses.get(member).packagedDrugs
          : []
      "
      :columns="columns"
      row-key="id"
      v-if="showDispensesData"
    >
      <template v-slot:no-data="{ icon, filter }">
        <div
          class="full-width row flex-center text-primary q-gutter-sm text-body2"
        >
          <span> Nenhum Medicamento Indicado </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <div class="hidden">{{ qtySupplied(props.row) }}</div>
          <q-td key="order" :props="props"> </q-td>
          <q-td
            key="drug"
            :props="props"
            :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
          >
            {{ props.row.drug.name }}
          </q-td>
          <q-td
            key="packSize"
            :props="props"
            :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
          >
            {{ props.row.drug.packSize }}
          </q-td>
          <q-td
            key="form"
            :props="props"
            :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
          >
            {{ props.row.drug.form.description }}
          </q-td>
          <q-td
            key="takeInstrucions"
            :props="props"
            :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
          >
            {{ props.row.drug.defaultTreatment }} -
            {{ props.row.drug.defaultTimes }}X por
            {{ props.row.drug.defaultPeriodTreatment }}
          </q-td>
          <q-td
            key="packs"
            :props="props"
            :style="qtySuppliedFlag === -1 ? 'color: red' : ' color: black'"
          >
            {{
              usePrescribedDrug().getQtyPrescribed(
                props.row,
                drugsDuration.weeks
              )
            }}
          </q-td>
          <q-td key="options" :props="props">
            <div class="col">
              <q-btn
                flat
                round
                color="red-8"
                icon="delete"
                @click="removePrescribedDrug(props.row)"
              >
                <q-tooltip class="bg-red-5">Remover</q-tooltip>
              </q-btn>
              <q-btn
                v-if="qtySuppliedFlag === -1"
                flat
                round
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
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  <q-dialog persistent v-model="showAddEditDrug">
    <AddEditPrescribedDrug
      :visitDetails="selectedVisitDetails"
      :hasTherapeuticalRegimen="hasTherapeuticalRegimen"
      @close="showAddEditDrug = false"
    />
  </q-dialog>
</template>
<script setup>
import { inject, onMounted, provide, reactive, ref } from 'vue';
import GroupPack from '../../stores/models/group/GroupPack';
import Pack from '../../stores/models/packaging/Pack';
import PackagedDrug from '../../stores/models/packagedDrug/PackagedDrug';
import PatientVisitDetails from '../../stores/models/patientVisitDetails/PatientVisitDetails';
import PatientVisit from '../../stores/models/patientVisit/PatientVisit';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePatient } from 'src/composables/patient/patientMethods';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService';
import episodeService from 'src/services/api/episode/episodeService';
import { useLoading } from 'src/composables/shared/loading/loading';
import ListHeader from 'components/Shared/ListHeader.vue';
import AddEditPrescribedDrug from 'components/Patient/PatientPanel/AddEditPrescribedDrug.vue';
import drugService from 'src/services/api/drugService/drugService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import formService from 'src/services/api/formService/formService';

import { v4 as uuidv4 } from 'uuid';
import StockService from 'src/services/api/stockService/StockService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';
const columns = [
  { name: 'order', align: 'left', label: 'Ordem', sortable: false },
  { name: 'drug', align: 'left', label: 'Medicamento', sortable: false },
  {
    name: 'packSize',
    align: 'left',
    label: 'Quantidade no Frasco',
    sortable: false,
  },
  { name: 'form', align: 'left', label: 'Forma', sortable: false },
  {
    name: 'takeInstrucions',
    align: 'left',
    label: 'Instrução de Toma',
    sortable: false,
  },
  { name: 'packs', align: 'left', label: 'Número de Frascos', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

const columns1 = [
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
      getQtyPrescribed(row, curPrescription.value.duration.weeks) > 0
        ? getQtyPrescribed(row, curPrescription.value.duration.weeks)
        : 1,
    label: 'Quantidade em (Frascos)',
    sortable: false,
  },
];

const props = defineProps(['member']);

const { alertSucess, alertError } = useSwal();
const { closeLoading, showloading } = useLoading();
const clinic = inject('clinic');
let selectedVisitDetails = reactive(ref(new PatientVisitDetails()));
const showAddEditDrug = ref(false);
const hasTherapeuticalRegimen = ref(false);
const showDispensesData = ref(false);
const selectedGroup = inject('group');
const membersDispenses = inject('membersDispenses');
const curIdentifier = ref('');
const curPrescriptionDetail = ref('');
const curVisitDetails = ref('');
const drugsDuration = inject('drugsDuration');
const pickupDate = inject('pickupDate');
const infoVisible = ref(true);
const curGroupPackHeader = inject('curGroupPackHeader');
const qtySuppliedFlag = ref(0);
const expand = (valueUpdated) => {
  infoVisible.value = valueUpdated;
};
const drugQuantities = inject('drugQuantities');
const stockIndicator = inject('stockIndicator');

const qtySupplied = async (packagedDrug) => {
  const item = await checkStock(packagedDrug);
  if (item) {
    qtySuppliedFlag.value = packagedDrug.quantitySupplied;
  } else {
    qtySuppliedFlag.value = -1;
    stockIndicator.value = false;
  }
  return qtySuppliedFlag.value;
};
const checkStock = async (packagedDrug) => {
  let resp = true;
  const quantitySupplied = drugQuantities.get(packagedDrug.drug.id);

  if (drugsDuration.value !== '') {
    // packagedDrug.drug = drugService.getDrugWith1ById(packagedDrug.drug.id);
    const qtytoDispense = usePrescribedDrug().getQtyPrescribed(
      packagedDrug,
      drugsDuration.weeks
    );
    packagedDrug.quantitySupplied = qtytoDispense;
    resp = await StockService.checkStockStatus(
      packagedDrug.drug.id,
      pickupDate.value,
      quantitySupplied,
      clinicService.currClinic().id,
      drugsDuration.weeks
    );
  }

  return resp;
};

const initDispenses = () => {
  let prescription;

  if (props.member.endDate === null) {
    if (props.member.groupMemberPrescriptions[0] != null) {
      prescription = props.member.groupMemberPrescriptions[0].prescription;
    } else {
      prescription = useEpisode().lastVisit(
        props.member.patient.identifiers[0].episodes[0]
      ).prescription;
    }
    const patientVisitDetails = new PatientVisitDetails({
      id: uuidv4(),
    });
    const groupPack = new GroupPack({ id: uuidv4() });
    const pack = new Pack({ id: uuidv4() });
    const patientVisit = new PatientVisit({
      id: uuidv4(),
      patient: props.member.patient,
      clinic: props.member.patient.clinic,
    });
    prescription.prescribedDrugs.forEach((prescD) => {
      const packDrug = new PackagedDrug();
      packDrug.id = uuidv4();
      packDrug.amtPerTime = prescD.amtPerTime;
      packDrug.timesPerDay = prescD.timesPerDay;
      packDrug.form = prescD.form;
      packDrug.drug = drugService.getDrugWith1ById(prescD.drug.id);
      packDrug.quantitySupplied = prescD.prescribedQty;
      // packDrug.toContinue = prescD.toContinue
      packDrug.creationDate = new Date();
      if (!drugQuantities.has(prescD.drug.id)) {
        drugQuantities.set(prescD.drug.id, 0);
      }
      const currentQuantity = drugQuantities.get(prescD.drug.id);
      drugQuantities.set(
        prescD.drug.id,
        currentQuantity + prescD.prescribedQty
      );
      pack.packagedDrugs.push(packDrug);
    });
    patientVisitDetails.prescription = prescription;
    patientVisitDetails.pack = pack;
    // patientVisitDetails.clinic = props.member.patient.clinic;
    patientVisitDetails.clinic = {};
    patientVisitDetails.clinic.id = props.member.patient.clinic.id;
    patientVisitDetails.episode = episodeService.getEpisodeById(
      props.member.patient.identifiers[0].episodes[0].id
    );
    patientVisitDetails.patientVisit = patientVisit;
    pack.syncStatus = props.member.patient.his_id.length > 10 ? 'R' : 'N';
    pack.patientVisitDetails.push(patientVisitDetails);
    membersDispenses.value.set(props.member, pack);
    groupPack.pack = pack;
    curGroupPackHeader.value.groupPacks.push(groupPack);
    showDispensesData.value = true;
    setTimeout(() => {
      closeLoading();
    }, 1000);
  }
};

const openAddPrescribedDrugForm = () => {
  const pack = membersDispenses.value.get(props.member);
  // props.member.patient.identifiers[0].service = clinicalServiceService.getClinicalServicePersonalizedById(props.member.patient.identifiers[0].service.id)[0]
  curIdentifier.value = patientServiceIdentifierService.curIdentifierById(
    props.member.patient.identifiers[0].id
  );
  curPrescriptionDetail.value =
    prescriptionDetailsService.getPrescriptionDetailByID(
      pack.patientVisitDetails[0].prescription.prescriptionDetails[0].id
    );
  curVisitDetails.value = pack.patientVisitDetails[0];

  showAddEditDrug.value = true;
};

const getForm = (id) => {
  return formService.getFormById(id);
};

const removePrescribedDrug = (prescribedDrug) => {
  console.log(selectedGroup);
  const pack = membersDispenses.value.get(props.member);
  const newPackagedDrugs = pack.packagedDrugs.filter((prescDr) => {
    return prescDr.drug.id !== prescribedDrug.drug.id;
  });
  pack.packagedDrugs = newPackagedDrugs;
  console.log(pack);
};

const addPrescribedDrug = (prescribedDrug, visitDetails) => {
  console.log(visitDetails);
  visitDetails = curVisitDetails;
  console.log(visitDetails);
  //  prescribedDrug.prescription_id = visitDetails.prescription.id
  const pack = membersDispenses.value.get(props.member);
  const psdrugExists = pack.packagedDrugs.some((pd) => {
    return pd.drug.id === prescribedDrug.drug.id;
  });
  if (psdrugExists) {
    alertError(
      'O medicamento seleccionado não pode ser adicionado, pois já existe na lista a dispensar para o membro [' +
        usePatient().fullName(props.member.patient) +
        ']'
    );
  } else {
    pack.packagedDrugs.push(new PackagedDrug(prescribedDrug));
    console.log(pack.packagedDrugs);
  }
  showAddEditDrug.value = false;
};

onMounted(() => {
  initDispenses();
});

provide('curIdentifier', curIdentifier);
provide('curPrescriptionDetail', curPrescriptionDetail);
provide('addPrescribedDrug', addPrescribedDrug);
provide('showAddEditDrug', showAddEditDrug);
</script>
