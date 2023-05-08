<template>
  <q-card style="width: 900px; max-width: 90vw;">
        <form @submit.prevent="submitForm" >
            <q-card-section class="q-pa-none bg-green-2">
                  <div class="row items-center text-center text-subtitle1 q-pa-md">
                    <div class="col text-bold text-grey-10 q-ml-sm">{{isEditStep ? 'Actualizar' : 'Registar'}} Paciente</div>
                  </div>
                  <q-separator/>
            </q-card-section>
            <q-card-section class="q-px-md">
                <div class="q-mt-lg">
                    <div class="row items-center q-mb-md">
                        <q-icon name="person_outline" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Dados Pessoais</span>
                    </div>
                    <q-separator color="grey-13" size="1px"/>
                </div>
                <div class="q-mt-md">
                    <div class="row">
                        <nameInput ref="firstNames" v-model="patientReg.firstNames"/>
                        <middleNameInput ref="middleNames" v-model="patientReg.middleNames" class="q-ml-md"/>
                        <lastNameInput ref="lastNames" v-model="patientReg.lastNames" class="q-ml-md"/>
                    </div>
                    <div class="row">
                          <q-input
                              dense
                              outlined
                              class="col"
                              v-model="dateOfBirth"
                              ref="birthDate"
                              @update:model-value="idadeCalculator(dateOfBirth)"
                              label="Data de Nascimento *">
                              <template v-slot:append>
                                  <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                      <q-date
                                      v-model="dateOfBirth"
                                      :options="optionsNonFutureDate"
                                      mask="DD-MM-YYYY"
                                      @update:model-value="idadeCalculator(dateOfBirth)">
                                      <div class="row items-center justify-end">
                                          <q-btn v-close-popup label="Close" color="primary" flat />
                                      </div>
                                      </q-date>
                                  </q-popup-proxy>
                                  </q-icon>
                              </template>
                          </q-input>
                            <numberInput v-model="age" label="Idade" class="q-ml-md" readonly/>
                        <q-select
                          class="col q-ml-md"
                          dense outlined
                          ref="gender"
                          :rules="[ val => !!val || 'Por favor indicar o sexo']"
                          v-model="patientReg.gender"
                          :options="genders"
                          label="Sexo *" />
                    </div>
                </div>
                <div class="q-mt-lg">
                    <div class="row items-center q-mb-md">
                        <q-icon name="house" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Endereço</span>
                    </div>
                    <q-separator color="grey-13" size="1px"/>
                </div>
                <div class="row q-mt-md">
                    <q-select
                      class="col" dense outlined
                      @input-value="val => { onChangeProvincia(val) }"
                      v-model="patientReg.province"
                      use-input
                      ref="province"
                      :rules="[ val => !!val || 'Por favor indicar a Província']"
                      hide-selected
                      fill-input
                      input-debounce="0"
                      :options="provinces"
                      option-value="id"
                      option-label="description"
                      label="Provincia *"/>
                    <q-select
                      class="col q-ml-md"
                      dense outlined
                      @input-value="val => { onChangeDistrito(val) }"
                      v-model="patientReg.district"
                      option-value="id"
                      option-label="description"
                      ref="district"
                      :rules="[ val => !!val || 'Por favor indicar o Distrito']"
                      :options="filterRedDistricts"
                      label="Distrito/Cidade *"
                      @filter="filterDistricts"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <q-select
                      class="col q-ml-md"
                      :readonly="patientReg.district === null || patientReg.district === undefined"
                      dense outlined
                      :options="filterRedPostos"
                      v-model="patientReg.postoAdministrativo"
                      option-value="id"
                      option-label="description"
                      label="Posto Administivo"
                      @filter="filterPostos"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                </div>
                <div class="row q-mt-md">
                    <q-select
                      class="col"
                      dense
                      outlined
                      clearable
                      :readonly="patientReg.district === null || patientReg.district === undefined"
                      :options="filterRedBairros"
                      v-model="patientReg.bairro"
                      option-value="id"
                      option-label="description"
                      label="Localidade/Bairro"
                      @filter="filterBairros"
                      use-input
                      hide-selected
                      fill-input
                      @new-value="createBairro"
                      input-debounce="0">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                      <!-- <template v-slot:append>
                        <q-btn round dense flat icon="add" @click.stop.prevent="createBairro" />
                      </template> -->
                    </q-select>
                    <TextInput v-model="patientReg.address" label="Morada" dense class="col q-ml-md" />
                    <TextInput v-model="patientReg.addressReference" label="Ponto de Referência" dense class="col col q-ml-md" />
                </div>
                <div class="q-mt-lg">
                    <div class="row items-center q-mb-md">
                        <q-icon name="call" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Contacto</span>
                    </div>
                    <q-separator color="grey-13" size="1px"/>
                </div>
                <div class="row q-mt-md">
                  <PhoneField v-model="patientReg.cellphone" dense label="Principal"/>
                  <PhoneField v-model="patientReg.alternativeCellphone" dense label="Alternativo" class="q-ml-md"/>
                </div>
            </q-card-section>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn type="submit" :loading="submitLoading" label="Submeter" color="primary" />
            </q-card-actions>
        </form>
        <q-dialog v-model="alert.visible">
          <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
    </q-card>
