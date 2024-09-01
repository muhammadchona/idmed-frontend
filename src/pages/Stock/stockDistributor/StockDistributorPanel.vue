<template>
  <div>
    <TitleBar />
    <div class="row" v-if="isMobile">
      <div class="col q-mx-md q-mt-md">
        <ListHeader
          :addVisible="false"
          :expandVisible="false"
          :mainContainer="true"
          bgColor="bg-primary"
          >Notas da Guia
        </ListHeader>
        <div class="box-border row q-pt-sm">
          <q-input
            outlined
            v-model="orderNumber"
            ref="orderNumberRef"
            label="Número"
            :rules="[(val) => !!val || 'Por favor indicar o número da guia']"
            :disable="!isGuiaEditionStep"
            dense
            class="col q-mx-md"
          />
          <q-input
            dense
            outlined
            :disable="!isGuiaEditionStep"
            class="col q-mx-md"
            v-model="creationDate"
            label="Data de Distribuição"
          >
            <q-input
              outlined
              v-model="notes"
              label="Notas"
              ref="notesRef"
              :disable="!isGuiaEditionStep"
              dense
              class="col"
              type="textarea"
            />

            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="creationDate" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="row q-mx-sm items-center" v-if="isGuiaDisplayStep">
            <q-btn
              unelevated
              color="blue"
              class="col q-ma-sm"
              label="Voltar"
              @click="goBack"
              size="12px"
            />
            <q-btn
              unelevated
              color="orange-5"
              class="q-ml-md col"
              label="Editar"
              @click="initGuiaEdition"
              size="12px"
            />
            <q-btn
              unelevated
              color="red"
              class="q-ml-md col"
              label="Remover"
              @click="removeGuia"
              size="12px"
            />
          </div>
          <div class="row q-pa-sm" v-if="isGuiaEditionStep">
            <q-btn
              unelevated
              color="blue"
              class="col"
              label="Cancelar"
              @click="cancelOperation"
              size="10px"
            />
            <q-btn
              unelevated
              color="orange-5"
              class="q-ml-md col"
              label="Gravar"
              @click="doSaveGuia"
              size="10px"
            />
          </div>
        </div>
      </div>
      <div class="col-12 q-px-md">
        <div>
          <ListHeader
            :addVisible="isGuiaDisplayStep"
            :expandVisible="false"
            :mainContainer="true"
            @showAdd="initNewStock"
            bgColor="bg-primary"
            :addButtonActions="initNewStock"
            >Medicamentos
          </ListHeader>
          <div class="box-border q-pb-md">
            <q-table
              class="col"
              dense
              flat
              :rows="stockList"
              :columns="columns"
              row-key="id"
            >
              <template v-slot:no-data="{ icon, filter }">
                <div
                  class="full-width row flex-center text-primary q-gutter-sm text-body2"
                >
                  <span> Sem resultados para visualizar </span>
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
              </template>
              <template #header="props">
                <q-tr class="text-left bg-grey-3" :props="props">
                  <q-th style="width: 70px">{{ columns[0].label }}</q-th>
                  <q-th class="col">{{ columns[1].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[2].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[3].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[4].label }}</q-th>
                  <q-th style="width: 120px">{{ columns[5].label }}</q-th>
                  <q-th style="width: 150px; text-align: center">{{
                    columns[6].label
                  }}</q-th>
                </q-tr>
              </template>
              <template #body="props">
                <q-tr :props="props">
                  <q-td key="order" :props="props">
                    {{ index }}
                  </q-td>
                  <q-td key="drug" :props="props">
                    <q-select
                      class="col"
                      dense
                      outlined
                      :disable="!props.row.stock.enabled"
                      ref="drug"
                      v-model="props.row.stock.drug"
                      :options="drugs"
                      @filter="filterFn"
                      option-value="id"
                      option-label="name"
                      label="Medicamento"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="quantity" :props="props">
                    <q-input
                      outlined
                      v-model="props.row.quantity"
                      :disable="!props.row.enabled"
                      label="Quantidade"
                      dense
                      class="col"
                    />
                  </q-td>
                  <q-td key="options" :props="props">
                    <div class="col">
                      <q-btn
                        v-if="props.row.enabled"
                        :loading="submitting"
                        flat
                        dense
                        round
                        color="primary"
                        icon="done"
                        @click="validateStock(props.row)"
                      />
                      <q-btn
                        v-if="props.row.enabled"
                        flat
                        dense
                        round
                        color="red"
                        icon="clear"
                        @click="cancel(props.row)"
                      />
                      <q-btn
                        v-if="!props.row.enabled"
                        flat
                        dense
                        round
                        color="orange-5"
                        icon="edit"
                        @click="initStockEdition(props.row)"
                      />
                      <q-btn
                        v-if="!props.row.enabled"
                        flat
                        dense
                        round
                        color="red"
                        icon="delete_forever"
                        class="q-ml-sm"
                        @click="promptStockDeletion(props.row)"
                      />
                    </div>
                    <div class="col">
                      <!--q-chip color="info" text-color="white"> Em Uso </q-chip-->
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
          <div class="row">
            <q-banner
              dense
              inline-actions
              style="padding-top: 2px; padding-bottom: 2px"
              class="col text-white q-pa-none bg-orange-4 q-pr-sm"
            >
              <template v-slot:action class="items-center">
                <q-btn
                  dense
                  unelevated
                  color="primary"
                  class="col"
                  label="Imprimir"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </div>
    </div>

    <div class="row" v-if="!isMobile">
      <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg">
        <div>
          <ListHeader
            :addVisible="false"
            :expandVisible="false"
            :mainContainer="true"
            bgColor="bg-primary"
            >Notas da Guia
          </ListHeader>
          <div class="box-border q-pt-md">
            <q-input
              outlined
              v-model="orderNumber"
              ref="orderNumberRef"
              label="Número"
              :rules="[(val) => !!val || 'Por favor indicar o número da guia']"
              :disable="!isGuiaEditionStep"
              dense
              class="col q-ma-sm"
            />
            <q-input
              dense
              outlined
              :disable="!isGuiaEditionStep"
              class="col q-ma-sm"
              v-model="creationDate"
              label="Data de Criação"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="creationDate" mask="DD-MM-YYYY">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              outlined
              v-model="notes"
              label="Notas"
              ref="notesRef"
              :disable="!isGuiaEditionStep"
              dense
              class="col q-ma-sm"
              type="textarea"
            />
            <q-separator class="q-mx-sm" />
            <div class="row q-pa-sm" v-if="isGuiaDisplayStep">
              <q-btn
                unelevated
                color="blue"
                class="col"
                label="Voltar"
                @click="goBack"
              />
              <q-btn
                unelevated
                color="orange-5"
                class="q-ml-md col"
                label="Editar"
                @click="initGuiaEdition"
              />
              <q-btn
                unelevated
                color="red"
                class="q-ml-md col"
                label="Remover"
                @click="removeGuia"
              />
            </div>
            <div class="row q-pa-sm" v-if="isGuiaEditionStep">
              <q-btn
                unelevated
                color="blue"
                class="col"
                label="Cancelar"
                @click="cancelOperation"
              />
              <q-btn
                unelevated
                color="orange-5"
                class="q-ml-md col"
                label="Gravar"
                @click="doSaveGuia"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col q-pt-md q-mr-lg">
        <div>
          <ListHeader
            :addVisible="isGuiaDisplayStep"
            :expandVisible="false"
            :mainContainer="true"
            @showAdd="initNewStock"
            bgColor="bg-primary"
            :addButtonActions="initNewStock"
            >Medicamentos
          </ListHeader>
          <div class="box-border q-pb-md">
            <q-table
              class="col"
              dense
              flat
              :rows="stockList"
              :columns="columns"
              row-key="id"
            >
              <template v-slot:no-data="{ icon, filter }">
                <div
                  class="full-width row flex-center text-primary q-gutter-sm text-body2"
                >
                  <span> Sem resultados para visualizar </span>
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
              </template>
              <template #header="props">
                <q-tr class="text-left bg-grey-3" :props="props">
                  <!-- <q-th style="width: 70px">{{ columns[0].label }}</q-th> -->
                  <q-th class="col">{{ columns[1].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[2].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[3].label }}</q-th>
                  <q-th style="width: 150px; text-align: center">{{
                    columns[4].label
                  }}</q-th>
                  <q-th style="width: 150px; text-align: center">{{
                    columns[5].label
                  }}</q-th>
                </q-tr>
              </template>
              <template #body="props">
                <q-tr :props="props">
                  <!-- <q-td key="order" :props="props">
                    {{ index }}
                  </q-td> -->
                  <q-td key="drug" :props="props">
                    <q-select
                      class="col"
                      dense
                      outlined
                      @update:model-value="
                        (val) => onChangeDrug(props.row, val)
                      "
                      :disable="!props.row.enabled"
                      ref="drugRef"
                      v-model="props.row.drug"
                      :options="drugs"
                      @filter="filterFn"
                      option-value="id"
                      option-label="name"
                      label="Medicamento"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="clinic" :props="props">
                    <q-select
                      @update:model-value="
                        (val) => onChangeClinic(props.row, val)
                      "
                      class="col"
                      dense
                      outlined
                      :disable="!props.row.enabled"
                      ref="clinicSectorRef"
                      v-model="props.row.clinic"
                      :options="clinicSectors"
                      option-value="id"
                      option-label="clinicName"
                      label="Sector Clinico"
                      @filter="filterClinicSectors"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="quantity" :props="props">
                    <q-input
                      v-model="props.row.quantity"
                      :disable="!props.row.enabled"
                      ref="quantityRef"
                      label="Quantidade"
                      type="number"
                      dense
                      outlined
                      class="col"
                    />
                  </q-td>
                  <q-td
                    key="status"
                    :props="props"
                    style="width: 150px; text-align: center"
                  >
                    <q-chip
                      square
                      :color="getOrderColor(props.row.status)"
                      text-color="white"
                      v-if="isEstadoVisible(props.row.status)"
                      >{{ getOrderStatus(props.row.status) }}
                    </q-chip>
                  </q-td>
                  <q-td
                    key="options"
                    :props="props"
                    style="width: 150px; text-align: center"
                  >
                    <div
                      class="col"
                      v-if="isEditOptionsVisible(props.row.status)"
                    >
                      <q-btn
                        v-if="props.row.enabled"
                        :loading="submitting"
                        flat
                        dense
                        round
                        color="primary"
                        icon="done"
                        @click="validateStock(props.row)"
                      />
                      <q-btn
                        v-if="props.row.enabled"
                        flat
                        dense
                        round
                        color="red"
                        icon="clear"
                        @click="cancel(props.row)"
                      />
                      <!--q-btn
                        v-if="!props.row.enabled"
                        flat
                        dense
                        round
                        color="orange-5"
                        icon="edit"
                        @click="initStockEdition(props.row)"
                      /-->
                      <q-btn
                        v-if="
                          props.row.status !== 'R' && props.row.status !== ''
                        "
                        flat
                        dense
                        round
                        color="red"
                        icon="delete_forever"
                        class="q-ml-sm"
                        @click="promptStockDeletion(props.row)"
                      />
                    </div>
                    <div class="col" v-else>
                      <!--q-chip color="info" text-color="white"> Em Uso </q-chip-->
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
          <div class="row">
            <q-banner
              dense
              inline-actions
              style="padding-top: 2px; padding-bottom: 2px"
              class="col text-white q-pa-none bg-orange-4 q-pr-sm"
            >
              <template v-slot:action class="items-center">
                <q-btn
                  dense
                  unelevated
                  color="primary"
                  class="col hidden"
                  label="Imprimir"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

