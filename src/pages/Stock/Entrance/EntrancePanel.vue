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
            v-model="dateReceived"
            label="Data de Criação"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="dateReceived" mask="DD-MM-YYYY">
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
                      :disable="!props.row.enabled"
                      ref="drug"
                      v-model="props.row.drug"
                      :options="drugs"
                      option-value="id"
                      option-label="name"
                      label="Medicamento"
                      @filter="filterFn"
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
                  <q-td key="manufacture" :props="props">
                    <q-input
                      outlined
                      v-model="props.row.manufacture"
                      :disable="!props.row.enabled"
                      label="Fabricante"
                      dense
                      class="col"
                    />
                  </q-td>
                  <q-td key="batchNumber" :props="props">
                    <q-input
                      outlined
                      v-model="props.row.batchNumber"
                      :disable="!props.row.enabled"
                      label="Lote"
                      dense
                      class="col"
                    />
                  </q-td>
                  <q-td key="expireDate" :props="props">
                    <q-input
                      dense
                      :disable="!props.row.enabled"
                      outlined
                      class="col"
                      v-model="props.row.auxExpireDate"
                      ref="expireDate"
                      label="Data de Validade"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy
                            ref="qDateProxy"
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-date
                              v-model="props.row.auxExpireDate"
                              mask="DD-MM-YYYY"
                            >
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
                  </q-td>
                  <q-td key="unitsReceived" :props="props">
                    <q-input
                      outlined
                      v-model="props.row.unitsReceived"
                      :disable="!props.row.enabled"
                      label="Quantidade"
                      dense
                      class="col"
                    />
                  </q-td>
                  <q-td key="options" :props="props">
                    <div class="col" v-if="!stockMethod.isInUse(props.row)">
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
                    <div class="col" v-else>
                      <q-chip color="info" text-color="white"> Em Uso </q-chip>
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
              v-model="dateReceived"
              label="Data de Criação"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="dateReceived" mask="DD-MM-YYYY">
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
                      :disable="!props.row.enabled"
                      ref="drug"
                      v-model="props.row.drug"
                      :options="drugs"
                      option-value="id"
                      option-label="name"
                      label="Medicamento"
                      @filter="filterFn"
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
                  <q-td key="manufacture" :props="props">
                    <q-input
                      v-model="props.row.manufacture"
                      :disable="!props.row.enabled"
                      label="Fabricante"
                      dense
                      outlined
                      class="col"
                    />
                  </q-td>
                  <q-td key="batchNumber" :props="props">
                    <q-input
                      v-model="props.row.batchNumber"
                      :disable="!props.row.enabled"
                      label="Lote"
                      dense
                      outlined
                      class="col"
                    />
                  </q-td>
                  <q-td key="expireDate" :props="props">
                    <q-input
                      dense
                      :disable="!props.row.enabled"
                      outlined
                      class="col"
                      v-model="props.row.auxExpireDate"
                      ref="expireDate"
                      label="Data de Validade"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy
                            ref="qDateProxy"
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-date
                              v-model="props.row.auxExpireDate"
                              mask="DD-MM-YYYY"
                              :options="blockDataFutura"
                            >
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
                  </q-td>
                  <q-td key="unitsReceived" :props="props">
                    <q-input
                      v-model="props.row.unitsReceived"
                      :disable="!props.row.enabled"
                      label="Quantidade"
                      type="number"
                      dense
                      outlined
                      class="col"
                    />
                  </q-td>
                  <q-td key="options" :props="props">
                    <div class="col" v-if="!stockMethod.isInUse(props.row)">
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
                    <div class="col" v-else>
                      <q-chip color="info" text-color="white"> Em Uso </q-chip>
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
import Stock from '../../../stores/models/stock/Stock';
import { computed, onMounted, provide, ref } from 'vue';
import { date, SessionStorage } from 'quasar';
import moment from 'moment';
import StockService from 'src/services/api/stockService/StockService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import { useStock } from 'src/composables/stock/StockMethod';
import { useMediaQuery } from '@vueuse/core';
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
import StockCenterService from 'src/services/api/stockCenterService/StockCenterService';

const router = useRouter();
const stockMethod = useStock();
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
  { name: 'manufacture', align: 'left', label: 'Fabricante', sortable: true },
  { name: 'batchNumber', align: 'left', label: 'Lote', sortable: true },
  {
    name: 'expireDate',
    align: 'left',
    label: 'Data de Validade',
    sortable: false,
  },
  { name: 'unitsReceived', align: 'left', label: 'Quantidade', sortable: true },
  { name: 'options', align: 'center', label: 'Opções', sortable: false },
];

