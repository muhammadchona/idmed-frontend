<template>
  <q-card style="width: 1250px; max-width: 100vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="row items-center text-subtitle1 q-pa-md">
        <q-icon name="groups" size="md" color="primary" />
        <div class="text-bold text-grey-10 q-ml-sm">
          Grupo: {{ selectedGroup.code }}
        </div>
        <div class="text-grey-10 q-ml-sm">
          <span class="text-bold text-h6">|</span> {{ selectedGroup.name }}
        </div>
        <div class="text-grey-10 q-ml-sm">
          <span class="text-bold text-h6">|</span>
          {{ selectedGroup.groupType.code }}
        </div>
      </div>
      <q-separator />
    </q-card-section>
    <form @submit.prevent="doFormValidation">
      <div class="q-mx-lg">
        <div class="q-mt-lg">
          <div class="row items-center q-mb-sm">
            <span class="text-subtitle2">Dispensa</span>
          </div>
          <q-separator color="grey-13" size="1px" class="q-mb-sm" />
        </div>
        <div class="row q-mt-md">
          <q-input
            dense
            outlined
            bg-color="white"
            class="col"
            v-model="pickupDate"
            @update:model-value="determineNextPickUpDate()"
            label="Data de Levantamento"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="pickupDate"
                    mask="DD-MM-YYYY"
                    :options="blockDataFutura"
                    @update:model-value="determineNextPickUpDate()"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select
            dense
            class="q-mx-sm col"
            bg-color="white"
            outlined
            @blur="determineNextPickUpDate()"
            v-model="drugsDuration"
            :options="durations"
            option-value="id"
            option-label="description"
            label="Dispensa para"
          />

          <q-input
            outlined
            dense
            v-model="nextPDate"
            @update:model-value="determineNextPickUpDate()"
            label="Proximo Levantamento"
            bg-color="white"
            class="col"
            ref="nextPickupDate"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="nextPDate" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select
            dense
            class="q-mx-sm col"
            bg-color="white"
            outlined
            v-model="dispenseMode"
            :options="dispenseModes"
            option-value="id"
            option-label="description"
            label="Modo de dispensa"
          />
        </div>
        <span>
          <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
              <span class="text-subtitle2">Membros</span>
            </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm" />
          </div>
          <span v-if="loadedData">
            <span v-for="member in selectedGroup.members" :key="member.id">
              <addMemberDispense :member="member" v-if="loadedData" />
            </span>
          </span>
        </span>
      </div>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn
          label="Cancelar"
          color="red"
          @click="$emit('close')"
          v-close-popup
        />
        <q-btn
          type="submit"
          :disable="!stockIndicator"
          :loading="submitting"
          label="Dispensar"
          color="primary"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>
<script setup>
import { computed, inject, onMounted, provide, reactive, ref } from 'vue';
import { date } from 'quasar';
import GroupPackHeader from '../../stores/models/group/GroupPackHeader';
import PackagedDrug from '../../stores/models/packagedDrug/PackagedDrug';
import PackagedDrugStock from '../../stores/models/packagedDrug/PackagedDrugStock';
import PatientVisitDetails from '../../stores/models/patientVisitDetails/PatientVisitDetails';
import moment from 'moment';
import { useGroupMember } from 'src/composables/group/groupMemberMethods';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import patientService from 'src/services/api/patientService/patientService';
import durationService from 'src/services/api/duration/durationService';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';
import episodeService from 'src/services/api/episode/episodeService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import StockService from 'src/services/api/stockService/StockService';
import drugService from 'src/services/api/drugService/drugService';
import groupPackHeaderService from 'src/services/api/groupPackHeader/groupPackHeaderService';
import addMemberDispense from 'src/components/Groups/AddMemberDispense.vue';
import { v4 as uuidv4 } from 'uuid';
import { useGroupMemberPrescription } from 'src/composables/group/groupMemberPrescriptionMethods';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import clinicService from 'src/services/api/clinicService/clinicService';
// import isOnline from 'is-online';

const {
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
  getJSDateFromDDMMYYY,
  getDateFormatYYYYMMDDFromDDMMYYYY,
  extractHyphenDateFromDMYConvertYMD,
} = useDateUtils();
const { alertSucess, alertError } = useSwal();
const { closeLoading, showloading } = useLoading();
const { isOnline } = useSystemUtils();

