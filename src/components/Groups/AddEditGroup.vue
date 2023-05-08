<template>
  <q-card style="width: 900px; max-width: 90vw;">
        <form @submit.prevent="submitForm" class="q-ma-none">
            <q-card-section class="q-pa-none bg-green-2">
                <div class="q-pa-md">
                    <div class="row items-center">
                        <q-icon name="groups" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Dados do Grupo</span>
                    </div>
                </div>
                <q-separator color="grey-13" size="1px"/>
            </q-card-section>
          <q-scroll-area style="height: 630px;">
          <q-card-section class="q-px-md">
                <div class="q-mt-md">
                    <div class="row">
                      <q-select
                        class="col"
                        dense
                        :disable="isMemberEditionStep"
                        outlined
                        :options="clinicServices"
                        v-model="curGroup.service"
                        option-value="id"
                        option-label="code"
                        label="Serviço de Saúde *" />
                      <TextField
                        label="Numero do grupo *"
                        v-model="curGroup.code"
                        :disable="isMemberEditionStep"
                        class="col q-ml-md"
                        dense
                        :rules="[]"/>
                      <TextField
                        label="Nome *"
                        v-model="curGroup.name"
                        :disable="isMemberEditionStep"
                        dense
                        :rules="[]"
                        class="col q-ml-md"/>
                    </div>
                    <div class="row q-mt-md">
                      <q-select
                        class="col"
                        dense
                        outlined
                        :options="groupTypes"
                        :disable="isMemberEditionStep"
                        v-model="curGroup.groupType"
                        option-value="id"
                        option-label="description"
                        label="Tipo *" />
                      <q-input
                          dense
                          outlined
                          class="col q-ml-md"
                          v-model="startDate"
                          :disable="isMemberEditionStep"
                          ref="creationDate"
                          label="Data de Criação *">
                          <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                  <q-date v-model="startDate" mask="DD-MM-YYYY" >
                                  <div class="row items-center justify-end">
                                      <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                  </q-date>
                              </q-popup-proxy>
                              </q-icon>
                          </template>
                      </q-input>
                      <q-space/>
                    </div>
                </div>
                <div class="q-mt-lg">
                    <div class="row items-center q-mb-md">
                        <q-icon name="person" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Membros</span>
                    </div>
                    <q-separator color="grey-13" size="1px"/>
                </div>
                <div class="row">
                  <q-input
                    bottom-slots
                    outlined
                    v-model="searchParam"
                    label="Pesquisar por Identificador/Nome"
                    style="width: 400px"
                    :disable="curGroup.service === null"
                    class="q-mt-md"
                    dense>
                    <template v-slot:append class="q-mr-none">
                     <!--   <q-btn  @click="search()" class="q-mt-md q-mb-md q-mr-none"  square color="primary" icon="search" >
                        <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
                      </q-btn> -->
                      <!-- <q-btn v-if="searchParam !== ''" icon="clear" @click="searchParam = '', searchResults = []" class="q-mt-md q-ml-md q-mb-md cursor-pointer" color="amber" square /> -->
                    </template>
                  </q-input>
                  <q-btn  @click="search()" class="q-mt-md q-ml-md q-mb-md"  square color="primary" icon="search" :disable="curGroup.service === null">
                    <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
                  </q-btn>
                   <!-- <q-btn v-if="searchParam !== ''" icon="clear" @click="searchParam = '', searchResults = []" class="q-mt-md q-ml-md q-mb-md cursor-pointer" color="amber" square /> -->
                </div>
                <q-separator color="grey-13" size="1px"/>
                <div class="row q-mt-none">
                <div class="col-6 q-pr-sm">
                  <div class="col text-center q-mb-lg text-subtitle1 ">
                    Por Adicionar
                  </div>
                  <q-table
                    class="col"
                    dense
                    flat
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
                        <q-td key="id" :props="props">
                          {{props.row.preferedIdentifier().value}}
                        </q-td>
                        <q-td key="name" :props="props">
                          {{props.row.fullName}}
                        </q-td>
                        <q-td key="options" :props="props">
                          <div class="col">
                            <q-btn flat round
                            color="primary"
                            icon="group_add"
                            @click="addPatient(props.row)">
                            <q-tooltip class="bg-primary">Adicionar</q-tooltip>
                          </q-btn>

                          </div>
                        </q-td>
                      </q-tr>
                    </template>
                </q-table>
                </div>
                <q-separator color="grey-13 q-ma-none" vertical inset />
                <div class="col q-pl-sm">
                  <div class="col text-center q-mb-lg text-subtitle1">
                    Existentes
                  </div>
                  <q-table
                    class="col"
                    dense
                    flat
                    :rows="curGroup.members"
                    :columns="columns"
                    row-key="id"
                    >
                    <template v-slot:no-data="{ icon, filter }">
                      <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                        <span>
                          Nenhum Paciente adicionado
                        </span>
                        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                      </div>
                    </template>
                    <template #body="props">
                      <q-tr :props="props">
                        <!--q-td key="order" :props="props">
                        </q-td-->
                        <q-td key="id" :props="props">
                          {{props.row.patient.preferedIdentifier().value}}
                        </q-td>
                        <q-td key="name" :props="props">
                          {{props.row.patient.fullName}}
                        </q-td>
                        <q-td key="options" :props="props">
                          <div class="col">
                            <q-btn flat round
                            color="red-8"
                            icon="group_remove"
                            @click="removePatient(props.row)">
                            <q-tooltip class="bg-red-5">Remover</q-tooltip>
                          </q-btn>

                          </div>
                        </q-td>
                      </q-tr>
                    </template>
                </q-table>
                </div>
                </div>
            </q-card-section>
            <q-scroll-observer @scroll="scrollHandler" />
      </q-scroll-area>
           <q-card-actions align="right" class="q-my-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn type="submit" label="Submeter" color="primary" />
            </q-card-actions>
        </form>
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
import Group from '../../store/models/group/Group'
import Patient from '../../store/models/patient/Patient'
import moment from 'moment'
import ClinicalService from '../../store/models/ClinicalService/ClinicalService'
import GroupType from '../../store/models/groupType/GroupType'
import Clinic from '../../store/models/clinic/Clinic'
import { QSpinnerBall, SessionStorage, useQuasar } from 'quasar'
import GroupMember from '../../store/models/groupMember/GroupMember'
import PatientVisitDetails from '../../store/models/patientVisitDetails/PatientVisitDetails'
import PatientServiceIdentifier from '../../store/models/patientServiceIdentifier/PatientServiceIdentifier'
import mixinplatform from 'src/mixins/mixin-system-platform'
import Episode from 'src/store/models/episode/Episode'
import mixinutils from 'src/mixins/mixin-utils'
const columns = [
  { name: 'id', align: 'left', label: 'Identificador', sortable: false },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  props: ['step', 'stepp'],
  mixins: [mixinplatform, mixinutils],
  data () {
    return {
      columns,
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      curGroup: new Group({ members: [] }),
      searchParam: '',
      searchResults: ref([]),
      $q: useQuasar(),
      startDate: ''
    }
  },
  watch: {
     searchResults (oldp, newp) {
      if (oldp !== newp) {
        this.hideLoading()
      }
    }
  },
  methods: {
    init () {
      if (!this.isCreateStep) {
        this.curGroup = Group.query()
                            .with(['service.clinic.facilityType', 'service.clinic.district.province', 'service.clinic.province', 'service.identifierType'])
                            .with(['members.patient', 'members.clinic.province'])
                            .with('groupType')
                            .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                            .where('id', SessionStorage.getItem('selectedGroup').id)
                            .first()
        this.curGroup.members = this.curGroup.members.filter((member) => {
          return member.endDate === null || member.endDate === ''
        })
        this.curGroup.members.forEach((member) => {
          member.patient = Patient.query()
                                  .has('identifiers')
                                  .with(['identifiers.identifierType', 'identifiers.service.identifierType', 'identifiers.clinic.province'])
                                  .with('province')
                                  .with('district.province')
                                  .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                  .where('id', member.patient.id)
                                  .first()
        })
        this.startDate = this.formatDate(this.curGroup.startDate)
      }
    },
    isMemberOfGroupOnService (patient, serviceCode) {
      let res = false
      const members = GroupMember.query()
                                .with('group.*')
                                .get()
      if (members !== null) {
        members.forEach((member) => {
           member.patient = Patient.query()
                                  .has('identifiers')
                                  .with(['identifiers.identifierType', 'identifiers.service.identifierType', 'identifiers.clinic.province'])
                                  .with('province')
                                  .with('district.province')
                                  .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                  .where('id', member.patient_id)
                                  .first()
          if (patient.id === member.patient.id && serviceCode === member.group.service.code && member.endDate === null) {
            res = true
          }
        })
      }
      return res
    },
    lastEpisode (identifier) {
       return Episode.query()
                    .with('startStopReason')
                    .with('episodeType')
                    .with('patientServiceIdentifier')
                    .with('clinicSector.*')
                    .where('patientServiceIdentifier_id', identifier.id)
                    .orderBy('episodeDate', 'desc')
                    .first()
    },
    showloading () {
      console.log('loaging')
       this.$q.loading.show({
          spinner: QSpinnerBall,
          spinnerColor: 'gray',
          spinnerSize: 140,
          message: 'Processando, aguarde por favor...',
          messageColor: 'white'
        })
    },
    hideLoading () {
      this.$q.loading.hide()
    },
    doIdentifiersGetAllByPatient (patientId, offset, max) {
      this.showloading()
      PatientServiceIdentifier.apiGetAllByPatientId(patientId, offset, max)
    },
    addPatient (patient) {
      this.showloading()
      const patientExists = this.curGroup.members.some((member) => {
            return member.patient.id === patient.id
          })
       if (patientExists) {
          this.hideLoading()
          this.displayAlert('error', 'O paciente selecionado ja se encontra associado a este grupo [' + this.curGroup.service.code + '].')
       } else {
         if (this.mobile) { // Depois mudar para mobile
          // Validar paciente antes de adicionar, se o ultimo episodio e' de inicio (deve ser de inicio)
          let lastEpisode = {}
          patient.identifiers.forEach((identifier) => {
            const episodes = Episode.query().where('patientServiceIdentifier_id', identifier.id)
                                  .get()
            identifier.episodes = episodes
            if (identifier.service.code === this.curGroup.service.code) {
              lastEpisode = this.lastEpisode(identifier)
            }
          })

          if (!patient.hasEpisodes()) {
            this.displayAlert('error', 'O paciente selecionado não possui episódios.')
          } else if (!lastEpisode.startStopReason.isStartReason) {
            this.displayAlert('error', 'O Último episódio do paciente não é de inicio')
          } else if (this.isMemberOfGroupOnService(patient, this.curGroup.service.code)) {
            this.displayAlert('error', 'O paciente selecionado ja se encontra associado a um grupo activo do serviço ', this.curGroup.service.code)
          } else {
            this.curGroup.members.push(this.initNewMember(patient))
          }
          this.hideLoading()
         } else {
          Group.apiValidateBeforeAdd(patient.id, this.curGroup.service.code).then(resp => {
            if (resp.response.data === 'Accepted') {
              this.curGroup.members.push(this.initNewMember(patient))
            } else {
              this.displayAlert('error', resp.response.data)
            }
            this.hideLoading()
          })
         }
      }
    },
    initNewMember (patient) {
      const member = new GroupMember({
        startDate: this.getJSDateFromDDMMYYY(this.startDate),
        patient: patient,
        clinic: this.clinic
      })
      return member
    },
    removePatient (member) {
      const members = this.curGroup.members.filter((mb) => {
                        return mb.patient.id !== member.patient.id
                      })
      this.curGroup.members = members
    },
    notMember (patient) {
      const exists = this.curGroup.members.some((mb) => {
                        return mb.patient.id === patient.id
                      })
      return !exists
    },
    search () {
      this.showloading()
      if (this.mobile) { // Depois mudar para mobile
        const patients = Patient.query()
                                  .has('identifiers')
                                  .with(['identifiers.identifierType', 'identifiers.service.identifierType', 'identifiers.clinic.province'])
                                  .with('province')
                                  .with('members.group.service')
                                  .with('district.province')
                                  .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                  .where('clinic_id', this.clinic.id)
                                  .get()
        this.searchResults = patients.filter((patient) => {
          return this.stringContains(patient.firstNames, this.searchParam) || this.stringContains(patient.middleNames, this.searchParam) || this.stringContains(patient.lastNames, this.searchParam)
        })
      } else {
        if (this.searchParam.length > 0) {
          Patient.delete((patient) => {
          return this.notMember(patient)
        })
          Patient.apisearchByParam(this.searchParam, this.clinic.id).then(resp => {
              if (resp.response.data.length >= 0) {
                const patients = Patient.query()
                                    .has('identifiers')
                                    .has('patientVisits')
                                    .with(['identifiers.identifierType', 'identifiers.service.identifierType', 'identifiers.clinic.province'])
                                    .with('province')
                                    .with('members.group.service')
                                    .with('district.province')
                                    .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                    .where('clinic_id', this.clinic.id)
                                    .get()
             this.searchResults = patients.filter((patient) => {
          return this.stringContains(patient.firstNames, this.searchParam) || this.stringContains(patient.middleNames, this.searchParam) || this.stringContains(patient.lastNames, this.searchParam)
        })
              }
          })
        } else {
          this.hideLoading()
        }
        }
    },
    isAssociatedToSelectedService (patient) {
      if (patient.identifiers.length <= 0) return false

      const match = patient.identifiers.some((identifier) => {
        return identifier.service.id === this.curGroup.service.id
      })
      return match
    },
    hasIdentifierLike (patientToCheck, identifierString) {
      if (patientToCheck.identifiers.length <= 0) return false

      const match = patientToCheck.identifiers.some((identifier) => {
        return this.stringContains(identifier.value, identifierString)
      })
      return match
    },
    stringContains (stringToCheck, stringText) {
      if (stringText === '' || stringToCheck === null) return false
      return stringToCheck.toLowerCase().includes(stringText.toLowerCase())
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
    submitForm () {
      this.doSave()
    },
    async doSave () {
      this.$q.loading.show({
        message: 'Carregando ...',
        spinnerColor: 'grey-4',
        spinner: QSpinnerBall
      })

      setTimeout(() => {
        this.$q.loading.hide()
      }, 700)
      if (this.isCreateStep) {
        this.curGroup.startDate = this.getJSDateFromDDMMYYY(this.startDate)
        this.curGroup.clinic = this.clinic
      }

      this.curGroup = new Group(JSON.parse(JSON.stringify(this.curGroup)))
        this.curGroup.members.forEach((member) => {
          member.startDate = this.curGroup.startDate
          member.group_id = this.curGroup.id
          member.patient_id = member.patient.id
          member.clinic_id = this.clinic.id
          member.syncStatus = 'R'
          member.group = null
        })
      if (this.mobile) {
        if (this.isCreateStep) {
          this.curGroup.syncStatus = 'R'
          this.curGroup.clinic_id = this.clinic.id
          this.curGroup.clinical_service_id = this.curGroup.service.id
          this.curGroup.groupType_id = this.curGroup.groupType.id
          await Group.localDbAdd(JSON.parse(JSON.stringify(this.curGroup)))
          await Group.insert({ data: this.curGroup })
        } else {
          if (this.curGroup.syncStatus !== 'R') this.curGroup.syncStatus = 'U'
          this.curGroup.clinic_id = this.clinic.id
          this.curGroup.clinical_service_id = this.curGroup.service.id
          this.curGroup.groupType_id = JSON.parse(JSON.stringify(this.curGroup.groupType.id))
          this.curGroup.members.forEach((member) => {
            member.startDate = this.curGroup.startDate
            if (member.syncStatus !== 'R') member.syncStatus = 'U'
            member.patient.identifiers = []
            const groupUpdate = new Group(JSON.parse(JSON.stringify((this.curGroup))))
            Group.localDbUpdate(groupUpdate).then(groupRes => {
              Group.update({ data: groupUpdate })
            })
          })
        }
        this.displayAlert('info', 'Operação efectuada com sucesso.')
      } else {
        if (this.isCreateStep) {
          Group.apiSave(this.curGroup).then(resp => {
          Group.apiFetchById(resp.response.data.id).then(resp => {
            this.loadMembersData()
            this.curGroup = Group.query()
                                .with('groupType')
                                .with('members.patient.*')
                                .with('service.*')
                                .with('packHeaders.*')
                                .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                .where('id', resp.response.data.id)
                                .first()
            this.displayAlert('info', 'Operação efectuada com sucesso.')
          })
        }).catch(error => {
            const listErrors = []
            if (error.request.response != null) {
              const arrayErrors = JSON.parse(error.request.response)
              if (arrayErrors.total == null) {
                listErrors.push(arrayErrors.message)
              } else {
                arrayErrors._embedded.errors.forEach(element => {
                  listErrors.push(element.message)
                })
              }
            }
            this.displayAlert('error', listErrors)
          })
        } else {
          console.log('Edit Step')
          Group.apiUpdate(this.curGroup).then(resp => {
          Group.apiFetchById(resp.response.data.id).then(resp => {
            this.loadMembersData()
            this.curGroup = Group.query()
                                .with('groupType')
                                .with('members.patient.*')
                                .with('service.*')
                                .with('packHeaders.*')
                                .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                .where('id', resp.response.data.id)
                                .first()
            this.displayAlert('info', 'Operação efectuada com sucesso.')
            this.$emit('getGroupMembers')
            console.log('emitsGetGroupMembers')
          })
        }).catch(error => {
            const listErrors = []
            if (error.request.response != null) {
              const arrayErrors = JSON.parse(error.request.response)
              if (arrayErrors.total == null) {
                listErrors.push(arrayErrors.message)
              } else {
                arrayErrors._embedded.errors.forEach(element => {
                  listErrors.push(element.message)
                })
              }
            }
            this.displayAlert('error', listErrors)
          })
        }
    }
    },
    loadMembersData () {
      this.curGroup.members.forEach((member) => {
        member.patient.identifiers.forEach((identifier) => {
          identifier.episodes.forEach((episode) => {
            PatientVisitDetails.apiGetAllByEpisodeId(episode.id, 0, 500)
          })
        })
      })
    },
    displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
      if (this.alert.type === 'info') {
        this.$emit('close')
        if (this.isCreateStep) {
          this.curGroup.clinic_id = this.curGroup.clinic.id
          this.curGroup.clinical_service_id = this.curGroup.service.id
          this.curGroup.groupType_id = this.curGroup.groupType.id
        }
        SessionStorage.set('selectedGroup', this.curGroup)
        this.$router.push('/group/panel')
      }
    }
  },
  computed: {
    clinicServices: {
      get () {
        return ClinicalService.query().with('identifierType').get()
      }
    },
    groupTypes: {
      get () {
        return GroupType.query().get()
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
    },
    isCreateStep () {
      return this.step === 'create'
    },
    isEditStep () {
      return this.step === 'edit'
    },
    isMemberEditionStep () {
      return this.step === 'addMember'
    }
  },
  mounted () {
    this.setStep(this.stepp)
    this.init()
  },
  unmounted () {
    console.log('unMounted')
  },
  components: {
      TextField: require('components/Shared/Input/TextField.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
  }
}
</script>

<style>

</style>
