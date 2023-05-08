<template>
  <q-card style="width: 900px; max-width: 90vw;">
        <form @submit.prevent="submitForm" >
            <q-card-section class="q-pa-none bg-green-2">
              <div class="row items-center text-subtitle1 q-pa-md">
                <q-icon  :name="patient.gender == 'Feminino' ? 'female' : 'male'" size="md" color="primary"/>
                <div class="text-bold text-grey-10 q-ml-sm">{{patient.fullName}}</div>
                <div class="text-grey-10 q-ml-sm"><span class="text-bold text-h6">|</span> {{patient.gender}}</div>
                <div class="text-grey-10 q-ml-sm"  v-if="patient.age() <= 14"><span class="text-bold text-h6"> |
                  <q-icon name="child_care" /> </span> {{patient.age()}} Ano(s) de Idade</div>
                <div class="text-grey-10 q-ml-sm"  v-else><span class="text-bold text-h6">|</span> {{patient.age()}} Anos de Idade</div>
              </div>
              <q-separator/>
            </q-card-section>
            <div class="text-center text-h6 q-mt-sm">
              <span v-if="isEditStep">Actualizar</span>
              <span v-if="isCreateStep">Adicionar</span>
              <span v-if="isCloseStep">Fechar</span>
              <span v-if="isReOpenStep">Reabrir</span>
              Serviço de Saúde
            </div>
            <div class="q-mx-lg">
              <div class="q-mt-lg">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Dados do serviço de Saúde</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
              </div>
              <div class="row q-mt-md">
                  <q-select
                    class="col"
                    dense outlined
                    ref="clinicalService"
                    :rules="[ val => !!val || 'Por favor indicar o serviço de saúde']"
                    :disable="isCloseStep || isReOpenStep"
                    v-model="identifier.service"
                    :options="notAssociatedServices"
                    @blur="reloadIdentifierTypeMask"
                    option-value="id"
                    option-label="code"
                    label="Serviço de Saúde *" />

                  <q-input
                      dense
                      outlined
                      class="col q-ml-md"
                      v-model="identifierstartDate"
                      :disable="isCloseStep || isReOpenStep"
                      ref="startDate"
                      :rules="[ val => val && val.length > 0 || 'Por favor indicar a data de admissão']"
                      label="Data de Admissão *">
                      <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                              <q-date v-model="identifierstartDate"  :options="optionsNonFutureDate" mask="DD-MM-YYYY" >
                              <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                              </div>
                              </q-date>
                          </q-popup-proxy>
                          </q-icon>
                      </template>
                  </q-input>
                  <q-select
                    class="col q-ml-md"
                    dense
                    outlined
                    ref="state"
                    :rules="[ val => !!val || 'Por favor indicar o estado']"
                    :disable="isCloseStep || isReOpenStep"
                    v-model="identifier.state"
                    :options="isCreateStep ? estado : estados"
                    label="Estado *" />
              </div>

              <span v-if="!isCloseStep && !isReOpenStep">
                <div class="q-mt-md">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Dados do Identificador</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
                </div>

                <div class="row q-mb-md">
                    <div v-if="isCreateStep && patient.identifiers.length > 0" class="col"  tabindex="0"> Assumir Identificador Anterior?
                        <q-radio keep-color color="primary" v-model="usePreferedId" v-bind:val="true" label="Sim" />
                        <q-radio keep-color color="primary" v-model="usePreferedId" v-bind:val="false" label="Nao"/>
                    </div>
                </div>
                <div class="row" v-if="!usePreferedId">
                    <identifierInput
                      ref="identifier"
                      label="Nr. do Identificador *"
                      :disable="identifier.service === null"
                      :mask="identifierTypeMask"
                      fill-mask="#"
                      :rules="[ val => !!val || 'Por favor indicar o identificador']"
                      v-model="identifier.value"/>
                    <div v-if="identifier" class="col q-ml-md"  tabindex="0"> Preferido?
                      <q-radio keep-color color="primary" v-model="identifier.prefered" v-bind:val="true" label="Sim" />
                      <q-radio keep-color color="primary" v-model="identifier.prefered" v-bind:val="false" label="Nao"/>
                    </div>
                </div>
              </span>
              <span v-if="isCloseStep">
                <div class="q-mt-md">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Dados de Fim do serviço de Saúde</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
                </div>
                <div class="row">
                  <q-input
                      dense
                      outlined
                      class="col"
                      v-model="endDate"
                      ref="endDate"
                      label="Data de Fim *">
                      <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                              <q-date v-model="endDate" mask="DD-MM-YYYY" >
                              <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                              </div>
                              </q-date>
                          </q-popup-proxy>
                          </q-icon>
                      </template>
                    </q-input>
                    <q-select
                      class="col q-ml-md"
                      dense outlined
                      ref="stopReason"
                      :rules="[ val => !!val || 'Por favor indicar a nota de fim']"
                      v-model="closureEpisode.startStopReason"
                      :options="stopReasons"
                      option-value="id"
                      option-label="reason"
                      label="Notas de Fim [Referência, Transferido para, ...] *" />
                </div>
                <div class="row" v-if="isReferenceEpisode || isTransferenceEpisode">
                  <q-select
                      class="col" dense outlined
                      v-model="selectedProvince"
                      use-input
                      ref="province"
                      input-debounce="0"
                      :options="provinces"
                      option-value="id"
                      option-label="description"
                      label="Província"/>
                  <q-select
                      class="col q-ml-md" dense outlined
                      v-model="selectedDistrict"
                      use-input
                      ref="district"
                      input-debounce="0"
                      :options="districts"
                      option-value="id"
                      option-label="description"
                      label="Distrito"/>
                  <q-select
                      class="col q-ml-md"
                      dense outlined
                      ref="referralClinic"
                      :rules="[ val => !!val || 'Por favor indicar o destino do paciente.']"
                      v-model="closureEpisode.referralClinic"
                      :options="referralClinics"
                      option-value="id"
                      option-label="clinicName"
                      :label="patientDestinationfieldLabel" />
                </div>
                <div class="row" v-if="isDCReferenceEpisode">
                  <q-select
                      class="col" dense outlined
                      v-model="selectedClinicSectorType"
                      use-input
                      ref="clinicSectorType"
                      input-debounce="0"
                      :options="clinicSectorTypes"
                      option-value="id"
                      option-label="description"
                      label="Tipo de Sector de Dispensa"/>
                  <q-select
                      class="col q-ml-md"
                      dense outlined
                      ref="referealClinicSector"
                      :rules="[ val => !!val || 'Por favor indicar o sector de dispensa.']"
                      v-model="selectedClinicSector"
                      :options="referealClinicSectors"
                      option-value="id"
                      option-label="description"
                      label="Sector de Dispensa" />
                </div>
                <div class="row">
                    <TextInput
                      v-model="closureEpisode.notes"
                      label="Outras notas de fim *"
                      ref="closingNotes"
                      :rules="[ val => !!val || 'Por favor indicar outras notas do fim']"
                      dense
                      class="col" />
                </div>
              </span>

              <span v-if="isReOpenStep">
                <div class="q-mt-md">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Dados de Reabertura do serviço de Saúde</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
                </div>
                <div class="row">
                  <q-input
                      dense
                      outlined
                      class="col"
                      v-model="reOpenDate"
                      ref="reOpenDate"
                      label="Data de Reabertura *">
                      <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                              <q-date v-model="reOpenDate" mask="DD-MM-YYYY" >
                              <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                              </div>
                              </q-date>
                          </q-popup-proxy>
                          </q-icon>
                      </template>
                    </q-input>
                    <q-select
                      class="col q-ml-md"
                      dense outlined
                      ref="reOpenReason"
                      :rules="[ val => !!val || 'Por favor indicar a nota de reabertura']"
                      v-model="closureEpisode.startStopReason"
                      :options="startReasons"
                      option-value="id"
                      option-label="reason"
                      label="Notas de Reabertura *" />
                    <TextInput
                      v-model="closureEpisode.notes"
                      label="Outras notas *"
                      ref="reOpenNotes"
                      :rules="[ val => !!val || 'Por favor indicar outras notas do fim']"
                      dense
                      class="col q-ml-md" />
                </div>
              </span>
            </div>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn
                  type="submit"
                  :loading="submitting"
                  @click="submitting = true"
                  label="Submeter"
                  color="primary" />
            </q-card-actions>
        </form>
        <q-dialog v-model="alert.visible" @hide="desableSubmitting" :persistent="true">
          <Dialog :type="alert.type" @closeDialog="closeDialog" @commitOperation="commitOperation">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
    </q-card>
