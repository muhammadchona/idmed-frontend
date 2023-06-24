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
        member.groupMemberPrescription !== null
          ? member.groupMemberPrescription.prescription.prescribedDrugs
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
                member.groupMemberPrescription !== null
                  ? member.groupMemberPrescription.prescription.duration.weeks
                  : useEpisode().lastVisit(
                      member.patient.identifiers[0].episodes[0]
                    ).prescription.duration.weeks
              ) > 0
                ? usePrescribedDrug().getQtyPrescribed(
                    props.row,
                    member.groupMemberPrescription !== null
                      ? member.groupMemberPrescription.prescription.duration
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
      :rows="membersDispenses.get(member).packagedDrugs"
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
          <q-td key="order" :props="props"> </q-td>
          <q-td key="drug" :props="props">
            {{ props.row.drug.name }}
          </q-td>
          <q-td key="packSize" :props="props">
            {{ props.row.drug.packSize }}
          </q-td>
          <q-td key="form" :props="props">
            {{ props.row.drug.form.description }}
          </q-td>
          <q-td key="takeInstrucions" :props="props">
            {{ props.row.drug.defaultTreatment }} -
            {{ props.row.drug.defaultTimes }}X por
            {{ props.row.drug.defaultPeriodTreatment }}
          </q-td>
          <q-td key="packs" :props="props">
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
import { computed, inject, onMounted, provide, ref, watch } from 'vue';
import { date, QSpinnerBall, SessionStorage } from 'quasar';
import GroupPackHeader from '../../stores/models/group/GroupPackHeader';
import GroupPack from '../../stores/models/group/GroupPack';
import Pack from '../../stores/models/packaging/Pack';
import PackagedDrug from '../../stores/models/packagedDrug/PackagedDrug';
import PackagedDrugStock from '../../stores/models/packagedDrug/PackagedDrugStock';
import PatientVisitDetails from '../../stores/models/patientVisitDetails/PatientVisitDetails';
import PatientVisit from '../../stores/models/patientVisit/PatientVisit';
import Prescription from '../../stores/models/prescription/Prescription';
import ClinicalService from '../../stores/models/ClinicalService/ClinicalService';
import PrescriptionDetail from '../../stores/models/prescriptionDetails/PrescriptionDetail';
import GroupMemberPrescription from '../../stores/models/group/GroupMemberPrescription';
// import mixinplatform from 'src/mixins/mixin-system-platform'
// import mixinutils from 'src/mixins/mixin-utils'
import Drug from '../../stores/models/drug/Drug';
import moment from 'moment';
import { useGroup } from 'src/composables/group/groupMethods';
import { useGroupMember } from 'src/composables/group/groupMemberMethods';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import { usePatient } from 'src/composables/patient/patientMethods';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRouter } from 'vue-router';
import groupService from 'src/services/api/group/groupService';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import patientService from 'src/services/api/patientService/patientService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService';
import packService from 'src/services/api/pack/packService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import durationService from 'src/services/api/duration/durationService';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';
import episodeService from 'src/services/api/episode/episodeService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
// import packService from 'src/services/api/pack/packService';
import ListHeader from 'components/Shared/ListHeader.vue';
import AddEditPrescribedDrug from 'components/Patient/PatientPanel/AddEditPrescribedDrug.vue';
import StockService from 'src/services/api/stockService/StockService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import drugService from 'src/services/api/drugService/drugService';
import groupPackHeaderService from 'src/services/api/groupPackHeader/groupPackHeaderService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import formService from 'src/services/api/formService/formService';
import { v4 as uuidv4 } from 'uuid';
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

const {
  idadeCalculator,
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
  getJSDateFromDDMMYYY,
  getDateFormatYYYYMMDDFromDDMMYYYY,
  extractHyphenDateFromDMYConvertYMD,
} = useDateUtils();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile } = useSystemUtils();

const clinic = inject('clinic');
// let selectedGroup = ref(null);
let selectedVisitDetails = ref(new PatientVisitDetails());
const showAddEditDrug = ref(false);
const hasTherapeuticalRegimen = ref(false);
const patientVisitDetailsToAdd = ref([]);
const showDispensesData = ref(false);
const step = 'display';
const selectedGroup = inject('group');
console.log(selectedGroup);
const loadedData = ref(false);
const defaultPickUpDate = ref(null);
const membersDispenses = inject('membersDispenses');
// const date = ref(moment(date).format('YYYY/MM/DD'))
const curIdentifier = ref('');
const curPrescriptionDetail = ref('');
const curVisitDetails = ref('');
const drugsDuration = inject('drugsDuration');
const infoVisible = ref(true);
const loadGroup = inject('loadGroup');
const curGroupPackHeader = inject('curGroupPackHeader');

