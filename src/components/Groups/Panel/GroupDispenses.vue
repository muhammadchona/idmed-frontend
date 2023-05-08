<template>
  <div>
    <ListHeader
      :addVisible="!group.isDesintegrated()"
      :mainContainer="true"
      :expandVisible="true"
      @expandLess="expandLess"
      @showAdd="$emit('newPacking', headers[0])"
      bgColor="bg-primary">Dispensas Efectuadas
    </ListHeader>
    <div class="q-mb-md box-border" v-if="showDispensesData">
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
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template #body="props">
            <q-tr :props="props">
              <q-td key="order" :props="props">
              </q-td>
              <q-td key="lastDispenseDate" :props="props">
                {{this.getDDMMYYYFromJSDate(props.row.packDate)}}
              </q-td>
              <q-td key="nextPickupDate" :props="props">
                {{this.getDDMMYYYFromJSDate(props.row.nextPickUpDate)}}
              </q-td>
              <q-td key="duration" :props="props">
                {{ props.row.duration !== null ? props.row.duration.weeks / 4 : ''}} mes(es)
              </q-td>
              <q-td key="pickUpDays" :props="props">
                Passam {{this.getDateDiff(new Date(), props.row.packDate)}} dias após o último levantamento
              </q-td>
              <q-td key="options" :props="props">
                <div class="col">
                  <q-btn flat round
                  :disable="!props.row.isLast || group.isDesintegrated()"
                  color="red-8"
                  icon="delete"
                  @click="removePackHeader(props.row)">
                  <q-tooltip class="bg-red-5">Remover</q-tooltip>
                </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-dialog v-model="alert.visible">
          <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import moment from 'moment'
import { date, SessionStorage } from 'quasar'
import GroupPackHeader from '../../../store/models/group/GroupPackHeader'
import Group from '../../../store/models/group/Group'
import mixinutils from 'src/mixins/mixin-utils'
// import Pack from '../../../store/models/packaging/Pack'
import GroupPack from 'src/store/models/group/GroupPack'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
import Pack from 'src/store/models/packaging/Pack'
import PatientVisit from '../../../store/models/patientVisit/PatientVisit'
import Prescription from '../../../store/models/prescription/Prescription'
const columns = [
  { name: 'order', align: 'left', label: 'Ordem', sortable: false },
  { name: 'lastDispenseDate', align: 'left', label: 'Data da Última Dispensa', sortable: false },
  { name: 'nextPickupDate', align: 'left', label: 'Data do Próximo Levantamento', sortable: false },
  { name: 'duration', align: 'left', label: 'Período Dispensado', sortable: false },
  { name: 'pickUpDays', align: 'left', label: 'Dias de Levantamento', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  props: ['packHeaders'],
  mixins: [mixinutils],
  data () {
    return {
      grupPacks: ref([]),
      columns,
      showDispensesData: ref(true)
    }
  },
  methods: {
    displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
    },
    expandLess (value) {
      this.showDispensesData = !value
    },
    getJSDateFromDDMMYYY (dateString) {
      const dateParts = dateString.split('-')
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    },
    formatDate (dateString) {
      if (!dateString || !moment(dateString).isValid()) return ''
      const dateMoment = moment(dateString).format('DD-MM-YYYY')
      return dateMoment
    },
    getDDMMYYYFromJSDate (jsDate) {
      return moment(jsDate).format('DD-MM-YYYY')
    },
    getDateDiff (date1, date2) {
      return date.getDateDiff(date1, date2, 'days')
    },
    loadHeaders () {
      const headers = GroupPackHeader.query().with('groupPacks.pack').with('duration').where('group_id', SessionStorage.getItem('selectedGroup').id).orderBy('packDate', 'desc').get()
      if (headers.length > 0) {
        headers[0].isLast = true
      }
      return headers
    },
    removePackHeader (groupPackHeader) {
     GroupPackHeader.apiDelete(groupPackHeader).then(resp => {
      const packsToDelete = GroupPack.query().with('pack').where('header_id', groupPackHeader.id).get()
      console.log(packsToDelete)
      packsToDelete.forEach(packToDelete => {
       const pvd = PatientVisitDetails.query().where('pack_id', packToDelete.pack_id).first()
       const pack = Pack.query().where('id', packToDelete.pack_id).first()
       const memberPrescription = Prescription.query().where('id', pvd.prescription_id).first()
       memberPrescription.leftDuration = Number(pack.weeksSupply / 4)
       console.log(pvd)
       Prescription.update(memberPrescription)
       Pack.delete(pvd.pack_id)
       PatientVisitDetails.delete(pvd.id)
       PatientVisit.delete(pvd.patient_visit_id)
      })
      GroupPackHeader.delete(groupPackHeader.id)
      this.$emit('getGroupMembers')
          this.displayAlert('info', 'Operação efectuada com sucesso.')
     })
    }
  },
  computed: {
    headers: {
      get () {
        return this.loadHeaders()
      }
    },
    group: {
      get () {
        return Group.find(SessionStorage.getItem('selectedGroup').id)
      }
    }
  },
  components: {
    ListHeader: require('components/Shared/ListHeader.vue').default,
    Dialog: require('components/Shared/Dialog/Dialog.vue').default
  }
}
</script>

<style>

</style>
