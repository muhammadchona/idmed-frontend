<template>
  <div>
    <ListHeader
      :addVisible="false"
      :doneVisible="isEditStep"
      @expandLess="expandLess"
      :mainContainer="false"
      @done="saveAdjustments"
      :bgColor="headerColor"
      >{{ props.drug.name }}
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
            <q-th style="width: 190px">{{ columns[2].label }}</q-th>
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
              <TextInput
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
                <TextInput
                  v-model="props.row.adjustedStock.stockMoviment"
                  disable
                  label="Quantidade"
                  dense
                  class="col"
                />
              </div>
            </q-td>
            <q-td key="balance" :props="props">
              <div class="row">
                <TextInput
                  v-model="props.row.balance"
                  :disable="!inventory.open"
                  @update:model-value="changeStepToEdition()"
                  label="Quantidade"
                  dense
                  class="col"
                />
                <TextInput
                  v-model="props.row.adjustedStock.drug.form.description"
                  disable
                  label="Foma"
                  dense
                  class="col q-ml-sm"
                />
              </div>
            </q-td>
            <q-td key="notes" :props="props">
              <TextInput
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
import Drug from '../../../stores/models/drug/Drug';
import Inventory from '../../../stores/models/stockinventory/Inventory';
import { useMediaQuery } from '@vueuse/core';

import Dialog from 'components/Shared/Dialog/Dialog.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import TextInput from 'components/Shared/Input/TextField.vue';
import { useInventoryStockAdjustment } from 'src/composables/stockAdjustment/InventoryStockAdjustmentMethod';
import stockService from 'src/services/api/stockService/StockService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import clinicService from 'src/services/api/clinicService/clinicService';

const props = defineProps(['drug', 'inventory']);
const { alertSucess, alertError, alertWarningAction } = useSwal();

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

const isWebScreen = useMediaQuery('(min-width: 1024px)');
const mobile = computed(() => (isWebScreen.value ? false : true));
const inventoryStockAdjMethod = useInventoryStockAdjustment();
const dateUtils = useDateUtils();

const drug = reactive(props.drug);
const inventory = reactive(props.inventory);
const alert = ref({
  type: '',
  visible: false,
  msg: '',
});

const adjustments = ref([]);
const step = ref('display');
const infoContainerVisible = true;

const expandLess = (value) => {
  infoContainerVisible = !value;
};
const init = () => {
  if (mobile.value) {
    /* Inventory.localDbGetAll().then(item => {
              console.log('LISTA Inventarios: ', item)
              if (item.syncStatus !== '') {
                  Inventory.insert({
                    data: item
                  })
              }
            }) */
    InventoryStockAdjustment.localDbGetAll().then((item) => {
      console.log('LISTA AJustes: ', item);
      if (item.syncStatus !== '') {
        InventoryStockAdjustment.insert({
          data: item,
        });
      }
    });
    Drug.localDbGetAll().then((drugs) => {
      Drug.insertOrUpdate({ data: drugs });
    });
    prepareInit();
  } else {
    prepareInit();
  }
};

const prepareInit = () => {
  let i = 1;
  if (drug.stocks.length > 0) {
    Object.keys(drug.stocks).forEach(
      function (k) {
        initNewAdjustment(drug.stocks[k], drug, i);
        i = i + 1;
      }.bind(this)
    );
  }
};

const initNewAdjustment = (stock, drug, i) => {
  let newAdjustment = null;
  newAdjustment = inventoryStockAdjMethod.getInventoryStockAdjustmentById(
    stock.id,
    inventory.id
  );

  console.log(newAdjustment);
  if (newAdjustment === null) {
    newAdjustment = new InventoryStockAdjustment({
      inventory: inventory,
      clinic: clinicService.currClinic(),
    });
  }
  newAdjustment.index = i;
  newAdjustment.adjustedStock = stockService.getStockById(stock.id);
  newAdjustment.adjustedStock.auxExpireDate = dateUtils.getDDMMYYYFromJSDate(
    newAdjustment.adjustedStock.expireDate
  );
  newAdjustment.adjustedStock.drug = drug;
  adjustments.value.push(newAdjustment);
};

const saveAdjustments = () => {
  Object.keys(adjustments.value).forEach(
    function (k) {
      const adjustment = adjustments.value[k];
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
    }.bind(this)
  );
  doSave(0);
};
const doSave = (i) => {
  if (adjustments.value[i] !== undefined) {
    if (
      adjustments.value[i].balance.length <= 0 ||
      isNaN(adjustments.value[i].balance)
    ) {
      alertError(
        'error',
        'Por favor indicar um Numero Valido para o campo Quantidade Contada.'
      );
    } else {
      console.log(adjustments.value[i]); // devolver ajustes ao salvar
      if (!mobile.value) {
        InventoryStockAdjustmentService.apiFetchById(
          adjustments.value[i].id
        ).then((resp1) => {
          if (resp1.data.length === 0) {
            InventoryStockAdjustmentService.post(adjustments.value[i]).then(
              (resp) => {
                adjustments.value[i].id = resp.data.id;
                i = i + 1;
                setTimeout(doSave(i), 2);
                alertSucess('info', 'Operação efectuada com sucesso.');
              }
            );
          } else {
            const adjustment = adjustments.value[i];
            adjustment.adjustedStock.adjustments = [];
            InventoryStockAdjustmentService.apiUpdate(adjustment).then(
              (resp) => {
                i = i + 1;
                setTimeout(doSave(i), 2);
                alertSucess('info', 'Operação efectuada com sucesso.');
              }
            );
          }
        });
      } else {
        const targetCopy = new InventoryStockAdjustment(
          JSON.parse(JSON.stringify(adjustment))
        );
        const id = targetCopy.id;
        InventoryStockAdjustment.localDbGetById(id).then((item) => {
          if (item !== null && item !== undefined) {
            targetCopy.syncStatus = 'U';
            targetCopy.operation_id = targetCopy.operation.id;
            targetCopy.clinic = clinicService.currClinic();
            targetCopy.clinic_id = tclinicService.currClinic().id;
            InventoryStockAdjustment.localDbUpdate(targetCopy).then((resp) => {
              InventoryStockAdjustment.insert({
                data: targetCopy,
              });
              i = i + 1;
              setTimeout(doSave(i), 2);
              alertSucess('info', 'Operação efectuada com sucesso.');
            });
          } else {
            targetCopy.syncStatus = 'R';
            targetCopy.inventory_id = targetCopy.inventory.id;
            targetCopy.adjusted_stock_id = targetCopy.adjustedStock.id;
            targetCopy.operation_id = targetCopy.operation.id;
            InventoryStockAdjustment.localDbAdd(targetCopy).then((resp) => {
              InventoryStockAdjustment.insert({
                data: targetCopy,
              });
              i = i + 1;
              setTimeout(doSave(i), 2);
              alertSucess('info', 'Operação efectuada com sucesso.');
            });
          }
          if (
            inventory.value.open &&
            inventory.value.syncStatus !== 'R' &&
            inventory.value.syncStatus !== 'U'
          ) {
            Inventory.localDbGetById(inventory.value.id).then((item) => {
              const target = JSON.parse(JSON.stringify(item));
              target.syncStatus = 'U';
              Inventory.localDbUpdate(target).then((item) => {
                Inventory.update({ data: target });
              });
            });
          }
        });
      }
    }
  } else {
    step.value = 'display';
  }
};

const changeStepToEdition = () => {
  step.value = 'edit';
};

onMounted(() => {
  init();
});

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

<style>
</style>