const { getQtyPrescribed } = usePrescribedDrug();

const nextPDate = ref('');
const pickupDate = ref('');
const drugsDuration = ref('');
const dispenseMode = ref('');

const clinic = inject('clinic');
let curGroupPackHeader = reactive(ref(new GroupPackHeader({ id: uuidv4() })));
let selectedVisitDetails = reactive(ref(new PatientVisitDetails()));
const showAddEditDrug = ref(false);
const hasTherapeuticalRegimen = ref(false);
const patientVisitDetailsToAdd = ref([]);
const showDispensesData = ref(true);
const step = 'display';
const selectedGroup = inject('group');
const loadedData = ref(false);
const defaultPickUpDate = inject('defaultPickUpDate');
const membersDispenses = ref(new Map());
// const date = ref(moment(date).format('YYYY/MM/DD'))
const curIdentifier = ref('');
const curPrescriptionDetail = ref('');
const curVisitDetails = ref('');
const submitting = ref(false);
const loadMemberInfoToShowByGroupId = inject('loadMemberInfoToShowByGroupId');
const getGroupMembers = inject('getGroupMembers');
const showNewPackingForm = inject('showNewPackingForm');
const groupMembersNew = inject('groupMembersNew');

const drugQuantities = new Map();
const stockIndicator = ref(true);

const loadDetails = () => {
  if (defaultPickUpDate !== undefined && defaultPickUpDate.value !== null) {
    pickupDate.value = getDDMMYYYFromJSDate(defaultPickUpDate);
  }
  if (!isOnline.value) {
    drugService.getAllDrugs();
    durationService.getAllFromStorage();
    dispenseModeService.getAllFromStorage();
  }
};

const blockDataFutura = (date) => {
  return date <= moment(new Date()).format('YYYY/MM/DD');
};

const getNextPickUpDate = () => {
  const dates = [];
  if (selectedGroup.value.packHeaders.length > 0) {
    selectedGroup.value.packHeaders.forEach((header) => {
      dates.push(new Date(selectedGroup.value.packHeaders.nextPickUpDate));
    });
  } else {
    selectedGroup.value.members.forEach((member) => {
      dates.push(
        new Date(
          usePrescription().lastPackOnPrescription(
            useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
              .prescription
          ).nextPickUpDate
        )
      );
    });
  }
  return new Date(Math.max.apply(null, dates));
};

const checkMembersPrescriptions = () => {
  let error = 'Os seguintes pacientes possuem prescrições inválidas [';
  let invalidPrescription = '';
  selectedGroup.value.members.forEach((member) => {
    let remainingDuration = 0;
    if (member.groupMemberPrescriptions[0] !== null) {
      remainingDuration = usePrescription().remainigDuration(
        member.groupMemberPrescriptions[0].prescription
      );
    }
    if (
      (useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
        .prescription.leftDuration <= 0 &&
        member.groupMemberPrescriptions[0] === null) ||
      remainingDuration <= 0
    ) {
      invalidPrescription +=
        invalidPrescription === ''
          ? usePatient().fullName(member.patient)
          : ', ' + usePatient().fullName(member.patient);
    }
  });
  if (invalidPrescription !== '') {
    error += invalidPrescription + ']';
    return error;
  } else {
    return null;
  }
};

const checkMembersPrescriptionsDuration = () => {
  let error =
    'A duração das prescrições é menor em relação a duração que pretende dispensar para os seguintes pacientes: [';
  let invalidPrescription = '';

  selectedGroup.value.members.forEach((member) => {
    let remainingDuration = 0;
    if (member.groupMemberPrescriptions[0] !== null) {
      remainingDuration = usePrescription().remainigDurationInWeeks(
        member.groupMemberPrescriptions[0].prescription
      );
    }
    if (
      remainingDuration <
      durationService.getDurationById(drugsDuration.value.id).weeks
    ) {
      invalidPrescription +=
        invalidPrescription === ''
          ? usePatient().fullName(member.patient)
          : ', ' + usePatient().fullName(member.patient);
    }
  });

  /*
  groupMembersNew.value.forEach((gm) => {
    const member = groupMemberService.getMemberById(gm.groupMemberId);
    const validityInWeeks =
      gm.lastPrescriptionDateMember === null
        ? Number(gm.validade * 4)
        : Number(gm.validadeNova * 4);
    if (
      validityInWeeks <
      durationService.getDurationById(drugsDuration.value.id).weeks
    ) {
      invalidPrescription +=
        invalidPrescription === ''
          ? usePatient().fullName(member.patient)
          : ', ' + usePatient().fullName(member.patient);
    }
  });
*/
  if (invalidPrescription !== '') {
    error += invalidPrescription + ']';
    return error;
  } else {
    return null;
  }
};

