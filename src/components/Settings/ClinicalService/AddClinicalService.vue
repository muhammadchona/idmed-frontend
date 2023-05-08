<template>
  <q-card style="width: 1010px; max-width: 90vw;">
          <q-card-section class="q-pa-none bg-green-2">
                  <div class="q-pa-md">
                      <div class="row items-center">
                          <q-icon name="local_pharmacy" size="sm"/>
                          <span class="q-pl-sm text-subtitle2">Serviço Clínico</span>
                      </div>
                  </div>
                  <q-separator color="grey-13" size="1px"/>
              </q-card-section>
          <form  >
          <q-scroll-area style="height: 600px;">
          <q-stepper
            v-model="stepScreens"
            ref="stepper"
            animated
          >
        <q-step
          :name="1"
          title="Dados Iniciais"
        >
              <div class="row q-mt-md">
              <nameInput
                v-model="clinicalService.description"
                  ref="nome"
                  :disable="onlyView"
                  label="Nome do Servico Clinico *" />
              </div>
                <div class="row q-mt-md">
                  <codeInput
                      ref="code"
                      v-model="clinicalService.code"
                      lazy-rules
                       :disable="onlyView"
                      label="Código*"
                       :rules="[val => codeRules (val)]" />
              </div>
                <div class="row q-mt-md">
                    <q-select
                        class="col"
                        dense outlined
                        :disable="onlyView"
                        v-model="clinicalService.identifierType"
                        :options="identifierTypes"
                        :rules="[ val => ( val != null ) || ' Por favor indique o tipo de identificador']"
                        option-value="id"
                        ref="identifierType"
                        option-label="description"
                        label="Tipo de Identificador*" />
                  </div>
                 <div class="row">
                  <div class="col-4 col-md-6">
           <q-table
              style="max-width: 450px;max-height: 350px"
              title="Atributos Para a Prescrição"
              :rows="clinicalServiceAttributes"
              :columns="columnAttributes"
              row-key="code"
              v-if="onlyView"
              class="my-sticky-header-table"
            />
            </div>
            <div class="col-4 col-md-6">
           <q-table
              style="max-width: 450px; max-height: 350px"
              title="Regimes Terapeuticos"
              :rows="therapeuticRegimens"
              :columns="columnsRegimen"
              row-key="code"
              v-if="onlyView && therapeuticRegimens.length > 0"
              class="my-sticky-header-table"
            />
          </div>
          <div class="col-4 col-md-6 pa-md">
           <q-table
              style="max-width: 450px; max-height: 350px"
              title="Sectores Clinicos"
              :rows="clinicSectors"
              :columns="columnsSectors"
              row-key="code"
              v-if="onlyView "
              class="my-sticky-header-table"
          />
          </div>
         </div>
        </q-step>
        <q-step
            :name="2"
            title="Adicionar Variáveis da Prescrição"
        >
         <q-card-section class="q-px-md">
                 <div class="q-pa-md">
           <q-table
            title="Atributos Para a Prescrição"
            :rows="clinicalServiceAttributes"
            :columns="columnAttributes"
            :filter="filter"
            row-key="code"
            selection="multiple"
            v-model:selected="selectedAttributes"
            class="my-sticky-header-table"
            v-if="!onlyView"
          >
           <template v-slot:top-right>
              <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
              </q-input>
          </template>
           </q-table>
            </div>
          </q-card-section>
         </q-step>
         <q-step
            :name="3"
            title="Adicionar Sector Clínico"
        >
         <q-card-section class="q-px-md">
          <div class="q-pa-md">
           <q-table
              title="Sectores Clinicos"
              :rows="clinicSectors"
              :columns="columnsSectors"
              :filter="filter1"
              row-key="code"
              selection="multiple"
              v-model:selected="clinicalService.clinicSectors"
              class="my-sticky-header-table"
            >
           <template v-slot:top-right>
              <q-input outlined dense debounce="300" v-model="filter1" placeholder="Procurar">
              <template v-slot:append>
                  <q-icon name="search" />
              </template>
                  </q-input>
          </template>
           </q-table>
                </div>
              </q-card-section>
           </q-step>
           <q-step
            v-if="isRegimenAttrSelected"
            :name="4"
            title="Adicionar Regimes Terapêuticos"
        >
         <q-card-section class="q-px-md">
          <div class="q-pa-md">
           <q-table
              title="Regimes Terapêuticos"
              :rows="therapeuticRegimens"
              :columns="columnsRegimen"
              :filter="filter2"
              row-key="code"
              selection="multiple"
              v-model:selected="selectedTherapeuticRegimens"
              class="my-sticky-header-table"
          >
          <template v-slot:top-right>
              <q-input outlined dense debounce="300" v-model="filter2" placeholder="Procurar">
              <template v-slot:append>
                  <q-icon name="search" />
              </template>
                  </q-input>
          </template>
           </q-table>
          </div>
          </q-card-section>
           </q-step>
              </q-stepper>
              <q-scroll-observer @scroll="scrollHandler" />
        </q-scroll-area>
             <q-card-actions align="right" class="q-mb-md">
                  <q-stepper-navigation >
                  <q-btn label="Cancelar" color="red" @click="$emit('close')" />
                  <q-btn v-if="stepScreens > 1 && !onlyView" color="primary" @click="$refs.stepper.previous()" label="Voltar" class="q-ml-sm" />
            <q-btn @click="goToNextStep"  v-if="!onlyView" color="primary" :label="submitNextButtonLabel" class="q-ml-sm"/>
          </q-stepper-navigation>
              </q-card-actions>
                 <q-dialog v-model="alert.visible" persistent>
               <Dialog :type="alert.type" @closeDialog="closeDialog">
              <template v-slot:title> Informação</template>
              <template v-slot:msg> {{alert.msg}} </template>
            </Dialog>
               </q-dialog>
          </form>
      </q-card>

  </template>
  <script>
  import { ref } from 'vue'
  import { useQuasar, SessionStorage } from 'quasar'
  import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'
  import ClinicalService from '../../../store/models/ClinicalService/ClinicalService'
  import ClinicalServiceAttributeType from '../../../store/models/ClinicalServiceAttributeType/ClinicalServiceAttributeType'
  import ClinicalServiceAttribute from '../../../store/models/ClinicalServiceAttribute/ClinicalServiceAttribute'
  import IdentifierType from '../../../store/models/identifierType/IdentifierType'
  import ClinicSector from '../../../store/models/clinicSector/ClinicSector'
  import Clinic from '../../../store/models/clinic/Clinic'
  import mixinplatform from 'src/mixins/mixin-system-platform'
  import mixinutils from 'src/mixins/mixin-utils'

  const columnsRegimen = [
    { name: 'code', required: true, label: 'Code', align: 'left', field: row => row.code, format: val => `${val}`, sortable: true },
    { name: 'description', required: true, label: 'Nome', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true }
  ]

  const columnsSectors = [
    { name: 'code', required: true, label: 'Código', align: 'left', field: row => row.code, format: val => `${val}`, sortable: true },
    { name: 'description', required: true, label: 'Nome', align: 'left', field: row => row.description, format: val => `${val}`, sortable: true }
  ]

  const columnAttributes = [
    { name: 'description', required: true, label: 'Code', align: 'left', field: row => row.description, format: val => `${val}` }
  ]

  export default {
      props: ['selectedClinicalService', 'onlyView', 'editMode', 'stepp'],
      mixins: [mixinplatform, mixinutils],
    data () {
   const $q = useQuasar()
    const selected = ref([])

      return {
        selected,
        columnsRegimen,
        columnAttributes,
        columnsSectors,
        $q,
         stepScreens: ref(1),
         clinicalService: new ClinicalService(),
         clinicalServiceAttributeTypes: [],
         regimenDrugs: [],
         clinicServiceAttribute: [],
         selectedAttributes: [],
        alert: ref({
                type: '',
                visible: false,
                msg: ''
              }),
        databaseCodes: [],
        filter: ref(''),
        filter1: ref(''),
        filter2: ref(''),
        selectedTherapeuticRegimens: []
    }
    },
    computed: {
        therapeuticRegimens () {
          if (this.editMode) {
       return TherapeuticRegimen.query().with('drugs.form').with('clinicalService').where((therapeuticRegimen) => {
       return (therapeuticRegimen.clinical_service_id === this.clinicalService.id || therapeuticRegimen.clinical_service_id === '') && therapeuticRegimen.active === true
        }).get()
          } if (this.onlyView) {
        return TherapeuticRegimen.query().with('drugs.form').with('clinicalService').where((therapeuticRegimen) => {
       return therapeuticRegimen.clinical_service_id === this.clinicalService.id
        }).get()
          } else {
            return TherapeuticRegimen.query().with('drugs.form').hasNot('clinicalService').where('active', true).get()
            }
        },
         clinicalServiceAttributes () {
          if (this.onlyView) {
            const attrTypes = []
            const listAttributes = ClinicalServiceAttribute.query().with('clinicalServiceAttributeType').where('service_id', this.clinicalService.id).get()
            listAttributes.forEach(item => {
              attrTypes.push(item.clinicalServiceAttributeType)
            })
            return attrTypes
          } else {
               return ClinicalServiceAttributeType.all()
          }
        },
        identifierTypes () {
           return IdentifierType.all()
        },
         clinicalServices () {
            return ClinicalService.query().with('attributes.clinicalServiceAttributeType')
            .with('identifierType')
            .with('therapeuticRegimens')
            .with('clinicSectors')
            .has('code').get()
        },
        clinicSectors () {
          if (this.onlyView) {
            const clinicServiceObj = ClinicalService.query().where('id', this.clinicalService.id).with('clinicSectors').first()
            return clinicServiceObj.clinicSectors
          } else {
            return ClinicSector.query().withAll().has('code').where('active', true).where('clinic_id', this.currClinic.id).get()
          }
        },
          currClinic () {
          return Clinic.query()
                      .with('province')
                      .with('district.province')
                      .with('facilityType')
                      .where('id', SessionStorage.getItem('currClinic').id)
                      .first()
        },
        isRegimenAttrSelected () {
          if (this.selectedAttributes.length <= 0) return false
          const isSelected = this.selectedAttributes.some((attr) => {
            return attr.code === 'THERAPEUTICAL_REGIMEN'
          })
          return isSelected
        },
        submitNextButtonLabel () {
          if ((this.stepScreens === 3 && !this.isRegimenAttrSelected) || this.stepScreens === 4) return 'Submeter'
          return 'Próximo'
        }
    },
    methods: {
          submitClinicalService () {
                 this.createClinicServiceAttribute()
            this.clinicalService.attributes = this.clinicalServiceAttributeTypes
            this.clinicalService.active = true
              console.log(this.clinicalService)
              if (this.mobile) {
              console.log('Mobile')
                if (!this.isEditStep) {
                  this.clinicalService.syncStatus = 'R'
                  console.log(this.clinicalService)
                  ClinicalService.localDbAdd(JSON.parse(JSON.stringify(this.clinicalService)))
                  ClinicalService.insert({ data: this.clinicalService })
                  this.closeDialog()
                  this.displayAlert('info', this.clinicalService.id === null ? 'Serviço Clínico adicionado com sucesso.' : 'Serviço Clínico actualizado com sucesso.')
                } else {
                    if (this.clinicalService.syncStatus !== 'R') this.clinicalService.syncStatus = 'U'
                    const clinicalServiceUpdate = new ClinicalService(JSON.parse(JSON.stringify((this.clinicalService))))
                    ClinicalService.localDbUpdate(clinicalServiceUpdate)
                    this.closeDialog()
                    this.displayAlert('info', this.clinicalService.id === null ? 'Serviço Clínico adicionado com sucesso.' : 'Serviço Clínico actualizado com sucesso.')
                }
              } else {
                if (!this.isEditStep) {
                ClinicalService.apiSave(this.clinicalService).then(resp => {
                    this.displayAlert('info', this.clinicalService.id === null ? 'Serviço Clínico adicionado com sucesso.' : 'Serviço Clínico actualizado com sucesso.')
                ClinicalService.apiFetchById(resp.response.data.id)
                console.log(resp.response.data)
                TherapeuticRegimen.apiGetAll(0, 200)
                }).catch(error => {
                    this.displayAlert('error', error)
                })
              } else {
                ClinicalService.apiUpdate(this.clinicalService).then(resp => {
                  ClinicalServiceAttribute.delete((clinicalServiceAttribute) => {
                   return clinicalServiceAttribute.service_id === this.clinicalService.id
                    })
                  ClinicalService.update({ where: this.clinicalService.id, data: this.clinicalService })
                  ClinicalServiceAttribute.insertOrUpdate({ data: this.clinicalService.attributes })
                  ClinicalService.apiFetchById(resp.response.data.id).then(resp0 => {
                    console.log(resp0)
                  })
                  TherapeuticRegimen.apiGetAll(0, 200)
                    this.displayAlert('info', 'Serviço Clínico actualizado com sucesso.')
                }).catch(error => {
                    this.displayAlert('error', error)
                })
              }
           }
          },
          displayAlert (type, msg) {
            this.alert.type = type
            this.alert.msg = msg
            this.alert.visible = true
          },
          closeDialog () {
            if (this.alert.type === 'info') {
              this.$emit('close')
            }
          },
          goToNextStep () {
             if (this.stepScreens === 1) {
               this.$refs.nome.$refs.ref.validate()
               this.$refs.code.$refs.ref.validate()
              this.$refs.identifierType.validate()
               if (!this.$refs.nome.$refs.ref.hasError && !this.$refs.code.$refs.ref.hasError && !this.$refs.identifierType.hasError) {
                  this.$refs.stepper.next()
              }
             } else if (this.stepScreens === 2) {
              if (this.selectedAttributes.length <= 0) {
             this.displayAlert('error', 'Por Favor seleccione pelo menos um atributo para o Serviço Clínicos')
              } else {
                  this.$refs.stepper.next()
             }
             } else if (this.stepScreens === 3) {
               if (this.clinicalService.clinicSectors.length <= 0) {
             this.displayAlert('error', 'Por Favor seleccione pelo menos um sector para o Serviço Clínicos')
              } else {
              const attribute = this.selectedAttributes.filter(x => x.code === 'THERAPEUTICAL_REGIMEN')
              if (attribute.length >= 1 && attribute[0].code === 'THERAPEUTICAL_REGIMEN') {
            this.$refs.stepper.next()
          } else {
            this.submitClinicalService()
            }
          }
          } else if (this.stepScreens === 4) {
            this.clinicalService.therapeuticRegimens = this.selectedTherapeuticRegimens
               if (this.clinicalService.therapeuticRegimens.length <= 0) {
             this.displayAlert('error', 'Por Favor seleccione pelo menos um regime terapeutico para o Serviço Clínicos')
              } else {
                this.submitClinicalService()
              }
          }
          },
          createClinicServiceAttribute () {
            this.selectedAttributes.forEach(attribute => {
              this.clinicServiceAttribute = new ClinicalServiceAttribute()
              this.clinicServiceAttribute.clinicalServiceAttributeType = attribute
              this.clinicalServiceAttributeTypes.push(this.clinicServiceAttribute)
            })
          },
           extractDatabaseCodes () {
          this.clinicalServices.forEach(element => {
              this.databaseCodes.push(element.code)
      })
      },
      codeRules (val) {
        if (this.clinicalService.code === '') {
          return 'o Código é obrigatorio'
        } else if ((this.databaseCodes.includes(val) && this.selectedClinicalService.id === this.clinicalService.id && !this.isEditStep) ||
        ((this.databaseCodes.includes(val) && this.clinicalServices.filter(x => x.code === val)[0].id !== this.clinicalService.id && this.isEditStep))) {
        return 'o Código indicado ja existe'
           }
      }
    },
    mounted () {
      this.setStep(this.stepp)
        const offset = 0
        const max = 100
      ClinicalServiceAttributeType.apiGetAll(offset, max)
      IdentifierType.apiGetAll(offset, max)
    },
     created () {
          if (this.clinicalService !== '') {
            this.clinicalService = Object.assign({}, this.selectedClinicalService)
            // this.clinicalService.attributes = this.selectedClinicalService.attributes
            if (this.selectedClinicalService != null) {
              this.clinicalService.attributes.forEach(attribute => {
            this.selectedAttributes.push(attribute.clinicalServiceAttributeType)
          })
          const serviceId = this.clinicalService.id
          this.selectedTherapeuticRegimens = this.therapeuticRegimens.filter(x => x.clinical_service_id === serviceId)
          console.log(this.selectedTherapeuticRegimens)
        }
          }
          this.extractDatabaseCodes()
      },
    components: {
          nameInput: require('components/Shared/NameInput.vue').default,
            codeInput: require('components/Shared/CodeInput.vue').default,
              Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }
  }
  </script>
  <style lang="sass">
  .my-sticky-header-table
    /* height or max-height is important */

    .q-table__top
      /* bg color is important for th; just specify one */
      background-color: #0ba58b

    thead tr th
      position: sticky
      z-index: 0
    thead tr
      top: 0

    /* this is when the loading indicator appears */
    &.q-table--loading thead tr:last-child th
      /* height of all previous header rows */
      top: 0px
  </style>
