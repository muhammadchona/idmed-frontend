<template>
  <q-card style="width: 1010px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="local_pharmacy" size="sm" />
          <span class="q-pl-sm text-subtitle2">Serviço Clínico</span>
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form>
      <q-scroll-area style="height: 600px">
        <q-stepper v-model="stepScreens" ref="stepper" animated>
          <q-step :name="1" title="Dados Iniciais">
            <div class="row q-mt-md">
              <nameInput
                v-model="clinicalService.description"
                ref="nome"
                :disable="onlyView"
                label="Nome do Servico Clinico *"
              />
            </div>
            <div class="row q-mt-md">
              <codeInput
                ref="code"
                v-model="clinicalService.code"
                lazy-rules
                :disable="onlyView"
                label="Código*"
                :rules="[(val) => codeRules(val)]"
              />
            </div>
            <div class="row q-mt-md">
              <q-select
                class="col"
                dense
                outlined
                :disable="onlyView"
                v-model="clinicalService.identifierType"
                :options="identifierTypes"
                :rules="[
                  (val) =>
                    val != null || ' Por favor indique o tipo de identificador',
                ]"
                option-value="id"
                ref="identifierType"
                option-label="description"
                label="Tipo de Identificador*"
              />
            </div>
            <div class="row">
              <div class="col-4 col-md-6">
                <q-table
                  style="max-width: 450px; max-height: 350px"
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
                  v-if="onlyView"
                  class="my-sticky-header-table"
                />
              </div>
            </div>
          </q-step>
          <q-step :name="2" title="Adicionar Variáveis da Prescrição">
            <q-card-section class="q-px-md">
              <div class="q-pa-md">
                <q-table
                  title="Atributos Para a Prescrição"
                  :data="clinicalServiceAttributes"
                  :columns="columnAttributes"
                  :filter="filter"
                  row-key="code"
                  selection="multiple"
                  v-model:selected="selectedAttributes"
                  class="my-sticky-header-table"
                  v-if="!onlyView"
                >
                  <template v-slot:top-right>
                    <q-input
                      outlined
                      dense
                      debounce="300"
                      v-model="filter"
                      placeholder="Procurar"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>
                </q-table>
              </div>
            </q-card-section>
          </q-step>
          <q-step :name="3" title="Adicionar Sector Clínico">
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
                    <q-input
                      outlined
                      dense
                      debounce="300"
                      v-model="filter1"
                      placeholder="Procurar"
                    >
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
                    <q-input
                      outlined
                      dense
                      debounce="300"
                      v-model="filter2"
                      placeholder="Procurar"
                    >
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
        <q-stepper-navigation>
          <q-btn label="Cancelar" color="red" @click="$emit('close')" />
          <q-btn
            v-if="stepScreens > 1 && !onlyView"
            color="primary"
            @click="$refs.stepper.previous()"
            label="Voltar"
            class="q-ml-sm"
          />
          <q-btn
            @click="goToNextStep"
            v-if="!onlyView"
            color="primary"
            :label="submitNextButtonLabel"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*imports*/
import { ref, inject, onMounted, computed, reactive } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen';
import ClinicalService from '../../../stores/models/ClinicalService/ClinicalService';
import ClinicalServiceAttributeType from '../../../stores/models/ClinicalServiceAttributeType/ClinicalServiceAttributeType';
import ClinicalServiceAttribute from '../../../stores/models/ClinicalServiceAttribute/ClinicalServiceAttribute';
import IdentifierType from '../../../stores/models/identifierType/IdentifierType';
import ClinicSector from '../../../stores/models/clinicSector/ClinicSector';
import Clinic from '../../../stores/models/clinic/Clinic';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService.ts';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService.ts';
import clinicalServiceAttrTypeService from 'src/services/api/clinicalServiceAttrTypeService/ClinicalServiceAttrTypeService.ts';
import clinicalServiceAttrService from 'src/services/api/clinicalServiceAttributeService/clinicalServiceAttributeService.ts';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService.ts';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';