let submitting = false;
const dateReceived = ref('');
const orderNumber = ref('');

const step = ref('display');
const guiaStep = ref('display');
const selectedStock = ref([]);
let drugs = [];
const stockList = ref([]);
let stock = '';
const orderNumberRef = ref('');

const goBack = () => {
  router.go(-1);
};

const blockDataFutura = () => {
  const data = ref(moment(date).format('YYYY/MM/DD'));
  return true;
  //  data.value >= moment(new Date()).add(28, 'd').format('YYYY/MM/DD')
};

const filterFn = (val, update, abort) => {
  if (val === '') {
    update(() => {
      drugs = activeDrugs;
    });
    return;
  }
  update(() => {
    drugs = activeDrugs.value.filter((drug) => {
      return stringContains(drug.name, val);
    });
  });
};

const stringContains = (stringToCheck, stringText) => {
  if (stringText === '') return false;
  return stringToCheck.toLowerCase().includes(stringText.toLowerCase());
};

const init = () => {
  dateReceived.value = dateUtils.getDDMMYYYFromJSDate(
    currStockEntrance.value.dateReceived
  );
  orderNumber.value = currStockEntrance.value.orderNumber;
 };

const cancelOperation = () => {
  guiaStep.value = 'display';
  submitting = false;
};

const doSaveGuia = () => {
  currStockEntrance.value.dateReceived = dateUtils.getJSDateFromDDMMYYY(
    dateReceived.value
  ); // getJSDateFromDDMMYYY()
  currStockEntrance.value.orderNumber = orderNumber.value;
  currStockEntrance.value.clinic = currClinic.value;

  orderNumberRef.value.validate();
  if (dateReceived.value === '') {
    alertError('Preencha a data de criação da guia .');
  } else if (currStockEntrance.value.dateReceived > new Date()) {
    alertError(
      'A data de criação da guia não pode ser superior a data corrente.'
    );
  } else if (!orderNumberRef.value.hasError) {
         if (guiaStep.value === 'create') {
        StockEntranceService.post(currStockEntrance.value)
          .then((resp) => {
            currStockEntrance.value = resp.response.data;
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
          JSON.stringify(currStockEntrance.value, circularReferenceReplacer())
        );
        StockEntranceService.apiUpdate(
          currStockEntrance.value.id,
          entrance
        ).then((resp) => {
          SessionStorage.set('currStockEntrance', currStockEntrance.value.id);
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
  if (currStockEntrance.value.stocks.length > 0 || stockList.value.length > 0) {
    alertError(
      'Não pode editar os dados da guia, pois ja existem registos de lotes associados.'
    );
  } else {
    guiaStep.value = 'edit';
  }
};
const removeGuia = () => {
  if (currStockEntrance.value.stocks.length > 0 || stockList.value.length > 0) {
    alertError(
      'Não pode remover esta guia, pois ja existem registos de lotes associados.'
    );
  } else {
    guiaStep.value = 'delete';

    alertWarningAction(
      'Deseja remover a presente guia de entrada de stock?',
      'Não',
      'Sim'
    ).then((result) => {
      if (result) {
        doRemoveGuia(stock);
      }
    });
  }
};

const doRemoveGuia = () => {
    StockEntranceService.delete(currStockEntrance.value.id).then((resp) => {
      goBack();
      alertSucess('Operação efectuada com sucesso.');
    });
};

const doRemoveStock = (stock) => {
  step.value = 'delete';
    showloading();
    StockService.delete(stock.id)
      .then((resp) => {
        removeFromList(stock);
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
    const center = StockCenterService.getStockCenter();
    center.clinic = clinicService.currClinic();
    const newStock = new Stock({
      drug: new Drug(),
      center: center,
      enabled: true,
      clinic: clinicService.currClinic(),
      entrance: currStockEntrance,
    });
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

const validateStock = (stock) => {
  submitting = true;
  stock.expireDate = dateUtils.getJSDateFromDDMMYYY(stock.auxExpireDate);
  if (stock.drug.name === '') {
    submitting = false;
    alertError('Por favor indicar o medicamento!');
  } else if (stock.manufacture === '') {
    submitting = false;
    alertError('Por favor indicar o fabricante!');
  } else if (stock.batchNumber === '') {
    submitting = false;
    alertError('Por favor indicar o lote!');
  } else if (!date.isValid(stock.expireDate)) {
    submitting = false;
    alertError('Por favor indicar uma data de validade válida!');
  } else if (
    stock.expireDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  ) {
    submitting = false;
    alertError('A data de validade não pode ser anterior a data corrente!');
  } else if (!isPositiveInteger(stock.unitsReceived)) {
    submitting = false;
    alertError('Por favor indicar uma quantidade válida!');
  } else if (!(stock.expireDate instanceof Date)) {
    alertError('A data de validade é inválida!');
  } else if (stock.expireDate <= moment(new Date()).add(28, 'd')) {
    submitting = false;

    alertError(
      'O medicamento não deve expirar em menos de 28 dias, Por favor indique uma data de validade válida!'
    );
  } else {
    if (stock.expireDate <= moment(new Date()).add(91, 'd')) {
      alertWarningAction(
        ' O stock especificado irá expirar em menos de 3 meses. Deseja continuar',
        'Não',
        'Sim'
      ).then((result) => {
        if (result) {
          doSave(stock);
        }
      });

      // displayAlert('confirmation', ' O stock especificado irá expirar em menos de 3 meses. Deseja continuar')
    } else {
      doSave(stock);
    }
  }
};

const doSave = (stock) => {
  showloading();
  stock.id = uuidv4();
  stock.stockMoviment = stock.unitsReceived;
  stock.clinic_id = clinicService.currClinic().id;
  stock.drug_id = stock.drug.id;
  const center = StockCenterService.getStockCenter();
  stock.clinic = clinicService.currClinic();
  stock.stock_center_id = center.id;
  stock.entrance = currStockEntrance;
  // const entrance = currStockEntrance.value
  stock.entrance_id = currStockEntrance.value.id;
  // stock.entrance = entrance
    if (isCreationStep.value) {
      StockService.post(stock)
        .then((resp) => {
          // stock.id = resp.response.data.id
          submitting = false;
          stock.enabled = false;
          step.value = 'display';
          alertSucess('Operação efectuada com sucesso.');
        })
        .catch((error) => {
          alertError('Ocorreu um erro inesperado');
          console.log('ERRO: ', error);
        });
    } else if (isEditionStep.value) {
      StockService.patch(stock.id, stock)
        .then((resp) => {
          //stock.id = resp.response.data.id
          submitting = false;
          stock.enabled = false;
          step.value = 'display';
          alertSucess('Operação efectuada com sucesso.');
        })
        .catch((error) => {
          alertError('Ocorreu um erro inesperado');
          console.log('ERRO: ', error);
        });
    }
 
  closeLoading();
};

const fetchStockEntrance = () => {
  StockEntranceService.apiFetchById(currStockEntrance.value.id)
    .then((resp) => {
      currStockEntrance.value = resp.response.data;
    })
    .catch((error) => {
      alertError('Ocorreu um erro inesperado');
    });
};

const cancel = (stock) => {
  if (isEditionStep.value) {
    stock.drug = selectedStock.value.drug;
    stock.expireDate = selectedStock.value.expireDate;
    stock.batchNumber = selectedStock.value.batchNumber;
    stock.unitsReceived = selectedStock.value.unitsReceived;
    stock.enabled = false;
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
      'Confirma a remoção do lote [' + stock.batchNumber + ']?',
      'Não',
      'Sim'
    ).then((result) => {
      if (result) {
        doRemoveStock(stock);
      }
    });
  }
};

const getCurrStockEntrance = () => {
  const stockEntr = JSON.parse(localStorage.getItem('currStockEntrance'));
  return StockEntranceService.getStockEntranceById(stockEntr.id);
};

const loadStockList = () => {
  if (currStockEntrance.value.stocks.length > 0) {
    Object.keys(currStockEntrance.value.stocks).forEach(
      function (k) {
        const stock = StockService.getStockList(
          currStockEntrance.value.stocks[k].id
        );
        stock.auxExpireDate = dateUtils.getDDMMYYYFromJSDate(stock.expireDate);
        stockList.value.push(stock);
      }.bind(this)
    );
  }
  console.log('Finished loading stock');
};

onMounted(() => {
  init();
  loadStockList();
  drugs = activeDrugs;
});

const currStockEntrance = computed(() => {
  return getCurrStockEntrance();
});

const activeDrugs = computed(() => {
  return drugService.getActiveDrugs();
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
