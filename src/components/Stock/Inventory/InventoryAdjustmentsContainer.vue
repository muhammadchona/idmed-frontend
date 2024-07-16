<template>
  <div>
    <ListHeader
      :addVisible="false"
      :doneVisible="isEditStep"
      @expandLess="expandLess"
      :mainContainer="false"
      @done="saveAdjustments"
      :bgColor="headerColor"
      >{{ drug.name }}
    </ListHeader>
    <div class="box-border q-pb-md" v-show="infoContainerVisible">
      <q-table
        class="col"
        dense
        flat
        :rows="adjustments"
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
            <q-th style="width: 110px">{{ columns[1].label }}</q-th>
            <q-th style="width: 180px">{{ columns[2].label }}</q-th>
            <q-th style="width: 190px">{{ columns[3].label }}</q-th>
            <q-th style="width: 190px">{{ columns[4].label }}</q-th>
            <q-th class="col">{{ columns[5].label }}</q-th>
          </q-tr>
        </template>
        <template #body="props">
          <q-tr :props="props">
            <q-td key="order" :props="props">
              {{ props.row.index }}
            </q-td>
            <q-td key="batchNumber" :props="props">
              <q-input
                outlined
                v-model="props.row.adjustedStock.batchNumber"
                disable
                label="Lote"
                dense
                class="col"
              />
            </q-td>
            <q-td key="expireDate" :props="props">
              <q-input
                dense
                outlined
                disable
                class="col"
                v-model="props.row.adjustedStock.auxExpireDate"
                ref="reOpenDate"
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
                        v-model="props.row.adjustedStock.auxExpireDate"
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
            <q-td key="currQty" :props="props">
              <div class="row">
                <q-input
                  dense
                  outlined
                  v-model="props.row.adjustedStock.stockMoviment"
                  disable
                  label="Quantidade"
                  class="col"
                />
              </div>
            </q-td>
            <q-td key="balance" :props="props">
              <div class="row">
                <q-input
                  outlined
                  v-model="props.row.balance"
                  :disable="!inventory.open"
                  @update:model-value="changeStepToEdition()"
                  label="Quantidade"
                  dense
                  class="col"
                />
                <q-input
                  outlined
                  v-model="drug.form.description"
                  disable
                  label="Forma"
                  dense
                  class="col q-ml-sm"
                />
              </div>
            </q-td>
            <q-td key="notes" :props="props">
              <q-input
                outlined
                v-model="props.row.notes"
                :disable="!inventory.open"
                @update:model-value="changeStepToEdition()"
                label="Notas"
                dense
                class="col"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <q-separator color="orange" v-show="!infoContainerVisible" />
    <q-dialog v-model="alert.visible" persistent>
      <Dialog :type="alert.type" @closeDialog="closeDialog">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script setup>
import { InventoryStockAdjustment } from '../../../stores/models/stockadjustment/InventoryStockAdjustment';
import { onMounted, ref, computed, reactive } from 'vue';

import Dialog from 'components/Shared/Dialog/Dialog.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import { useInventoryStockAdjustment } from 'src/composables/stockAdjustment/InventoryStockAdjustmentMethod';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import StockService from 'src/services/api/stockService/StockService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { v4 as uuidv4 } from 'uuid';
import clinicService from 'src/services/api/clinicService/clinicService';

const { isOnline } = useSystemUtils();

const props = defineProps(['drugFromInventoryPanel', 'inventory']);
const { alertSucess, alertError } = useSwal();
const { showloading, closeLoading } = useLoading();

const columns = [
  {
    name: 'order',
    required: true,
    label: 'Ordem',
    field: 'index',
    align: 'center',
    sortable: false,
  },
  { name: 'batchNumber', align: 'center', label: 'Lote', sortable: true },
  {
    name: 'expireDate',
    align: 'center',
    label: 'Data de Validade',
    sortable: false,
  },
  { name: 'currQty', align: 'center', label: 'Saldo Actual', sortable: true },
  {
    name: 'balance',
    align: 'center',
    label: 'Quantidade Contada',
    sortable: true,
  },
  { name: 'notes', align: 'center', label: 'Notas', sortable: false },
];

const inventoryStockAdjMethod = useInventoryStockAdjustment();
const dateUtils = useDateUtils();

const drug = reactive(props.drugFromInventoryPanel);
const inventory = reactive(props.inventory);
const alert = ref({
  type: '',
  visible: false,
  msg: '',
});

const adjustments = ref([]);
const isNewAdjustment = ref(false);
const numberOfValidStockPerDrug = ref(0);
const step = ref('display');
const infoContainerVisible = true;

const expandLess = (value) => {
  infoContainerVisible = !value;
};

onMounted(() => {
  showloading();
  init();
});

const init = () => {
  numberOfValidStockPerDrug.value = 0;
  if (!isOnline.value) {
    InventoryStockAdjustmentService.apiGetAllMobile();
  }
  prepareInit();
};