/*Components Import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';

/*Declarations*/
const stepScreens = ref(1);
const columnsRegimen = [
  {
    name: 'code',
    required: true,
    label: 'Code',
    align: 'left',
    field: (row) => row.code,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'description',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
];

const columnsSectors = [
  {
    name: 'code',
    required: true,
    label: 'Código',
    align: 'left',
    field: (row) => row.code,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'description',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
];

const columnAttributes = [
  {
    name: 'description',
    required: true,
    label: 'Code',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
  },
];
const selected = ref([]);
const clinicalServiceAttributeTypes = ref([]);
const regimenDrugs = ref([]);
const clinicServiceAttribute = ref([]);
const databaseCodes = ref([]);
const filter = ref('');
const filter1 = ref('');
const filter2 = ref('');
const selectedTherapeuticRegimens = ref([]);
const selectedAttributes = ref([]);
const stepper = ref();
const nome = ref();

/*injects*/
const selectedClinicalService = inject('selectedClinicalService');
const stepp = inject('stepp');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const showClinicServiceRegistrationScreen = inject(
  'showClinicServiceRegistrationScreen'
);

/*Hooks*/
const clinicalService = computed(() => {
  return selectedClinicalService.value;
});

const onlyView = computed(() => {
  return viewMode.value;
});

const therapeuticRegimens = computed(() => {
  if (editMode.value) {
    return therapeuticalRegimenService.getAllActiveTherapeuticalRegimensByclinicalService(
      clinicalService.value.id
    );
  }
  if (onlyView.value) {
    return therapeuticalRegimenService.getAllTherapeuticalByclinicalService(
      clinicalService.value.id
    );
  } else {
    return therapeuticalRegimenService.getAllActiveTherapeuticalHasNoClinicalService();
  }
});
const clinicalServiceAttributes = computed(() => {
  if (onlyView.value) {
    const attrTypes = [];
    const listAttributes =
      clinicalServiceAttrService.getAllClinicalServiceAttrByClinicalService(
        clinicalService.value.id
      );
    listAttributes.forEach((item) => {
      attrTypes.push(item.clinicalServiceAttributeType);
    });
    return attrTypes;
  } else {
    return clinicalServiceAttrTypeService.getAllClinicalServiceAttrTypes();
  }
});

const identifierTypes = computed(() => {
  return identifierTypeService.getAllIdentifierTypes();
});

const clinicalServices = computed(() => {
  return clinicalServiceService.getAllClinicalServicesPersonalized();
});

const clinicSectors = computed(() => {
  if (onlyView.value) {
    const clinicServiceObj = clinicalServiceService.getbyIdWithSectors(
      clinicalService.value.id
    );
    return clinicServiceObj.clinicSectors;
  } else {
    return clinicSectorService.getActivebyClinicId(currClinic.value.id);
  }
});

const isRegimenAttrSelected = computed(() => {
  console.log(selectedAttributes);
  if (selectedAttributes.value.length <= 0) return false;
  const isSelected = selectedAttributes.value.some((attr) => {
    return attr.code === 'THERAPEUTICAL_REGIMEN';
  });
  return isSelected.value;
});

const submitNextButtonLabel = computed(() => {
  if (
    (stepScreens.value === 3 && !isRegimenAttrSelected.value) ||
    stepScreens.value === 4
  )
    return 'Submeter';
  return 'Próximo';
});

onMounted(() => {
  if (clinicalService.value !== '') {
    if (selectedClinicalService.value != null) {
      clinicalService.value.attributes.forEach((attribute) => {
        selectedAttributes.value.push(attribute.clinicalServiceAttributeType);
      });
      const serviceId = clinicalService.value.id;
      selectedTherapeuticRegimens.value = therapeuticRegimens.value.filter(
        (x) => x.clinical_service_id === serviceId
      );
    }
  }
  extractDatabaseCodes();
});

//   therapeuticRegimens () {
//     if (editMode) {
//  return TherapeuticRegimen.query().with('drugs.form').with('clinicalService').where((therapeuticRegimen) => {
//  return (therapeuticRegimen.clinical_service_id === clinicalService.id || therapeuticRegimen.clinical_service_id === '') && therapeuticRegimen.active === true
//   }).get()
//     } if (onlyView) {
//   return TherapeuticRegimen.query().with('drugs.form').with('clinicalService').where((therapeuticRegimen) => {
//  return therapeuticRegimen.clinical_service_id === clinicalService.id
//   }).get()
//     } else {
//       return TherapeuticRegimen.query().with('drugs.form').hasNot('clinicalService').where('active', true).get()
//       }
//   },
//    clinicalServiceAttributes () {
//     if (onlyView) {
//       const attrTypes = []
//       const listAttributes = ClinicalServiceAttribute.query().with('clinicalServiceAttributeType').where('service_id', clinicalService.id).get()
//       listAttributes.forEach(item => {
//         attrTypes.push(item.clinicalServiceAttributeType)
//       })
//       return attrTypes
//     } else {
//          return ClinicalServiceAttributeType.all()
//     }
//   },
// identifierTypes () {
//    return IdentifierType.all()
// },
//  clinicalServices () {
//     return ClinicalService.query().with('attributes.clinicalServiceAttributeType')
//     .with('identifierType')
//     .with('therapeuticRegimens')
//     .with('clinicSectors')
//     .has('code').get()
// },
// clinicSectors () {
//   if (onlyView) {
//     const clinicServiceObj = ClinicalService.query().where('id', clinicalService.id).with('clinicSectors').first()
//     return clinicServiceObj.clinicSectors
//   } else {
//     return ClinicSector.query().withAll().has('code').where('active', true).where('clinic_id', currClinic.id).get()
//   }
// },

// isRegimenAttrSelected () {
//   if (selectedAttributes.length <= 0) return false
//   const isSelected = selectedAttributes.some((attr) => {
//     return attr.code === 'THERAPEUTICAL_REGIMEN'
//   })
//   return isSelected
// },
// submitNextButtonLabel () {
//   if ((stepScreens === 3 && !isRegimenAttrSelected) || stepScreens === 4) return 'Submeter'
//   return 'Próximo'
// }
// },
/*methods*/
// submitClinicalService () {
//        createClinicServiceAttribute()
//   clinicalService.attributes = clinicalServiceAttributeTypes
//   clinicalService.active = true
//     console.log(clinicalService)
//     if (mobile) {
//     console.log('Mobile')
//       if (!isEditStep) {
//         clinicalService.syncStatus = 'R'
//         console.log(clinicalService)
//         ClinicalService.localDbAdd(JSON.parse(JSON.stringify(clinicalService)))
//         ClinicalService.insert({ data: clinicalService })
//         closeDialog()
//         displayAlert('info', clinicalService.id === null ? 'Serviço Clínico adicionado com sucesso.' : 'Serviço Clínico actualizado com sucesso.')
//       } else {
//           if (clinicalService.syncStatus !== 'R') clinicalService.syncStatus = 'U'
//           const clinicalServiceUpdate = new ClinicalService(JSON.parse(JSON.stringify((clinicalService))))
//           ClinicalService.localDbUpdate(clinicalServiceUpdate)
//           closeDialog()
//           displayAlert('info', clinicalService.id === null ? 'Serviço Clínico adicionado com sucesso.' : 'Serviço Clínico actualizado com sucesso.')
//       }
//     } else {
//       if (!isEditStep) {
//       ClinicalService.apiSave(clinicalService).then(resp => {
//           displayAlert('info', clinicalService.id === null ? 'Serviço Clínico adicionado com sucesso.' : 'Serviço Clínico actualizado com sucesso.')
//       ClinicalService.apiFetchById(resp.response.data.id)
//       console.log(resp.response.data)
//       TherapeuticRegimen.apiGetAll(0, 200)
//       }).catch(error => {
//           displayAlert('error', error)
//       })
//     } else {
//       ClinicalService.apiUpdate(clinicalService).then(resp => {
//         ClinicalServiceAttribute.delete((clinicalServiceAttribute) => {
//          return clinicalServiceAttribute.service_id === clinicalService.id
//           })
//         ClinicalService.update({ where: clinicalService.id, data: clinicalService })
//         ClinicalServiceAttribute.insertOrUpdate({ data: clinicalService.attributes })
//         ClinicalService.apiFetchById(resp.response.data.id).then(resp0 => {
//           console.log(resp0)
//         })
//         TherapeuticRegimen.apiGetAll(0, 200)
//           displayAlert('info', 'Serviço Clínico actualizado com sucesso.')
//       }).catch(error => {
//           displayAlert('error', error)
//       })
//     }
//  }
// },

const extractDatabaseCodes = () => {
  clinicalServices.value.forEach((element) => {
    databaseCodes.value.push(element.code);
  });
};

const goToNextStep = () => {
  if (stepScreens.value === 1) {
    // nome.value.validate();
    // $refs.nome.$refs.ref.validate();
    // $refs.code.$refs.ref.validate();
    // $refs.identifierType.validate();
    // if (
    //   !$refs.nome.$refs.ref.hasError &&
    //   !$refs.code.$refs.ref.hasError &&
    //   !$refs.identifierType.hasError
    // ) {
    stepper.value.next();
    console.log(onlyView.value);
    console.log(clinicalServiceAttributes.value.length);
    // }
  } else if (stepScreens.value === 2) {
    if (selectedAttributes.value.length <= 0) {
      // displayAlert(
      //   'error',
      //   'Por Favor seleccione pelo menos um atributo para o Serviço Clínicos'
      // );
    } else {
      stepper.value.next();
    }
  } else if (stepScreens.value === 3) {
    if (clinicalService.value.clinicSectors.length <= 0) {
      // displayAlert(
      //   'error',
      //   'Por Favor seleccione pelo menos um sector para o Serviço Clínicos'
      // );
    } else {
      const attribute = selectedAttributes.value.filter(
        (x) => x.code === 'THERAPEUTICAL_REGIMEN'
      );
      if (
        attribute.value.length >= 1 &&
        attribute.value[0].code === 'THERAPEUTICAL_REGIMEN'
      ) {
        $refs.stepper.next();
      } else {
        submitClinicalService();
      }
    }
  } else if (stepScreens.value === 4) {
    clinicalService.value.therapeuticRegimens = selectedTherapeuticRegimens;
    if (clinicalService.value.therapeuticRegimens.length <= 0) {
      // displayAlert(
      //   'error',
      //   'Por Favor seleccione pelo menos um regime terapeutico para o Serviço Clínicos'
      // );
    } else {
      submitClinicalService();
    }
  }
};

const createClinicServiceAttribute = () => {
  selectedAttributes.value.forEach((attribute) => {
    clinicServiceAttribute.value = new ClinicalServiceAttribute();
    clinicServiceAttribute.value.clinicalServiceAttributeType = attribute;
    clinicalServiceAttributeTypes.value.push(clinicServiceAttribute.value);
  });
};

const codeRules = (val) => {
  if (clinicalService.value.code === '') {
    return 'o Código é obrigatorio';
  } else if (
    (databaseCodes.value.includes(val) &&
      selectedClinicalService.id === clinicalService.value.id &&
      !isEditStep) ||
    (databaseCodes.value.includes(val) &&
      clinicalServices.value.filter((x) => x.code === val)[0].id !==
        clinicalService.value.id &&
      isEditStep)
  ) {
    return 'o Código indicado ja existe';
  }
};
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
