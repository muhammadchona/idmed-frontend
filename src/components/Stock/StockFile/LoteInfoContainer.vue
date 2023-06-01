<template>
  <div class="box-border q-pb-md">
    <ListHeader
      :addVisible="isDisplayStep"
      :doneVisible="doneVisible"
      :mainContainer="false"
      expandLess="expandLess"
      addNewAdjustment="addNewAdjustment"
      saveAjustment="saveAjustment"
      cancel="cancel"
      :bgColor="headerColor"
      ><span class="text-blue-grey-8"
        >Nr. do Lote: {{ stock.batchNumber }} - [Saldo Actual:
        {{ stock.stockMoviment }}] - [Validade:
        <span :class="getValidadeLabelColor">{{ getValidade }}</span
        >]</span
      >
    </ListHeader>
    <q-table
      class="col"
      dense
      flat
      separator="cell"
      :rows="drugEventList"
      :columns="columns"
      row-key="id"
      v-show="serviceInfoVisible"
    >
      <template v-slot:no-data="{ icon, filter }">
        <div
          class="full-width row flex-center text-primary q-gutter-sm text-body2"
        >
          <span> Sem informação por visualizar </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
      <template #header="props">
        <q-tr
          class="text-left bg-grey-3"
          style="text-align: center"
          :props="props"
        >
          <q-th style="width: 140px">{{ columns[0].label }}</q-th>
          <q-th style="width: 200px">{{ columns[1].label }}</q-th>
          <q-th style="width: 180px">{{ columns[2].label }}</q-th>
          <q-th style="width: 120px">{{ columns[3].label }}</q-th>
          <q-th style="width: 120px">{{ columns[4].label }}</q-th>
          <q-th style="width: 120px">{{ columns[5].label }}</q-th>
          <q-th style="width: 120px">{{ columns[6].label }}</q-th>
          <q-th style="width: 120px">{{ columns[7].label }}</q-th>
          <q-th style="width: 100px">{{ columns[8].label }}</q-th>
          <q-th class="col" style="width: 400px">{{ columns[9].label }}</q-th>
        </q-tr>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td key="eventDate" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <q-input
                dense
                outlined
                class="col"
                v-model="props.row.eventDate"
                mask="date"
                ref="expireDate"
                label="Data Movimento"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="qDateProxy"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="props.row.eventDate">
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
            </span>
            <span v-else>{{ dateUtils.formatDate(props.row.eventDate) }}</span>
          </q-td>
          <q-td key="moviment" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.moviment"
                label="Tipo de Movimento"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.moviment }}</span>
          </q-td>
          <q-td key="orderNumber" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.orderNumber"
                :disable="isLossAdjustment"
                label="Número da Guia"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.orderNumber }}</span>
          </q-td>
          <q-td key="incomes" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.incomes"
                disable
                label="Entradas"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.incomes }}</span>
          </q-td>
          <q-td key="outcomes" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.outcomes"
                disable
                label="Saídas"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.outcomes }}</span>
          </q-td>
          <q-td key="posetiveAdjustment" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.posetiveAdjustment"
                :disable="!isPosetiveAdjustment"
                label="Ajuste Positivo"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.posetiveAdjustment }}</span>
          </q-td>
          <q-td key="negativeAdjustment" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.negativeAdjustment"
                :disable="!isNegativeAdjustment"
                label="Ajuste Negativo"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.negativeAdjustment }}</span>
          </q-td>
          <q-td key="loses" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.loses"
                :disable="!isLossAdjustment"
                label="Perdas"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.loses }}</span>
          </q-td>
          <q-td key="balance" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.balance"
                disable
                label="Saldo"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.balance }}</span>
          </q-td>
          <q-td key="notes" :props="props">
            <span v-if="props.row.id === null && !isDisplayStep">
              <TextInput
                v-model="props.row.notes"
                label="Notas"
                dense
                class="col"
              />
            </span>
            <span v-else>{{ props.row.notes }}</span>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import Stock from '../../../stores/models/stock/Stock';