</template>

<script>
import { SessionStorage } from 'quasar'
import Patient from '../../../store/models/patient/Patient'
import PatientServiceIdentifier from '../../../store/models/patientServiceIdentifier/PatientServiceIdentifier'
import ClinicalService from '../../../store/models/ClinicalService/ClinicalService'
import ClinicSector from '../../../store/models/clinicSector/ClinicSector'
import Clinic from '../../../store/models/clinic/Clinic'
import IdentifierType from '../../../store/models/identifierType/IdentifierType'
import Episode from '../../../store/models/episode/Episode'
import EpisodeType from '../../../store/models/episodeType/EpisodeType'
import StartStopReason from '../../../store/models/startStopReason/StartStopReason'
import Province from '../../../store/models/province/Province'
import District from '../../../store/models/district/District'
import PatientTransReference from '../../../store/models/tansreference/PatientTransReference'
import PatientTransReferenceType from '../../../store/models/tansreference/PatientTransReferenceType'
import ClinicSectorType from '../../../store/models/clinicSectorType/ClinicSectorType'
import Prescription from '../../../store/models/prescription/Prescription'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import moment from 'moment'
export default {
    props: ['identifierToEdit', 'selectedPatient', 'stepp'],
   mixins: [mixinplatform, mixinutils],
    data () {
        return {
            submitting: false,
            identifierstartDate: '',
            identifier: new PatientServiceIdentifier(),
            closureEpisode: new Episode(),
            estados: ['Activo', 'Inactivo'],
            estado: ['Activo'],
            endDate: '',
            reOpenDate: '',
            usePreferedId: false,
            identifierTypeMask: '',
            selectedProvince: null,
            selectedDistrict: null,
            selectedClinicSectorType: null,
            selectedClinicSector: null,
            optionsNonFutureDate (dateOfBirth) {
                  return dateOfBirth <= moment().format('YYYY/MM/DD')
            }
        }
    },
    methods: {
      desableSubmitting () {
        this.submitting = false
      },
      init () {
        this.identifier.patient = Patient.find(this.patient.id)
        this.reloadIdentifierTypeMask()
      },
      reloadIdentifierTypeMask () {
        IdentifierType.localDbGetAll().then(idTypes => {
          IdentifierType.insert({ data: idTypes })
        })
        if (this.identifier.service !== null) {
          this.identifierTypeMask = this.identifier.service.identifierType.pattern
        }
      },
      isServiceAssociated (service) {
        const serviceIsAssociated = this.patient.identifiers.some((id) => {
          return id.service.id === service.id
        })
        return serviceIsAssociated
      },
      filterNotAssociatedServices () {
        const filteredServices = this.clinicalServices.filter((serv) => {
          return !this.isServiceAssociated(serv)
        })
        return filteredServices
      },
      identifierHasValidPrescription (episode) {
        const identifier = PatientServiceIdentifier.query()
                                                    .with(['clinic.province', 'clinic.district.province'])
                                                    .with(['episodes.patientVisitDetails.*'])
                                                    .where('id', episode.patientServiceIdentifier.id)
                                                    .first()
        const lastVisitWithPrescription = identifier.lastVisitPrescription()
        if (lastVisitWithPrescription !== null) {
          const lastPrescription = Prescription.query()
                                                .with('patientVisitDetails.pack')
                                                .with('duration')
                                                .where('id', lastVisitWithPrescription.prescription.id)
                                                .first()
          if (lastPrescription.remainigDurationInWeeks() > 0) return true
        }
        return false
      },
      submitForm () {
        this.submitting = true
        if (this.isCloseStep) {
          this.$refs.stopReason.validate()
          this.$refs.closingNotes.$refs.ref.validate()
              if (!this.$refs.stopReason.hasError &&
              !this.$refs.closingNotes.$refs.ref.hasError) {
              const episode = Episode.query()
                                      .with('startStopReason')
                                      .with('patientServiceIdentifier')
                                      .with('patientVisitDetails.*')
                                      .whereHas('episodeType', (query) => {
                                            query.where('code', 'INICIO')
                                          })
                                      .where('patientServiceIdentifier_id', this.identifier.id)
                                      .orderBy('creationDate', 'desc')
                                      .first()
              if (!this.isValidDate(String(this.getDateFromHyphenDDMMYYYY(this.endDate)))) {
                this.displayAlert('error', 'A data de fim é inválida.')
              } else if (this.getDateFromHyphenDDMMYYYY(this.endDate) > this.getDateFromHyphenYYYYMMDD(moment().format('YYYY-MM-DD'))) {
                this.displayAlert('error', 'A data de fim indicada é maior que a data da corrente.')
              } else if (episode !== null && this.getDateFromHyphenDDMMYYYY(this.endDate) < this.getDateFromHyphenYYYYMMDD(episode.episodeDate)) {
                this.displayAlert('error', 'A data de fim indicada é menor que a data de inicio ao tratamento.')
              } else if (episode !== null && episode.hasVisits() && (this.getDateFromHyphenDDMMYYYY(this.endDate) < this.getDateFromHyphenYYYYMMDD(episode.lastVisit().lastPack().pickupDate))) {
                this.displayAlert('error', 'A data de fim indicada é menor que a data da ultima visita efectuada pelo paciente.')
              } else if (this.isReferenceEpisode && !this.identifierHasValidPrescription(episode)) {
                this.displayAlert('error', 'O paciente deve ter registo de pelo menos uma prescrição e dispensa para poder ser referido.')
              } else if ((this.isReferenceEpisode || this.isTransferenceEpisode) && this.closureEpisode.referralClinic === null) {
                this.displayAlert('error', 'Por favor indicar o destino do paciente.')
              } else {
                this.doSave()
              }
          } else {
              this.submitting = false
            }
        } else if (this.isReOpenStep) {
          this.$refs.reOpenReason.validate()
          this.$refs.reOpenNotes.$refs.ref.validate()
              if (!this.$refs.reOpenReason.hasError &&
              !this.$refs.reOpenNotes.$refs.ref.hasError) {
              const episode = Episode.query()
                                      .with('startStopReason')
                                      .whereHas('episodeType', (query) => {
                                            query.where('code', 'FIM')
                                          })
                                      .where('patientServiceIdentifier_id', this.identifier.id)
                                      .orderBy('creationDate', 'desc')
                                      .first()
              if (!this.isValidDate(String(this.getDateFromHyphenDDMMYYYY(this.reOpenDate)))) {
                this.displayAlert('error', 'A data de abertura é inválida.')
              } else if (this.getDateFromHyphenDDMMYYYY(this.reOpenDate) > this.getDateFromHyphenYYYYMMDD(moment().format('YYYY-MM-DD'))) {
                this.displayAlert('error', 'A data de abertura indicada é maior que a data da corrente.')
              } else if (this.getDateFromHyphenDDMMYYYY(this.reOpenDate) < this.getDateFromHyphenYYYYMMDD(episode.episodeDate)) {
                this.displayAlert('error', 'A data de abertura indicada é menor que a data do ultimo fecho efectuado.')
              } else {
                this.doSave()
              }
          } else {
              this.submitting = false
            }
        } else if (this.isCreateStep || this.isEditStep) {
          this.$refs.startDate.validate()
          this.$refs.clinicalService.validate()
          this.$refs.state.validate()
          if (!this.usePreferedId) {
            this.$refs.identifier.$refs.identifier.validate()
          } else {
            this.identifier.prefered = false
            this.identifier.value = ''
          }
          if (!this.$refs.clinicalService.hasError && !this.$refs.startDate.hasError &&
              !this.$refs.state.hasError) {
                if (!this.isValidDate(String(this.getDateFromHyphenDDMMYYYY(this.identifierstartDate)))) {
                this.displayAlert('error', 'A data de admissão é inválida.')
              } else if (this.getDateFromHyphenDDMMYYYY(this.identifierstartDate) < this.getDateFromHyphenYYYYMMDD(this.selectedPatient.dateOfBirth)) {
                this.displayAlert('error', 'A data de admissão indicada é menor que a data de nascimento do paciente/utente.')
              } else if (!this.usePreferedId && (this.identifier.value === '' || this.stringContains(this.identifier.value, '#'))) {
                this.displayAlert('error', 'Por favor indicar um identificador dentro do padrão.')
              } else {
                if (this.isEditStep) {
                  const episode = Episode.query()
                                        .with('startStopReason')
                                        .where('patientServiceIdentifier_id', this.identifier.id)
                                        .orderBy('creationDate', 'desc')
                                        .first()
                  if (episode !== null && (this.getDateFromHyphenDDMMYYYY(this.identifierstartDate) > this.getDateFromHyphenYYYYMMDD(episode.episodeDate))) {
                    this.displayAlert('error', 'A data de admissão indicada é maior que a data do primeiro episódio registado.')
                  } else if (this.hasVisitsMade && (this.identifier.service.id !== this.identifierToEdit.service.id)) {
                    this.displayAlert('error', 'Não pode alterar o serviço de saúde pois ja existem registos de visitas associados.')
                  } else if (this.patient.identifiers.length > 1 && this.patient.hasPreferedId() && this.identifier.prefered) {
                    this.displayAlert('confirmation', 'O identificador neste momento em associação passará a ser considerado como preferido, deseja continuar neste modo?')
                  } else {
                    this.doSave()
                  }
                } else if (this.patient.identifiers.length > 1 && this.patient.hasPreferedId() && this.identifier.prefered) {
                    this.displayAlert('confirmation', 'O identificador neste momento em associação passará a ser considerado como preferido, deseja continuar neste modo?')
                } else {
                  this.doSave()
                }
              }
            } else {
              this.submitting = false
            }
        }
      },
      lastStartEpisodeWithPrescription () {
        let episode = null
        const episodes = Episode.query()
                                .with('startStopReason')
                                .with('clinicSector')
                                .with('patientServiceIdentifier')
                                .with('patientVisitDetails.*')
                                .whereHas('episodeType', (query) => {
                                      query.where('code', 'INICIO')
                                    })
                                .where('patientServiceIdentifier_id', this.identifier.id)
                                .orderBy('creationDate', 'desc')
                                .get()
        if (episodes.length <= 0) return null

        Object.keys(episodes).forEach(function (k) {
          const id = episodes[k]
          if (episode === null && id.hasVisits()) {
            episode = id
          }
        })
        return episode
      },
      canEditIdentifier () {
        const identifier = PatientServiceIdentifier.query()
                                                  .with(['clinic.province', 'clinic.district.province'])
                                                  .with('episodes.patientVisitDetails')
                                                  .where('id', this.identifierToEdit.id)
                                                  .first()
        return identifier.canBeEdited()
      },
      async doSave () {
        this.identifier.episodes = []
        if (this.isCloseStep) {
          this.closureEpisode.episodeType = EpisodeType.query().where('code', 'FIM').first()
          this.closureEpisode.episodeType_id = this.closureEpisode.episodeType.id
          this.closureEpisode.episodeDate = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.endDate))
          if (!this.isReferenceEpisode || !this.isDCReferenceEpisode) this.identifier.endDate = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.endDate))
        }
        if (this.isReOpenStep) {
          this.closureEpisode.episodeType = EpisodeType.query().where('code', 'INICIO').first()
          this.closureEpisode.episodeType_id = this.closureEpisode.episodeType.id
          this.closureEpisode.episodeDate = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.reOpenDate))
          this.identifier.reopenDate = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.reOpenDate))
          this.identifier.endDate = ''
        }
        if (this.isCloseStep || this.isReOpenStep) {
          this.closureEpisode.creationDate = moment()
          this.closureEpisode.clinic = this.currClinic
          this.closureEpisode.clinic_id = this.currClinic.id
          if (this.selectedClinicSector !== null) {
            this.closureEpisode.clinicSector = ClinicSector.query()
                                                            .with('clinic')
                                                            .with('clinicSectorType')
                                                            .where('id', this.selectedClinicSector.id)
                                                            .first()
          } else {
            this.closureEpisode.clinicSector = this.lastEpisode.clinicSector
            this.closureEpisode.clinicSector_id = this.lastEpisode.clinicSector.id
          }
          this.closureEpisode.clinicSector.clinic = this.currClinic
          this.closureEpisode.clinicSector.clinic_id = this.currClinic.id
          this.closureEpisode.clinicSector.clinicSectorType = ClinicSectorType.find(this.closureEpisode.clinicSector.clinic_sector_type_id)
          this.closureEpisode.clinicSector.clinic_sector_type_id = this.closureEpisode.clinicSector.clinicSectorType.id
          this.identifier.episodes.push(this.closureEpisode)
        }
        if (this.isCreateStep) {
          this.identifier.clinic = this.currClinic
          this.identifier.startDate = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.identifierstartDate))
          this.identifier.identifierType = this.identifier.service.identifierType
        }
        if (this.isEditStep) {
          this.identifier.startDate = this.getYYYYMMDDFromJSDate(this.getDateFromHyphenDDMMYYYY(this.identifierstartDate))
        }
        if (this.mobile) {
          this.identifier.identifier_type_id = this.identifier.identifierType.id
          this.identifier.service_id = this.identifier.service.id
          this.identifier.patient_id = this.identifier.patient.id
          this.identifier.clinic_id = this.identifier.clinic.id

          if (this.isCreateStep) {
            this.identifier.syncStatus = 'R'
          } else {
            this.identifier.syncStatus = 'U'
          }

          if (this.identifier.episodes.length > 0) {
            this.identifier.episodes[0].episodeType_id = this.identifier.episodes[0].episodeType.id
            this.identifier.episodes[0].clinicSector_id = this.identifier.episodes[0].clinicSector.id
            this.identifier.episodes[0].patientServiceIdentifier_id = this.identifier.id
            this.identifier.episodes[0].startStopReason_id = this.identifier.episodes[0].startStopReason.id
            this.identifier.episodes[0].referralClinic_id = this.identifier.episodes[0].referralClinic !== null ? this.identifier.episodes[0].referralClinic.id : null
            this.identifier.episodes[0].syncStatus = 'R'
          }
          const identifierCopy = new PatientServiceIdentifier(JSON.parse(JSON.stringify(this.identifier)))
          if (identifierCopy.episodes.length > 0) {
            await Episode.localDbAdd(identifierCopy.episodes[0])
            Episode.insert({ data: identifierCopy.episodes[0] })
            identifierCopy.episodes = []
          }
          if (this.isCreateStep) {
            await PatientServiceIdentifier.localDbAdd(identifierCopy)
            PatientServiceIdentifier.insert({ data: identifierCopy })
          } else {
            await PatientServiceIdentifier.localDbUpdate(identifierCopy)
            PatientServiceIdentifier.update({ data: identifierCopy })
          }
          this.initPatientTransReference()
          this.displayAlert('info', 'Operação efectuada com sucesso.')
        } else {
          await PatientServiceIdentifier.apiSave(this.identifier, this.isCreateStep).then(resp => {
            this.identifier.id = resp.response.data.id
            if (this.isReOpenStep || this.isCloseStep) {
              this.fetchUpdatedIdentifier(resp.response.data.id)
            }
            this.initPatientTransReference()
            let msg = ''
            if (this.isCloseStep) {
              msg = 'Serviço de saúde fechado com sucesso.'
            } else if (this.isCreateStep) {
              msg = 'Serviço de saúde adicionado com sucesso.'
            } else if (this.isEditStep) {
              this.identifier.id = resp.response.data.id
              msg = 'Serviço de saúde actualizado com sucesso.'
            } else if (this.isReOpenStep) {
              msg = 'Serviço de saúde reaberto com sucesso.'
            }
            this.displayAlert('info', msg)
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
      },
      initPatientTransReference () {
        if (this.isTransferenceEpisode || this.isReferenceEpisode) {
          const transReference = new PatientTransReference({
            syncStatus: 'P',
            operationDate: this.closureEpisode.episodeDate,
            creationDate: moment(),
            operationType: PatientTransReferenceType.query().where('code', this.isTransferenceEpisode ? 'TRANSFERENCIA' : 'REFERENCIA_FP').first(),
            origin: this.currClinic,
            destination: this.closureEpisode.referralClinic.uuid,
            identifier: Object.assign({}, this.identifier),
            patient: Object.assign({}, this.patient)
          })
          transReference.identifier.episodes = []
          transReference.patient.identifiers = []
          if (this.mobile) {
            transReference.originId = transReference.origin.id
            transReference.identifierId = transReference.identifier.id
            transReference.patientId = transReference.patient.id
            transReference.patientTransReferenceTypeId = transReference.operationType.id
          } else {
            setTimeout(this.doTransReference(transReference), 2)
          }
        } else if (this.isDCReferenceEpisode) {
          const transReference = new PatientTransReference({
            syncStatus: 'P',
            operationDate: this.closureEpisode.episodeDate,
            creationDate: moment(),
            operationType: PatientTransReferenceType.query().where('code', 'REFERENCIA_DC').first(),
            origin: this.currClinic,
            destination: this.selectedClinicSector.uuid,
            identifier: Object.assign({}, this.identifier),
            patient: Object.assign({}, this.patient)
          })
          transReference.identifier.episodes = []
          transReference.patient.identifiers = []
          if (this.mobile) {
            transReference.originId = transReference.origin.id
            transReference.identifierId = transReference.identifier.id
            transReference.patientId = transReference.patient.id
            transReference.patientTransReferenceTypeId = transReference.operationType.id
          } else {
            setTimeout(this.doTransReference(transReference), 2)
          }
        }
      },
      doTransReference (transReference) {
        if (this.mobile) {
          transReference.syncStatus = 'R'
          PatientTransReference.localDbAdd(transReference)
          PatientTransReference.insert({ data: transReference })
        } else {
          PatientTransReference.apiSave(transReference)
        }
      },
      async fetchUpdatedIdentifier (id) {
        await PatientServiceIdentifier.apiFetchById(id).then(resp => {
        })
      },
      commitOperation () {
        this.submitting = true
        this.doSave()
      }
    },
    created () {
      this.setStep(this.stepp)
        if (!this.isCreateStep) {
          this.identifier = Object.assign({}, this.identifierToEdit)
          this.identifier.clinic = this.currClinic
          this.identifierstartDate = this.getDDMMYYYFromJSDate(this.identifier.startDate)
          this.identifier.service = ClinicalService.query()
                                                  .with('identifierType')
                                                  .where('id', this.identifier.service.id)
                                                  .first()
        }
    },
    mounted () {
      this.init()
    },
    computed: {
      clinicSectorTypes () {
        return ClinicSectorType.query().with('clinicSectorList.*').get()
      },
      referealClinicSectors () {
        if (this.selectedClinicSectorType === null) return []
        return this.selectedClinicSectorType.clinicSectorList
      },
      provinces: {
        get () {
           if (this.isReferenceEpisode) {
            return Province.query().with('districts.*').has('code').where('id', this.currClinic.province.id).get()
          } else {
            return Province.query().with('districts.*').has('code').get()
          }
        }
      },
      districts: {
        get () {
          if (this.selectedProvince !== null && this.selectedProvince !== undefined) {
           // if (this.isReferenceEpisode) // this.loadProvince()
            return District.query().with('province').where('province_id', this.selectedProvince.id).has('code').get()
          } else {
            return null
          }
        }
      },
      isReferenceEpisode () {
        if (this.closureEpisode === null || this.closureEpisode === undefined) return false
        if (this.closureEpisode.startStopReason === null || this.closureEpisode.startStopReason === undefined) return false
        return this.closureEpisode.startStopReason.code === 'REFERIDO_PARA'
      },
      isTransferenceEpisode () {
        if (this.closureEpisode === null || this.closureEpisode === undefined) return false
        if (this.closureEpisode.startStopReason === null || this.closureEpisode.startStopReason === undefined) return false
        return this.closureEpisode.startStopReason.code === 'TRANSFERIDO_PARA'
      },
      isDCReferenceEpisode () {
        if (this.closureEpisode === null || this.closureEpisode === undefined) return false
        if (this.closureEpisode.startStopReason === null || this.closureEpisode.startStopReason === undefined) return false
        return this.closureEpisode.startStopReason.code === 'REFERIDO_DC'
      },
      referralClinics () {
        let clinicList = []
        if (this.selectedDistrict !== null) {
         if (this.isReferenceEpisode) {
            clinicList = Clinic.query()
                            .with('province')
                            .with('district.province')
                            .with('facilityType')
                            .where((clinic) => {
                              return clinic.mainClinic === false && clinic.active === true
                            }).get()
            const filteredList = clinicList.filter((clinic) => {
              return clinic.facilityType.code !== 'US' && clinic.province.id === this.selectedProvince.id && clinic.district.id === this.selectedDistrict.id
            })

            return filteredList
          } else {
              clinicList = Clinic.query()
                            .with('province')
                            .with('district.province')
                            .with('facilityType')
                            .where((clinic) => {
                              return clinic.mainClinic === false && clinic.active === true
                            }).get()
            const filteredList = clinicList.filter((clinic) => {
              return clinic.facilityType.code === 'US' && clinic.province.id === this.selectedProvince.id && clinic.district.id === this.selectedDistrict.id
            })

            return filteredList
          }
        }
        return []
      },
      patient: {
        get () {
          return Patient.query()
                        .with('identifiers.*')
                        .with('province')
                        .with('attributes')
                        .with('appointments')
                        .with('district.province')
                        .with('postoAdministrativo')
                        .with('bairro')
                        .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                        .where('id', SessionStorage.getItem('selectedPatient').id)
                        .first()
        }
      },
      hasVisitsMade () {
        return this.lastStartEpisodeWithPrescription() !== null
      },
      canEdit () {
        return this.canEditIdentifier()
      },
      clinicalServices: {
        get () {
          return ClinicalService.query().with('identifierType').has('code').orderBy('code', 'asc').get()
        }
      },
      notAssociatedServices: {
        get () {
          return this.filterNotAssociatedServices()
        }
      },
      clinicSerctors () {
        return ClinicSector.query().with('clinic').where('clinic_id', this.currClinic.id).orderBy('code', 'asc').get()
      },
      identifierTypes () {
        return IdentifierType.all()
      },
      pharmacies () {
        return Clinic.query().with('province').where('mainClinic', false).orderBy('code', 'asc').get()
      },
      stopReasons () {
        const allReasons = StartStopReason.query()
                              .where('isStartReason', false).orderBy('reason', 'asc').get()
        let resonList = []
        if (this.lastEpisode.isReferenceOrTransferenceEpisode()) {
          resonList = allReasons.filter((reason) => {
            return reason.code !== 'REFERIDO_DC' && reason.code !== 'TRANSFERIDO_PARA' && reason.code !== 'REFERIDO_PARA'
          })
          return resonList
        } else {
          return allReasons
        }
      },
      startReasons () {
        const allReasons = StartStopReason.query()
                              .where('isStartReason', true)
                              .orderBy('reason', 'asc')
                              .get()
        let resonList = []
        if (this.lastEpisode !== null && this.lastEpisode.isReferenceOrTransferenceEpisode()) {
          resonList = allReasons.filter((reason) => {
            return reason.code === 'VOLTOU_REFERENCIA' || reason.code === 'REINICIO_TRATAMETO' || reason.code === 'TRANSFERIDO_DE'
          })
          return resonList
        } else {
          resonList = allReasons.filter((reason) => {
            return reason.code !== 'VOLTOU_REFERENCIA'
          })
          return resonList
        }
      },
      lastEpisode: {
        get () {
          return Episode.query()
                      .withAll()
                      .where('patientServiceIdentifier_id', this.identifier.id)
                      .orderBy('episodeDate', 'desc')
                      .first()
        }
      }
    },
    components: {
      TextInput: require('components/Shared/Input/TextField.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default,
      identifierInput: require('components/Patient/Inputs/PatientIdentifierInput.vue').default
    }
}
</script>

<style>

</style>