import Drug from '../../../stores/models/drug/Drug';
import Clinic from '../../../stores/models/clinic/Clinic';
import { computed, onMounted, provide, ref, inject } from 'vue';
import { date } from 'quasar';
import moment from 'moment';
import DrugDistributorService from 'src/services/api/drugDistributorService/DrugDistributorService';
import StockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

// import { v4 as uuidv4 } from 'uuid'

// components
import TitleBar from 'components/Shared/TitleBar.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import drugService from 'src/services/api/drugService/drugService';
import clinicService from 'src/services/api/clinicService/clinicService';
import DrugDistributor from '../../../stores/models/drugDistributor/DrugDistributor';
import StockService from 'src/services/api/stockService/StockService';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import stockLevelService from 'src/services/api/stockLevelService/stockLevelService.ts';

const router = useRouter();
const dateUtils = useDateUtils();
const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarningAction } = useSwal();
const { isMobile } = useSystemUtils();
const title = ref('Detalhe da Guia');
const columns = [
  {
    name: 'order',
    required: true,
    label: 'Ordem',
    field: 'index',
    align: 'left',
    sortable: false,
  },
  { name: 'drug', align: 'left', label: 'Medicamento', sortable: true },
  { name: 'clinic', align: 'left', label: 'Sector Clinico', sortable: true },
  { name: 'quantity', align: 'left', label: 'Quantidade', sortable: true },
  { name: 'status', align: 'left', label: 'Estado', sortable: true },
  { name: 'options', align: 'center', label: 'Opções', sortable: false },
];

