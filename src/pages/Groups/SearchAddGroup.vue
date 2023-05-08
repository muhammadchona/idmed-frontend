<template>
  <div class="q-mt-lg">
    <TitleBar>Procurar ou adicionar Grupo</TitleBar>
    <div class="q-mx-xl">
      <div class="row items-center q-my-md">
          <q-icon name="person_outline" size="sm"/>
          <span class="q-pl-sm text-subtitle2">Informação inicial</span>
      </div>
      <div class="row">
        <TextField
            @update:model-value="search()"
            label="Numero do grupo"
            v-model="curGroup.code"
            style="witdth: 350px"
            dense
            :rules="[]"/>
          <TextField
            @update:model-value="search()"
            label="Nome"
            v-model="curGroup.name"
            dense
            :rules="[]"
            style="witdth: 450px"
            class="q-ml-md"/>
      </div>
      <div class="q-mt-lg q-mb-md">
          <div class="row items-center q-mb-md">
              <q-icon name="search" size="sm"/>
              <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
          </div>
          <q-separator color="grey-13" size="1px"/>
      </div>
      <div>
        <q-scroll-area style="height: 460px">
          <q-table
              class="col"
              dense
              :rows="searchResults"
              :columns="columns"
              row-key="id"
              >
              <template v-slot:no-data="{ icon, filter }">
                <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                  <span>
                    Sem resultados para visualizar
                  </span>
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
              </template>
              <template #body="props">
                <q-tr :props="props">
                  <!--q-td key="order" :props="props">
                  </q-td-->
                  <q-td key="code" :props="props">
                    {{props.row.code}}
                  </q-td>
                  <q-td key="name" :props="props">
                    {{props.row.name}}
                  </q-td>
                  <q-td key="groupType" :props="props">
                    {{props.row.groupType.description}}
                  </q-td>
                  <q-td key="service" :props="props">
                    {{props.row.service.code}}
                  </q-td>
                  <q-td key="options" :props="props">
                    <div class="col">
                      <q-btn flat round
                      color="primary"
                      icon="groups"
                      @click="openGroup(props.row)">
                      <q-tooltip class="bg-primary">Visualizar</q-tooltip>
                    </q-btn>

                    </div>
                  </q-td>
                </q-tr>
              </template>
          </q-table>
        </q-scroll-area>
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn class="q-mb-xl q-mr-xl" fab color="primary" icon="add" @click="showGroupRegister = true"/>
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showGroupRegister">
          <groupRegister
            :step="step"
            :stepp="step"
            @close="showGroupRegister = false" />
      </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import Group from '../../store/models/group/Group'
