<template>
   <q-card style="width: 1250px; max-width: 100vw;">
            <q-card-section class="q-pa-none bg-green-2">
              <div class="row items-center text-subtitle1 q-pa-md">
                <q-icon  name="groups" size="md" color="primary"/>
                <div class="text-bold text-grey-10 q-ml-sm">Grupo: {{curGroup.code}}</div>
                <div class="text-grey-10 q-ml-sm"><span class="text-bold text-h6">|</span> {{curGroup.name}}</div>
                <div class="text-grey-10 q-ml-sm"><span class="text-bold text-h6">|</span> {{curGroup.groupType.code}}</div>
              </div>
              <q-separator/>
            </q-card-section>
        <form @submit.prevent="doFormValidation" >
            <div class="q-mx-lg">
              <div class="q-mt-lg">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Dispensa</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
              </div>
              <div class="row q-mt-md">
                <q-input
                  dense
                  outlined
                  bg-color="white"
                  class="col"
                  v-model="pickupDate"
                  @update:model-value="determineNextPickUpDate()"
                  ref="pickupDate"
                  label="Data de Levantamento">
                  <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                          <q-date v-model="pickupDate" mask="DD-MM-YYYY" @update:model-value="determineNextPickUpDate()" :options="blockDataFutura">
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
                @blur="determineNextPickUpDate()"
                outlined
                v-model="drugsDuration"
                :options="durations"
                option-value="id"
                option-label="description"
                label="Dispensa para" />

              <q-input
                outlined dense
                v-model="nextPDate"
                @update:model-value="determineNextPickUpDate()"
                label="Proximo Levantamento"
                bg-color="white"
                class="col"
                ref="nextPickupDate">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
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
                label="Modo de dispensa" />
              </div>
              <span>
                <div class="q-mt-md">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Membros</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
                </div>
                <span v-if="curGroup !== null" >
                  <span v-for="member in selectedGroup.members" :key="member.id">
                  <ListHeader
                    :addVisible="true"
                    :mainContainer="true"
                    @expandLess="expandLess"
                    :expandVisible="false"
                    @showAdd="openAddPrescribedDrugForm(member.patient)"
                    bgColor="bg-primary">{{member.patient.preferedIdentifier().value}} - {{member.patient.fullName}}
                  </ListHeader>
                  <div class="col" >
                    <q-table
                      class="col"
                      dense
                      flat
                      :rows="member.groupMemberPrescription !== null ? member.groupMemberPrescription.prescription.prescribedDrugs : member.patient.identifiers[0].episodes[0].lastVisit().prescription.prescribedDrugs"
                      :columns="columns"
                      row-key="id"
                      v-if="showDispensesData"
                      >
                      <template v-slot:no-data="{ icon, filter }">
                        <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                          <span>
                            Nenhum Medicamento Indicado
                          </span>
                          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                        </div>
                      </template>
                      <template #body="props">
                        <q-tr :props="props">
                          <q-td key="order" :props="props">
                          </q-td>
                          <q-td key="drug" :props="props">
                            {{props.row.drug.name}}
                          </q-td>
                          <q-td key="packSize" :props="props">
                            {{props.row.drug.packSize}}
                          </q-td>
                          <q-td key="form" :props="props">
                            {{props.row.drug.form.description}}
                          </q-td>
                          <q-td key="takeInstrucions" :props="props">
                            {{props.row.drug.defaultTreatment}} - {{props.row.drug.defaultTimes}}X por {{props.row.drug.defaultPeriodTreatment}}
                          </q-td>
                          <q-td key="packs" :props="props">
                            {{props.row.getQtyPrescribed(drugsDuration)}}
                          </q-td>
                          <q-td key="options" :props="props">
                            <div class="col">
                              <q-btn flat round
                              color="red-8"
                              icon="delete"
                              @click="removePrescribedDrug(props.row)">
                              <q-tooltip class="bg-red-5">Remover</q-tooltip>
                            </q-btn>
                            </div>
                          </q-td>
                        </q-tr>
                      </template>
                    </q-table>
                  </div>
                  </span>
                </span>

              </span>
            </div>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
              <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
              <q-btn type="submit"
              :loading="submitting"
              label="Dispensar" color="primary" />
            </q-card-actions>
        </form>
        <q-dialog persistent v-model="showAddEditDrug">
          <AddEditPrescribedDrug
            @addPrescribedDrug="addPrescribedDrug"
            :visitDetails="selectedVisitDetails"
            :hasTherapeuticalRegimen="hasTherapeuticalRegimen"
            @close="showAddEditDrug = false" />
        </q-dialog>
        <q-dialog persistent v-model="alert.visible">
          <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
    </q-card>
