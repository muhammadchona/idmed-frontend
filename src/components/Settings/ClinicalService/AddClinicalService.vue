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
            <div class="q-mt-md">
              <div class="row">
                <q-input
                  v-model="clinicalService.code"
                  ref="codeRef"
                  dense
                  outlined
                  class="col"
                  :disable="onlyView"
                  label="Código *"
                  :rules="[(val) => !!val || 'Por favor indicar o código']"
                />
                <q-input
                  v-model="clinicalService.description"
                  ref="nomeRef"
                  dense
                  outlined
                  class="col q-ml-md"
                  :disable="onlyView"
                  label="Nome do Servico Clinico *"
                  :rules="[(val) => !!val || 'Por favor indicar o nome']"
                />
              </div>

              <div class="row">
                <q-select
                  class="col"
                  dense
                  outlined
                  :disable="onlyView"
                  v-model="clinicalService.identifierType"
                  :options="identifierTypes"
                  :rules="[
                    (val) =>
                      val != null ||
                      ' Por favor indique o tipo de identificador',
                  ]"
                  option-value="id"
                  ref="identifierTypeRef"
                  option-label="description"
                  label="Tipo de Identificador*"
                />
              </div>
              <div class="row">
                <div class="col-4 col-md-6 q-mb-sm">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Atributos Para a Prescrição"
                    :rows="clinicalService.clinicalServiceAttributes"
                    :columns="columnAttributes"
                    row-key="code"
                    v-if="onlyView"
                    class="my-sticky-header-table"
                    dense
                  />
                </div>
                <div class="col-4 col-md-6 q-mb-sm">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Regimes Terapeuticos"
                    :rows="therapeuticRegimenList"
                    :columns="columnsRegimen"
                    row-key="code"
                    v-if="onlyView && therapeuticRegimenList.length > 0"
                    class="my-sticky-header-table"
                    dense
                  />
                </div>
                <div class="col-4 col-md-6 pa-md">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Sectores Clinicos"
                    :rows="clinicalService.clinicSectors"
                    :columns="columnsSectors"
                    row-key="code"
                    v-if="onlyView"
                    class="my-sticky-header-table"
                    dense
                  />
                </div>
              </div>
            </div>
          </q-step>

          <q-step :name="2" title="Adicionar Variáveis da Prescrição">
            <q-card-section class="q-px-md">
              <div class="q-pa-md">
                <q-table
                  title="Atributos Para a Prescrição"
                  :rows="clinicalServiceAttributeList"
                  :columns="columnAttributes"
                  :filter="filter"
                  row-key="code"
                  selection="multiple"
                  v-model:selected="clinicalService.clinicalServiceAttributes"
                  class="my-sticky-header-table"
                  v-if="!onlyView"
                  dense
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
                  :rows="clinicSectorList"
                  :columns="columnsSectors"
                  :filter="filter1"
                  row-key="code"
                  selection="multiple"
                  v-model:selected="clinicalService.clinicSectors"
                  class="my-sticky-header-table"
                  dense
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
                  :rows="therapeuticRegimenList"
                  :columns="columnsRegimen"
                  :filter="filter2"
                  row-key="code"
                  selection="multiple"
                  v-model:selected="clinicalService.therapeuticRegimens"
                  class="my-sticky-header-table"
                  dense
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
        <q-scroll-observer />
      </q-scroll-area>
      <q-card-actions align="right" class="q-mb-md">
        <q-stepper-navigation>
          <q-btn label="Cancelar" color="red" @click="close" />
          <q-btn
            v-if="notFirstStep"
            color="primary"
            @click="stepper.previous()"
            label="Voltar"
            class="q-ml-sm"
          />
          <q-btn
            @click="goToNextStep"
            v-if="!onlyView"
            color="primary"
            :label="submitNextButtonLabel"
            :loading="loadingStep"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*imports*/
import { ref, inject, computed } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService.ts';

/*Declarations*/
const { alertError } = useSwal();
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
    field: (row) => row.clinicName,
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
    sortable: true,
  },
];
const filter = ref('');
const filter1 = ref('');
const filter2 = ref('');
const stepper = ref();

// Refs
const codeRef = ref(null);
const nomeRef = ref(null);
const identifierTypeRef = ref(null);

/*injects*/
const viewMode = inject('viewMode');
const submitClinicalService = inject('submitClinicalService');
const therapeuticRegimenList = inject('therapeuticRegimens');
const clinicalServiceAttributeList = inject('clinicalServiceAttributeTypes');
const clinicSectorList = inject('clinicSectors');
const identifierTypes = inject('identifierTypes');
const clinicalService = inject('clinicalService');
const isNewClinicalService = inject('isNewClinicalService');
const close = inject('close');
const loadingStep = inject('loadingStep');

/*Hooks*/
const notFirstStep = computed(() => {
  return stepScreens.value > 1 && !onlyView.value;
});

const onlyView = computed(() => {
  return viewMode.value;
});

const isRegimenAttrSelected = computed(() => {
  if (clinicalService.value.clinicalServiceAttributes.length <= 0) return false;
  const isSelected = clinicalService.value.clinicalServiceAttributes.some(
    (attr) => {
      return attr.code === 'THERAPEUTICAL_REGIMEN';
    }
  );
  return isSelected;
});

const submitNextButtonLabel = computed(() => {
  if (
    (stepScreens.value === 3 && !isRegimenAttrSelected.value) ||
    stepScreens.value === 4
  )
    return 'Gravar';
  return 'Próximo';
});

// Methods
const goToNextStep = () => {
  if (stepScreens.value === 1) {
    codeRef.value.validate();
    nomeRef.value.validate();
    identifierTypeRef.value.validate();
    if (
      !codeRef.value.hasError &&
      !nomeRef.value.hasError &&
      !identifierTypeRef.value.hasError
    ) {
      if (codeRules(clinicalService.value.code) && isNewClinicalService.value) {
        alertError('O código do Serviço Clínico introduzido ja existe.');
      } else {
        stepper.value.next();
      }
    }
  } else if (stepScreens.value === 2) {
    if (clinicalService.value.clinicalServiceAttributes.length <= 0) {
      alertError(
        'Por Favor seleccione pelo menos um atributo para o Serviço Clínico'
      );
    } else {
      stepper.value.next();
    }
  } else if (stepScreens.value === 3) {
    if (clinicalService.value.clinicSectors.length <= 0) {
      alertError(
        'Por Favor seleccione pelo menos um sector para o Serviço Clínico'
      );
    } else {
      const attribute = clinicalService.value.clinicalServiceAttributes.filter(
        (x) => x.code === 'THERAPEUTICAL_REGIMEN'
      );
      if (
        attribute.length >= 1 &&
        attribute[0].code === 'THERAPEUTICAL_REGIMEN'
      ) {
        stepper.value.next();
      } else {
        submitClinicalService();
      }
    }
  } else if (stepScreens.value === 4) {
    if (clinicalService.value.therapeuticRegimens.length <= 0) {
      alertError(
        'Por Favor seleccione pelo menos um regime terapêutico para o Serviço Clínico'
      );
    } else {
      submitClinicalService();
    }
  }
};

const codeRules = (val) => {
  return clinicalServiceService.getByIdentifierTypeCode(val) !== null;
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