let submitting = false;
const creationDate = ref('');
const orderNumber = ref('');
const notes = ref('');

const step = ref('display');
const guiaStep = ref('display');
const selectedStock = ref([]);
const drugs = ref([]);
const clinicSectors = ref([]);
const stockList = ref([]);
let stockDistributorBatch = '';
const orderNumberRef = ref('');
const notesRef = ref('');
const clinicSectorRef = ref('');
const drugRef = ref('');
const paramsStockLevel = ref({ drugId: '', clinicId: '' });
const quantityRef = ref('');

const status = ref('');
const stockDistributionCount = inject('stockDistributionCount');

const goBack = () => {
  router.go(-1);
};

const isEstadoVisible = (status) => {
  return status !== '';
};

const isEditOptionsVisible = (status) => {
  const aux = status === 'P' || status === 'R' || status === '';
  return aux;
};

const filterFn = (val, update, abort) => {
  const stringOptions = activeDrugs.value;
  if (val === '') {
    update(() => {
      return (drugs.value = stringOptions.map((drug) => drug));
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      drugs.value = [];
    });
  } else {
    update(() => {
      drugs.value = stringOptions
        .map((drug) => drug)
        .filter((drug) => {
          return (
            drug && drug.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const filterClinicSectors = (val, update, abort) => {
  const stringOptions = clinicSectorsList.value;
  if (val === '') {
    update(() => {
      return (clinicSectors.value = stringOptions.map((drug) => drug));
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      clinicSectors.value = [];
    });
  } else {
    update(() => {
      clinicSectors.value = stringOptions
        .map((sector) => sector)
        .filter((sector) => {
          return (
            sector &&
            sector.clinicName.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const onChangeClinic = (row, item) => {
  paramsStockLevel.value.clinicId = item.id;
  if (
    paramsStockLevel.value.clinicId !== '' &&
    paramsStockLevel.value.drugId !== ''
  ) {
    const stockLevel = stockLevelService.getStockLevel(
      paramsStockLevel.value.clinicId,
      paramsStockLevel.value.drugId
    );
    if (stockLevel !== null) {
      row.quantity = stockLevel.quantity;
    } else {
      row.quantity = 0;
    }
  }
};

const onChangeDrug = (row, item) => {
  paramsStockLevel.value.drugId = item.id;
  if (
    paramsStockLevel.value.clinicId !== '' &&
    paramsStockLevel.value.drugId !== ''
  ) {
    const stockLevel = stockLevelService.getStockLevel(
      paramsStockLevel.value.clinicId,
      paramsStockLevel.value.drugId
    );
    if (stockLevel !== null) {
      row.quantity = stockLevel.quantity;
    } else {
      row.quantity = 0;
    }
  }
};

const init = () => {
  creationDate.value = dateUtils.getDDMMYYYFromJSDate(
    currStockDistributor.value.creationDate
  );
  orderNumber.value = currStockDistributor.value.orderNumber;
  notes.value = currStockDistributor.value.notes;
};

const cancelOperation = () => {
  guiaStep.value = 'display';
  submitting = false;
};

const doSaveGuia = () => {
  currStockDistributor.value.creationDate = dateUtils.getJSDateFromDDMMYYY(
    creationDate.value
  ); // getJSDateFromDDMMYYY()
  currStockDistributor.value.orderNumber = orderNumber.value;
  currStockDistributor.value.clinic = currClinic.value;
  currStockDistributor.value.notes = notes.value;

  orderNumberRef.value.validate();
  if (creationDate.value === '') {
    alertError('Preencha a data de criação da guia .');
  } else if (currStockDistributor.value.creationDate > new Date()) {
    alertError(
      'A data de criação da guia não pode ser superior a data corrente.'
    );
  } else if (!orderNumberRef.value.hasError) {
    if (guiaStep.value === 'create') {
      StockDistributorService.post(currStockDistributor.value)
        .then((resp) => {
          currStockDistributor.value = resp.response.data;
          guiaStep.value = 'display';
          alertSucess('Operação efectuada com sucesso.');
        })
        .catch((error) => {
          const listErrors = [];
          if (error != null) {
            const arrayErrors = JSON.parse(error);
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
          }
          alertError(listErrors);
        });
    } else if (guiaStep.value === 'edit') {
      const entrance = JSON.parse(
        JSON.stringify(currStockDistributor.value, circularReferenceReplacer())
      );
      StockDistributorService.apiUpdate(
        currStockDistributor.value.id,
        entrance
      ).then((resp) => {
        localStorage.setItem(
          'currStockDistributor',
          currStockDistributor.value.id
        );
        guiaStep.value = 'display';
        alertSucess('Operação efectuada com sucesso.');
      });
    }
  }
};

const circularReferenceReplacer = () => {
  const seen = new WeakSet();
  return (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return; // Break circular reference
      }
      seen.add(value);
    }
    return value;
  };
};

const initGuiaEdition = () => {
  if (
    currStockDistributor.value.drugDistributors.length > 0 ||
    stockList.value.length > 0
  ) {
    alertError(
      'Não pode editar os dados da ordem, pois ja existem registos de lotes associados.'
    );
  } else {
    guiaStep.value = 'edit';
  }
};
const removeGuia = () => {
  if (
    currStockDistributor.value.drugDistributors.length > 0 ||
    stockList.value.length > 0
  ) {
    alertError(
      'Não pode remover esta  Ordem de distribuicao , pois ja existem registos de lotes associados.'
    );
  } else {
    alertWarningAction(
      'Deseja remover a presente Ordem de distribuicao de Stock ?',
      'Não',
      'Sim'
    ).then((result) => {
      if (result) {
        guiaStep.value = 'delete';
        doRemoveGuia(stockDistributorBatch);
      }
    });
  }
};

const doRemoveGuia = () => {
  StockDistributorService.delete(currStockDistributor.value.id).then((resp) => {
    goBack();
    alertSucess('Operação efectuada com sucesso.');
  });
};

const doRemoveStock = (record) => {
  status.value = 'A';
  step.value = 'display';
  record.enabled = false;
  record.status = 'A';

  showloading();
  DrugDistributorService.updateDrugDistributorStatus(record, 'A')
    .then((resp) => {
      step.value = 'display';

      if (!!currClinic.value) {
        DrugDistributorService.getDistributionsByStatus(
          currClinic.value.id,
          'P'
        ).then((list) => {
          stockDistributionCount.value = list.length;
        });
      }
      closeLoading();
      alertSucess('Operação efectuada com sucesso.');
    })
    .catch((error) => {
      alertError('Ocorreu um erro inesperado, contacte o administrador!');
    });
};

const initNewStock = () => {
  showloading();
  if (step.value === 'create' || step.value === 'edit') {
    alertError(
      'Por favor concluir ou cancelar a operação em curso antes de iniciar a adição de novo registo.'
    );
    closeLoading();
  } else {
    step.value = 'create';
    const newStock = new DrugDistributor({
      drug: new Drug(),
      enabled: true,
      clinic: new Clinic(),
      stockDistributor: currStockDistributor,
    });
    status.value = 'P';

    stockList.value.push(newStock);
    closeLoading();
  }
};

const isPositiveInteger = (str) => {
  const num = Number(str);
  if (Number.isInteger(num) && num > 0) {
    return true;
  }
  if (typeof str !== 'string') {
    return false;
  }
  return false;
};

const validateStock = async (stock) => {
  submitting = true;
  stock.stock_distributor_id = currStockDistributor.value.id;

  if (stock.drug.name === '') {
    submitting = false;
    alertError('Por favor indicar o medicamento!');
  } else if (stock.clinic.clinicName === '') {
    submitting = false;
    alertError('Por favor indicar o sector clinico!');
  } else if (!isPositiveInteger(stock.quantity)) {
    submitting = false;
    alertError('Por favor indicar uma quantidade válida!');
  } else {
    const hasStock = await StockService.checkStockStatus(
      stock.drug.id,
      currStockDistributor.value.creationDate,
      stock.quantity,
      clinicService.currClinic().id,
      8
    );
    if (hasStock) {
      doSave(stock);
    } else {
      submitting = false;
      closeLoading();
      alertError(
        'O medicamento não possui quantidade suficiente para a distribuição!'
      );
    }
  }
};

const doSave = (stock) => {
  showloading();
  stock.drug_id = stock.drug.id;
  stock.drug = {};
  stock.drug.id = stock.drug_id;
  stock.stockDistributor = {};
  stock.stockDistributor.id = stock.stock_distributor_id;
  stock.status = 'P'; //Pending

  stock.clinic_id = stock.clinic.id;
  //stock.clinic = {};

  if (isCreationStep.value) {
    submitting = false;
    stock.id = uuidv4();
    DrugDistributorService.post(stock)
      .then((resp) => {
        if (
          !stockLevelService.isStockLevelExists(stock.clinic_id, stock.drug_id)
        ) {
          const stockLevel = {};
          stockLevel.id = uuidv4();
          stockLevel.drug_id = stock.drug_id;
          stockLevel.clinic_id = stock.clinic_id;
          stockLevel.quantity = stock.quantity;
          stockLevel.drug = {};
          stockLevel.clinic = {};
          stockLevel.drug.id = stock.drug_id;
          stockLevel.clinic.id = stock.clinic_id;

          stockLevelService.post(stockLevel);
        }

        loadStockList();
        paramsStockLevel.value = {};
        // stock.id = resp.response.data.id
        submitting = false;
        step.value = 'display';
        stock.enabled = false;

        alertSucess('Operação efectuada com sucesso.');
        closeLoading();
      })
      .catch((error) => {
        alertError('Ocorreu um erro inesperado');
        console.log('ERRO: ', error);
        closeLoading();
      });
  } else if (isEditionStep.value) {
    DrugDistributorService.patch(stock.id, stock)
      .then((resp) => {
        //stock.id = resp.response.data.id
        submitting = false;
        stock.enabled = false;
        step.value = 'display';
        alertSucess('Operação efectuada com sucesso.');
        closeLoading();
      })
      .catch((error) => {
        alertError('Ocorreu um erro inesperado');
        console.log('ERRO: ', error);
        closeLoading();
      });
  }
};

const cancel = (stock) => {
  if (isEditionStep.value) {
    stock.drug = selectedStock.value.drug;
    stock.expireDate = selectedStock.value.expireDate;
    stock.batchNumber = selectedStock.value.batchNumber;
    stock.quantity = selectedStock.value.unitsReceived;
  } else if (isCreationStep.value) {
    removeFromList(stock);
  }
  step.value = 'display';
};

const removeFromList = (stock) => {
  const i = stockList.value.map((toRemove) => toRemove.id).indexOf(stock.id); // find index of your object
  stockList.value.splice(i, 1);
};

const initStockEdition = (stock) => {
  selectedStock.value = Object.assign({}, stock);
  if (step.value === 'edit' || step.value === 'create') {
    alertError(
      'Por favor concluir ou cancelar a operação em curso antes de iniciar a edição deste registo.'
    );
  } else {
    stock.enabled = true;
    step.value = 'edit';
  }
};

const promptStockDeletion = (stock) => {
  if (step.value === 'create' || step.value === 'edit') {
    alertError(
      'Por favor concluir ou cancelar a operação em curso antes de iniciar a remoção deste registo.'
    );
  } else {
    alertWarningAction(
      'Confirma a anulação da distribuição [' +
        stock.drug.name +
        '] com quantidade [' +
        stock.quantity +
        ']?',
      'Não',
      'Sim'
    ).then((result) => {
      if (result) {
        doRemoveStock(stock);
      }
    });
  }
};

const getCurrStockDistributor = () => {
  const distributorId = JSON.parse(
    localStorage.getItem('currStockDistributor')
  );
  return StockDistributorService.getStockDistributorById(distributorId);
};

const loadStockList = () => {
  stockList.value = [];
  if (currStockDistributor.value.drugDistributors.length > 0) {
    Object.keys(currStockDistributor.value.drugDistributors).forEach(
      function (k) {
        const stock = DrugDistributorService.getDrugDistributorById(
          currStockDistributor.value.drugDistributors[k].id
        );
        stockList.value.push(stock);
      }.bind(this)
    );
  }
  console.log('Finished loading stock');
};

const getOrderStatus = (status) => {
  if (status === 'P') {
    //statusColor.value = 'orange';
    return 'Pendente';
  } else if (status === 'C') {
    //statusColor.value = 'green';
    return 'Confirmado';
  } else if (status === 'R') {
    //statusColor.value = 'red';
    return 'Rejeitado';
  } else if (status === 'A') {
    return 'Anulado';
  }
};

const getOrderColor = (status) => {
  if (status === 'P') {
    //statusColor.value = ;
    return 'orange';
  } else if (status === 'C') {
    //statusColor.value =;
    return 'green';
  } else if (status === 'R') {
    //statusColor.value = ;
    return 'red';
  } else if (status === 'A') {
    return 'red';
  }
};

onMounted(() => {
  init();
  loadStockList();
  //drugs.value = activeDrugs;
});

const currStockDistributor = computed(() => {
  return getCurrStockDistributor();
});

const activeDrugs = computed(() => {
  return drugService.getActiveDrugs();
});

const clinicSectorsList = computed(() => {
  return clinicSectorService.getActivebyClinicId(currClinic.value.id);
});

const isEditionStep = computed(() => {
  return step.value === 'edit';
});

const isCreationStep = computed(() => {
  return step.value === 'create';
});

const isGuiaEditionStep = computed(() => {
  return guiaStep.value === 'edit';
});

const isGuiaDisplayStep = computed(() => {
  return guiaStep.value === 'display';
});
const currClinic = computed(() => {
  return clinicService.currClinic();
});
provide('title', title);
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
