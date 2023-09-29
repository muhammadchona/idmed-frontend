<template>
  <div class="box-border q-pb-md">
    <ListHeader
      :addVisible="addVisible"
      :doneVisible="doneVisible"
      :mainContainer="false"
      expandLess="expandLess"
      addNewAdjustment="addNewAdjustment"
      cancelAdjustment="cancelAdjustment"
      saveAjustment="saveAjustment"
      :showCancel="showCancel"
      :bgColor="headerColor"
      :loadingSave="loadingSave"
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
      :loading = "loading"
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
                      <q-date v-model="props.row.eventDate"  mask="DD-MM-YYYY">
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
            <span v-else>{{ dateUtils.isValidDate(props.row.eventDate) ? dateUtils.getDDMMYYYFromJSDate(props.row.eventDate) : props.row.eventDate}}</span>
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
       
        </q-tr>
      </template>
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import Stock from '../../../stores/models/stock/Stock';
import { StockDestructionAdjustment } from '../../../stores/models/stockadjustment/StockDestructionAdjustment';
import DestroyedStock from '../../../stores/models/stockdestruction/DestroyedStock';
import { onMounted, ref, computed, provide } from 'vue';
import { StockReferenceAdjustment } from '../../../stores/models/stockadjustment/StockReferenceAdjustment';
import ReferedStockMoviment from '../../../stores/models/stockrefered/ReferedStockMoviment';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import StockService from 'src/services/api/stockService/StockService';
// components

import ListHeader from 'components/Stock/StockFile/StockFileListHeader.vue';
import TextInput from 'components/Shared/Input/TextField.vue';
import clinicService from 'src/services/api/clinicService/clinicService';
import drugFileService from 'src/services/api/drugFile/drugFileService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import ReferedStockMovimentService from 'src/services/api/referedStockMovimentService/ReferedStockMovimentService';
import DestroyedStockService from 'src/services/api/destroyedStockService/DestroyedStockService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { v4 as uuidv4 } from 'uuid';

const { isMobile, isOnline } = useSystemUtils();
const { alertSucess, alertError } = useSwal();
const loading = ref(true)
const loadingSave =ref(false)

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
];
const props = defineProps(['stockInfo', 'batchS']);
const dateUtils = useDateUtils();

const stockExpiteStatus = ref('');
const drugEventList = ref([]);
const adjustmentTypeRef = ref('');
const step = ref('display');
const serviceInfoVisible = ref(true);
const curEvent = ref({});
const bgColor = ref({});
const mainContainer = ref({});
const previousBalance = ref(0)
const showCancel = ref(false)

const expandLess = (value) => {
  serviceInfoVisible.value = !value;
};