import { StockDestructionAdjustment } from '../../../stores/models/stockadjustment/StockDestructionAdjustment';
import StockOperationType from '../../../stores/models/stockoperation/StockOperationType';
import DestroyedStock from '../../../stores/models/stockdestruction/DestroyedStock';
import { onMounted, ref, computed, provide, reactive } from 'vue';
import { StockReferenceAdjustment } from '../../../stores/models/stockadjustment/StockReferenceAdjustment';
import ReferedStockMoviment from '../../../stores/models/stockrefered/ReferedStockMoviment';
import db from 'src/stores/localbase';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import StockService from 'src/services/api/stockService/StockService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useMediaQuery } from '@vueuse/core';
// components

import ListHeader from 'components/Stock/StockFile/StockFileListHeader.vue';
import TextInput from 'components/Shared/Input/TextField.vue';
import clinicService from 'src/services/api/clinicService/clinicService';
import drugFileService from 'src/services/api/drugFile/drugFileService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';

const { alertSucess, alertError } = useSwal();

const columns = [
  {
    name: 'eventDate',
    required: true,
    label: 'Data Movimento',
    field: 'eventDate',
    align: 'center',
    sortable: true,
  },
  {
    name: 'moviment',
    align: 'center',
    label: 'Origem/Destino',
    sortable: true,
  },
  { name: 'orderNumber', align: 'center', label: 'Nr. Guia', sortable: false },
  { name: 'incomes', align: 'center', label: 'Entrada', sortable: true },
  { name: 'outcomes', align: 'center', label: 'Saídas', sortable: true },
  {
    name: 'posetiveAdjustment',
    align: 'center',
    label: 'Ajuste Positivo (+)',
    sortable: true,
  },
  {
    name: 'negativeAdjustment',
    align: 'center',
    label: 'Ajuste Negativo (-)',
    sortable: true,
  },
  { name: 'loses', align: 'center', label: 'Perdas', sortable: true },
  { name: 'balance', align: 'center', label: 'Saldo', sortable: true },
  { name: 'notes', align: 'center', label: 'Notas', sortable: false },
];
const props = defineProps(['stockInfo', 'batchS']);
const dateUtils = useDateUtils();
const isWebScreen = useMediaQuery('(min-width: 1024px)');
const mobile = computed(() => (isWebScreen.value ? false : true));

const stockExpiteStatus = ref('');
const drugEventList = ref([]);
const adjustmentTypeRef = ref('');
const step = ref('display');
const serviceInfoVisible = ref(true);
const curEvent = ref({});
const bgColor = reactive(ref({}));
const addVisible = reactive(ref({}));
const mainContainer = reactive(ref({}));

const expandLess = (value) => {
  serviceInfoVisible.value = !value;
};

