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
              <span v-else>Adicionar</span>
              Episódio
            </div>
            <div class="q-mx-lg">
              <div class="q-mt-lg">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Dados de início do Episódio</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
              </div>
              <div class="row q-mt-md">
                  <q-select
                    class="col"
                    disable
                    dense outlined
                    v-model="identifier.service"
                    option-value="id"
                    option-label="description"
                    label="Serviço de Saúde" />

                  <q-input
                      dense
                      outlined
                      disable
                      class="col q-ml-md"
                      v-model="identifierstartDate"
                      ref="birthDate"
                      :rules="[ val => val && val.length > 0 || 'Por favor indicar a data de admissão']"
                      label="Data de Admissão">
                      <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                              <q-date v-model="identifier.startDate" mask="DD-MM-YYYY">
                              <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                              </div>
                              </q-date>
                          </q-popup-proxy>
                          </q-icon>
                      </template>
                  </q-input>

                  <q-select class="col q-ml-md"
                    dense outlined
                    v-model="episode.startStopReason"
                    :disable="!inEdition"
                    :options="startReasons"
                    ref="startReason"
                    :rules="[ val => !!val || 'Por favor indicar a nota de início']"
                    option-value="id"
                    option-label="reason"
                    label="Notas de início *" />
              </div>
              <div class="row q-mt-md">
                  <q-select
                    class="col"
                    dense outlined
                    :disable="!inEdition"
                    ref="clinicSerctor"
                    :rules="[ val => !!val || 'Por favor indicar o sector onde vai ocorrer o atendimento']"
                    v-model="episode.clinicSector"
                    :options="clinicSerctors"
                    option-value="id"
                    option-label="description"
                    label="Sector Clinico *" />
                  <q-input
                      dense
                      outlined
                      :disable="!inEdition"
                      class="col q-ml-md"
                      v-model="startDate"
                      ref="startDate"
                      :rules="[ val => val && val.length > 0 || 'Por favor indicar a data de início']"
                      label="Data de Início *">
                      <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                              <q-date v-model="startDate"  :options="optionsNonFutureDate" mask="DD-MM-YYYY">
                              <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                              </div>
                              </q-date>
                          </q-popup-proxy>
                          </q-icon>
                      </template>
                  </q-input>
                  <div class="col q-ml-md"/>
              </div>
              <span v-if="isEditStep">
                <div class="q-mt-md">
                  <div class="row items-center q-mb-sm">
                      <span class="text-subtitle2">Dados do Novo Episódio</span>
                  </div>
                  <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
                </div>
                <div class="row">
                  <q-input
                        dense
                        outlined
                        class="col"
                        v-model="stopDate"
                        :disable="episode.id !== null && isEditStep"
                        ref="stopDate"
                        label="Data *">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="stopDate" mask="DD-MM-YYYY">
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
                      :disable="episode.id !== null && isEditStep"
                      dense outlined
                      ref="stopReason"
                      :rules="[ val => !!val || 'Por favor indicar a nota de fim']"
                      v-model="closureEpisode.startStopReason"
                      :options="stopReasons"
                      option-value="id"
                      option-label="reason"
                      label="Notas do Episódio *" />
                </div>

                <div class="row" v-if="isReferenceEpisode || isTransferenceEpisode">
                  <q-select
                      class="col" dense outlined
                      v-model="selectedProvince"
                      use-input
                      :disable="(episode.id !== null && isEditStep) || isReferenceEpisode"
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
                      :disable="episode.id !== null && isEditStep"
                      ref="district"
                      input-debounce="0"
                      :options="districts"
                      option-value="id"
                      option-label="description"
                      label="Distrito"/>
                  <q-select
                      class="col q-ml-md"
                      dense outlined
                      :disable="episode.id !== null && isEditStep"
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
                      :disable="episode.id !== null && isEditStep"
                      ref="clinicSectorType"
                      input-debounce="0"
                      :options="clinicSectorTypes"
                      option-value="id"
                      option-label="description"
                      label="Tipo de Sector de Dispensa"/>
                  <q-select
                      class="col q-ml-md"
                      dense outlined
                      :disable="episode.id !== null && isEditStep"
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
                      label="Outras notas do episódio"
                      :disable="episode.id !== null && isEditStep"
                      ref="endNotes"
                      :rules="[ val => !!val || 'Por favor indicar a nota de fim']"
                      dense
                      class="col" />
                </div>
              </span>
            </div>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn type="submit" :loading="submitting" label="Submeter" color="primary" />
            </q-card-actions>
        </form>
        <q-dialog v-model="alert.visible" @hide="desableSubmitting" :persistent="true">
          <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
    </q-card>