</template>

<script>
import Province from '../../../store/models/province/Province'
import { ref } from 'vue'
import Patient from '../../../store/models/patient/Patient'
import { SessionStorage } from 'quasar'
import Clinic from '../../../store/models/clinic/Clinic'
import District from '../../../store/models/district/District'
import moment from 'moment'
import PostoAdministrativo from '../../../store/models/PostoAdministrativo/PostoAdministrativo'
import Localidade from '../../../store/models/Localidade/Localidade'
import TransferenceService from 'src/services/Transferences/TransferenceService'
import PatientVisit from '../../../store/models/patientVisit/PatientVisit'
import Episode from 'src/store/models/episode/Episode'
import Pack from 'src/store/models/packaging/Pack'
import Prescription from 'src/store/models/prescription/Prescription'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import PatientServiceIdentifier from 'src/store/models/patientServiceIdentifier/PatientServiceIdentifier'
// import ClinicalService from 'src/store/models/ClinicalService/ClinicalService'
export default {
    props: ['clinic', 'selectedPatient', 'newPatient', 'transferencePatientData', 'stepp', 'openMrsPatient'],
    emits: ['update:newPatient'],
    mixins: [mixinplatform, mixinutils],
    data () {
        return {
            dateOfBirth: '',
            selectedProvince: {},
            genders: ['Masculino', 'Feminino'],
           // age: '',
            submitLoading: false,
            patientReg: new Patient(),
            filterRedDistricts: ref([]),
            filterRedPostos: ref([]),
            filterRedBairros: ref([]),
            optionsNonFutureDate (dateOfBirth) {
                  return dateOfBirth <= moment().format('YYYY/MM/DD')
            },
            showDateIdentifier: false,
            dateOfAdmission: ''
        }
    },
    methods: {
      onChangeProvincia (provincia) {
        if (this.selectedPatient.province !== null) {
          if (this.selectedPatient.province.description !== provincia) {
            this.patientReg.district = null
            this.patientReg.bairro = null
            this.patientReg.postoAdministrativo = null
          }
        }
      },
      onChangeDistrito (distrito) {
        if (this.selectedPatient.district !== null) {
          if (this.selectedPatient.district.description !== distrito) {
            this.patientReg.bairro = null
            this.patientReg.postoAdministrativo = null
          }
      }
    },
      createBairro (val, done) {
        if (val.length > 0) {
          const bairro = new Localidade({ code: val.toUpperCase(), description: val, postoAdministrativo: this.patientReg.postoAdministrativo })
          if (!this.objectExistsOnArray(val, this.bairros)) {
            this.filterRedBairros.push(bairro)
          }
          done(bairro, 'toggle')
        }
      },
      objectExistsOnArray (description, array) {
        if (array === null || array.length <= 0) return false
        const exists = array.some((o) => {
          return o.description.toLowerCase() === description.toLowerCase()
        })
        return exists
      },
      filterPostos (val, update, abort) {
        if (val === '') {
            update(() => {
              this.filterRedPostos = this.postos
            })
            return
          }

        update(() => {
          this.filterRedPostos = this.postos.filter((f) => { return this.stringContains(f.description, val) })
        })
      },
      filterDistricts (val, update, abort) {
      const stringOptions = this.districts
      if (val === '') {
        update(() => {
          this.filterRedDistricts = stringOptions.map(district => district)
        })
      } else if (stringOptions.length === 0) {
        update(() => {
          this.filterRedDistricts = []
        })
      } else {
        update(() => {
          this.filterRedDistricts = stringOptions
            .map(district => district)
            .filter(district => {
              return district &&
              district.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
            })
        })
      }
    },
      filterBairros (val, update, abort) {
        if (this.bairros === null || this.bairros.length <= 0) return
        if (val === '') {
            update(() => {
              this.filterRedBairros = this.bairros
            })
            return
          }

        update(() => {
          this.filterRedBairros = this.bairros.filter((f) => { return this.stringContains(f.description, val) })
        })
      },
      submitForm () {
        this.submitLoading = true
        this.$refs.firstNames.$refs.nome.$refs.ref.validate()
        // this.$refs.middleNames.$refs.midleName.$refs.ref.validate()
        this.$refs.lastNames.$refs.lastName.$refs.ref.validate()
        this.$refs.gender.validate()
        this.$refs.province.validate()
        this.$refs.district.validate()

        if (!this.$refs.firstNames.$refs.nome.$refs.ref.hasError &&
            // !this.$refs.middleNames.$refs.midleName.$refs.ref.hasError &&
            !this.$refs.lastNames.$refs.lastName.$refs.ref.hasError &&
            !this.$refs.province.hasError &&
            !this.$refs.gender.hasError &&
            !this.$refs.district.hasError) {
              const dateObject = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.dateOfBirth)) // this.getDDMMYYYFromJSDate(this.dateOfBirth)
              if (this.isEditStep && (this.patientReg.hasIdentifiers() && (this.getYYYYMMDDFromJSDate(this.patientReg.getOldestIdentifier().startDate) < dateObject))) {
                this.displayAlert('error', 'A data de nascimento indicada é maior que a data da admissão ao serviço se saúde [ ' + this.patientReg.getOldestIdentifier().service.code + ' ]')
                this.submitLoading = false
              } else {
                this.savePatient()
              }
        } else {
          this.submitLoading = false
        }
      },
      async savePatient () {
        if (!this.newPatient) {
          this.patientReg.identifiers = []
        }
        if (this.patientReg.identifiers.length > 0 && this.patientReg.identifiers[0].clinic === null) {
          this.patientReg.identifiers = []
        }
          this.patientReg.dateOfBirth = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.dateOfBirth))
          if (this.patientReg.bairro !== null && this.patientReg.bairro.district === null) {
            this.patientReg.bairro.district = this.patientReg.district
          }
          if (this.openMrsPatient) {
            const uuid = this.patientReg.hisUuid
       //     this.showDateIdentifier = true
          Patient.api().get('/patient/openmrsProgramSearch/' + this.patientReg.his.id + '/' + uuid + '/' + localStorage.getItem('encodeBase64'))
                        .then((response) => {
                          this.patients = []
                           this.hideLoading()
                          if (response.response.data.results.length > 0) {
                            response.response.data.results.forEach(identifierOpenMrs => {
                              if (identifierOpenMrs.display === 'SERVICO TARV - TRATAMENTO') {
                                this.editPatientIdentifierFromOpenMRS(this.patientReg, identifierOpenMrs)
                              }
                               }
                            )
                            this.doSave()
                          } else {
                                 this.hideLoading()
                                 this.$q.notify({
                                color: 'negative',
                                position: 'center',
                                message: 'Não foi Encontrada a Data de Admissão para o serviço clinico , Será usada a data actual para efectuar a importação.',
                                icon: 'report_problem'
                              })
                              this.doSave()
                          }
                        })
          } else {
            this.doSave()
          }
      },