const saveAjustment = () => {
  const clinic = clinicService.currClinic();
  clinic.sectors = [];
  let adjustment = null;
  let reference = null;
  let destruction = null;
  if (isLossAdjustment.value) {
    destruction = new DestroyedStock({
      notes: curEvent.value.moviment,
      date: new Date(curEvent.value.eventDate),
      clinic: clinic,
    });
    adjustment = new StockDestructionAdjustment({
      adjustedValue: Number(curEvent.value.loses),
      operation:
        StockOperationTypeService.getStockOperatinTypeByCode('AJUSTE_NEGATIVO'),
    });
    destruction.adjustments.push(adjustment);
  } else if (isPosetiveAdjustment.value || isNegativeAdjustment.value) {
    reference = new ReferedStockMoviment({
      origin: curEvent.value.moviment,
      date: new Date(curEvent.value.eventDate),
      quantity: isPosetiveAdjustment.value
        ? Number(curEvent.value.posetiveAdjustment)
        : Number(curEvent.value.negativeAdjustment),
      orderNumber: curEvent.value.orderNumber,
      clinic: clinic,
    });
    adjustment = new StockReferenceAdjustment({
      adjustedValue: isPosetiveAdjustment.value
        ? Number(curEvent.value.posetiveAdjustment)
        : Number(curEvent.value.negativeAdjustment),
      operation: StockOperationTypeService.getStockOperatinTypeByCode(
        isPosetiveAdjustment.value ? 'AJUSTE_POSETIVO' : 'AJUSTE_NEGATIVO'
      ),
    });
    reference.adjustments.push(adjustment);
  }

  adjustment.adjustedStock = StockService.getStockById(stock.value.id);
  if (
    new Date(curEvent.value.eventDate) <
    new Date(adjustment.adjustedStock.entrance.dateReceived)
  ) {
    alertError(
      'error',
      'A data do movimento não pode ser menor que a data de entrada do lote.'
    );
  } else if (new Date(curEvent.value.eventDate) > new Date()) {
    alertError(
      'error',
      'A data do movimento não pode ser maior que a data corrente.'
    );
  } else if (curEvent.value.moviment === '') {
    alertError('error', 'Por favor indicar a Origem/Destino.');
  } else if (Number(adjustment.adjustedValue) <= 0) {
    alertError('error', 'Por favor indicar uma quantidade válida.');
  } else if (
    (isLossAdjustment.value || isNegativeAdjustment.value) &&
    adjustment.adjustedStock.stockMoviment - adjustment.adjustedValue < 0
  ) {
    alertError(
      'error',
      'A quantidade que pretende retitar é maior que a quantidade em stock no momento, impossível prosseguir!'
    );
  } else {
    adjustment.clinic = clinic;
    adjustment.notes = curEvent.value.notes;
    adjustment.captureDate = new Date(curEvent.value.eventDate);
    adjustment.finalised = true;
    adjustment.adjustedStock.clinic = clinic;
    if (isPosetiveAdjustment.value) {
      adjustment.adjustedStock.stockMoviment = Number(
        adjustment.adjustedStock.stockMoviment + adjustment.adjustedValue
      );
    } else {
      adjustment.adjustedStock.stockMoviment = Number(
        adjustment.adjustedStock.stockMoviment - adjustment.adjustedValue
      );
    }
    adjustment.balance = adjustment.adjustedStock.stockMoviment;
    curEvent.value.balance = adjustment.balance;
    if (mobile.value) {
      if (isPosetiveAdjustment.value || isNegativeAdjustment.value) {
        reference.syncStatus = 'R';
        ReferedStockMoviment.localDbAdd(reference)
          .then((resp) => {
            reference.adjustments[0].adjustedStock.syncStatus = 'U';
            Stock.localDbUpdate(reference.adjustments[0].adjustedStock);
            step.value = 'display';
            adjustmentType.value = '';
            alertSucess('info', 'Operação efectuada com sucesso.');
            $emit('updateDrugFileAdjustment', reference.adjustments[0]);
          })
          .catch((error) => {
            alertError('error', error);
          });
      } else {
        destruction.syncStatus = 'R';
        DestroyedStock.localDbAdd(destruction)
          .then((resp) => {
            destruction.adjustments[0].syncStatus = 'U';
            Stock.localDbUpdate(destruction.adjustments[0].adjustedStock);
            $emit('updateDrugFileAdjustment', destruction.adjustments[0]);
            step.value = 'display';
            adjustmentType.value = '';
            alertSucess('info', 'Operação efectuada com sucesso.');
          })
          .catch((error) => {
            alertError('error', error);
          });
        db.newDb().collection('destruction').set(destruction);
      }
      drugEventList.value.shift();
    } else {
      doSave(reference, destruction);
    }
  }
};

const doSave = (reference, destruction) => {
  if (isPosetiveAdjustment.value || isNegativeAdjustment.value) {
    ReferedStockMovimentService.post(reference).then((resp) => {
      curEvent.value.id = reference.adjustments[0].id;
      updateRelatedStock(reference.adjustments[0].adjustedStock);
    });
  } else {
    DestroyedStockService.post(destruction).then((resp) => {
      curEvent.value.id = destruction.adjustments[0].id;
      updateRelatedStock(destruction.adjustments[0].adjustedStock);
    });
  }
};