const prepareInit = () => {
  let i = 1;
  const stockList = getValidStocks(drug);
  numberOfValidStockPerDrug.value = stockList.length;

  if (stockList.length > 0) {
    stockList.forEach((stock) => {
      initNewAdjustment(stock, drug, i);
      i = i + 1;
    });
    closeLoading();
  } else if (stockList.length === i) {
    closeLoading();
  }
  closeLoading();
};

const getValidStocks = (drug) => {
  closeLoading();
  return StockService.getValidStockByDrug(drug, clinicService.currClinic().id);
};

const initNewAdjustment = (stock, drug, i) => {
  let newAdjustment = null;

  newAdjustment = inventoryStockAdjMethod.getInventoryStockAdjustmentById(
    stock.id,
    inventory.id
  );

  if (newAdjustment === null) {
    newAdjustment = new InventoryStockAdjustment({
      id: null,
    });
    newAdjustment.inventory = inventory;
    newAdjustment.clinic = stock.clinic;
    newAdjustment.clinic_id = stock.clinic_id;
    isNewAdjustment.value = true;
  }

  newAdjustment.index = i;
  newAdjustment.adjustedStock = stock;
  newAdjustment.adjustedStock.auxExpireDate = dateUtils.getDDMMYYYFromJSDate(
    newAdjustment.adjustedStock.expireDate
  );
  newAdjustment.adjustedStock.drug = drug;
  newAdjustment.adjustedStock.clinic = {};
  newAdjustment.adjustedStock.clinic.id = stock.clinic_id;
  newAdjustment.inventory = {};
  newAdjustment.inventory.id = inventory.id;
  inventory.adjustments.push(newAdjustment);
  adjustments.value.push(newAdjustment);
};

const saveAdjustments = () => {
  showloading();
  let conta = 0;
  adjustments.value.forEach((adjustment) => {
    if (adjustment.adjustedStock.drug.id === drug.id) {
      conta++;
      let operation = null;
      if (adjustment.balance > adjustment.adjustedStock.stockMoviment) {
        operation =
          StockOperationTypeService.getStockOperatinTypeByCode(
            'AJUSTE_POSETIVO'
          );
      } else if (adjustment.balance < adjustment.adjustedStock.stockMoviment) {
        operation =
          StockOperationTypeService.getStockOperatinTypeByCode(
            'AJUSTE_NEGATIVO'
          );
      } else {
        operation =
          StockOperationTypeService.getStockOperatinTypeByCode('SEM_AJUSTE');
      }
      adjustment.captureDate = new Date();
      adjustment.operation = operation;
      adjustment.adjustedStock.clinic = {};
      adjustment.adjustedStock.clinic.id = adjustment.clinic_id;
      adjustment.inventory.clinic = {};
      adjustment.adjustedStock.drug = {};
      adjustment.adjustedStock.stock = {};
      adjustment.adjustedStock.stock.id = adjustment.adjustedStock.stock_id;
      adjustment.adjustedStock.drug.id = drug.id;
      adjustment.inventory = {};
      adjustment.inventory.id = inventory.id;
      if (inventoryStockAdjMethod.isPosetiveAdjustment(adjustment)) {
        adjustment.adjustedValue = Number(
          adjustment.balance - adjustment.adjustedStock.stockMoviment
        );
      } else if (inventoryStockAdjMethod.isNegativeAdjustment(adjustment)) {
        adjustment.adjustedValue = Number(
          adjustment.adjustedStock.stockMoviment - adjustment.balance
        );
      } else {
        adjustment.adjustedValue = 0;
      }
      doSave(adjustment, conta);
    }
  });
};
const doSave = async (adjustment, contagem) => {
  if (adjustment !== undefined) {
    if (adjustment.balance.length <= 0 || isNaN(adjustment.balance)) {
      closeLoading();
      alertError(
        'error',
        'Por favor indicar um Numero Valido para o campo Quantidade Contada.'
      );
    } else {
      showloading();
      if (contagem <= numberOfValidStockPerDrug.value) {
        if (adjustment.id === null) {
          adjustment.id = uuidv4();
          await InventoryStockAdjustmentService.post(adjustment).then(
            (resp) => {
              console.log('Post', resp);
            }
          );
        } else {
          console.log('Ajuste Patch', adjustment);
          await InventoryStockAdjustmentService.patch(
            adjustment.id,
            adjustment
          ).then((resp) => {
            console.log('patch', resp);
          });
        }
      }
      if (contagem === numberOfValidStockPerDrug.value) {
        alertSucess('Operação efectuada com sucesso.');
        step.value = 'display';
        closeLoading();
      }
    }
  } else {
    step.value = 'display';
  }
};

const changeStepToEdition = () => {
  step.value = 'edit';
};

const isEditStep = computed(() => {
  return step.value === 'edit';
});

const headerColor = computed(() => {
  if (isEditStep.value) {
    return 'bg-amber-9';
  } else {
    return 'bg-primary';
  }
});
</script>

<style></style>