</template>

<script>
import { ref } from 'vue'
import { date, QSpinnerBall, SessionStorage } from 'quasar'
import DispenseMode from '../../store/models/dispenseMode/DispenseMode'
import Duration from '../../store/models/Duration/Duration'
import Group from '../../store/models/group/Group'
import Patient from '../../store/models/patient/Patient'
import Episode from '../../store/models/episode/Episode'
import GroupPackHeader from '../../store/models/group/GroupPackHeader'
import GroupPack from '../../store/models/group/GroupPack'
import Pack from '../../store/models/packaging/Pack'
import Clinic from '../../store/models/clinic/Clinic'
import Stock from '../../store/models/stock/Stock'
import PackagedDrug from '../../store/models/packagedDrug/PackagedDrug'
import PackagedDrugStock from '../../store/models/packagedDrug/PackagedDrugStock'
import PatientVisitDetails from '../../store/models/patientVisitDetails/PatientVisitDetails'
import PatientVisit from '../../store/models/patientVisit/PatientVisit'
import Prescription from '../../store/models/prescription/Prescription'
import ClinicalService from '../../store/models/ClinicalService/ClinicalService'
import PrescriptionDetail from '../../store/models/prescriptionDetails/PrescriptionDetail'
import GroupMemberPrescription from '../../store/models/group/GroupMemberPrescription'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import Drug from '../../store/models/drug/Drug'
import moment from 'moment'
const columns = [
  { name: 'order', align: 'left', label: 'Ordem', sortable: false },
  { name: 'drug', align: 'left', label: 'Medicamento', sortable: false },
  { name: 'packSize', align: 'left', label: 'Quantidade no Frasco', sortable: false },
  { name: 'form', align: 'left', label: 'Forma', sortable: false },
  { name: 'takeInstrucions', align: 'left', label: 'Instrução de Toma', sortable: false },
  { name: 'packs', align: 'left', label: 'Número de Frascos', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  mixins: [mixinplatform, mixinutils],
  props: ['group', 'defaultPickUpDate'],
  data () {
    return {
      submitting: false,
      columns,
      nextPDate: '',
      pickupDate: '',
      drugsDuration: '',
      dispenseMode: '',
      curGroupPackHeader: new GroupPackHeader(),
      selectedGroup: ref(null),
      showAddEditDrug: false,
      selectedVisitDetails: new PatientVisitDetails(),
      hasTherapeuticalRegimen: false,
      patientVisitDetailsToAdd: [],
      showDispensesData: ref(true)
    }
  },
  methods: {
    async init () {
      // this.loadGroup()
      console.log(this.defaultPickUpDate)
      if (this.defaultPickUpDate !== null) {
        this.pickupDate = this.getDDMMYYYFromJSDate(this.defaultPickUpDate)
      }
      if (this.mobile) {
        await Drug.localDbGetAll().then(drugs => {
          Drug.insertOrUpdate({ data: drugs })
        })
        await Duration.localDbGetAll().then(drugs => {
          Duration.insertOrUpdate({ data: drugs })
        })
        await DispenseMode.localDbGetAll().then(drugs => {
          DispenseMode.insertOrUpdate({ data: drugs })
        })
      }
    },
      date: ref(moment(date).format('YYYY/MM/DD')),
        blockDataFutura (date) {
            return date <= moment(new Date()).format('YYYY/MM/DD')
        },
    getNextPickUpDate () {
      const dates = []
      if (this.selectedGroup.packHeaders.length > 0) {
        this.selectedGroup.packHeaders.forEach((header) => {
           dates.push(new Date(this.selectedGroup.packHeaders.nextPickUpDate))
        })
      } else {
        this.selectedGroup.members.forEach((member) => {
          dates.push(new Date(member.patient.identifiers[0].episodes[0].lastVisit().pack.nextPickUpDate))
        })
      }
      return new Date(Math.max.apply(null, dates))
    },
    checkMembersPrescriptions () {
      let error = 'Os seguintes pacientes possuem prescrições inválidas ['
      let invalidPrescription = ''
      this.selectedGroup.members.forEach((member) => {
        if (member.patient.identifiers[0].episodes[0].lastVisit().prescription.leftDuration <= 0 && member.groupMemberPrescription === null) {
          invalidPrescription += invalidPrescription === '' ? member.patient.fullName : ', ' + member.patient.fullName
        }
      })
      if (invalidPrescription !== '') {
        error += invalidPrescription + ']'
        return error
      } else {
        return null
      }
    },
    checkMembersPrescriptionsDate (pickupDate) {
      let error = 'A data de levantamento não pode ser menor que a data das ultimas prescrições dos pacientes : ['
      let invalidPrescription = ''
      this.selectedGroup.members.forEach((member) => {
        const memberPrescriptionDate = moment(member.groupMemberPrescription.prescription.prescriptionDate).format('YYYY-MM-DD')
        const dispenseDate = moment(pickupDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        if (moment(dispenseDate).isBefore(memberPrescriptionDate, 'day')) {
          invalidPrescription += invalidPrescription === '' ? member.patient.fullName : ', ' + member.patient.fullName
        }
      })
      if (invalidPrescription !== '') {
        error += invalidPrescription + ']'
        return error
      } else {
        return null
      }
    },
    doFormValidation () {
    this.submitting = true
    const momentPickUpdate = this.getDateFormatYYYYMMDDFromDDMMYYYY(this.pickupDate)
    const getNextPickUpDate = this.getDateFormatYYYYMMDDFromDDMMYYYY(this.getNextPickUpDate())
    const momentNextPickUpdate = this.getDateFormatYYYYMMDDFromDDMMYYYY(this.nextPDate)
      const prescriptionError = this.checkMembersPrescriptions()
      if (prescriptionError !== null) {
        this.displayAlert('error', prescriptionError)
        this.submitting = false
      } else if (this.pickupDate === '' || this.pickupDate === undefined) {
        this.displayAlert('error', 'Por favor, indique a data do levantamento.')
        this.submitting = false
      } else if (this.extractHyphenDateFromDMYConvertYMD(this.pickupDate) > moment().format('YYYY-MM-DD')) {
        this.displayAlert('error', 'A data da dispensa indicada é maior que a data da corrente.')
        this.submitting = false
      } else if (moment(momentPickUpdate).isBefore(getNextPickUpDate, 'day')) {
        this.displayAlert('error', 'A data da dispensa não pode ser anterior a ' + this.getDDMMYYYFromJSDate(this.getNextPickUpDate()))
        this.submitting = false
      } else if (this.drugsDuration === '') {
        this.displayAlert('error', 'Por favor, o período para o qual está a efectuar a dispensa.')
        this.submitting = false
      } else if (this.nextPDate === '' || this.nextPDate === undefined) {
        this.displayAlert('error', 'Por favor, indique a data do próximo levantamento.')
        this.submitting = false
      } else if (moment(momentNextPickUpdate).isBefore((momentPickUpdate))) {
        this.displayAlert('error', 'A data do próximo levantamento não pode ser anterior a data do levantamento.')
        this.submitting = false
      } else if (this.dispenseMode === '') {
        this.displayAlert('error', 'Por favor indicar o modo de dispensa.')
        this.submitting = false
      } else {
        const prescriptionDateError = this.checkMembersPrescriptionsDate(this.pickupDate)
        if (prescriptionDateError !== null) {
        this.displayAlert('error', prescriptionDateError)
        this.submitting = false
      } else {
        this.generatepacks()
      }
      }
    },
    memerHasGroupPrescription (member) {
      return member.groupMemberPrescription !== null
    },
    expandLess (value) {
      this.showDispensesData = !value
    },
    addPrescribedDrug (prescribedDrug, visitDetails) {
      console.log(visitDetails)
      prescribedDrug.prescription_id = visitDetails.prescription.id
      this.selectedGroup.members.forEach((member) => {
        let prescribedDrugs
        if (member.groupMemberPrescription != null) {
          prescribedDrugs = member.groupMemberPrescription.prescription.prescribedDrugs
        } else {
          prescribedDrugs = member.patient.identifiers[0].episodes[0].lastVisit().prescription.prescribedDrugs
        }
        const psdrugExists = prescribedDrugs.some((pd) => {
          return pd.drug.id === prescribedDrug.drug.id && member.patient.id === visitDetails.patientVisit.patient_id
        })
        if (psdrugExists) {
          this.displayAlert('error', 'O medicamento seleccionado não pode ser adicionado, pois já existe na lista a dispensar para o membro [' + member.patient.fullName + ']')
        } else {
          if (member.groupMemberPrescription != null && member.patient.id === visitDetails.patientVisit.patient_id) {
            prescribedDrug.prescription_id = member.groupMemberPrescription.prescription.id
          member.groupMemberPrescription.prescription.prescribedDrugs.push(prescribedDrug)
        } else {
          if (member.patient.identifiers[0].episodes[0].lastVisit().prescription.id === visitDetails.prescription.id) {
            member.patient.identifiers[0].episodes[0].lastVisit().prescription.prescribedDrugs.push(prescribedDrug)
          }
        }
        }
      })
      this.showAddEditDrug = false
    },
    removePrescribedDrug (prescribedDrug) {
      this.selectedGroup.members.forEach((member) => {
        let prescription
        if (member.groupMemberPrescription != null) {
          prescription = member.groupMemberPrescription.prescription
        } else {
          prescription = member.patient.identifiers[0].episodes[0].lastVisit().prescription
        }
        if (prescription.id === prescribedDrug.prescription_id) {
        console.log(prescribedDrug)
          const newPrescribedDrugs = prescription.prescribedDrugs.filter((prescDr) => {
            return prescDr.drug.id !== prescribedDrug.drug.id
          })
          prescription.prescribedDrugs = newPrescribedDrugs
        }
      })
    },
    openAddPrescribedDrugForm (patient) {
      patient.identifiers[0].service = ClinicalService.query()
                                                      .with('identifierType')
                                                      .with('therapeuticRegimens')
                                                      .with('clinicSectors.*')
                                                      .with('attributes.clinicalServiceAttributeType')
                                                      .where('id', patient.identifiers[0].service.id)
                                                      .first()
      patient.identifiers[0].episodes[0].lastVisit().prescription.prescriptionDetails[0] = PrescriptionDetail.query()
                                                                                                          .withAll()
                                                                                                          .where('prescription_id', patient.identifiers[0].episodes[0].lastVisit().prescription.id)
                                                                                                          .first()
      this.selectedVisitDetails = patient.identifiers[0].episodes[0].lastVisit()
      this.selectedVisitDetails.episode = patient.identifiers[0].episodes[0]
      this.selectedVisitDetails.episode.patientServiceIdentifier = patient.identifiers[0]
      this.selectedVisitDetails.episode.patientServiceIdentifier.service = patient.identifiers[0].service
      this.hasTherapeuticalRegimen = patient.identifiers[0].hasTherapeuticalRegimen()
      this.showAddEditDrug = true
    },
    generatepacks () {
      console.log('generatepacks')
      this.$q.loading.show({
        message: 'Por favor aguarde ...',
        spinnerColor: 'grey-4',
        spinner: QSpinnerBall
      })

      setTimeout(() => {
        this.$q.loading.hide()
      }, 900)
      let errorMsg = 'Não existe stock suficiente do medicamento ['
      let error = ''
      this.initGroupPackHeader()
      this.curGroup.members.forEach((member) => {
        const pack = new Pack({
          packDate: this.curGroupPackHeader.packDate,
          pickupDate: this.curGroupPackHeader.packDate,
          nextPickUpDate: this.curGroupPackHeader.nextPickUpDate,
          weeksSupply: this.curGroupPackHeader.duration.weeks,
          dispenseMode: this.dispenseMode,
          clinic: this.clinic,
          patientVisitDetails: [],
          syncStatus: member.patient.his_id.length > 10 ? 'R' : 'N'
        })
         const drugerror = this.initNewPack(member.patient.identifiers[0].episodes[0].lastVisit(), pack, member.patient, member.patient.identifiers[0].episodes[0], member)
        if (drugerror !== undefined) error += drugerror
        console.log(error)
        const groupPack = new GroupPack({
          pack: pack
        })
        this.curGroupPackHeader.groupPacks.push(groupPack)
      })
      if (error !== undefined && error !== null && error.length > 0) {
        errorMsg += error + ']'
        console.log(errorMsg)
        this.displayAlert('error', errorMsg)
        this.submitting = false
      } else {
        const i = 0
        this.savePatientVisitDetails(this.curGroupPackHeader.groupPacks, i)
      }
    },
    savePatientVisitDetails (groupPacks, i) {
      if (this.mobile) {
        if (groupPacks[i] !== null && groupPacks[i] !== undefined) {
          const patientVisit = JSON.parse(JSON.stringify(groupPacks[i].pack.patientVisitDetails[0].patientVisit))

          console.log(patientVisit)
          patientVisit.patientVisitDetails.push(JSON.parse(JSON.stringify(groupPacks[i].pack.patientVisitDetails[0])))
          patientVisit.patientVisitDetails[0].patientVisit = null
          groupPacks[i].pack.patientVisitDetails = []

          groupPacks[i].pack.dispenseMode_id = groupPacks[i].pack.dispenseMode.id
          groupPacks[i].pack.clinic_id = groupPacks[i].pack.clinic.id

          groupPacks[i].pack.packagedDrugs.forEach((pDrug) => {
            pDrug.pack_id = groupPacks[i].pack.id
            pDrug.drug_id = pDrug.drug.id
            pDrug.packagedDrugStocks.forEach((pDrugStock) => {
              pDrugStock.pack_id = groupPacks[i].pack.id
              pDrugStock.drug_id = pDrugStock.drug.id
              pDrugStock.packagedDrug_id = pDrug.id
            })
          })
          // patientVisit.patientVisitDetails[0].prescription.calculateLeftDuration(JSON.parse(JSON.stringify(groupPacks[i].pack)).weeksSupply)

          Pack.localDbAdd(JSON.parse(JSON.stringify(groupPacks[i].pack)))
          Pack.insert({ data: JSON.parse(JSON.stringify(groupPacks[i].pack)) })
          patientVisit.patientVisitDetails[0].pack = JSON.parse(JSON.stringify(groupPacks[i].pack))
          patientVisit.patientVisitDetails[0].pack.packagedDrugs = []
          patientVisit.clinic_id = patientVisit.clinic.id
          patientVisit.patient_id = patientVisit.patient.id
          patientVisit.patientVisitDetails[0].episode_id = patientVisit.patientVisitDetails[0].episode.id
          patientVisit.patientVisitDetails[0].clinic_id = patientVisit.patientVisitDetails[0].clinic.id
          patientVisit.patientVisitDetails[0].patient_visit_id = patientVisit.id
          patientVisit.patientVisitDetails[0].prescription_id = patientVisit.patientVisitDetails[0].prescription.id
          patientVisit.patientVisitDetails[0].pack_id = patientVisit.patientVisitDetails[0].pack.id

          PatientVisit.localDbAdd(patientVisit)
          PatientVisit.insert({ data: patientVisit })

          i = i + 1
          setTimeout(this.savePatientVisitDetails(groupPacks, i), 4)
        } else {
          this.curGroupPackHeader = JSON.parse(JSON.stringify(this.curGroupPackHeader))
          this.curGroupPackHeader.groupPacks.forEach((groupPack) => {
            groupPack.pack.patientVisitDetails = []
            groupPack.pack_id = groupPack.pack.id
            groupPack.header_id = this.curGroupPackHeader.id
            groupPack.syncStatus = 'R'
          })
          this.curGroupPackHeader.duration_id = this.curGroupPackHeader.duration.id
          this.curGroupPackHeader.group_id = this.group.id
          this.curGroupPackHeader.group = null
          console.log(this.curGroupPackHeader)
          GroupPackHeader.localDbAdd(JSON.parse(JSON.stringify(this.curGroupPackHeader)))
          GroupPackHeader.insert({ data: this.curGroupPackHeader })
          this.submitting = false
          this.displayAlert('info', 'Operação efectuada com sucesso.')
        }
      } else {
        if (groupPacks[i] !== null && groupPacks[i] !== undefined) {
          const patientVisit = Object.assign({}, groupPacks[i].pack.patientVisitDetails[0].patientVisit)
          console.log(patientVisit)
          patientVisit.patientVisitDetails.push(groupPacks[i].pack.patientVisitDetails[0])
          patientVisit.patientVisitDetails[0].patientVisit = null
          groupPacks[i].pack.patientVisitDetails = []
          groupPacks[i].pack.packagedDrugs.forEach(pck => {
          pck.drug = Drug.query()
                   .with('form')
                   .with('stocks')
                   .with('clinicalService.identifierType')
                    .where('id', pck.drug.id)
                    .first()
          pck.packagedDrugStocks.forEach(pck1 => {
          pck1.drug = Drug.query()
                   .with('form')
                   .with('stocks')
                   .with('clinicalService.identifierType')
                    .where('id', pck.drug.id)
                    .first()
                  })
                })
                patientVisit.patientVisitDetails[0].pack = groupPacks[i].pack
        //  Pack.apiSave(groupPacks[i].pack).then(resp => {
        //    groupPacks[i].pack.id = resp.response.data.id
        //    groupPacks[i].pack.$id = resp.response.data.id
         //   patientVisit.patientVisitDetails[0].pack.packagedDrugs = []

            console.log(patientVisit)
            patientVisit.patientVisitDetails[0].prescription.calculateLeftDuration(JSON.parse(JSON.stringify(groupPacks[i].pack)).weeksSupply)
            PatientVisit.apiSave(patientVisit).then(resp => {
              // groupPacks[i].pack.patientVisitDetails = []
              const pv = JSON.parse(JSON.stringify(patientVisit))
              PatientVisit.insert({ data: pv })
          pv.patientVisitDetails.forEach((pvd) => {
            patientVisit.patientVisitDetails = []
            pvd.patientVisit = JSON.parse(JSON.stringify(patientVisit))
            this.patientVisitDetailsToAdd.push(pvd)
          })
              i = i + 1
              setTimeout(this.savePatientVisitDetails(groupPacks, i), 4)
            })
         // })
        } else {
          this.curGroupPackHeader.groupPacks.forEach((groupPack) => {
            groupPack.pack.patientVisitDetails = []
            groupPack.pack_id = groupPack.pack.id
          })
          GroupPackHeader.apiSave(this.curGroupPackHeader).then(resp => {
            console.log(resp)
            this.curGroupPackHeader.id = resp.response.data.id
            Group.apiFetchById(this.curGroupPackHeader.group.id).then(resp => {
              console.log(resp)
              resp.response.data.packHeaders.forEach(packHeader => {
                      GroupPackHeader.apiFetchById(packHeader.id).then(resp => {
                        console.log(resp)
                      })
                    })
            })
            this.patientVisitDetailsToAdd.forEach(pvd => {
              pvd.episode_id = pvd.episode.id
              pvd.clinic_id = pvd.clinic.id
              pvd.patient_visit_id = pvd.patientVisit.id
              pvd.prescription_id = pvd.prescription.id
              pvd.pack_id = pvd.pack.id
              console.log(pvd)
              PatientVisitDetails.insert({ data: pvd })
            })
            this.displayAlert('info', 'Operação efectuada com sucesso.')
            this.$emit('getGroupMembers', false)
          })
        }
      }
    },
    savePack (pack, i) {
      Pack.apiSave(pack).then(resp => {
        pack.id = resp.response.data.id
        i = i + 1
        setTimeout(this.savePatientVisitDetails(i), 400)
      })
    },
    fechtPatientVisitDetails (pack) {
      PatientVisitDetails.apiFetchById(pack.patientVisitDetails.id).then(resp => {
        pack.patientVisitDetails = PatientVisitDetails.find(pack.patientVisitDetails.id)
      })
    },
    initGroupPackHeader () {
      this.curGroupPackHeader = new GroupPackHeader()
      this.curGroupPackHeader.group = Group.query()
                                            .with('service.identifierType')
                                            .with('groupType')
                                            .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                            .where('id', this.group.id)
                                            .first()
      this.curGroupPackHeader.duration = this.drugsDuration
      this.curGroupPackHeader.packDate = this.getJSDateFromDDMMYYY(this.pickupDate)
      this.curGroupPackHeader.nextPickUpDate = this.getJSDateFromDDMMYYY(this.nextPDate)
    },
    initNewPack (visitDetails, pack, patient, episode, member) {
      let prescription
      let drugErrors = ''
      if (member.groupMemberPrescription != null) {
        prescription = member.groupMemberPrescription.prescription
      } else {
        prescription = member.patient.identifiers[0].episodes[0].lastVisit().prescription
      }
      prescription.prescribedDrugs.forEach((prescribedDrug) => {
        const stocks = Stock.query()
                            .where('drug_id', prescribedDrug.drug.id)
                            .orderBy('expireDate', 'asc')
                            .get()
        const validStock = stocks.filter((item) => {
          return new Date(item.expireDate) > new Date() && item.stockMoviment > 0
        })

        let allAvalibleValidStock
        if (validStock !== undefined && validStock !== null && validStock.length > 0) {
          validStock.forEach((stock) => {
            allAvalibleValidStock += stock.stockMoviment
          })
          if (allAvalibleValidStock < prescribedDrug.qtyPrescribed) {
            drugErrors += drugErrors === '' ? prescribedDrug.drug.name : ', ' + prescribedDrug.drug.name
          }
        } else {
          drugErrors += drugErrors === '' ? prescribedDrug.drug.name : ', ' + prescribedDrug.drug.name
        }
      })
      if (drugErrors !== '') {
        return drugErrors
      } else {
      Object.keys(prescription.prescribedDrugs).forEach(function (k) {
        const packagedDrugStocks = []
        const stocksToMoviment = []
        const prescribedDrug = prescription.prescribedDrugs[k]
        let qtyPrescribed = prescribedDrug.qtyPrescribed
        const packDrug = new PackagedDrug()
        const stocks = Stock.query()
                            .with(['clinic.*'])
                            .with(['entrance.clinic.province', 'entrance.clinic.district.province', 'entrance.clinic.facilityType'])
                            .with(['center.clinic.province', 'center.clinic.district.province', 'center.clinic.facilityType'])
                            .with(['drug.form', 'drug.clinicalService.identifierType'])
                            .where('drug_id', prescribedDrug.drug.id)
                            .orderBy('expireDate', 'asc')
                            .get()
        const validStock = stocks.filter((item) => {
          return new Date(item.expireDate) > new Date() && item.stockMoviment > 0
        })
          let i = 0
          while (qtyPrescribed > 0) {
            console.log(i)
        console.log(validStock)
            if ((validStock[i].stockMoviment >= qtyPrescribed)) {
              validStock[i].stockMoviment = Number(validStock[i].stockMoviment - qtyPrescribed)
              stocksToMoviment.push(validStock[i])
              qtyPrescribed = 0
              // const pkstock = this.initPackageStock(validStock[i], prescribedDrug.drug, prescribedDrug.qtyPrescribed)
              const packagedDrugStock = new PackagedDrugStock()
              packagedDrugStock.drug = prescribedDrug.drug
              packagedDrugStock.stock = validStock[i]
              packagedDrugStock.quantitySupplied = prescribedDrug.qtyPrescribed
              packagedDrugStock.creationDate = new Date()
              packagedDrugStocks.push(packagedDrugStock)
            } else {
              const availableBalance = validStock[i].stockMoviment
              qtyPrescribed = Number(qtyPrescribed - validStock[i].stockMoviment)
              validStock[i].stockMoviment = 0
              stocksToMoviment.push(validStock[i])
              const packagedDrugStock = new PackagedDrugStock()
              packagedDrugStock.drug = prescribedDrug.drug
              packagedDrugStock.stock = validStock[i]
              packagedDrugStock.quantitySupplied = availableBalance
              packagedDrugStock.creationDate = new Date()
              i = i + 1
            }
          }
          packDrug.packagedDrugStocks = packagedDrugStocks
          packDrug.quantitySupplied = prescribedDrug.qtyPrescribed
          packDrug.drug = prescribedDrug.drug
          packDrug.toContinue = prescribedDrug.toContinue
          const pvd = new PatientVisitDetails({
                            patientVisit: new PatientVisit({
                                            visitDate: this.curGroupPackHeader.packDate,
                                            patient: Patient.query()
                                                            .with('province')
                                                            .with('district.province')
                                                            .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                                            .where('id', patient.id)
                                                            .first(),
                                            clinic: this.clinic
                                          }),
                            clinic: this.clinic,
                            prescription: Prescription.query()
                                                      .with('doctor')
                                                      .with('duration')
                                                      .with('prescriptionDetails')
                                                      .where('id', prescription.id)
                                                      .first(),
                            episode: Episode.query()
                                            .with('startStopReason')
                                            .with('episodeType')
                                            .with('clinicSector')
                                            .with('patientServiceIdentifier')
                                            .where('id', episode.id)
                                            .first()
                          })
          pack.patientVisitDetails = []
          pack.patientVisitDetails.push(pvd)
          pack.packagedDrugs.push(packDrug)
      }.bind(this))
    }
    },
    loadGroup () {
      const group = Group.query()
                        .with('service')
                        .with('members.patient.identifiers.identifierType')
                        .with('groupType')
                        .where('id', this.group.id)
                        .first()
      group.members = group.members.filter((member) => { return member.isActive() })
      group.members.forEach((member) => {
        member.groupMemberPrescription = GroupMemberPrescription.query()
                                                                  .with(['prescription.prescriptionDetails', 'prescription.duration', 'prescription.doctor', 'prescription.prescribedDrugs.drug.form'])
                                                                  .where('member_id', member.id)
                                                                  .first()
        member.patient = Patient.query().with(['identifiers.identifierType', 'identifiers.service.identifierType'])
                                .with('province')
                                .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                .where('id', member.patient.id)
                                .first()
        member.patient.identifiers = member.patient.identifiers.filter((identifier) => {
          return identifier.service.id === this.group.service.id
        })
        member.patient.identifiers[0].episodes = []
        member.patient.identifiers[0].episodes[0] = this.lastStartEpisodeWithPrescription(member.patient.identifiers[0].id)
      })
      console.log(group)
      this.selectedGroup = group
      return group
    },
    lastStartEpisodeWithPrescription (identifierId) {
      let episode = null
      const episodes = Episode.query()
                              .with('startStopReason')
                              .with('clinicSector')
                              .with('patientServiceIdentifier')
                              .with(['patientVisitDetails.*'])
                              .has('patientVisitDetails')
                              .whereHas('episodeType', (query) => {
                                    query.where('code', 'INICIO')
                                  })
                              .where('patientServiceIdentifier_id', identifierId)
                              .orderBy('creationDate', 'desc')
                              .get()
      Object.keys(episodes).forEach(function (k) {
        const id = episodes[k]
        if (episode === null && id.hasVisits()) {
          episode = id
          episode.lastVisit().prescription = Prescription.query()
                                                          .with('doctor')
                                                          .with('duration')
                                                          .with('prescribedDrugs.drug.form')
                                                          .with('prescriptionDetails')
                                                          .where('id', episode.lastVisit().prescription.id)
                                                          .first()
        }
      })
      return episode
    },
    determineNextPickUpDate () {
      if (date.isValid(this.getJSDateFromDDMMYYY(this.pickupDate)) && this.drugsDuration !== '') {
        const newDate = this.getJSDateFromDDMMYYY(this.pickupDate)
        let lostDays = parseInt((this.drugsDuration.weeks / 4) * 2)
        if (this.drugsDuration.weeks <= 1) lostDays = 0
        const daysToAdd = parseInt((this.drugsDuration.weeks * 7) + lostDays)
        this.nextPDate = this.getDDMMYYYFromJSDate(date.addToDate(newDate, { days: daysToAdd }))
        // this.$emit('updateQtyPrescribed', this.drugsDuration, this.pickupDate, this.nextPDate)
      }
    },
    closeDialog () {
      this.alert.visible = false
      if (this.alert.type === 'info') {
        this.$emit('close')
        this.$router.push('/group/panel')
      }
    }
  },
  computed: {
    curGroup () {
      if (this.selectedGroup !== null) {
          return this.selectedGroup
        } else {
          return this.loadGroup()
        }
    },
    durations: {
      get () {
        return Duration.all()
      }
    },
    dispenseModes: {
      get () {
        return DispenseMode.all()
      }
    },
    clinic () {
      if (SessionStorage.getItem('currClinic') === null || SessionStorage.getItem('currClinic').id === null) {
          const clinic = Clinic.query()
                                .with('province.*')
                                .with('facilityType.*')
                                .with('district.*')
                                .with('sectors.*')
                                .where('mainClinic', true)
                                .first()
           SessionStorage.set('currClinic', clinic)
           return clinic
        } else {
          return new Clinic(SessionStorage.getItem('currClinic'))
        }
    }
  },
  mounted () {
    this.init()
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    ListHeader: require('components/Shared/ListHeader.vue').default,
    AddEditPrescribedDrug: require('components/Patient/PatientPanel/AddEditPrescribedDrug.vue').default
  }
}
</script>

<style>

</style>