async saveDate () {
  this.patientReg.identifiers[0].startDate = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.dateOfAdmission))
  console.log(this.patientReg.identifiers[0].startDate)
  this.doSave()
},
      async doSave () {
        const clinicAux = Clinic.query()
                                .with('province')
                                .with('district.province')
                                .with('facilityType')
                                .where('id', this.patientReg.clinic.id)
                                .first()
        this.patientReg.clinic = clinicAux
        if (this.mobile) {
          this.patientReg.syncStatus = this.isEditStep ? 'U' : 'R'
          this.patientReg.province_id = this.patientReg.province.id
          this.patientReg.district_id = this.patientReg.district.id
          this.patientReg.postoAdministrativo_id = this.patientReg.postoAdministrativo !== null ? this.patientReg.postoAdministrativo.id : ''
          this.patientReg.bairro_id = this.patientReg.bairro !== null ? this.patientReg.bairro.id : null
          this.patientReg.clinic_id = this.patientReg.clinic.id
          const targetCopy = new Patient(JSON.parse(JSON.stringify(this.patientReg)))
          console.log(targetCopy)
          if (!this.isEditStep) {
            await Patient.localDbAdd(targetCopy).then(patient => {
              console.log(patient)
            })
            await Patient.insert({ data: targetCopy })
          } else {
            await Patient.localDbUpdate(targetCopy).then(patient => {
              console.log(patient)
            })
            await Patient.update({ data: targetCopy })
          }

          SessionStorage.set('selectedPatient', targetCopy)
          this.displayAlert('info', 'Dados do paciente gravados com sucesso.')
          this.submitLoading = false
        } else {
         // Localidade.insertOrUpdate({ data: this.patientReg.bairro })

          await Patient.apiSave(this.patientReg, this.newPatient).then(resp => {
            this.patientReg.id = resp.response.data.id
            this.patientReg.$id = resp.response.data.id
            SessionStorage.set('selectedPatient', new Patient(this.patientReg))
            if (!this.newPatient) {
              SessionStorage.set('selectedPatient', new Patient(this.patientReg))
              Patient.update({
                where: this.patientReg.id,
                data: this.patientReg
              })
            }
            if (this.transferencePatientData !== undefined && this.transferencePatientData.length > 0) {
              this.doPatientTranference(resp)
            } else {
              this.displayAlert('info', 'Dados do paciente gravados com sucesso.')
              this.submitLoading = false
            }
          }).catch(error => {
            this.listErrors = []
            this.submitLoading = false
            if (error.request !== undefined && error.request.status !== 0) {
              const arrayErrors = JSON.parse(error.request.response)
              if (arrayErrors.total == null) {
                this.listErrors.push(arrayErrors.message)
              } else {
                arrayErrors._embedded.errors.forEach(element => {
                  this.listErrors.push(element.message)
                })
              }
            }
            this.displayAlert('error', this.listErrors)
          })
        }
      },
      doPatientTranference (resp) {
        const psi = TransferenceService.buildPatientIdentifierFromIdmed((this.transferencePatientData[0]))
        psi.patient = this.patientReg
        psi.patient.id = resp.response.data.id
        psi.patient.$id = resp.response.data.id
        PatientServiceIdentifier.apiSave(psi).then(respPatientSI => {
          const episode = TransferenceService.buildEpisodeFromIdmed((this.transferencePatientData[0]))
          episode.patientServiceIdentifier = psi
          episode.patientServiceIdentifier.id = respPatientSI.response.data.id
          episode.patientServiceIdentifier.$id = respPatientSI.response.data.id
            Episode.apiSave(episode).then(respEpi => {
              const patientVisit = TransferenceService.getPatientVisitWithDetailsPRescriptionAndPack(this.transferencePatientData[0])
              Prescription.apiSave(patientVisit.patientVisitDetails[0].prescription).then(respPres => {
              patientVisit.patientVisitDetails[0].prescription.id = respPres.response.data.id
              patientVisit.patientVisitDetails[0].prescription.$id = respPres.response.data.id
              Pack.apiSave(patientVisit.patientVisitDetails[0].pack).then(respPack => {
                patientVisit.patientVisitDetails[0].pack.id = respPack.response.data.id
                patientVisit.patientVisitDetails[0].pack.$id = respPack.response.data.id
                patientVisit.patientVisitDetails[0].episode = respEpi.response.data
                patientVisit.patientVisitDetails[0].episode.id = respEpi.response.data.id
                patientVisit.patientVisitDetails[0].episode.$id = respEpi.response.data.id
                patientVisit.patient = this.patientReg
                patientVisit.patient.id = resp.response.data.id
                patientVisit.patient.$id = resp.response.data.id

                PatientVisit.apiSave(patientVisit).then(resp => {
                    this.displayAlert('info', 'Dados do paciente gravados com sucesso.')
                    this.submitLoading = false
                })
              })
            })
          })
        })
      },
      closeDialog () {
        this.alert.visible = false
        if (this.alert.type === 'info' && this.newPatient) {
          this.$emit('update:newPatient', false)
          this.$emit('close')
          this.$router.push('/patientpanel')
        } else if (this.alert.type === 'info' && this.isEditStep) {
          this.$emit('update:newPatient', false)
          this.$emit('close')
        }
      },
      initPatient () {
       if (!this.newPatient) {
          if (this.isEditStep) {
              this.patientReg = Patient.query().with(['province', 'district.province'])
                                        .with('identifiers.*')
                                        .with('postoAdministrativo')
                                        .with('bairro')
                                        .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                        .where('id', this.selectedPatient.id).first()
              this.patientReg.district = District.query().with('province').where('id', this.patientReg.district_id).first()
              this.dateOfBirth = moment(this.selectedPatient.dateOfBirth).format('DD-MM-YYYY')
          }
        } else {
              if (this.selectedPatient === null) {
                this.patientReg.clinic = this.currClinic
                this.patientReg.province = this.currClinic.province
              } else {
                this.patientReg = this.selectedPatient
                if (this.patientReg.dateOfBirth !== '') this.dateOfBirth = moment(this.patientReg.dateOfBirth).format('DD-MM-YYYY')
                this.patientReg.clinic = this.currClinic
                this.patientReg.province = this.currClinic.province
              }
          }
      },
      formatDate (dateString) {
        if (!dateString || !moment(dateString).isValid()) return ''
        const dateMoment = moment(dateString).format('DD-MM-YYYY')
        return dateMoment
      },
      editPatientIdentifierFromOpenMRS (patientReg, identifierOpenMrs) {
            patientReg.identifiers.forEach(identifier => {
             if (identifier.service.code === 'TARV' && identifierOpenMrs.display === 'SERVICO TARV - TRATAMENTO') {
              console.log(identifierOpenMrs)
              identifier.startDate = identifierOpenMrs.dateEnrolled
             }
            })
      },
      initParams () {
        this.setStep(this.stepp)
        if (this.website) {
          const offset = 0
          const max = 100
          Province.apiGetAll(offset, max)
          PostoAdministrativo.apiGetAll(offset, max)
          District.apiGetAll(offset, max)
          Clinic.apiFetchById(SessionStorage.getItem('currClinic').id)
        } else {
          Province.localDbGetAll().then(provinceList => {
            Province.insertOrUpdate({ data: provinceList })
          })
          PostoAdministrativo.localDbGetAll().then(items => {
            PostoAdministrativo.insertOrUpdate({ data: items })
          })
          Localidade.localDbGetAll().then(items => {
            Localidade.insertOrUpdate({ data: items })
          })
        }
      },
      moment
    },
    components: {
        TextInput: require('components/Shared/Input/TextField.vue').default,
        PhoneField: require('components/Shared/Input/PhoneField.vue').default,
        nameInput: require('components/Patient/Inputs/PatientNameInput.vue').default,
        middleNameInput: require('components/Patient/Inputs/PatientMiddleNameInput.vue').default,
        numberInput: require('components/Shared/Input/NumberField.vue').default,
        Dialog: require('components/Shared/Dialog/Dialog.vue').default,
        lastNameInput: require('components/Patient/Inputs/PatientLastNameInput.vue').default
    },
    computed: {
      provinces: {
        get () {
          return Province.query().with('districts.*').has('code').get()
          }
      },
      districts: {
        get () {
          if (this.patientReg.province !== null && this.patientReg.province !== undefined) {
            return District.query().with('province').where('province_id', this.patientReg.province.id).get()
          } else {
            return null
          }
        }
      },
      postos: {
        get () {
          if (this.patientReg.district !== null && this.patientReg.district !== undefined) {
            return PostoAdministrativo.query().with('district.province').where('district_id', this.patientReg.district.id).has('code').get()
          } else {
            return null
          }
        }
      },
      bairros: {
        get () {
          if (this.patientReg.postoAdministrativo !== null && this.patientReg.postoAdministrativo !== undefined) {
            return Localidade.query().with('postoAdministrativo.district').where('postoAdministrativo_id', this.patientReg.postoAdministrativo.id).has('code').get()
          } else {
            return null
          }
        }
      },
      age: {
        get () {
          const idade = this.idadeCalculator(this.dateOfBirth)
          if (!isNaN(idade)) {
            return idade
          } else {
            return null
          }
        }
      }
    },
    mounted () {
      this.initParams()
      this.initPatient()
    }
}
</script>

<style>

</style>
