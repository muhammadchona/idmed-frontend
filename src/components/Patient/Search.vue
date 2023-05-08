<template>
  <div class="q-mt-lg">
    <TitleBar>Procurar ou adicionar Utentes/Pacientes</TitleBar>
    <div class="q-mx-xl">
      <div class="row">
        <q-space/>
        <q-select
          class="col-2 q-mt-md"
          dense outlined
          option-label="abbreviation"
          v-model="selectedDataSources"
          :options="dataSources"
          @update:model-value="loadHISDataSource()"
          label="Fonte de dados" />
      </div>
      <div class="row items-center q-my-md">
          <q-icon name="person_outline" size="sm"/>
          <span class="q-pl-sm text-subtitle2">Informação inicial</span>
      </div>
      <div class="row">
          <identifierInput
            v-model="patientId"
            :rules="[]"/>
          <nameInput
            class="q-ml-md"
            label="Nome"
            :rules="[]"
            :readonly="this.selectedDataSources.id.length > 4"
            v-model="currPatient.firstNames">
            <template v-slot:append>
              <q-icon name="close" @click="text = ''" class="cursor-pointer" />
            </template>
          </nameInput>
          <TextField
            label="Outros Nomes"
            v-model="currPatient.middleNames"
            dense
            :rules="[]"
            :readonly="this.selectedDataSources.id.length > 4"
            class="col q-ml-md"/>
          <lastNameInput
            label="Apelido"
            :rules="[]"
            :readonly="this.selectedDataSources.id.length > 4"
            v-model="currPatient.lastNames"
            class="q-ml-md"/>
            <q-btn v-if="canClear" @click="search()" class="q-ml-md q-mb-xs" square color="primary" icon="search" >
                    <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
                  </q-btn>
            <q-btn v-if="canClear" @click="clearSearchParams" class="q-ml-md q-mb-xs" square color="amber" icon="clear" >
                    <q-tooltip class="bg-amber-5">Limpar</q-tooltip>
                  </q-btn>
      </div>
      <div class="q-mt-lg q-mb-md">
          <div class="row items-center q-mb-md">
              <q-icon name="search" size="sm"/>
              <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
          </div>
          <q-separator color="grey-13" size="1px"/>
      </div>
      <div>
          <q-table
            class="col"
            dense
            :rows="patients"
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
                <q-td key="identifier" :props="props">
                  {{props.row.preferedIdentifierValue()}}
                </q-td>
                <q-td key="name" :props="props">
                  {{props.row.fullName}}
                </q-td>
                <q-td key="age" :props="props">
                  {{this.idadeCalculator(this.getDDMMYYYFromJSDate(props.row.dateOfBirth))}}
                </q-td>
                <q-td key="gender" :props="props">
                  {{props.row.gender}}
                </q-td>
                <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn flat round v-if="!(this.selectedDataSources.id.length > 4)"
                    color="amber-8"
                    icon="edit"
                    @click="editPatient(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                  <q-btn flat round v-if="!(this.selectedDataSources.id.length > 4)"
                    class="q-ml-md"
                    color="green-8"
                    icon="person_search"
                    @click="goToPatientPanel(props.row)">
                    <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                  </q-btn>

                  <q-btn flat round v-if="this.selectedDataSources.id.length > 4"
                    class="q-ml-md"
                    color="green-8"
                    icon="file_download"
                    @click="saveOpenMRSPatient(props.row)">
                    <q-tooltip class="bg-green-5">Carregar</q-tooltip>
                  </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
        </q-table>
        <div class="q-mt-md"></div>
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn class="q-mb-xl q-mr-xl" fab color="primary" icon="add" @click="createPatient()"/>
      </q-page-sticky>
      <q-dialog persistent v-model="showPatientRegister">
          <patientRegister
            :newPatient="newPatient"
            :selectedPatient="currPatient"
            :clinic="currClinic"
            :stepp="step"
            :transferencePatientData="transferencePatientData"
            :openMrsPatient="openMrsPatient"
            @close="showPatientRegister = false" />
      </q-dialog>
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
// import axios from 'axios'
import { SessionStorage, useQuasar, QSpinnerBall } from 'quasar'
import District from 'src/store/models/district/District'
import ClinicalService from 'src/store/models/ClinicalService/ClinicalService'
import HealthInformationSystem from 'src/store/models/healthInformationSystem/HealthInformationSystem'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
import Clinic from 'src/store/models/clinic/Clinic'
import Patient from 'src/store/models/patient/Patient'
import TransferenceService from 'src/services/Transferences/TransferenceService'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
const columns = [
 // { name: 'order', required: true, label: 'Ordem', align: 'left', sortable: true },
  { name: 'identifier', align: 'left', label: 'Identificador', sortable: false },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  { name: 'age', align: 'center', label: 'Idade', sortable: false },
  { name: 'gender', align: 'left', label: 'Género', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
    mixins: [mixinplatform, mixinutils],
    data () {
      return {
        searchField: '',
        selected: ref([]),
        columns,
        $q: useQuasar(),
        showPatientRegister: false,
        currPatient: new Patient({
          identifiers: [
            new PatientServiceIdentifier({})
          ]
        }),
        selectedDataSources: {
          id: 0,
          abbreviation: 'iDMED'
        },
        patients: [],
        newPatient: false,
        username: localStorage.getItem('user'),
        transferencePatientData: [],
        patientList: [],
        openMrsPatient: false
      }
    },
    watch: {
     patients (oldp, newp) {
      if (oldp !== newp) {
        this.hideLoading()
      }
    }
  },
    methods: {
      clearSearchParams () {
        Patient.deleteAll()
        this.currPatient = new Patient({
            identifiers: [
              new PatientServiceIdentifier({})
            ]
          })
          this.patients = []
      },
      showloading () {
       this.$q.loading.show({
          spinner: QSpinnerBall,
          spinnerColor: 'gray',
          spinnerSize: 140,
          message: 'Pesquisando, aguarde por favor...',
          messageColor: 'white'
        })
    },
    hideLoading () {
      this.$q.loading.hide()
    },
      init () {
        if (this.mobile) {
          Patient.localDbGetAll().then(patients => {
            Patient.insert({ data: patients })
          })
        }
      },
      createPatient () {
        this.currPatient = new Patient({
          identifiers: [
            new PatientServiceIdentifier({})
          ]
        })
        SessionStorage.remove('selectedPatient')
        this.changeToCreateStep()
        this.showPatientRegister = true
        this.newPatient = true
      },
      search () {
      //  (this.selectedDataSources.id.length > 4) ? this.provincialServiceSearch(this.selectedDataSources) : this.localSearch()
         if (this.selectedDataSources.id.length > 4) {
          if (this.selectedDataSources.abbreviation.length <= 2) {
            TransferenceService.provincialServiceSearch(this.$q, this.currPatient, this.patients, this.transferencePatientData)
            console.log(this.transferencePatientData)
          } else {
            this.openMRSSerach(this.selectedDataSources)
          }
        } else {
          this.localSearch()
        }
      },
      editPatient (patient) {
        this.currPatient = Object.assign({}, patient)
        this.changeToEditStep()
        this.showPatientRegister = true
        this.newPatient = false
      },
      saveOpenMRSPatient (patient) {
        this.currPatient = Object.assign({}, patient)
        this.changeToCreateStep()
        this.showPatientRegister = true
        this.newPatient = true
        this.openMrsPatient = true
      },
      goToPatientPanel (selectedPatient) {
        /* this.$q.loading.show({
          message: 'Carregando ...',
          spinnerColor: 'grey-4',
          spinner: QSpinnerBall
        })

        setTimeout(() => {
          this.$q.loading.hide()
        }, 1000) */
        setTimeout(this.proccedToPatientPanel(selectedPatient), 5000)
      },
       proccedToPatientPanel (patient) {
         SessionStorage.set('selectedPatient', patient)
        this.$router.push('/patientpanel')
      },
      filterPatient (patient) {
        console.log(patient.firstNames)
        return this.hasIdentifierLike(patient, this.currPatient) || this.stringContains(patient.firstNames, this.currPatient.firstNames) || this.stringContains(patient.middleNames, this.currPatient.middleNames) || this.stringContains(patient.lastNames, this.currPatient.lastNames)
      },
      hasIdentifierLike (patientToCheck, inputPatient) {
        if (patientToCheck.identifiers.length <= 0) return false

        const match = patientToCheck.identifiers.some((identifier) => {
          return this.stringContains(identifier.value, this.currPatient.identifiers[0].value)
        })
        return match
      },
      stringContains (stringToCheck, stringText) {
        if (stringToCheck === '' || stringToCheck === null || stringToCheck === undefined) return false
        if (stringText === '' || stringText === null || stringText === undefined) return false
        return stringToCheck.toLowerCase().includes(stringText.toLowerCase())
      },
      getAllPatientsOfClinic () {
        if (Patient.query().count() <= 0) {
          const offset = 0
          const max = 100
          this.doPatientGet(this.clinic.id, offset, max)
        }
      },
      doPatientGet (clinicId, offset, max) {
        Patient.apiGetAllByClinicId(clinicId, offset, max).then(resp => {
              if (resp.response.data.length > 0) {
                offset = offset + max
                setTimeout(this.doPatientGet(clinicId, offset, max), 2)
              }
          })
      },
      getAllDataSources (offset) {
       if (offset >= 0) {
          HealthInformationSystem.api().get('/healthInformationSystem?offset=' + offset + '&max=100').then(resp => {
          offset = offset + 100
          if (resp.response.data.length > 0) {
            setTimeout(this.getAllDataSources(offset), 2)
            }
          })
       }
      },
      saveDefaultHIS () {
        HealthInformationSystem.create({
            data: { id: -1, abbreviation: 'iDMED', description: 'iDMED', active: true }
        })
      },
      loadHISDataSource () {
        this.patients = []
          this.$q.loading.show({
                message: 'Carregando ...',
                spinnerColor: 'grey-4',
                spinner: QSpinnerBall
        })
        if (this.selectedDataSources.id.length > 4) {
          if (this.selectedDataSources.abbreviation.length <= 2) {
            TransferenceService.checkProvincialServer(this.$q)
          } else {
             this.checkOpenMRS(this.selectedDataSources)
          }
        } else {
          this.$q.notify({
            color: 'positive',
            position: 'center',
            message: 'Pesquisa de Pacientes no iDMED em funcionamento!!',
            icon: 'verified_user'
          })
           setTimeout(() => {
              this.$q.loading.hide()
            }, 400)
        }
      },
      localSearch () {
        this.showloading()
        if (this.website) {
          console.log('Performing website search')
          Patient.deleteAll()
          this.currPatient.clinic = this.clinic
          Patient.apiSearch(this.currPatient).then(resp => {
            // this.patientList = resp.response.data

          if (resp.response.data.length >= 0) {
            this.patients = Patient.query()
                                      .with(['identifiers.identifierType', 'identifiers.service.identifierType', 'identifiers.clinic.province'])
                                      .with('province')
                                      .with('attributes')
                                      .with('appointments')
                                      .with('district.*')
                                      .with('postoAdministrativo')
                                      .with('bairro')
                                      .with(['clinic.province', 'clinic.district.province'])
                                      .where('clinic_id', this.clinic.id)
                                      .orderBy('firstNames')
                                      .orderBy('identifiers.value', 'asc')
                                      .get()
            }
          })
        } else {
          console.log('Performing local search')
          const patients = Patient.query()
                                .with(['identifiers.identifierType', 'identifiers.service.identifierType', 'identifiers.clinic.province'])
                                .with('province')
                                .with('attributes')
                                .with('appointments')
                                .with('district.*')
                                .with('postoAdministrativo')
                                .with('bairro')
                                .with(['clinic.province', 'clinic.district.province'])
                                .where('clinic_id', this.clinic.id)
                                .orderBy('firstNames')
                                .orderBy('identifiers.value', 'asc')
                                .get()
          this.patients = patients.filter((patient) => {
            return this.filterPatient(patient)
          })
        }
      },
      openMRSSerach (his) {
        this.showloading()
        const nid = this.currPatient.identifiers[0].value.replaceAll('/', '-')

        if (nid.length <= 0) {
            this.$q.notify({
            color: 'negative',
            position: 'center',
            message: 'Não contém nenhum parâmetro de pesquisa. Por favor, introduza um Nº de Identificador',
            icon: 'report_problem'
          })
        this.hideLoading()
        } else {
          this.currPatient.clinic = this.clinic
          Patient.apiSearch(this.currPatient).then(resp => {
            // this.patientList = resp.response.data
          if (resp.response.data.length >= 1) {
            this.displayAlert('error', 'Ja Existe um Paciente com o NID:[ ' + nid + ' ] no IDMED. Use A pesquisa do Idmed')
            this.hideLoading()
          } else {
          Patient.api().get('/patient/openmrsSearch/' + his.id + '/' + nid + '/' + localStorage.getItem('encodeBase64'))
                        .then((response) => {
                          this.patients = []
                          console.log('Lista Oenmrs', response)
                           this.hideLoading()
                          if (response.response.data.results.length > 0) {
                            response.response.data.results.forEach(pacienteOpenMRS => {
                            const localpatient = new Patient({
                                identifiers: []
                              })
                              this.patients.push(this.buildLocalPatientFromOpenMRS(localpatient, pacienteOpenMRS))
                            }
                            )
                          } else {
                                 this.hideLoading()
                                 this.$q.notify({
                                color: 'negative',
                                position: 'center',
                                message: 'Nenhum resultado encontrado para o identificador ' + nid + '',
                                icon: 'report_problem'
                              })
                          }
                        })
        }
      })
      }
    },
      checkOpenMRS (his) {
        Patient.api().get('/patient/openmrsSession/' + his.id + '/' + localStorage.getItem('encodeBase64'))
                       .then((response) => {
                         if (response.response.data.authenticated === false || response.response.data.authenticated === undefined || response.response.data.authenticated === null) {
                            this.$q.notify({
                            color: 'negative',
                            position: 'center',
                            message: 'O Utilizador ' + this.username + ' não se encontra no OpenMRS ou serviço rest no OpenMRS não se encontra em funcionamento.',
                            icon: 'report_problem'
                          })
                         } else {
                           this.$q.notify({
                            color: 'positive',
                            position: 'center',
                            message: 'Pesquisa de Pacientes no OpenMRS em funcionamento!!',
                            icon: 'verified_user'
                          })
                         }
                       })
                      .catch((error) => {
                        if (String(error).includes('Network Error')) {
                            this.$q.notify({
                            color: 'negative',
                            position: 'center',
                            message: 'O Servidor OpenMRS encontra-se desligado ou existe um problema de conexão!',
                            icon: 'report_problem'
                          })
                        } else {
                          this.$q.notify({
                          color: 'negative',
                          position: 'center',
                          message: 'Falha inexperada, por favor contacte o adminitrador.',
                          icon: 'report_problem'
                        })
                        }
                      })
        setTimeout(() => {
            this.$q.loading.hide()
        }, 400)
      },
      buildPatientIdentifierFromOpenMRS (identifier) {
        const psi = new PatientServiceIdentifier()
              psi.startDate = new Date()
              psi.value = identifier
              psi.state = 'Activo'
              psi.prefered = true
              psi.service = ClinicalService.query().with('identifierType').where('code', 'TARV').first()
              psi.identifierType = ClinicalService.query().with('identifierType').where('code', 'TARV').first().identifierType
              psi.clinic = Clinic.query().with('province').where('id', SessionStorage.getItem('currClinic').id).first()
              return psi
      },
      buildLocalPatientFromOpenMRS (localpatient, pacienteOpenMRS) {
        const cellphoneObject = pacienteOpenMRS.person.attributes.find(attribute => attribute.attributeType.uuid === 'e2e3fd64-1d5f-11e0-b929-000c29ad1d07')
              localpatient.hisUuid = pacienteOpenMRS.uuid
              localpatient.his = (this.selectedDataSources.id.length > 4) ? this.selectedDataSources : null
              localpatient.hisLocation = pacienteOpenMRS.identifiers[0].location.uuid
              localpatient.hisLocationName = pacienteOpenMRS.identifiers[0].location.display
              localpatient.firstNames = pacienteOpenMRS.person.names[0].givenName
              localpatient.middleNames = pacienteOpenMRS.person.names[0].middleName
              localpatient.lastNames = pacienteOpenMRS.person.names[0].familyName
              localpatient.gender = pacienteOpenMRS.person.gender === 'M' ? 'Masculino' : 'Feminino'
              localpatient.dateOfBirth = pacienteOpenMRS.person.birthdate
              localpatient.identifiers.push(this.buildPatientIdentifierFromOpenMRS(pacienteOpenMRS.identifiers[0].identifier))
              localpatient.cellphone = (cellphoneObject !== null && cellphoneObject !== undefined) ? cellphoneObject.value : ''
              localpatient.address = pacienteOpenMRS.person.addresses[0].address3
              localpatient.addressReference = pacienteOpenMRS.person.addresses[0].address1
              localpatient.district = District.query().with('province').where('description', pacienteOpenMRS.person.addresses[0].countyDistrict).first()
              localpatient.province = localpatient.district !== null && localpatient.district !== undefined ? localpatient.district.province : null
              // localpatient.postoAdministrativo_id = pacienteOpenMRS.person.names[0]
              // localpatient.bairro_id = pacienteOpenMRS.person.names[0]
              // localpatient.clinic_id = pacienteOpenMRS.person.names[0]
              return localpatient
      }
    },
    computed: {
      canClear () {
        return (this.currPatient.identifiers[0] && this.currPatient.identifiers[0].value !== '') ||
               this.currPatient.firstNames !== '' ||
               this.currPatient.middleNames !== '' ||
               this.currPatient.lastNames !== ''
      },
      patientId: {
        get () {
          if (this.currPatient.identifiers[0] === null || this.currPatient.identifiers[0] === undefined) return null
          return this.currPatient.identifiers[0].value
        },
        set (value) {
          this.currPatient.identifiers[0].value = value
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
      dataSources () {
        return HealthInformationSystem.query()
                                      .with('interoperabilityAttributes.*')
                                      .where('active', true).all()
      }
    },
    created () {
      this.init()
    },
    mounted () {
      this.saveDefaultHIS()
      this.getAllDataSources(0)
      this.loadProvinceDistricts()
      // this.getAllPatientsOfClinic()
      // this.loadAppParameters()
    },
    components: {
        TitleBar: require('components/Shared/TitleBar.vue').default,
        patientRegister: require('components/Patient/Register/PatientRegister.vue').default,
        nameInput: require('components/Patient/Inputs/PatientNameInput.vue').default,
        identifierInput: require('components/Patient/Inputs/PatientIdentifierInput.vue').default,
        TextField: require('components/Shared/Input/TextField.vue').default,
        lastNameInput: require('components/Patient/Inputs/PatientLastNameInput.vue').default,
        Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }
}
</script>

<style>

</style>