const doFormValidation = () => {
  submitting.value = true;
  const momentPickUpdate = getDateFormatYYYYMMDDFromDDMMYYYY(pickupDate);
  const nextPickUpDate = getDateFormatYYYYMMDDFromDDMMYYYY(getNextPickUpDate());
  const momentNextPickUpdate = getDateFormatYYYYMMDDFromDDMMYYYY(nextPDate);
  let prescriptionError = checkMembersPrescriptions();
  prescriptionError = checkMembersPrescriptionsDuration();
  if (prescriptionError !== null) {
    alertError(prescriptionError);
    submitting.value = false;
  } else if (pickupDate.value === '' || pickupDate.value === undefined) {
    alertError(prescriptionError);
    submitting.value = false;
  } else if (
    extractHyphenDateFromDMYConvertYMD(pickupDate) >
    moment().format('YYYY-MM-DD')
  ) {
    alertError('A data da dispensa indicada é maior que a data da corrente.');
    submitting.value = false;
  } else if (moment(momentPickUpdate).isBefore(nextPickUpDate, 'day')) {
    alertError(
      'A data da dispensa não pode ser anterior a ' +
        getDDMMYYYFromJSDate(getNextPickUpDate())
    );
    submitting.value = false;
  } else if (drugsDuration.value === '') {
    alertError('Por favor, o período para o qual está a efectuar a dispensa.');
    submitting.value = false;
  } else if (nextPDate.value === '' || nextPDate.value === undefined) {
    alertError('Por favor, indique a data do próximo levantamento.');
    submitting.value = false;
  } else if (moment(momentNextPickUpdate).isBefore(momentPickUpdate)) {
    alertError(
      'A data do próximo levantamento não pode ser anterior a data do levantamento.'
    );
    submitting.value = false;
  } else if (dispenseMode.value === '') {
    alertError('Por favor indicar o modo de dispensa.');
    submitting.value = false;
  } else {
    const prescriptionDateError = checkMembersPrescriptionsDate(pickupDate);
    if (prescriptionDateError !== null) {
      alertError(prescriptionDateError);
      submitting.value = false;
    } else {
      generatepacks();
    }
  }
};

const executeGetGroupMembers = () => {
  if (!isOnline.value) {
    getGroupMembers(true);
  } else {
    loadMemberInfoToShowByGroupId();
  }
};

const checkMembersPrescriptionsDate = (pickupDate) => {
  let error =
    'A data de levantamento não pode ser menor que a data das ultimas prescrições dos pacientes : [';
  let invalidPrescription = '';
  selectedGroup.value.members.forEach((member) => {
    let memberPrescriptionDate = '';
    if (member.groupMemberPrescriptions[0] !== null) {
      memberPrescriptionDate = moment(
        member.groupMemberPrescriptions[0].prescription.prescriptionDate
      ).format('YYYY-MM-DD');
    } else {
      memberPrescriptionDate = useEpisode().lastVisit(
        member.patient.identifiers[0].episodes[0]
      ).prescription.prescriptionDate;
    }
    const dispenseDate = moment(pickupDate.value, 'DD-MM-YYYY').format(
      'YYYY-MM-DD'
    );
    if (moment(dispenseDate).isBefore(memberPrescriptionDate, 'day')) {
      invalidPrescription +=
        invalidPrescription === ''
          ? member.patient.fullName
          : ', ' + member.patient.fullName;
    }
  });
  if (invalidPrescription !== '') {
    error += invalidPrescription + ']';
    return error;
  } else {
    return null;
  }
};

const expandLess = (value) => {
  showDispensesData.value = !value;
};