const saveAjustment = () => {
  loadingSave.value = true
  showCancel.value=false
  const clinic = clinicService.currClinic();
  clinic.sectors = [];
  let adjustment = null;
  let reference = null;
  let destruction = null;
  if (isLossAdjustment.value) {
   
    destruction = new DestroyedStock({
      id : uuidv4(),
      date: dateUtils.getDateFromHyphenDDMMYYYYWithTime ( curEvent.value.eventDate ),
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
      id : uuidv4(),
      origin: curEvent.value.moviment,
      date:  dateUtils.getDateFromHyphenDDMMYYYYWithTime ( curEvent.value.eventDate ),
      quantity: isPosetiveAdjustment.value
        ? Number(curEvent.value.posetiveAdjustment)
        : Number(curEvent.value.negativeAdjustment),
     orderNumber: 'Ordem_ajuste',
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
     curEvent.value.eventDate.trim() ===""
  ) {
    alertError(
      'Por favor indicar a  data de movimento correcta.'
    );
    loadingSave.value=false
    return 
  }
  else
  if (
    new Date(curEvent.value.eventDate) <
    new Date(adjustment.adjustedStock.entrance.dateReceived)
  ) {
    alertError(
      'A data do movimento não pode ser menor que a data de entrada do lote.'
    );
    loadingSave.value=false
  } else if (new Date(curEvent.value.eventDate) > new Date()) {
    alertError('A data do movimento não pode ser maior que a data corrente.');
    loadingSave.value=false
  } else if (curEvent.value.moviment.trim() === '') {
    alertError( 'Por favor indicar a Origem/Destino.');
    loadingSave.value=false
  } else if (Number(adjustment.adjustedValue) <= 0) {
    alertError('Por favor indicar uma quantidade válida.');
    loadingSave.value=false
  } else if (
    (isLossAdjustment.value || isNegativeAdjustment.value) &&
    adjustment.adjustedStock.stockMoviment - adjustment.adjustedValue < 0
  ) {
    alertError(
      'A quantidade que pretende retitar é maior que a quantidade em stock no momento, impossível prosseguir!'
    );
    loadingSave.value=false
  } else {
    previousBalance.value =  drugEventList.value[1].balance
    adjustment.clinic = clinic;
    adjustment.captureDate  = dateUtils.getDateFromHyphenDDMMYYYYWithTime ( curEvent.value.eventDate );
    adjustment.adjustedStock.clinic = clinic;
    if (isPosetiveAdjustment.value) {
      adjustment.adjustedStock.stockMoviment = Number(
        previousBalance.value) + Number(adjustment.adjustedValue
      );
    } else {
      adjustment.adjustedStock.stockMoviment = Number(
        previousBalance.value - adjustment.adjustedValues
      );
    }
    adjustment.balance = adjustment.adjustedStock.stockMoviment;
    curEvent.value.balance = adjustment.balance;
    doSave(reference, destruction);
  }
};

const doSave = (reference, destruction) => {
  if (isPosetiveAdjustment.value || isNegativeAdjustment.value) {
    ReferedStockMovimentService.post(reference).then((resp) => {
      curEvent.value.id = reference.adjustments[0].id;
      updateRelatedStock(reference.adjustments[0].adjustedStock);
    });
  } else {
    destruction.notes = ' - '
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
    alertSucess('Operação efectuada com sucesso.');
    loadingSave.value = false
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

const cancelAdjustment = () => {
  drugEventList.value.shift()
  step.value = 'display';
  showCancel.value=false
}
const addNewAdjustment = (adjustmentType) => {
  
  const hasCreateRow = drugEventList.value.some(obj => obj.id === null);

  
  if (!hasCreateRow){
    showCancel.value=true
    addVisible.value = false
  adjustmentTypeRef.value = adjustmentType;
  const event = {
    id: null,
    eventDate: ' ',
    moviment: ' ',
    orderNumber: adjustmentType === 'POSETIVE' ? ' ' : '',
    incomes: '-',
    outcomes: '-',
    posetiveAdjustment: adjustmentType === 'POSETIVE' ? ' ' : '',
    negativeAdjustment: adjustmentType === 'NEGATIVE' ? ' ' : '',
    loses: adjustmentType === 'LOSS' ? ' ' : '-',
    balance: ' ',
  };
  curEvent.value = event;
  drugEventList.value.unshift(event);
  step.value = 'create'; 
} else {
  alertError(
      'Ja existe uma operacao de ajuste em curso.'
    );
}

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

const clinic =   clinicService.currClinic()
  if (!isOnline.value) {
    drugFileService.getDrugFileSummaryBatch(stock.value.id).then(resp => {
        drugEventList.value = resp
        loading.value = false
      })
  
    } else {
      drugFileService.apiGetDrugBatchSummary(clinic.id, stock.value.id).then(resp => {
        const t = resp.data
        /* t.sort((a, b) => {
          const d1 = new Date(a.eventDate)
          const d2 = new Date(b.eventDate)
          return d2 - d1
        }) */
        drugEventList.value = t
        loading.value = false
      })
     
    }
};

const stock = computed(() => {
  return props.stockInfo
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
  return step.value === 'edit' || step.value === 'create';
});

const isDisplayStep = computed(() => {
  return step.value === 'display';
});


const addVisible = computed(() => {
  return stockExpiteStatus.value !== 'Expired' || step.value !== 'edit' 
})


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
    generateDrugBatchEventSummary();

});
provide('expandLess', expandLess);
provide('addNewAdjustment', addNewAdjustment);
provide('cancel', cancel);
provide('bgColor', bgColor);
provide('addVisible', addVisible);
provide('doneVisible', doneVisible);
provide('mainContainer', mainContainer);
provide('saveAjustment', saveAjustment);
provide('showCancel', showCancel);
provide('cancelAdjustment', cancelAdjustment);
provide('loadingSave', loadingSave)
</script>

<style></style>