const updateRelatedStock = (stock) => {
  StockService.patch(stock.id, stock).then((resp) => {
    step.value = 'display';
    adjustmentTypeRef.value = '';
    alertSucess('info', 'Operação efectuada com sucesso.');
  });
};

const cancel = () => {
  const i = drugEventList.value
    .map((toRemove) => toRemove.id)
    .indexOf(curEvent.value.id); // find index of your object
  drugEventList.value.splice(i, 1);
  adjustmentTypeRef.value = '';
  step.value = 'display';
};

const addNewAdjustment = (adjustmentType) => {
  adjustmentTypeRef.value = adjustmentType;
  const event = {
    id: null,
    eventDate: ' ',
    moviment: ' ',
    orderNumber: adjustmentType === 'POSETIVE' ? ' ' : '-',
    incomes: '-',
    outcomes: '-',
    posetiveAdjustment: adjustmentType === 'POSETIVE' ? ' ' : '-',
    negativeAdjustment: adjustmentType === 'NEGATIVE' ? ' ' : '-',
    loses: adjustmentType === 'LOSS' ? ' ' : '-',
    balance: ' ',
    notes: '',
  };
  curEvent.value = event;
  drugEventList.value.unshift(event);
  step.value = 'create';
};

const determineValidade = () => {
  const expireDate = new Date(stock.value.expireDate);
  if (expireDate < new Date()) {
    stockExpiteStatus.value = 'Expired';
    return 'Expirou aos ' + dateUtils.formatDate(stock.value.expireDate);
  } else if (expireDate === new Date()) {
    stockExpiteStatus.value = 'Expiring';
    return 'Expira Hoje!';
  } else if (date.addToDate(new Date(), { months: 2 }) >= expireDate) {
    stockExpiteStatus.value = 'Expiring';
    const diff = date.getDateDiff(expireDate, new Date(), 'days');
    return 'Faltam ' + diff + ' dias para expirar';
  } else {
    stockExpiteStatus.value = 'valid';
    return dateUtils.formatDate(stock.value.expireDate);
  }
};

const generateDrugBatchEventSummary = () => {
  drugFileService
    .apiGetDrugBatchSummary(clinicService.currClinic().id, stock.value.id)
    .then((resp) => {
      console.log(resp.data);
      const t = resp.data;
      /* t.sort((a, b) => {
          const d1 = new Date(a.eventDate)
          const d2 = new Date(b.eventDate)
          return d2 - d1
        }) */
      drugEventList.value = t;
    });
};

const stock = computed(() => {
  if (!mobile.value) return props.stockInfo;
  return Stock.query().where('id', batchS.stockId).first();
});

const getValidade = computed(() => {
  return determineValidade();
});

const getValidadeLabelColor = computed(() => {
  if (stockExpiteStatus.value !== 'valid') {
    return 'text-red-8';
  } else {
    return 'text-green-8';
  }
});

const doneVisible = computed(() => {
  return step.value === 'eidt' || step.value === 'create';
});

const isDisplayStep = computed(() => {
  return step.value === 'display';
});

const isPosetiveAdjustment = computed(() => {
  return adjustmentTypeRef.value === 'POSETIVE';
});

const isNegativeAdjustment = computed(() => {
  return adjustmentTypeRef.value === 'NEGATIVE';
});

const isLossAdjustment = computed(() => {
  return adjustmentTypeRef.value === 'LOSS';
});

const headerColor = computed(() => {
  if (doneVisible.value) {
    return 'bg-orange-5';
  } else {
    return 'bg-grey-6';
  }
});

onMounted(() => {
  if (!mobile.value) {
    generateDrugBatchEventSummary();
  } else {
    drugEventList.value.push(batchS);
  }
});
provide('expandLess', expandLess);
provide('addNewAdjustment', addNewAdjustment);
provide('cancel', cancel);
provide('bgColor', bgColor);
provide('addVisible', addVisible);
provide('doneVisible', doneVisible);
provide('mainContainer', mainContainer);
provide('saveAjustment', saveAjustment);
</script>

<style>
</style>