const addPrescribedDrug = (prescribedDrug, visitDetails) => {
  visitDetails = curVisitDetails;
  //  prescribedDrug.prescription_id = visitDetails.prescription.id
  selectedGroup.value.members.forEach((member) => {
    let prescribedDrugs;
    if (member.groupMemberPrescriptions[0] != null) {
      prescribedDrugs =
        member.groupMemberPrescriptions[0].prescription.prescribedDrugs;
    } else {
      prescribedDrugs = useEpisode().lastVisit(
        member.patient.identifiers[0].episodes[0]
      ).prescription.prescribedDrugs;
    }
    const psdrugExists = prescribedDrugs.some((pd) => {
      return (
        pd.drug.id === prescribedDrug.drug.id &&
        member.patient.id === curIdentifier.value.patient_id
      );
    });
    if (psdrugExists) {
      alertError(
        'O medicamento seleccionado não pode ser adicionado, pois já existe na lista a dispensar para o membro [' +
          usePatient().fullName(member.patient) +
          ']'
      );
    } else {
      if (
        member.groupMemberPrescriptions[0] != null &&
        member.patient.id === curIdentifier.value.patient_id
      ) {
        prescribedDrug.prescription_id =
          member.groupMemberPrescriptions[0].prescription.id;
        // member.groupMemberPrescriptions[0].prescription.prescribedDrugs.push(prescribedDrug)
        const pack = membersDispenses.value.get(member);
        pack.packagedDrugs.push(new PackagedDrug(prescribedDrug));
      } else {
        if (
          useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
            .prescription.id ===
          member.groupMemberPrescriptions[0].prescription.id
        ) {
          // useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).prescription.prescribedDrugs.push(prescribedDrug)
        }
      }
    }
  });
  showAddEditDrug.value = false;
};

const checkStock = async (curPack, prescribedDrug) => {
  const qtyPrescribed = getQtyPrescribed(prescribedDrug, curPack.weeksSupply);

  const prescrDate = getYYYYMMDDFromJSDate(
    getDateFromHyphenDDMMYYYY(pickupDate.value)
  );
  const resp = await StockService.checkStockStatus(
    prescribedDrug.drug.id,
    prescrDate,
    qtyPrescribed,
    clinicService.currClinic().id,
    curPack.weeksSupply
  );
  return resp;
};

const getValidStockOnline = async (packDate, prescribedDrug) => {
  const packDatee = getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(packDate));
  const resp = await StockService.getValidStockByDrugAndPickUpDateOnline(
    prescribedDrug.drug.id,
    packDatee
  );
  return resp;
};

const validateStockPacks = async (pack) => {
  let drugErrors = '';
  for (const pcdDrugs of pack.packagedDrugs) {
    const hasStock = await checkStock(pack, pcdDrugs);
    const stocksO = await StockService.getValidStockByDrugAndPickUpDateOnline(
      pcdDrugs.drug.id,
      pack.pickupDate
    );
    let allAvalibleValidStock;
    if (hasStock) {
      const stocks = StockService.getValidStockByDrugAndPickUpDate(
        pcdDrugs.drug.id,
        getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(pickupDate.value))
      );
      const validStock = stocks.filter((item) => {
        return new Date(item.expireDate) > new Date() && item.stockMoviment > 0;
      });
      let i = 0;
      validStock.forEach((stock) => {
        allAvalibleValidStock += stock.stockMoviment;
      });
      if (allAvalibleValidStock < pcdDrugs.quantitySupplied) {
        drugErrors +=
          drugErrors === '' ? pcdDrugs.drug.name : ', ' + pcdDrugs.drug.name;
      }
    } else {
      drugErrors +=
        drugErrors === '' ? pcdDrugs.drug.name : ', ' + pcdDrugs.drug.name;
    }
    return drugErrors;
  }
};