import Clinic from '../../store/models/clinic/Clinic'
import { SessionStorage } from 'quasar'
import Patient from '../../store/models/patient/Patient'
import GroupType from '../../store/models/groupType/GroupType'
import ClinicalService from '../../store/models/ClinicalService/ClinicalService'
import Episode from '../../store/models/episode/Episode'
import PatientVisitDetails from '../../store/models/patientVisitDetails/PatientVisitDetails'
import Prescription from '../../store/models/prescription/Prescription'
import Pack from '../../store/models/packaging/Pack'
import mixinplatform from 'src/mixins/mixin-system-platform'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
import GroupMember from 'src/store/models/groupMember/GroupMember'
import Drug from 'src/store/models/drug/Drug'
import PackagedDrug from 'src/store/models/packagedDrug/PackagedDrug'
import Doctor from 'src/store/models/doctor/Doctor'
import Duration from 'src/store/models/Duration/Duration'
import PatientVisit from 'src/store/models/patientVisit/PatientVisit'
const columns = [
  { name: 'code', align: 'left', label: 'Número do grupo', sortable: false },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  { name: 'groupType', align: 'center', label: 'Tipo', sortable: false },
  { name: 'service', align: 'left', label: 'Serviço de Saúde', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  mixins: [mixinplatform],
  data () {
    return {
      selected: ref([]),
      columns,
      showGroupRegister: false,
      curGroup: new Group(),
      step: 'create',
      searchResults: ref([])
    }
  },
  methods: {
    init () {
      if (this.mobile) {
        GroupType.localDbGetAll().then(groupTypes => {
          groupTypes.forEach((groupType) => {
            groupType.groups = []
            GroupType.insertOrUpdate({ data: groupType })
          })
        })
        ClinicalService.localDbGetAll().then(clinicalServices => {
          clinicalServices.forEach((clinicalService) => {
            clinicalService.identifier_type_id = clinicalService.identifier_type.id
            clinicalService.attributes = []
            clinicalService.clinicSectors = []
            clinicalService.identifier_type = null
            ClinicalService.insertOrUpdate({ data: clinicalService })
          })
        })
        Patient.localDbGetAll().then(patients => {
          patients.forEach((patient) => {
            patient.clinic_id = patient.clinic.id
            patient.district_id = patient.district.id
            patient.bairro = null
            patient.clinic = null
            patient.district = null
            patient.province = null
            patient.appointments = []
            patient.attributes = []
            patient.identifiers = []
            patient.members = []
            patient.patientVisits = []
            Patient.insertOrUpdate({ data: patient })
          })
        })
        PatientServiceIdentifier.localDbGetAll().then(identifiers => {
          identifiers.forEach((identifier) => {
            identifier.clinic_id = identifier.clinic.id
            identifier.identifier_type_id = identifier.identifierType.id
            identifier.patient_id = identifier.patient.id
            identifier.service_id = identifier.service.id
            identifier.clinic = null
            identifier.identifierType = null
            identifier.patient = null
            identifier.service = null
            identifier.episodes = []
            PatientServiceIdentifier.insertOrUpdate({ data: identifier })
          })
        })
        Episode.localDbGetAll().then(episodes => {
          episodes.forEach((episode) => {
            episode.clinicSector_id = episode.clinicSector.id
            episode.episodeType_id = episode.episodeType.id
            episode.startStopReason_id = episode.startStopReason.id
            episode.patientServiceIdentifier_id = episode.patientServiceIdentifier.id
            episode.clinicSector = null
            episode.episodeType = null
            episode.referralClinic = null
            episode.startStopReason = null
            episode.patientServiceIdentifier = null
            episode.patientVisitDetails = []
            Episode.insertOrUpdate({ data: episode })
          })
        })
        Group.localDbGetAll().then(groups => {
          groups.forEach((group) => {
            if (group.members.length > 0) {
              group.members.forEach((member) => {
                member.group_id = group.id
                member.clinic_id = group.clinic.id
                member.patient_id = member.patient.id
                member.clinic = null
                member.group = null
                member.patient = null
                member.groupMemberPrescription = []
                GroupMember.insertOrUpdate({ data: member })
              })
            }
            group.clinic_id = group.clinic.id
            group.groupType_id = group.groupType.id
            group.clinical_service_id = group.service.id
            group.clinic = null
            group.groupType = null
            group.service = null
            group.members = []
            group.packHeaders = []
            Group.insertOrUpdate({ data: group })
          })
        })
        Pack.localDbGetAll().then(packs => {
          packs.forEach((pack) => {
            pack.packagedDrugs.forEach((packagedDrug) => {
              Drug.insert({ data: packagedDrug.drug })
              packagedDrug.drug_id = packagedDrug.drug.id
              packagedDrug.pack_id = pack.id
              packagedDrug.drug = null
              packagedDrug.pack = null
              packagedDrug.packagedDrugStocks = []
              PackagedDrug.insertOrUpdate({ data: packagedDrug })
            })
            pack.clinic_id = pack.clinic.id
            pack.dispenseMode_id = pack.dispenseMode.id
            pack.clinic = null
            pack.dispenseMode = null
            pack.groupPack = null
            pack.packagedDrugs = []
            pack.patientVisitDetails = []
            Pack.insertOrUpdate({ data: pack })
          })
        })
        Prescription.localDbGetAll().then(prescriptions => {
          prescriptions.forEach((prescription) => {
            const doctor = prescription.doctor
            doctor.clinic_id = prescription.clinic_id
            doctor.clinic = null
            doctor.prescriptions = []
            Doctor.insertOrUpdate({ data: doctor })
            const duraction = prescription.duration
            duraction.prescriptions = []
            Duration.insertOrUpdate({ data: duraction })
            prescription.duration_id = prescription.duration.id
            prescription.clinic_id = prescription.clinic.id
            prescription.doctor_id = prescription.doctor.id
            prescription.clinic = null
            prescription.doctor = null
            prescription.duration = null
            prescription.groupMemberPrescription = []
            prescription.patientVisitDetails = []
            prescription.prescribedDrugs = []
            prescription.prescriptionDetails = []
            Prescription.insertOrUpdate({ data: prescription })
          })
        })
        PatientVisitDetails.localDbGetAll().then(patientVisitDetails => {
          patientVisitDetails.forEach((pvd) => {
            const pv = pvd.patientVisit
            pv.clinic_id = pvd.patientVisit.clinic.id
            pv.patient_id = pv.patient.id
            pv.patient = null
            pv.patientVisitDetails = []
            pv.pregnancyScreening = []
            pv.ramScreening = []
            pv.tbScreening = []
            pv.vitalSigns = []
            PatientVisit.insertOrUpdate({ data: pv })
            pvd.prescription_id = pvd.prescription.id
            pvd.patient_visit_id = pvd.patientVisit.id
            pvd.clinic_id = pvd.clinic.id
            pvd.episode_id = pvd.episode.id
            pvd.pack_id = pvd.pack.id
            pvd.prescription = null
            pvd.patientVisit = null
            pvd.clinic = null
            pvd.episode = null
            pvd.pack = null
            PatientVisitDetails.insertOrUpdate({ data: pvd })
          })
        })
        Clinic.localDbGetAll().then((clinics) => {
          clinics.forEach((clinic) => {
            clinic.district_id = clinic.district.id
            clinic.province_id = clinic.province.id
            clinic.district = null
            clinic.nationalClinic = null
            clinic.patients = []
            clinic.sectors = []
            Clinic.insertOrUpdate({ data: clinic })
          })
        })
      } else {
        GroupType.apiGetAll()
        ClinicalService.apiGetAll()
        this.getAllGroupsOfClinic()
      }
    },
    search () {
      const groups = Group.query()
                          .with('groupType')
                          .with('service')
                          .get()
      this.searchResults = groups.filter((group) => {
        return this.stringContains(group.code, this.curGroup.code) || this.stringContains(group.name, this.curGroup.name)
      })
    },
    openGroup (group) {
      SessionStorage.set('selectedGroup', group)
      // pull all selected group info
      this.$router.push('/group/panel')
    },
    getAllGroupsOfClinic () {
      const offset = 0
      const max = 100
      this.doGroupsGet(this.clinic.id, offset, max)
    },
    getAllPatientsOfClinic () {
      const offset = 0
      const max = 100
      this.doPatientGet(this.clinic.id, offset, max)
    },
    loadPatientInfo () {
      const patientList = Patient.query().with('identifiers.episodes').get()
      patientList.forEach((patient) => {
        patient.identifiers.forEach((identifier) => {
          Episode.apiGetAllByIdentifierId(identifier.id, 0, 200)
          identifier.episodes.forEach((episode) => {
            PatientVisitDetails.apiGetAllByEpisodeId(episode.id, 0, 300).then(resp => {
              resp.response.data.forEach((pvd) => {
                Prescription.apiFetchById(pvd.prescription.id)
                Pack.apiFetchById(pvd.pack.id)
              })
            })
          })
        })
      })
    },
    doGroupsGet (clinicId, offset, max) {
      Group.apiGetAllByClinicId(clinicId, offset, max).then(resp => {
            if (resp.response.data.length > 0) {
              offset = offset + max
              setTimeout(this.doGroupsGet(clinicId, offset, max), 2)
            }
        }).catch(error => {
            console.log(error)
        })
    },
    stringContains (stringToCheck, stringText) {
      if (stringText === '') return false
      return stringToCheck.toLowerCase().includes(stringText.toLowerCase())
    }
  },
  created () {
    this.init()
  },
  components: {
    TitleBar: require('components/Shared/TitleBar.vue').default,
    TextField: require('components/Shared/Input/TextField.vue').default,
    groupRegister: require('components/Groups/AddEditGroup.vue').default
  },
  computed: {
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
  }
}
</script>

<style>

</style>
