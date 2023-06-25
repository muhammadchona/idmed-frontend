<template>
  <div>
    <ListHeader
      :addVisible="!useGroup().isDesintegrated(selectedGroup)"
      :mainContainer="true"
      :expandVisible="true"
      @expandLess="expandLess"
      :addButtonActions="newPacking"
      bgColor="bg-primary"
    >Dispensas Efectuadas
    </ListHeader>
    <div
      class="q-mb-md box-border"
      v-if="showDispensesData"
    >
      <q-table
        class="col"
        dense
        flat
        :rows="headers"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
            <span>
              Nenhuma dispensa efectuada
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
              key="lastDispenseDate"
              :props="props"
            >
              {{getDDMMYYYFromJSDate(props.row.packDate)}}
            </q-td>
            <q-td
              key="nextPickupDate"
              :props="props"
            >
              {{getDDMMYYYFromJSDate(props.row.nextPickUpDate)}}
            </q-td>
            <q-td
              key="duration"
              :props="props"
            >
              {{ props.row.duration !== null ? props.row.duration.weeks / 4 : ''}} mes(es)
            </q-td>
            <q-td
              key="pickUpDays"
              :props="props"
            >
              Passam {{getDateDiff(new Date(), props.row.packDate)}} dias após o último levantamento
            </q-td>
            <q-td
              key="options"
              :props="props"
            >
              <div class="col">
                <q-btn
                  flat
                  round
                  :disable="!props.row.isLast || !useGroup().isDesintegrated(selectedGroup)"
                  color="red-8"
                  icon="delete"
                  @click="removePackHeader(props.row)"
                >
                  <q-tooltip class="bg-red-5">Remover</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
  <q-dialog
    persistent
    v-model="showNewPackingForm"
  >
    <groupPack
      v-if="dataFetchDone"
      @getGroupMembers="getGroupMembers"
      @close="showNewPackingForm = false"
    />
  </q-dialog>
</template>

<script setup>
import { computed, inject, provide, ref } from 'vue';
import { date, SessionStorage } from 'quasar'
import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails'
import Pack from 'src/stores/models/packaging/Pack'
import PatientVisit from '../../../stores/models/patientVisit/PatientVisit'
import Prescription from '../../../stores/models/prescription/Prescription'
import groupPackHeaderService from 'src/services/api/groupPackHeader/groupPackHeaderService';
import groupService from 'src/services/api/group/groupService';
import groupPackService from 'src/services/api/groupPack/groupPackService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import packService from 'src/services/api/pack/packService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import {  useGroup } from 'src/composables/group/groupMethods';
import groupPack from 'src/components/Groups/GroupDispense.vue';
import ListHeader from 'src/components/Shared/ListHeader.vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
const columns = [
  { name: 'order', align: 'left', label: 'Ordem', sortable: false },
  { name: 'lastDispenseDate', align: 'left', label: 'Data da Última Dispensa', sortable: false },
  { name: 'nextPickupDate', align: 'left', label: 'Data do Próximo Levantamento', sortable: false },
  { name: 'duration', align: 'left', label: 'Período Dispensado', sortable: false },
  { name: 'pickUpDays', align: 'left', label: 'Dias de Levantamento', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]

const {
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
  getJSDateFromDDMMYYY,
  getDateFormatYYYYMMDDFromDDMMYYYY,
  extractHyphenDateFromDMYConvertYMD
} = useDateUtils();

const { alertSucess, alertError, alertInfo } = useSwal();
const showDispensesData = ref(true);
const grupPacks = ref([]);
const showNewPackingForm = inject('showNewPackingForm');
const dataFetchDone = inject('dataFetchDone');
const { closeLoading, showloading } = useLoading();
const getGroupMembers = inject('getGroupMembers')
const defaultPickUpDate = ref(null)

const removePackHeader = (groupPackHeader) => {
  groupPackHeaderService.apiDelete(groupPackHeader).then(resp => {
      const packsToDelete = groupPackService.getGroupPackByHeaderId(groupPackHeader.id)
      console.log(packsToDelete)
      packsToDelete.forEach(packToDelete => {
       const pvd = patientVisitDetailsService.getPatientVisitDetailsByPackId(packToDelete.pack_id)
       const pack = packService.getPackByID(packToDelete.pack_id)
       const memberPrescription = prescriptionService.getPrescriptionByID(pvd.prescription_id)
       memberPrescription.leftDuration = Number(pack.weeksSupply / 4)
       console.log(pvd)
       Prescription.update(memberPrescription)
       Pack.delete(pvd.pack_id)
       PatientVisitDetails.delete(pvd.id)
       PatientVisit.delete(pvd.patient_visit_id)
      })
     // groupPackHeaderService.delete(groupPackHeader.id)
     // this.$emit('getGroupMembers')
      alertSucess('Operação efectuada com sucesso.')
     })
}


const emit = defineEmits([
 // 'getGroupMembers'
]);




const newPacking = () => {
  // emit('newPacking', headers.value[0])
  showloading();
  if (headers.value[0] !== null && headers.value[0] !== undefined) defaultPickUpDate.value = headers.value[0].nextPickUpDate
  showNewPackingForm.value = true
  closeLoading();
}

const getDateDiff = (date1, date2) => {
  return date.getDateDiff(date1, date2, 'days')
}



const expandLess = (value) => {
  showDispensesData.value = !value
 }


 const loadHeaders = () => {
      const headers = groupPackHeaderService.getGroupPackHeaderByGroupId(SessionStorage.getItem('selectedGroupId'))
      if (headers.length > 0) {
        headers[0].isLast = true
      }
      return headers
}

const headers = computed(() => {
  return loadHeaders()
});

const selectedGroup = computed(() => groupService.getGroupById(SessionStorage.getItem('selectedGroupId')));

provide(defaultPickUpDate,'defaultPickUpDate')
</script>

<style>

</style>