</template>

<script>
import Clinic from '../../../store/models/clinic/Clinic'
import ClinicSector from '../../../store/models/clinicSector/ClinicSector'
import Episode from '../../../store/models/episode/Episode'
import PatientServiceIdentifier from '../../../store/models/patientServiceIdentifier/PatientServiceIdentifier'
import EpisodeType from '../../../store/models/episodeType/EpisodeType'
import StartStopReason from '../../../store/models/startStopReason/StartStopReason'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
import Province from '../../../store/models/province/Province'
import District from '../../../store/models/district/District'
import PatientTransReference from '../../../store/models/tansreference/PatientTransReference'
import PatientTransReferenceType from '../../../store/models/tansreference/PatientTransReferenceType'
import ClinicSectorType from '../../../store/models/clinicSectorType/ClinicSectorType'
import FacilityType from '../../../store/models/facilityType/FacilityType'
import IdentifierType from '../../../store/models/identifierType/IdentifierType'
import Prescription from '../../../store/models/prescription/Prescription'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import moment from 'moment'
export default {
    props: ['episodeToEdit', 'curIdentifier', 'stepp'],
    mixins: [mixinplatform, mixinutils],
    emits: ['update:submitting'],
    data () {
        return {
          submitting: false,
            identifier: new PatientServiceIdentifier(),
            episode: new Episode(),
            closureEpisode: new Episode(),
            estados: ['Activo', 'Curado'],
            startDate: '',
            stopDate: '',
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
      async init () {
        this.setStep(this.stepp)
        this.identifier = new PatientServiceIdentifier(this.curIdentifier)
        this.episode = Object.assign({}, this.episodeToEdit)
        this.episode.patientServiceIdentifier = this.identifier
        if (this.isEditStep) {
          this.startDate = this.getDDMMYYYFromJSDate(this.episode.episodeDate)
          this.episode.patientServiceIdentifier.episodes = []
          this.episode.clinicSector.clinic = Clinic.query()
                                                  .with('province')
                                                  .with('district.province')
                                                  .with('facilityType')
                                                  .where('id', this.episode.clinicSector.clinic_id)
                                                  .first()
        } else {
          if (this.identifier.lastEpisode() !== null && this.identifier.lastEpisode().isStartEpisode() && (this.episode !== null || this.episode !== undefined)) {
            this.episode = new Episode(this.identifier.lastEpisode())
            this.changeToCloseStep()
          }
        }
        if (this.mobile) {
          await ClinicSector.localDbGetAll().then(items => {
            ClinicSector.insertOrUpdate({ data: items })
          })
        }
      },
     submitForm () {
        this.submitting = true
        if (this.isCreateStep || this.isEditStep) {
          this.$refs.startReason.validate()
          this.$refs.clinicSerctor.validate()
          this.$refs.startDate.validate()

          if (!this.$refs.startReason.hasError && !this.$refs.startDate.hasError &&
              !this.$refs.clinicSerctor.hasError) {
                if (!this.isValidDate(String(this.getDateFromHyphenDDMMYYYY(this.startDate)))) {
                this.displayAlert('error', 'A data de inicio é inválida.')
              } else if (this.getYYYYMMDDFromJSDate(this.extractHyphenDateFromDMYConvertYMD(this.startDate)) > moment().format('YYYY-MM-DD')) {
                  this.displayAlert('error', 'A data de inicio indicada é maior que a data da corrente.')
                } else if (this.getYYYYMMDDFromJSDate(this.extractHyphenDateFromDMYConvertYMD(this.startDate)) < this.getYYYYMMDDFromJSDate(this.curIdentifier.startDate)) {
                  this.displayAlert('error', 'A data de inicio indicada é menor que a data de admissão ao serviço clínico.')
                } else {
                  if (this.isEditStep) {
                    const episode = Episode.query()
                                      .with('startStopReason')
                                      .with('patientServiceIdentifier')
                                      .with('patientVisitDetails.*')
                                      .where('id', this.episodeToEdit.id)
                                      .first()
                    if (episode.hasVisits() && (this.getYYYYMMDDFromJSDate(this.extractHyphenDateFromDMYConvertYMD(this.startDate)) < this.getYYYYMMDDFromJSDate(this.extractHyphenDateFromDMYConvertYMD(episode.lastVisit().lastPack().pickupDate)))) {
                       this.displayAlert('error', 'A data de inicio indicada é menor que a data da ultima visita efectuada pelo paciente.')
                    } else {
                      this.doSave()
                    }
                  } else {
                    this.doSave()
                  }
                }
          }
        } else {
              this.submitting = false
            }
      },
      async doSave () {
        if (this.inEdition) {
          this.episode.episodeType = EpisodeType.query().where('code', 'INICIO').first()
          this.episode.notes = 'Inicio ao tratamento'
          this.episode.clinic = this.currClinic
          this.episode.episodeDate = this.extractHyphenDateFromDMYConvertYMD(this.startDate)
          this.episode.creationDate = moment().format('YYYY-MM-DD')
        } else {
          if (this.stopDate !== '' && this.closureEpisode.notes !== '' && this.closureEpisode.StartStopReason !== null) {
            this.step = 'close'
             if (this.isCloseStep) {
              this.$refs.stopReason.validate()
              this.$refs.endNotes.$refs.ref.validate()
              if (!this.$refs.stopReason.hasError &&
                  !this.$refs.endNotes.$refs.ref.hasError) {
                    this.closureEpisode.episodeType = EpisodeType.query().where('code', 'FIM').first()
                    this.closureEpisode.clinic = this.currClinic
                    this.closureEpisode.episodeDate = this.extractHyphenDateFromDMYConvertYMD(this.stopDate)
                    this.closureEpisode.creationDate = moment().format('DD-MM-YYYY')
                    this.closureEpisode.patientServiceIdentifier = this.identifier

                    if (!this.isValidDate(String(this.getDateFromHyphenDDMMYYYY(this.stopDate)))) {
                      this.displayAlert('error', 'A data de fim é inválida.')
                    } else if (this.extractHyphenDateFromDMYConvertYMD(this.stopDate) > moment().format('YYYY-MM-DD')) {
                      this.displayAlert('error', 'A data de fim indicada é maior que a data da corrente.')
                    } else if (this.getYYYYMMDDFromJSDate(this.extractHyphenDateFromDMYConvertYMD(this.stopDate)) < this.getYYYYMMDDFromJSDate(this.extractHyphenDateFromDMYConvertYMD(this.episode.episodeDate))) {
                      this.displayAlert('error', 'A data de inicio indicada é menor que a data de inicio ao tratamento.')
                    } else {
                      console.log(this.episodeToEdit)
                      const episode = Episode.query()
                                              .with('startStopReason')
                                              .with('patientServiceIdentifier')
                                              .with('patientVisitDetails.*')
                                              .where('id', this.episode.id)
                                              .first()
                      if (this.isReferenceEpisode && episode.hasVisits()) {
                          episode.lastVisit().prescription.patientVisitDetails = PatientVisitDetails.query()
                                                                                                    .with('pack')
                                                                                                    .where('prescription_id', episode.lastVisit().prescription.id)
                                                                                                    .get()
                      }
                      if (episode.hasVisits() && (this.extractHyphenDateFromDMYConvertYMD(this.stopDate) < this.extractHyphenDateFromDMYConvertYMD(episode.lastVisit().lastPack().pickupDate))) {
                        this.displayAlert('error', 'A data de fim indicada é menor que a data da ultima visita efectuada pelo paciente.')
                      } else if ((this.isReferenceEpisode || this.isDCReferenceEpisode) && !this.identifierHasValidPrescription(episode)) {
                        this.displayAlert('error', 'O paciente deve ter registo de pelo menos uma prescrição e dispensa para poder ser referido.')
                      } else if ((this.isReferenceEpisode || this.isTransferenceEpisode) && this.closureEpisode.referralClinic === null) {
                        this.displayAlert('error', 'Por favor indicar o destino do paciente.')
                      } else {
                        if (this.selectedClinicSector === null) {
                          this.closureEpisode.clinicSector = ClinicSector.query()
                                                                          .with('clinic')
                                                                          .with('clinicSectorType')
                                                                          .where('id', this.episode.clinicSector.id)
                                                                          .first()
                        } else {
                          this.closureEpisode.clinicSector = ClinicSector.query()
                                                                          .with('clinic')
                                                                          .with('clinicSectorType')
                                                                          .where('id', this.selectedClinicSector.id)
                                                                          .first()
                        }
                        if (this.mobile) {
                          this.closureEpisode.referralClinic_id = this.closureEpisode.referralClinic !== null ? this.closureEpisode.referralClinic.id : null
                          this.closureEpisode.startStopReason_id = this.closureEpisode.startStopReason.id
                          this.closureEpisode.patientServiceIdentifier_id = this.closureEpisode.patientServiceIdentifier.id
                          this.closureEpisode.clinicSector_id = this.closureEpisode.clinicSector.id
                          this.closureEpisode.episodeType_id = this.closureEpisode.episodeType.id
                          this.closureEpisode.syncStatus = 'R'
                          await Episode.localDbAdd(JSON.parse(JSON.stringify(this.closureEpisode)))
                          Episode.insert({ data: this.closureEpisode })
                          this.displayAlert('info', 'Operação efectuada com sucesso.')
                        } else {
                          Episode.apiSave(this.closureEpisode).then(resp => {
                            this.closureEpisode.patientServiceIdentifier.patient = this.patient
                            this.closureEpisode.patientServiceIdentifier.patient.clinic.facilityType = FacilityType.find(this.closureEpisode.patientServiceIdentifier.patient.clinic.facilityTypeId)
                            this.closureEpisode.patientServiceIdentifier.clinic.facilityType = FacilityType.find(this.closureEpisode.patientServiceIdentifier.clinic.facilityTypeId)
                            this.closureEpisode.patientServiceIdentifier.service.identifierType = IdentifierType.find(this.closureEpisode.patientServiceIdentifier.service.identifier_type_id)

                            this.initPatientTransReference()
                            this.displayAlert('info', 'Operação efectuada com sucesso.')
                          }).catch(error => {
                            console.log(error)
                          })
                        }
                      }
                    }
              } else {
              this.submitting = false
            }
            }
          }
        }

        if (!this.isCloseStep) {
          this.episode.episodeDate = this.extractHyphenDateFromDMYConvertYMD(this.startDate)
          this.episode.clinicSector.clinicSectorType = ClinicSectorType.find(this.episode.clinicSector.clinic_sector_type_id)
          this.episode.patientServiceIdentifier.clinic.district = District.query().with('province').where('id', this.episode.patientServiceIdentifier.clinic.district_id).first()
          this.episode.patientServiceIdentifier.clinic.facilityType = FacilityType.find(this.episode.patientServiceIdentifier.clinic.facilityTypeId)
          this.episode.patientServiceIdentifier.episodes = []
          const lastEpisodeCopy = JSON.parse(JSON.stringify(this.episode))
          if (this.mobile) {
            lastEpisodeCopy.referralClinic_id = lastEpisodeCopy.referralClinic !== null ? lastEpisodeCopy.referralClinic.id : null
            lastEpisodeCopy.startStopReason_id = lastEpisodeCopy.startStopReason.id
            lastEpisodeCopy.patientServiceIdentifier_id = lastEpisodeCopy.patientServiceIdentifier.id
            lastEpisodeCopy.clinicSector_id = lastEpisodeCopy.clinicSector.id
            lastEpisodeCopy.episodeType_id = lastEpisodeCopy.episodeType.id
            lastEpisodeCopy.syncStatus = this.isCreateStep ? 'R' : 'U'
            await Episode.localDbAdd(lastEpisodeCopy)
            Episode.insert({ data: lastEpisodeCopy })
            this.displayAlert('info', 'Operação efectuada com sucesso.')
          } else {
            Episode.apiSave(this.episode, !this.isEditStep).then(resp => {
            if (new Episode(this.episode).isBackReferenceEpisode()) {
              const transReference = new PatientTransReference({
                syncStatus: 'P',
                operationDate: this.episode.episodeDate,
                creationDate: moment().format('DD-MM-YYYY'),
                operationType: PatientTransReferenceType.query().where('code', 'VOLTOU_DA_REFERENCIA').first(),
                origin: this.currClinic,
                destination: new Episode(lastEpisodeCopy).isDCReferenceEpisode() ? this.lastEpisode.clinicSector.uuid : this.lastEpisode.referralClinic.uuid,
                identifier: this.episode.patientServiceIdentifier,
                patient: this.patient
              })
              transReference.patient.clinic.facilityType = FacilityType.find(transReference.patient.clinic.facilityTypeId)

              setTimeout(this.doTransReference(transReference), 2)
            }
            this.displayAlert('info', this.isCreateStep ? 'Episódio adicionado com sucesso.' : 'Episódio actualizado com sucesso.')
            }).catch(error => {
              console.log(error)
            })
          }
        }
      },
      initPatientTransReference () {
        if (this.isTransferenceEpisode || this.isReferenceEpisode) {
          const transReference = new PatientTransReference({
            syncStatus: 'P',
            operationDate: this.closureEpisode.episodeDate,
            creationDate: moment().format('YYYY-MM-DD'),
            operationType: PatientTransReferenceType.query().where('code', this.isTransferenceEpisode ? 'TRANSFERENCIA' : 'REFERENCIA_FP').first(),
            origin: this.currClinic,
            destination: this.closureEpisode.referralClinic.uuid,
            identifier: this.closureEpisode.patientServiceIdentifier,
            patient: this.patient
          })
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
            creationDate: moment().format('YYYY-MM-DD'),
            operationType: PatientTransReferenceType.query().where('code', 'REFERENCIA_DC').first(),
            origin: this.currClinic,
            destination: this.selectedClinicSector.uuid,
            identifier: this.closureEpisode.patientServiceIdentifier,
            patient: this.patient
          })
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
      identifierHasValidPrescription (episode) {
        const identifier = PatientServiceIdentifier.query()
                                                    .with(['episodes.patientVisitDetails.*'])
                                                    .where('id', episode.patientServiceIdentifier.id)
                                                    .first()
        console.log(identifier)
        const lastVisitWithPrescription = identifier.lastVisitPrescription()
        console.log(lastVisitWithPrescription)
        if (lastVisitWithPrescription !== null) {
          const lastPrescription = Prescription.query()
                                                .with('patientVisitDetails.pack')
                                                .with('duration')
                                                .where('id', lastVisitWithPrescription.prescription.id)
                                                .first()
                                                console.log(lastPrescription.remainigDurationInWeeks())
          if (lastPrescription.remainigDurationInWeeks() > 0) return true
        }
        return false
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
      loadProvince () {
        this.selectedProvince = Province.query().with('districts.*').where('id', this.currClinic.province.id).first()
      }
    },
    created () {
        this.init()
    },
    mounted () {
    },
    components: {
      Dialog: require('components/Shared/Dialog/Dialog.vue').default,
      TextInput: require('components/Shared/Input/TextField.vue').default
    },
    computed: {
      patientDestinationfieldLabel () {
        if (this.isTransferenceEpisode) {
          return 'US de Transferência'
        } else if (this.isReferenceEpisode) {
          return 'Farmácia de Referência'
        } else {
          return 'Sem Titulo'
        }
      },
      provinces: {
        get () {
           if (this.isReferenceEpisode) {
             this.loadProvince()
            return Province.query().with('districts.*').has('code').where('id', this.currClinic.province.id).orderBy('code', 'asc').get()
          } else {
            return Province.query().with('districts.*').has('code').orderBy('code', 'asc').get()
          }
        }
      },
      clinicSectorTypes () {
        return ClinicSectorType.query().with('clinicSectorList').orderBy('code', 'asc').get()
      },
      referealClinicSectors () {
        if (this.selectedClinicSectorType === null) return []
        return this.selectedClinicSectorType.clinicSectorList
      },
      districts: {
        get () {
          if (this.selectedProvince !== null && this.selectedProvince !== undefined) {
            if (this.isReferenceEpisode) this.loadProvince()
            return District.query().with('province').where('province_id', this.selectedProvince.id).has('code').orderBy('code', 'asc').get()
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
      isDCReferenceEpisode () {
        if (this.closureEpisode === null || this.closureEpisode === undefined) return false
        if (this.closureEpisode.startStopReason === null || this.closureEpisode.startStopReason === undefined) return false
        return this.closureEpisode.startStopReason.code === 'REFERIDO_DC'
      },
      isTransferenceEpisode () {
        if (this.closureEpisode === null || this.closureEpisode === undefined) return false
        if (this.closureEpisode.startStopReason === null || this.closureEpisode.startStopReason === undefined) return false
        return this.closureEpisode.startStopReason.code === 'TRANSFERIDO_PARA'
      },
      identifierstartDate: {
        get () {
          return this.getDDMMYYYFromJSDate(this.identifier.startDate)
        },
        set (value) {}
      },
      clinicSerctors () {
        const sectors = ClinicSector.query()
                                    .with('clinic.*')
                                    .with('clinicSectorType')
                                    .where((sector) => { return sector.clinic_id === this.currClinic.id && sector.active === true })
                                    .orderBy('code', 'asc')
                                    .get()
        const sectorList = sectors.filter((sector) => {
          return sector.clinicSectorType.code === 'PARAGEM_UNICA' || sector.clinicSectorType.code === 'NORMAL'
        })

        return sectorList
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
                            })
                            .orderBy('code', 'asc')
                            .get()
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
                            })
                            .orderBy('code', 'asc')
                            .get()
            const filteredList = clinicList.filter((clinic) => {
              return clinic.facilityType.code === 'US' && clinic.province.id === this.selectedProvince.id && clinic.district.id === this.selectedDistrict.id
            })

            return filteredList
          }
        }
        return []
      },
      patient () {
        return this.selectedPatient
      },
      lastEpisode: {
        get () {
          return Episode.query()
                      .withAll()
                      .where('patientServiceIdentifier_id', this.identifier.id)
                      .orderBy('episodeDate', 'desc')
                      .first()
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
            return reason.code === 'VOLTOU_REFERENCIA'
          })
          return resonList
        } else {
          resonList = allReasons.filter((reason) => {
            return reason.code !== 'VOLTOU_REFERENCIA'
          })
          return resonList
        }
      },
      stopReasons () {
        const allReasons = StartStopReason.query()
                              .where('isStartReason', false).orderBy('reason', 'asc').get()
        let resonList = []
        if (this.lastEpisode !== null && this.lastEpisode.isReferenceOrTransferenceEpisode()) {
          resonList = allReasons.filter((reason) => {
            return reason.code !== 'REFERIDO_DC' && reason.code !== 'TRANSFERIDO_PARA' && reason.code !== 'REFERIDO_PARA'
          })
          return resonList
        } else {
          return allReasons
        }
      }
    }
}
</script>

<style>

</style>