const generateCurrGroupPackHeader = async () => {
  let drugErrors = '';
  for (const groupPack of curGroupPackHeader.value.groupPacks) {
    groupPack.pack.packDate = curGroupPackHeader.value.packDate;
    groupPack.pack.pickupDate = curGroupPackHeader.value.packDate;
    groupPack.pack.nextPickUpDate = curGroupPackHeader.value.nextPickUpDate;
    groupPack.pack.weeksSupply = durationService.getDurationById(
      curGroupPackHeader.value.duration.id
    ).weeks;
    // groupPack.pack.dispenseMode = dispenseMode.value;
    groupPack.pack.dispenseMode = {};
    groupPack.pack.dispenseMode.id = dispenseMode.value.id;
    // groupPack.pack.clinic = clinic.value;
    groupPack.pack.clinic = {};
    groupPack.pack.clinic.id = clinic.value.id;
    // if (drugerror !== undefined) error += drugerror;
    // return drugerror;
    for (const pcdDrugs of groupPack.pack.packagedDrugs) {
      const hasStock = await checkStock(groupPack.pack, pcdDrugs);
      const stocksO = await StockService.getValidStockByDrugAndPickUpDateOnline(
        pcdDrugs.drug.id,
        groupPack.pack.pickupDate
      );
      let allAvalibleValidStock;
      if (hasStock) {
        const stocks = StockService.getValidStockByDrugAndPickUpDate(
          pcdDrugs.drug.id,
          getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(pickupDate.value))
        );
        const validStock = stocks.filter((item) => {
          return (
            new Date(item.expireDate) > new Date() && item.stockMoviment > 0
          );
        });
        let i = 0;
        validStock.forEach((stock) => {
          allAvalibleValidStock += stock.stockMoviment;
        });
        if (allAvalibleValidStock < pcdDrugs.quantitySupplied) {
          drugErrors +=
            drugErrors === '' ? pcdDrugs.drug.name : ', ' + pcdDrugs.drug.name;
        }
      } else {
        drugErrors +=
          drugErrors === '' ? pcdDrugs.drug.name : ', ' + pcdDrugs.drug.name;
      }
      //return drugErrors;
    }
    if (drugErrors !== '') {
      return drugErrors;
    } else {
      Object.keys(groupPack.pack.packagedDrugs).forEach(
        function (k) {
          const packagedDrugStocks = [];
          const stocksToMoviment = [];
          const packagedDrug = groupPack.pack.packagedDrugs[k];
          let quantitySupplied = packagedDrug.quantitySupplied;
          // const packDrug = new PackagedDrug()
          const stocks = StockService.getValidStockByDrugAndPickUpDate(
            packagedDrug.drug.id,
            getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(pickupDate.value))
          );

          const validStock = stocks.filter((item) => {
            return (
              new Date(item.expireDate) > new Date() && item.stockMoviment > 0
            );
          });

          let i = 0;
          while (quantitySupplied > 0) {
            if (validStock[i].stockMoviment >= quantitySupplied) {
              validStock[i].stockMoviment = Number(
                validStock[i].stockMoviment - quantitySupplied
              );
              stocksToMoviment.push(validStock[i]);
              quantitySupplied = 0;
              const packagedDrugStock = new PackagedDrugStock({
                id: uuidv4(),
              });
              /*
            packagedDrugStock.drug = drugService.getDrugById(
              packagedDrug.drug.id
            );
            */
              packagedDrugStock.drug = {};
              packagedDrugStock.drug.id = packagedDrug.drug.id;
              //   packagedDrugStock.stock = validStock[i];
              packagedDrugStock.stock = {};
              packagedDrugStock.stock.id = validStock[i].id;
              packagedDrugStock.quantitySupplied =
                packagedDrug.quantitySupplied;
              packagedDrugStock.creationDate = new Date();
              packagedDrugStocks.push(packagedDrugStock);
            } else {
              const availableBalance = validStock[i].stockMoviment;
              qtyPrescribed = Number(
                qtyPrescribed - validStock[i].stockMoviment
              );
              validStock[i].stockMoviment = 0;
              stocksToMoviment.push(validStock[i]);
              const packagedDrugStock = new PackagedDrugStock();
              /*
            packagedDrugStock.drug = drugService.getDrugById(
              packagedDrug.drug.id
            );
            */
              packagedDrugStock.drug = {};
              packagedDrugStock.drug.id = packagedDrug.drug.id;
              //   packagedDrugStock.stock = validStock[i];
              packagedDrugStock.stock = {};
              packagedDrugStock.stock.id = validStock[i].id;
              packagedDrugStock.quantitySupplied = availableBalance;
              packagedDrugStock.creationDate = new Date();
              i = i + 1;
            }
          }
          const clinicalServiceId = packagedDrug.drug.clinicalService.id;
          packagedDrug.drug.clinicalService = {};
          packagedDrug.drug.clinicalService.id = clinicalServiceId;
          packagedDrug.drug.therapeuticRegimenList = [];
          packagedDrug.packagedDrugStocks = packagedDrugStocks;
          groupPack.pack.patientVisitDetails[0].patientVisit.visitDate =
            curGroupPackHeader.value.packDate;
        }.bind(this)
      );
    }
  }
  return drugErrors;
};