const expand = (valueUpdated) => {
  infoVisible.value = valueUpdated;
};

const initDispenses = () => {
  let prescription;
  if (props.member.groupMemberPrescription != null) {
    prescription = props.member.groupMemberPrescription.prescription;
  } else {
    prescription = useEpisode().lastVisit(
      props.member.patient.identifiers[0].episodes[0]
    ).prescription;
  }
  const patientVisitDetails = new PatientVisitDetails({
    id: uuidv4(),
  });
  // const groupPacks = []
  const groupPack = new GroupPack({ id: uuidv4() });
  const pack = new Pack({ id: uuidv4() });
  const patientVisit = new PatientVisit({
    id: uuidv4(),
    patient: props.member.patient,
    clinic: props.member.patient.clinic,
  });
  console.log(patientVisit);
  prescription.prescribedDrugs.forEach((prescD) => {
    const packDrug = new PackagedDrug();
    packDrug.id = uuidv4();
    packDrug.amtPerTime = prescD.amtPerTime;
    packDrug.timesPerDay = prescD.timesPerDay;
    packDrug.form = prescD.form;
    packDrug.drug = drugService.getDrugById(prescD.drug.id);
    packDrug.quantitySupplied = prescD.qtyPrescribed;
    // packDrug.toContinue = prescD.toContinue
    packDrug.creationDate = new Date();
    pack.packagedDrugs.push(packDrug);
  });
  patientVisitDetails.prescription = prescription;
  patientVisitDetails.pack = pack;
  patientVisitDetails.clinic = props.member.patient.clinic;
  patientVisitDetails.episode = episodeService.getEpisodeById(
    props.member.patient.identifiers[0].episodes[0].id
  );
  patientVisitDetails.patientVisit = patientVisit;
  pack.syncStatus = props.member.patient.his_id.length > 10 ? 'R' : 'N';
  pack.patientVisitDetails.push(patientVisitDetails);
  membersDispenses.value.set(props.member, pack);
  groupPack.pack = pack;
  curGroupPackHeader.value.groupPacks.push(groupPack);
  console.log(curGroupPackHeader.value.groupPacks);
  console.log(membersDispenses);
  showDispensesData.value = true;
  closeLoading();
};

const openAddPrescribedDrugForm = () => {
  console.log(props.member);
  const pack = membersDispenses.value.get(props.member);
  console.log(pack.patientVisitDetails[0].prescription.prescriptionDetails[0]);
  // props.member.patient.identifiers[0].service = clinicalServiceService.getClinicalServicePersonalizedById(props.member.patient.identifiers[0].service.id)[0]
  curIdentifier.value = patientServiceIdentifierService.curIdentifierById(
    props.member.patient.identifiers[0].id
  );
  curPrescriptionDetail.value =
    prescriptionDetailsService.getPrescriptionDetailByID(
      pack.patientVisitDetails[0].prescription.prescriptionDetails[0].id
    );
  curVisitDetails.value = pack.patientVisitDetails[0];
  console.log(curIdentifier.value);
  console.log(curPrescriptionDetail.value);

  showAddEditDrug.value = true;
};

const getForm = (id) => {
  console.log(formService.getFormById(id));
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
        usePatient().fullName(member.patient) +
        ']'
    );
  } else {
    pack.packagedDrugs.push(new PackagedDrug(prescribedDrug));
    console.log(pack.packagedDrugs);
  }
  showAddEditDrug.value = false;
};

