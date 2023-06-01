<template>
  <div>
    <TitleBar>Detalhe da Guia</TitleBar>
    <div class="row" v-if="mobile.value">
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

    <div class="row" v-if="!mobile.value">
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
    <q-dialog v-model="alert.visible" persistent>
      <Dialog
        :type="alert.type"
        @closeDialog="closeDialog"
        @commitOperation="doRemoveOrCreateAfterValidate"
        @cancelOperation="cancelOperation"
      >
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script setup>
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

import Drug from '../../../stores/models/drug/Drug';
import Stock from '../../../stores/models/stock/Stock';
import StockEntrance from '../../../stores/models/stockentrance/StockEntrance';
import { computed, onMounted, ref } from 'vue';
import StockCenter from '../../../stores/models/stockcenter/StockCenter';
import { date, SessionStorage } from 'quasar';
import moment from 'moment';
import mixinplatform from 'src/mixins/mixin-system-platform';
import AuditSyncronization from 'src/stores/models/auditSyncronization/AuditSyncronization';
import StockService from 'src/services/api/stockService/StockService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import { useStock } from 'src/composables/stock/StockMethod';
import StockEntranceMethod from 'src/methods/stockEntrance/StockEntranceMethod';
import { useMediaQuery } from '@vueuse/core';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useRouter } from 'vue-router';
import { reactive } from 'vue';

// import { v4 as uuidv4 } from 'uuid'

// components
import Dialog from 'components/Shared/Dialog/Dialog.vue';
import TitleBar from 'components/Shared/TitleBar.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import drugService from 'src/services/api/drugService/drugService';
import clinicService from 'src/services/api/clinicService/clinicService';
import StockCenterService from 'src/services/api/stockCenterService/StockCenterService';

const router = useRouter();
const isWebScreen = useMediaQuery('(min-width: 1024px)');
const stockMethod = useStock();
const mobile = computed(() => (isWebScreen.value ? false : true));
const dateUtils = useDateUtils();
const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarningAction } = useSwal();

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
mixins: [mixinplatform];

const alert = ref({
  type: '',
  visible: false,
  msg: '',
});

let submitting = false;
const dateReceived = ref('');
const orderNumber = ref('');

