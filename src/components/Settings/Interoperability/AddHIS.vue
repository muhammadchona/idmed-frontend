<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="online_prediction" size="sm" />
          <span class="q-pl-sm text-subtitle2"
            >Sistema para Interoperabilidade</span
          >
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form @submit.prevent="validateHis">
      <q-scroll-area style="height: 600px">
        <q-stepper v-model="stepScreens" ref="stepper" animated>
          <q-step :name="1" title="Selecção de Atributos">
            <div class="row q-mt-md">
              <q-input
                ref="nomeRef"
                v-model="his.description"
                label="Nome do Sistema de Informação *"
                outlined
                dense
                class="col"
                :rules="[(val) => !!val || 'Por favor indicar o nome']"
                lazy-rules
              />
            </div>
            <div class="row q-mt-md">
              <q-input
                ref="codeRef"
                v-model="his.abbreviation"
                :rules="[(val) => codeRules(val)]"
                lazy-rules
                label="Abreviatura *"
                outlined
                dense
                class="col"
              />
            </div>
            <div class="row q-mt-md">
              <q-table
                class="col my-sticky-header-table"
                title="Atributos"
                :rows="interoperabilityAttributes"
                :columns="columnsAttributes"
                row-key="code"
                :selection="selectionTable"
                v-model:selected="selectedAttributes"
              >
                <template v-slot:no-data="{ icon, filter }">
                  <div
                    class="full-width row flex-center text-primary q-gutter-sm text-body2"
                  >
                    <span> Sem resultados para visualizar </span>
                    <q-icon
                      size="2em"
                      :name="filter ? 'filter_b_and_w' : icon"
                    />
                  </div>
                </template>
              </q-table>
            </div>
          </q-step>
          <q-step :name="2" title="Adicionar valor do atributo">
            <div class="">
              <selectedAttributesTable
                :rows="healthInformationAttributeTypes"
                :columns="columnsSelectedAttributes"
              />
            </div>
          </q-step>
        </q-stepper>
        <q-scroll-observer />
      </q-scroll-area>
      <q-card-actions align="right" class="q-mb-md">
        <q-stepper-navigation>
          <q-btn label="Cancelar" color="red" @click="$emit('close')" />
          <q-btn
            v-if="stepScreens > 1"
            color="primary"
            @click="goBackStep"
            label="Voltar"
            class="q-ml-sm"
          />
          <q-btn
            @click="goToNextStep"
            color="primary"
            :label="stepScreens === 2 ? 'Gravar' : 'Proximo'"
            class="q-ml-sm"
            :loading="stepScreens === 2 ? submitting : false"
          />
        </q-stepper-navigation>
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*imports*/
import { ref, inject, onMounted, computed, provide } from 'vue';
import interoperabilityTypeService from 'src/services/api/InteroperabilityType/InteroperabilityTypeService.ts';
import interoperabilityAttributeService from 'src/services/api/InteroperabilityAttribute/InteroperabilityAttributeService.ts';
import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { v4 as uuidv4 } from 'uuid';

const { alertSucess, alertError } = useSwal();
const { showloading, closeLoading } = useLoading();

/*Components import*/
import selectedAttributesTable from 'src/components/Settings/Interoperability/HealthInformationSystemAttributeTable.vue';

/*Variables*/
const columnsAttributes = [
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
];

const columnsSelectedAttributes = [
  {
    name: 'interoperabilityType',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.interoperabilityType.description,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'value',
    required: true,
    label: 'Valor',
    align: 'left',
    field: (row) => row.value,
    format: (val) => `${val}`,
    sortable: true,
  },
];
const stepper = ref();
const submitting = ref(false);
const databaseCodes = ref([]);
const healthInformationAttributeTypes = ref([]);
const interoperabilityAttribute = ref([]);
const selectedAttributes = ref([]);
const stepScreens = ref(1);
const nomeRef = ref(null);
const codeRef = ref(null);
const selectionTable = ref('');
const openMrsId = 'ff8080817d9aa854017d9e2809b50008';
/*injects*/
const editMode = inject('editMode');
const his = inject('selectedHis');
const isCreateStep = inject('isCreateStep');
const isEditStep = inject('isEditStep');
const showHISRegistrationScreen = inject('showHISRegistrationScreen');
const viewMode = inject('viewMode');

/*Hooks*/
const interoperabilityAttributes = computed(() => {
  return interoperabilityTypeService.getAll();
});

const healthInformationSystemList = computed(() => {
  return healthInformationSystemService.getAllHis();
});

const checkIfIsOpenmrs = computed(() => {
  return his.value != null && his.value.id === openMrsId;
});

onMounted(() => {
  if (isCreateStep.value) {
    his.value = healthInformationSystemService.newInstanceEntity();
  }
  if (his.value != null) {
    his.value.interoperabilityAttributes.forEach((attribute) => {
      selectedAttributes.value.push(attribute.interoperabilityType);
      healthInformationAttributeTypes.value.push(attribute);
    });
  }
  if (checkIfIsOpenmrs.value) {
    selectionTable.value = 'none';
  } else {
    selectionTable.value = 'multiple';
  }
  extractDatabaseCodes();
});

