<template>
  <ListHeader
    :mainContainer="true"
    :expandVisible="true"
    @expand="expand"
    bgColor="bg-primary"
  >{{ usePatient().preferedIdentifier(member.patient).value }} - {{usePatient().fullName(member.patient)}}
  </ListHeader>
  <div v-if="infoVisible">
    <span class="text-bold text-subtitle1 vertical-middle q-pl-md">Medicamentos Prescritos</span>
    <q-table
      flat
      bordered
      dense
      hide-bottom
      v-if="showDispensesData"
      :rows="member.groupMemberPrescription !== null ? member.groupMemberPrescription.prescription.prescribedDrugs :  useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).prescription.prescribedDrugs"
      :columns="columns1"
      row-key="id"
    >
      <template #body="props">
        <q-tr
          no-hover
          :props="props"
        >
          <q-td
            key="drug"
            :props="props"
          >
            {{ props.row.drug.name }}
          </q-td>

          <q-td
            key="dosage"
            :props="props"
          >
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

          <q-td
            auto-width
            key="packs"
            :props="props"
          >
            {{
          usePrescribedDrug().getQtyPrescribed(props.row, member.groupMemberPrescription !== null ? member.groupMemberPrescription.prescription.duration.weeks :  useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).prescription.duration.weeks) >
               0
                 ? usePrescribedDrug().getQtyPrescribed(
                     props.row,
                     member.groupMemberPrescription !== null ? member.groupMemberPrescription.prescription.duration.weeks :  useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).prescription.duration.weeks
                   )
                 : 1
             }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-separator
      color="grey-13"
      size="1px"
      class="q-mb-sm"
    />
  </div>
  <div
    class="col"
    v-if="infoVisible"
  >
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
        <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
          <span>
            Nenhum Medicamento Indicado
          </span>
          <q-icon
            size="2em"
            :name="filter ? 'filter_b_and_w' : icon"
          />
        </div>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td
            key="order"
            :props="props"
          >
          </q-td>
          <q-td
            key="drug"
            :props="props"
          >
            {{props.row.drug.name}}
          </q-td>
          <q-td
            key="packSize"
            :props="props"
          >
            {{props.row.drug.packSize}}
          </q-td>
          <q-td
            key="form"
            :props="props"
          >
            {{props.row.drug.form.description}}
          </q-td>
          <q-td
            key="takeInstrucions"
            :props="props"
          >
            {{props.row.drug.defaultTreatment}} - {{props.row.drug.defaultTimes}}X por {{props.row.drug.defaultPeriodTreatment}}
          </q-td>
          <q-td
            key="packs"
            :props="props"
          >
            {{ usePrescribedDrug().getQtyPrescribed(props.row , drugsDuration.weeks ) }}

          </q-td>
          <q-td
            key="options"
            :props="props"
          >
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
  <q-dialog
    persistent
    v-model="showAddEditDrug"
  >
    <AddEditPrescribedDrug
      :visitDetails="selectedVisitDetails"
      :hasTherapeuticalRegimen="hasTherapeuticalRegimen"
      @close="showAddEditDrug = false"
    />
  </q-dialog>
</template>
<script setup>
import { computed, inject, onMounted, provide, reactive, ref } from 'vue';
import GroupPack from '../../stores/models/group/GroupPack'
import Pack from '../../stores/models/packaging/Pack'
import PackagedDrug from '../../stores/models/packagedDrug/PackagedDrug'
import PackagedDrugStock from '../../stores/models/packagedDrug/PackagedDrugStock'
import PatientVisitDetails from '../../stores/models/patientVisitDetails/PatientVisitDetails'
import PatientVisit from '../../stores/models/patientVisit/PatientVisit'
import Prescription from '../../stores/models/prescription/Prescription'
import ClinicalService from '../../stores/models/ClinicalService/ClinicalService'
import PrescriptionDetail from '../../stores/models/prescriptionDetails/PrescriptionDetail'
import GroupMemberPrescription from '../../stores/models/group/GroupMemberPrescription'
// import mixinplatform from 'src/mixins/mixin-system-platform'
// import mixinutils from 'src/mixins/mixin-utils'
import {  useGroup } from 'src/composables/group/groupMethods';
import { useGroupMember } from 'src/composables/group/groupMemberMethods';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods'
import {  usePatient } from 'src/composables/patient/patientMethods';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods'
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService'
import episodeService from 'src/services/api/episode/episodeService'
import { useLoading } from 'src/composables/shared/loading/loading';
// import packService from 'src/services/api/pack/packService';
import ListHeader from 'components/Shared/ListHeader.vue';
import AddEditPrescribedDrug from 'components/Patient/PatientPanel/AddEditPrescribedDrug.vue'
import drugService from 'src/services/api/drugService/drugService';
import groupPackHeaderService from 'src/services/api/groupPackHeader/groupPackHeaderService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import formService from 'src/services/api/formService/formService';
import { v4 as uuidv4 } from 'uuid';
const columns = [
  { name: 'order', align: 'left', label: 'Ordem', sortable: false },
  { name: 'drug', align: 'left', label: 'Medicamento', sortable: false },
  { name: 'packSize', align: 'left', label: 'Quantidade no Frasco', sortable: false },
  { name: 'form', align: 'left', label: 'Forma', sortable: false },
  { name: 'takeInstrucions', align: 'left', label: 'Instrução de Toma', sortable: false },
  { name: 'packs', align: 'left', label: 'Número de Frascos', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]

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
  }
];