const generatepacks = async () => {
  showloading();
  let errorMsg = 'Não existe stock suficiente do medicamento [';
  initGroupPackHeader();
  console.log(selectedGroup.value.members);
  generateCurrGroupPackHeader().then((drugErrors) => {
    if (
      drugErrors !== undefined &&
      drugErrors !== null &&
      drugErrors.length > 0
    ) {
      errorMsg += drugErrors + ']';
      alertError(drugErrors);
      submitting.value = false;
      closeLoading();
    } else {
      const i = 0;
      showloading();
      savePatientVisitDetails(curGroupPackHeader.value.groupPacks, i);
    }
  });
};

const savePatientVisitDetails = (groupPacks, i) => {
  if (!isOnline.value) {
    if (groupPacks[i] !== null && groupPacks[i] !== undefined) {
      const patientVisit =
        groupPacks[i].pack.patientVisitDetails[0].patientVisit;

      patientVisit.patientVisitDetails.push(
        groupPacks[i].pack.patientVisitDetails[0]
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
      patientVisit.patientVisitDetails[0].pack = groupPacks[i].pack;
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
      groupPacks[i].patientVisit = patientVisit;
      //  PatientVisit.localDbAdd(patientVisit);
      //  PatientVisit.insert({ data: patientVisit });

      i = i + 1;
      setTimeout(savePatientVisitDetails(groupPacks, i), 4);
    } else {
      curGroupPackHeader.value = JSON.parse(
        JSON.stringify(curGroupPackHeader.value)
      );
      curGroupPackHeader.value.groupPacks.forEach((groupPack) => {
        groupPack.pack.patientVisitDetails = [];
        groupPack.pack_id = groupPack.pack.id;
        groupPack.header_id = curGroupPackHeader.id;
        groupPack.syncStatus = 'R';
      });
      curGroupPackHeader.value.duration_id =
        curGroupPackHeader.value.duration.id;
      curGroupPackHeader.value.group_id = selectedGroup.value.id;
      curGroupPackHeader.value.group = null;
      groupPackHeaderService.apiSave(curGroupPackHeader.value).then((resp) => {
        alertSucess('Operação efectuada com sucesso.');
        submitting.value = false;
        showNewPackingForm.value = false;
        loadedData.value = false;
        executeGetGroupMembers();
        closeLoading();
        // $emit('getGroupMembers', false)
        //  emit('getGroupMembers');
      });
    }
  } else {
    if (groupPacks[i] !== null && groupPacks[i] !== undefined) {
      // groupPacks[i].pack.patientVisitDetails[0].patientVisit.visitDate = curGroupPackHeader.packDate
      const patientVisit = Object.assign(
        {},
        groupPacks[i].pack.patientVisitDetails[0].patientVisit
      );
      patientVisit.patientVisitDetails.push(
        groupPacks[i].pack.patientVisitDetails[0]
      );
      patientVisit.patientVisitDetails[0].patientVisit = null;
      groupPacks[i].pack.patientVisitDetails = [];
      groupPacks[i].pack.packagedDrugs.forEach((pck) => {
        pck.drug.stocks = [];
        //   pck.form.drugs = []
        pck.drug.form.drugs = [];
        pck.drug.therapeuticRegimenList = [];
        pck.drug.clinicalService.drugs = [];
        pck.drug.packagedDrugStocks = [];
        pck.drug.packaged_drugs = [];
      });
      patientVisit.patientVisitDetails[0].pack = groupPacks[i].pack;
      patientVisit.patientVisitDetails[0].prescription.prescribedDrugs.forEach(
        (pd) => {
          pd.drug.therapeuticRegimenList = [];
          pd.drug.packaged_drugs = [];
          pd.drug.stocks = [];
        }
      );

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
      groupPacks[i].patientVisit = patientVisit;
      i = i + 1;
      setTimeout(savePatientVisitDetails(groupPacks, i), 4);
    } else {
      curGroupPackHeader.value.groupPacks.forEach((groupPack) => {
        groupPack.pack.patientVisitDetails = [];
        groupPack.pack_id = groupPack.pack.id;
      });
      groupPackHeaderService
        .apiSave(curGroupPackHeader.value)
        .then((resp) => {
          groupPackHeaderService.apiFetchById(curGroupPackHeader.value.id);
          closeLoading();
          submitting.value = false;
          showNewPackingForm.value = false;
          loadedData.value = false;
          executeGetGroupMembers();
          alertSucess('Operação efectuada com sucesso.');
        })
        .catch((error) => {
          submitting.value = false;
          const listErrors = [];
          console.log(error);
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response);
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
          }
          alertError('error', listErrors);
        });
    }
  }
};