/*Methods*/
const validateHis = () => {
  nomeRef.value.validate();
  codeRef.value.validate();
  if (selectedAttributes.value.length <= 0) {
    alertError(
      'Por Favor seleccione pelo menos um atributo para a Interoperabilidade'
    );
  } else if (!nomeRef.value.hasError && !codeRef.value.hasError) {
    submitHis();
  }
};
const submitHis = () => {
  showloading();
  submitting.value = true;
  his.value.interoperabilityAttributes = [];
  healthInformationAttributeTypes.value.forEach((attribute) => {
    if (isCreateStep.value) {
      attribute.id = uuidv4();
    }
    his.value.interoperabilityAttributes.push(attribute);
  });
  if (isCreateStep.value) {
    his.value.active = true;
    healthInformationSystemService
      .post(his.value)
      .then(() => {
        closeLoading();
        alertSucess('Sistema para Interoperabilidade registado com sucesso');
        submitting.value = false;
        viewMode.value = true;
        showHISRegistrationScreen.value = false;
      })
      .catch((error) => {
        closeLoading();
        console.log(error);
        alertError(
          'Aconteceu um erro inesperado ao registar o Sistema para Interoperabilidade.'
        );
        submitting.value = false;
        viewMode.value = true;
        showHISRegistrationScreen.value = false;
      });
  } else {
    healthInformationSystemService
      .patch(his.value.id, his.value)
      .then(() => {
        healthInformationSystemService.apiFetchById(his.value.id);
        closeLoading();
        alertSucess('Sistema para Interoperabilidade actualizado com sucesso');
        submitting.value = false;
        viewMode.value = true;
        showHISRegistrationScreen.value = false;
      })
      .catch((error) => {
        closeLoading();
        console.log(error);
        alertError(
          'Aconteceu um erro inesperado ao registar o Sistema para Interoperabilidade.'
        );
        submitting.value = false;
        viewMode.value = true;
        showHISRegistrationScreen.value = false;
      });
  }
  // }
};
const goToNextStep = () => {
  let i = 0;
  if (stepScreens.value === 1) {
    nomeRef.value.validate();
    codeRef.value.validate();
    if (selectedAttributes.value.length <= 0) {
      alertError(
        'Por favor seleccione pelo menos um atributo para a Interoperabilidade'
      );
    } else if (!nomeRef.value.hasError && !codeRef.value.hasError) {
      if (isCreateStep.value) {
        addAttributesOnHealthInformationSystem();
      } else if (editMode.value) {
        his.value.interoperabilityAttributes.forEach(
          (healthInformationAttributeType) => {
            i++;
            if (
              !selectedAttributes.value.find(
                (x) =>
                  x.code ===
                  healthInformationAttributeType.interoperabilityType.code
              )
            ) {
              const i = healthInformationAttributeTypes.value
                .map((toRemove) => toRemove.id)
                .indexOf(healthInformationAttributeType.id);
              healthInformationAttributeTypes.value.splice(i, 1);
            }
          }
        );
        addAttributesOnHealthInformationSystem();
      }
      stepper.value.next();
    }
  } else if (stepScreens.value === 2) {
    var control = 0;
    healthInformationAttributeTypes.value.forEach((attribute) => {
      if (attribute.value === '') {
        control++;
      }
    });
    if (control > 0) {
      alertError(
        'Por favor preencha o valor dos atributos seleccionados para a Interoperabilidade'
      );
    } else {
      submitHis();
    }
  }
};

const goBackStep = () => {
  if (stepScreens.value === 2) {
    stepper.value.previous();

    healthInformationAttributeTypes.value.forEach((x) => {
      if (x.healthInformationSystem === null) {
        healthInformationAttributeTypes.value.splice(
          healthInformationAttributeTypes.value.indexOf(x),
          1
        );
      }
    });
  }
};

const extractDatabaseCodes = () => {
  healthInformationSystemList.value.forEach((element) => {
    databaseCodes.value.push(element.abbreviation);
  });
};

const codeRules = (val) => {
  if (his.value.abbreviation === '') {
    return 'o Código e obrigatório';
  } else if (
    (databaseCodes.value.includes(val) && !isEditStep.value) ||
    (databaseCodes.value.includes(val) &&
      healthInformationSystemList.value.filter((x) => x.abbreviation === val)[0]
        .id !== his.value.id &&
      isEditStep.value)
  ) {
    return !databaseCodes.value.includes(val) || 'o Código indicado já existe';
  }
};
const addAttributesOnHealthInformationSystem = () => {
  selectedAttributes.value.forEach((attribute) => {
    if (
      !healthInformationAttributeTypes.value.find(
        (x) => x.interoperabilityType.code === attribute.code
      )
    ) {
      interoperabilityAttribute.value =
        interoperabilityAttributeService.newInstanceEntity();
      interoperabilityAttribute.value.id = uuidv4();
      interoperabilityAttribute.value.interoperabilityType = attribute;
      healthInformationAttributeTypes.value.push(
        interoperabilityAttribute.value
      );
    }
  });
};

/*Provide*/
provide('rows', healthInformationAttributeTypes);
provide('columns', columnsSelectedAttributes);
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