const savePatientVisitDetails = (groupPacks, i) => {
  if (isMobile.value) {
    if (groupPacks[i] !== null && groupPacks[i] !== undefined) {
      const patientVisit = JSON.parse(
        JSON.stringify(groupPacks[i].pack.patientVisitDetails[0].patientVisit)
      );

      console.log(patientVisit);
      patientVisit.patientVisitDetails.push(
        JSON.parse(JSON.stringify(groupPacks[i].pack.patientVisitDetails[0]))
      );
      patientVisit.patientVisitDetails[0].patientVisit = null;
      groupPacks[i].pack.patientVisitDetails = [];

      groupPacks[i].pack.dispenseMode_id = groupPacks[i].pack.dispenseMode.id;
      groupPacks[i].pack.clinic_id = groupPacks[i].pack.clinic.id;

      groupPacks[i].pack.packagedDrugs.forEach((pDrug) => {
        pDrug.pack_id = groupPacks[i].pack.id;
        pDrug.drug_id = pDrug.drug.id;
        pDrug.packagedDrugStocks.forEach((pDrugStock) => {
          pDrugStock.pack_id = groupPacks[i].pack.id;
          pDrugStock.drug_id = pDrugStock.drug.id;
          pDrugStock.packagedDrug_id = pDrug.id;
        });
      });
      // patientVisit.patientVisitDetails[0].prescription.calculateLeftDuration(JSON.parse(JSON.stringify(groupPacks[i].pack)).weeksSupply)

      Pack.localDbAdd(JSON.parse(JSON.stringify(groupPacks[i].pack)));
      Pack.insert({ data: JSON.parse(JSON.stringify(groupPacks[i].pack)) });
      patientVisit.patientVisitDetails[0].pack = JSON.parse(
        JSON.stringify(groupPacks[i].pack)
      );
      patientVisit.patientVisitDetails[0].pack.packagedDrugs = [];
      patientVisit.clinic_id = patientVisit.clinic.id;
      patientVisit.patient_id = patientVisit.patient.id;
      patientVisit.patientVisitDetails[0].episode_id =
        patientVisit.patientVisitDetails[0].episode.id;
      patientVisit.patientVisitDetails[0].clinic_id =
        patientVisit.patientVisitDetails[0].clinic.id;
      patientVisit.patientVisitDetails[0].patient_visit_id = patientVisit.id;
      patientVisit.patientVisitDetails[0].prescription_id =
        patientVisit.patientVisitDetails[0].prescription.id;
      patientVisit.patientVisitDetails[0].pack_id =
        patientVisit.patientVisitDetails[0].pack.id;

      PatientVisit.localDbAdd(patientVisit);
      PatientVisit.insert({ data: patientVisit });

      i = i + 1;
      setTimeout(savePatientVisitDetails(groupPacks, i), 4);
    } else {
      curGroupPackHeader.value = JSON.parse(
        JSON.stringify(curGroupPackHeader.value)
      );
      curGroupPackHeader.groupPacks.forEach((groupPack) => {
        groupPack.pack.patientVisitDetails = [];
        groupPack.pack_id = groupPack.pack.id;
        groupPack.header_id = curGroupPackHeader.id;
        groupPack.syncStatus = 'R';
      });
      curGroupPackHeader.duration_id = curGroupPackHeader.duration.id;
      curGroupPackHeader.group_id = group.id;
      curGroupPackHeader.group = null;
      console.log(curGroupPackHeader);
      GroupPackHeader.localDbAdd(
        JSON.parse(JSON.stringify(curGroupPackHeader))
      );
      GroupPackHeader.insert({ data: curGroupPackHeader });
      submitting = false;
      displayAlert('info', 'Operação efectuada com sucesso.');
    }
  } else {
    if (groupPacks[i] !== null && groupPacks[i] !== undefined) {
      const patientVisit = Object.assign(
        {},
        groupPacks[i].pack.patientVisitDetails[0].patientVisit
      );
      console.log(patientVisit);
      patientVisit.patientVisitDetails.push(
        groupPacks[i].pack.patientVisitDetails[0]
      );
      patientVisit.patientVisitDetails[0].patientVisit = null;
      groupPacks[i].pack.patientVisitDetails = [];

      groupPacks[i].pack.packagedDrugs.forEach((pck) => {
        patientVisit.patientVisitDetails[
          i
        ].prescription.prescribedDrugs.forEach((prescDrug) => {
          if (prescDrug.drug.id === pck.drug.id) {
            pck.drug_id = pck.drug.id;
            pck.quantitySupplied = prescDrug.qtyPrescribed;
            pck.amtPerTime = prescDrug.amtPerTime;
            pck.timesPerDay = prescDrug.timesPerDay;
            pck.form = pck.drug.form;
            pck.drug = drugService.getDrugById(pck.drug.id);
            pck.drug.packaged_drugs = [];
            pck.packagedDrugStocks.forEach((pck1) => {
              pck1.drug = drugService.getDrugById(pck1.drug.id);
            });
          }
        });
        pck.drug.stocks = [];
        pck.form.drugs = [];
        pck.drug.form.drugs = [];
        pck.drug.therapeuticRegimenList = [];
        pck.drug.clinicalService.drugs = [];
      });
      patientVisit.patientVisitDetails[0].pack = groupPacks[i].pack;
      patientVisit.patientVisitDetails[0].prescription.prescribedDrugs.forEach(
        (pd) => {
          pd.drug.therapeuticRegimenList = [];
          pd.drug.packaged_drugs = [];
          pd.drug.stocks = [];
        }
      );
      //  Pack.apiSave(groupPacks[i].pack).then(resp => {
      //    groupPacks[i].pack.id = resp.response.data.id
      //    groupPacks[i].pack.$id = resp.response.data.id
      //   patientVisit.patientVisitDetails[0].pack.packagedDrugs = []

      console.log(patientVisit);
      console.log(patientVisit.patientVisitDetails);
      const patientId = patientVisit.patient.id;
      patientVisit.patient = {};
      patientVisit.patient.id = patientId;
      patientVisit.patientVisitDetails.forEach((pvd) => {
        const epsidodeId = pvd.episode.id;
        const prescriptionId = pvd.prescription.id;
        pvd.episode = {};
        pvd.episode.id = epsidodeId;
        pvd.prescription = {};
        pvd.prescription.id = prescriptionId;
      });
      console.log(patientVisit);
      console.log(patientVisit.patientVisitDetails);
      //  usePrescription().calculateLeftDuration(patientVisit.patientVisitDetails[0].prescription,JSON.parse(JSON.stringify(groupPacks[i].pack)).weeksSupply)
      patientVisitService.apiSave(patientVisit).then((resp) => {
        // groupPacks[i].pack.patientVisitDetails = []
        const pv = JSON.parse(JSON.stringify(patientVisit));
        //  PatientVisit.insert({ data: pv })
        pv.patientVisitDetails.forEach((pvd) => {
          patientVisit.patientVisitDetails = [];
          pvd.patientVisit = JSON.parse(JSON.stringify(patientVisit));
          patientVisitDetailsToAdd.value.push(pvd);
        });
        i = i + 1;
        setTimeout(savePatientVisitDetails(groupPacks, i), 4);
      });
      // })
    } else {
      curGroupPackHeader.groupPacks.forEach((groupPack) => {
        groupPack.pack.patientVisitDetails = [];
        groupPack.pack_id = groupPack.pack.id;
      });
      groupPackHeaderService.apiSave(curGroupPackHeader).then((resp) => {
        console.log(resp);
        curGroupPackHeader.id = resp.data.id;
        // Group.apiFetchById(curGroupPackHeader.group.id).then(resp => {a
        //  console.log(resp)
        // resp.response.data.packHeaders.forEach(packHeader => {
        //       GroupPackHeader.apiFetchById(packHeader.id).then(resp => {
        //        console.log(resp)
        //      })
        //    })
        //})
        patientVisitDetailsToAdd.value.forEach((pvd) => {
          pvd.episode_id = pvd.episode.id;
          pvd.clinic_id = pvd.clinic.id;
          pvd.patient_visit_id = pvd.patientVisit.id;
          pvd.prescription_id = pvd.prescription.id;
          pvd.pack_id = pvd.pack.id;
          console.log(pvd);
          PatientVisitDetails.insert({ data: pvd });
        });
        alertSucess('Operação efectuada com sucesso.');
        // $emit('getGroupMembers', false)
      });
    }
  }
};

onMounted(() => {
  console.log('Dispense Component: onMounted');
  // loadGroup()
  // loadDetails()
  initDispenses();
  console.log(
    useEpisode().lastVisit(props.member.patient.identifiers[0].episodes[0])
      .prescription.prescribedDrugs
  );
  console.log(selectedGroup.value.members);
  console.log(props.member);
});

provide('curIdentifier', curIdentifier);
provide('curPrescriptionDetail', curPrescriptionDetail);
provide('addPrescribedDrug', addPrescribedDrug);
provide('showAddEditDrug', showAddEditDrug);
</script>