const initGroupPackHeader = () => {
  // curGroupPackHeader = new GroupPackHeader()
  // curGroupPackHeader.value.group = selectedGroup.value;
  curGroupPackHeader.value.group = {};
  curGroupPackHeader.value.group.id = selectedGroup.value.id;
  // curGroupPackHeader.value.duration = drugsDuration.value;
  curGroupPackHeader.value.duration = {};
  curGroupPackHeader.value.duration.id = drugsDuration.value.id;
  curGroupPackHeader.value.packDate = getJSDateFromDDMMYYY(pickupDate.value);
  curGroupPackHeader.value.nextPickUpDate = getJSDateFromDDMMYYY(
    nextPDate.value
  );
};

const loadGroup = () => {
  // const group = selectedGroup.value
  selectedGroup.value.members = selectedGroup.value.members.filter((member) => {
    return useGroupMember().isActive(member);
  });
  selectedGroup.value.members.forEach((member) => {
    member.groupMemberPrescriptions[0] =
      groupMemberPrescriptionService.getGroupMemberPrescriptionByMemberId(
        member.id
      );
    member.patient = patientService.getPatienWithstByID(member.patient_id);

    member.patient.identifiers = member.patient.identifiers.filter(
      (identifier) => {
        return identifier.service.id === selectedGroup.value.service.id;
      }
    );
    //  member.patient.identifiers[0].episodes = [];
    member.patient.identifiers[0].episodes[0] =
      lastStartEpisodeWithPrescription(member.patient.identifiers[0].id);
  });
  loadedData.value = true;
  //  selectedGroup = group
  return selectedGroup;
};

const lastStartEpisodeWithPrescription = (identifierId) => {
  return episodeService.getStartEpisodeByIdentifierId(identifierId);
};

const determineNextPickUpDate = () => {
  if (
    date.isValid(getJSDateFromDDMMYYY(pickupDate.value)) &&
    drugsDuration.value !== ''
  ) {
    const newDate = getJSDateFromDDMMYYY(pickupDate.value);
    let lostDays = parseInt((drugsDuration.value.weeks / 4) * 2);
    if (drugsDuration.value.weeks <= 1) lostDays = 0;
    const daysToAdd = parseInt(drugsDuration.value.weeks * 7 + lostDays);
    nextPDate.value = getDDMMYYYFromJSDate(
      date.addToDate(newDate, { days: daysToAdd })
    );
  }
};

const durations = computed(() => {
  return durationService.getAllFromStorage();
});

const dispenseModes = computed(() => {
  return dispenseModeService.getAllFromStorage();
});

onMounted(() => {
  loadGroup();
  loadDetails();
  //  initDispenses()
});

provide('curIdentifier', curIdentifier);
provide('curPrescriptionDetail', curPrescriptionDetail);
provide('addPrescribedDrug', addPrescribedDrug);
provide('drugsDuration', drugsDuration);
provide('generatepacks', generatepacks);
provide('loadGroup', loadGroup);
provide('membersDispenses', membersDispenses);
provide('curGroupPackHeader', curGroupPackHeader);
provide('pickupDate', pickupDate);
provide('stockIndicator', stockIndicator);
provide('drugQuantities', drugQuantities);
</script>
<style></style>