const step = ref('display');
const guiaStep = ref('display');
const selectedStock = reactive(ref([]));
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
  if (mobile.value) {
    DrugMethod.localDbGetAll().then((drugs) => {
      drugs.forEach((drug) => {
        Drug.save({ where: drug.id, data: drug });
      });
    });
    loadStockList();
  }
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
  currStockEntrance.value.clinic = currClinic;

  orderNumberRef.value.validate();
  if (dateReceived.value === '') {
    alertError('error', 'Preencha a data de criação da guia .');
  } else if (currStockEntrance.value.dateReceived > new Date()) {
    alertError(
      'error',
      'A data de criação da guia não pode ser superior a data corrente.'
    );
  } else if (!orderNumberRef.value.hasError) {
    if (!mobile.value) {
      if (guiaStep.value === 'create') {
        StockEntranceService.post(currStockEntrance.value)
          .then((resp) => {
            currStockEntrance.value = resp.response.data;
            guiaStep.value = 'display';
            alertSucess('Sucesso', 'Operação efectuada com sucesso.');
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
            alertError('error', listErrors);
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
          alertSucess('Sucesso', 'Operação efectuada com sucesso.');
        });
      }
    } else {
      currStockEntrance.value.syncStatus = 'U';
      StockEntranceMethod.localDbUpdate(currStockEntrance).then((stockEnt) => {
        stockEntranceRepo.update(currStockEntrance);
        guiaStep.value = 'display';
        alertSucess('Sucesso', 'Operação efectuada com sucesso.');
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
      'error',
      'Não pode editar os dados da guia, pois ja existem registos de lotes associados.'
    );
  } else {
    guiaStep.value = 'edit';
  }
};
const removeGuia = () => {
  if (currStockEntrance.value.stocks.length > 0 || stockList.value.length > 0) {
    alertError(
      'error',
      'Não pode remover esta guia, pois ja existem registos de lotes associados.'
    );
  } else {
    guiaStep.value = 'delete';

    alertWarningAction(
      'Confirmação',
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
  if (!mobile.value) {
    StockEntranceService.delete(currStockEntrance.value.id).then((resp) => {
      goBack();
      alertSucess('info', 'Operação efectuada com sucesso.');
    });
  } else {
    const targetEntrance = JSON.parse(JSON.stringify(currStockEntrance));
    StockEntranceMethod.localDbGetById(targetEntrance.id).then((item) => {
      if (item.syncStatus !== 'R' && item.syncStatus !== 'U') {
        const auditSync = new AuditSyncronization();
        auditSync.operationType = 'remove';
        auditSync.className = StockEntrance.getClassName();
        auditSync.syncStatus = 'D';
        auditSync.entity = item;
        AuditSyncronization.localDbAdd(auditSync);
      }
      StockEntranceMethod.localDbDelete(item).then((stock) => {
        stockEntranceRepo.destroy(item.id);
      });
      $router.go(-1);
    });
  }
};

const doRemoveStock = (stock) => {
  step.value = 'delete';
  if (!mobile.value) {
    showloading();
    StockService.delete(stock.id).then((resp) => {
      removeFromList(stock);
      closeLoading();
      alertSucess('info', 'Operação efectuada com sucesso.');
    });
  } else {
    const targetStock = JSON.parse(JSON.stringify(selectedStock));
    removeFromList(targetStock);
    Stock.localDbGetById(targetStock.id).then((item) => {
      if (item.syncStatus !== 'R' && item.syncStatus !== 'U') {
        const auditSync = new AuditSyncronization();
        auditSync.operationType = 'remove';
        auditSync.className = Stock.getClassName();
        auditSync.syncStatus = 'D';
        auditSync.entity = item;
        AuditSyncronization.localDbAdd(auditSync);
      }
      StockMethod.localDbDelete(item).then((stock) => {
        StockRepo.destroy(item.id);
      });
      step.value = 'display';
    });
  }
};

const initNewStock = () => {
  if (step.value === 'create' || step.value === 'edit') {
    alertError(
      'error',
      'Por favor concluir ou cancelar a operação em curso antes de iniciar a adição de novo registo.'
    );
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
    alertError('error', 'Por favor indicar o medicamento!');
  } else if (stock.manufacture === '') {
    submitting = false;
    alertError('error', 'Por favor indicar o fabricante!');
  } else if (stock.batchNumber === '') {
    submitting = false;
    alertError('error', 'Por favor indicar o lote!');
  } else if (!date.isValid(stock.expireDate)) {
    submitting = false;
    alertError('error', 'Por favor indicar uma data de validade válida!');
  } else if (
    stock.expireDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  ) {
    submitting = false;
    alertError(
      'error',
      'A data de validade não pode ser anterior a data corrente!'
    );
  } else if (!isPositiveInteger(stock.unitsReceived)) {
    submitting = false;
    alertError('error', 'Por favor indicar uma quantidade válida!');
  } else if (!(stock.expireDate instanceof Date)) {
    alertError('error', 'A data de validade é inválida!');
  } else if (stock.expireDate <= moment(new Date()).add(28, 'd')) {
    submitting = false;

    alertError(
      'error',
      'O medicamento não deve expirar em menos de 28 dias, Por favor indique uma data de validade válida!'
    );
  } else {
    if (stock.expireDate <= moment(new Date()).add(91, 'd')) {
      alertWarningAction(
        'Confirmação',
        ' O stock especificado irá expirar em menos de 3 meses. Deseja continuar',
        'Não',
        'Sim'
      ).then((result) => {
        if (result) {
          doRemoveOrCreateAfterValidate(stock);
        }
      });

      // displayAlert('confirmation', ' O stock especificado irá expirar em menos de 3 meses. Deseja continuar')
    } else {
      doSave(stock);
    }
  }
};

const doSave = (stock) => {
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
  if (!mobile.value) {
    if (isCreationStep.value) {
      StockService.post(stock).then((resp) => {
        // stock.id = resp.response.data.id
        submitting = false;
        stock.enabled = false;
        step.value = 'display';
        alertSucess('info', 'Operação efectuada com sucesso.');
      });
    } else if (isEditionStep.value) {
      StockService.patch(stock.id, stock).then((resp) => {
        //stock.id = resp.response.data.id
        submitting = false;
        stock.enabled = false;
        step.value = 'display';
        alertSucess('info', 'Operação efectuada com sucesso.');
      });
    }
  } else {
    //  const targetCopy = new Stock(JSON.parse(JSON.stringify(stock)))
    stock.entrance_id = currStockEntrance.value.id; // stock.entrance.id
    stock.drug_id = stock.drug.id;
    stock.clinic = clinicService.currClinic();
    stock.clinic_id = clinicService.currClinic().id;
    stock.enabled = false;
    stock.center = StockCenter.query().where('prefered', true).first();
    stock.stock_center_id = stock.center.id;
    stock.entrance.clinic_id = clinicService.currClinic().id;
    stock.center.clinic = clinicService.currClinic();
    // const uuid = uuidv4
    const targetCopy = JSON.parse(JSON.stringify(stock));
    Stock.localDbAddOrUpdate(targetCopy, step)
      .then((stock1) => {
        Stock.insert({
          data: stock1.data.data,
        });
        if (step.value === 'edit') {
          Stock.localDbGetAll().then((stocks) => {
            const toUpdates = stocks.filter(
              (stock) => stock.entrance.id === currStockEntrance.value.id
            );
            StockEntranceMethod.localDbGetByStockEntranceId(
              currStockEntrance.value.id
            ).then((entrance) => {
              entrance.stocks = [];
              entrance.syncStatus =
                (entrance.syncStatus === '' || entrance.syncStatus === 'S') &&
                stock.syncStatus === 'U'
                  ? 'U'
                  : 'R';
              entrance.stocks = toUpdates;
              StockEntranceMethod.localDbUpdate(entrance).then((stockEntr) => {
                stockEntranceRepo.save({
                  data: stockEntr.data,
                });
              });
            });
          });
        } else {
          currStockEntrance.value.syncStatus =
            currStockEntrance.value.syncStatus !== 'R' &&
            currStockEntrance.value.syncStatus !== 'U'
              ? 'U'
              : 'R';
          currStockEntrance.value.stocks.push(targetCopy);
          StockEntranceMethod.localDbUpdate(currStockEntrance);
        }
        submitting = false;
        step.value = 'display';
        alertSucess('info', 'Operação efectuada com sucesso.');
      })
      .catch((error) => {
        displayAlert('error', error);
      });
  }
};

const fetchStockEntrance = () => {
  StockEntranceService.apiFetchById(currStockEntrance.value.id)
    .then((resp) => {
      currStockEntrance.value = resp.response.data;
    })
    .catch((error) => {
      const listErrors = [];
      if (error.request.response != null) {
        const arrayErrors = JSON.parse(error.request.response);
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element) => {
            listErrors.push(element.message);
          });
        }
      }
      displayAlert('error', listErrors);
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
      'error',
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
      'error',
      'Por favor concluir ou cancelar a operação em curso antes de iniciar a remoção deste registo.'
    );
  } else {
    alertWarningAction(
      'Confirmação',
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

const displayAlert = (type, msg) => {
  alert.value.type = type;
  alert.value.msg = msg;
  alert.value.visible = true;
};

const closeDialog = () => {
  alert.value.visible = false;
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
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