const props = defineProps(['member']);

const { alertSucess, alertError, alertInfo,alertWarningAction } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile } = useSystemUtils();

const clinic = inject('clinic');
// let selectedGroup = reactive(ref(null));
let selectedVisitDetails = reactive(ref(new PatientVisitDetails()));
const showAddEditDrug = ref(false);
const hasTherapeuticalRegimen = ref(false);
const patientVisitDetailsToAdd = ref([]);
const showDispensesData = ref(false);
const selectedGroup =  inject('group');
console.log(selectedGroup)
const loadedData = ref(false)
const defaultPickUpDate = ref(null)
const membersDispenses = inject('membersDispenses');
const curIdentifier = ref('')
const curPrescriptionDetail = ref ('')
const curVisitDetails = ref('')
const drugsDuration = inject('drugsDuration');
const infoVisible = ref(true);
const curGroupPackHeader = inject('curGroupPackHeader')


const expand = (valueUpdated) => {
  infoVisible.value = valueUpdated;
};


const initDispenses = () => {
 
  let prescription
        if (props.member.groupMemberPrescription != null) {
          prescription = props.member.groupMemberPrescription.prescription
        } else {
          prescription = useEpisode().lastVisit(props.member.patient.identifiers[0].episodes[0]).prescription
        }
const patientVisitDetails = new PatientVisitDetails({
                                           id: uuidv4()
                                          })
const groupPack = new GroupPack({ id: uuidv4()
                                          })
     const pack = new Pack({id: uuidv4() })
     const patientVisit = new PatientVisit({
                                           id: uuidv4(),
                                            patient: props.member.patient,
                                            clinic: props.member.patient.clinic
                                          })
           console.log(patientVisit)
     prescription.prescribedDrugs.forEach(prescD => {
      const packDrug = new PackagedDrug()
      packDrug.id = uuidv4()
      packDrug.amtPerTime = prescD.amtPerTime;
      packDrug.timesPerDay = prescD.timesPerDay;
      packDrug.form =  prescD.form;
      packDrug.drug = drugService.getDrugById(prescD.drug.id)
      packDrug.quantitySupplied = prescD.qtyPrescribed
     // packDrug.toContinue = prescD.toContinue
      packDrug.creationDate = new Date()
      pack.packagedDrugs.push(packDrug)
     })
     patientVisitDetails.prescription = prescription
     patientVisitDetails.pack =  pack
     patientVisitDetails.clinic = props.member.patient.clinic
     patientVisitDetails.episode = episodeService.getEpisodeById(props.member.patient.identifiers[0].episodes[0].id)
     patientVisitDetails.patientVisit = patientVisit
     pack.syncStatus = props.member.patient.his_id.length > 10 ? 'R' : 'N'
     pack.patientVisitDetails.push(patientVisitDetails)
    membersDispenses.value.set(props.member, pack)
    groupPack.pack = pack
    curGroupPackHeader.value.groupPacks.push(groupPack)
    showDispensesData.value= true
    closeLoading();
}

const openAddPrescribedDrugForm = () => {  

    console.log(props.member)
    const pack = membersDispenses.value.get(props.member)
    console.log(pack.patientVisitDetails[0].prescription.prescriptionDetails[0])
    // props.member.patient.identifiers[0].service = clinicalServiceService.getClinicalServicePersonalizedById(props.member.patient.identifiers[0].service.id)[0]
    curIdentifier.value = patientServiceIdentifierService.curIdentifierById(props.member.patient.identifiers[0].id)
    curPrescriptionDetail.value = prescriptionDetailsService.getPrescriptionDetailByID(pack.patientVisitDetails[0].prescription.prescriptionDetails[0].id)
    curVisitDetails.value = pack.patientVisitDetails[0]
    console.log(curIdentifier.value)
    console.log(curPrescriptionDetail.value)

     showAddEditDrug.value = true
    }

const getForm = (id) => {
  return formService.getFormById(id)
 }

   
const  removePrescribedDrug = (prescribedDrug) => {
  console.log(selectedGroup)
    const pack = membersDispenses.value.get(props.member)
    const newPackagedDrugs = pack.packagedDrugs.filter((prescDr) => {
            return prescDr.drug.id !== prescribedDrug.drug.id
          })
      pack.packagedDrugs = newPackagedDrugs
          console.log(pack)
    }

    const addPrescribedDrug =  (prescribedDrug, visitDetails) => {
      console.log(visitDetails)
      visitDetails = curVisitDetails
      console.log(visitDetails)
    //  prescribedDrug.prescription_id = visitDetails.prescription.id
        const pack = membersDispenses.value.get(props.member)
        const psdrugExists = pack.packagedDrugs.some((pd) => {
          return pd.drug.id === prescribedDrug.drug.id 
        })
        if (psdrugExists) {
          alertError('O medicamento seleccionado não pode ser adicionado, pois já existe na lista a dispensar para o membro [' + usePatient().fullName(member.patient) + ']')
        } else {
          pack.packagedDrugs.push(new PackagedDrug(prescribedDrug))
          console.log(pack.packagedDrugs)
        }
      showAddEditDrug.value = false
    }




onMounted(() => {
   initDispenses()
});



provide('curIdentifier', curIdentifier);
provide('curPrescriptionDetail', curPrescriptionDetail);
provide('addPrescribedDrug', addPrescribedDrug);
provide('showAddEditDrug', showAddEditDrug)
</script>