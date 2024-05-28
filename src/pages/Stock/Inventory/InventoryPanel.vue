<template>
  <div>
    <TitleBar />
    <div class="row" v-if="!isMobile">
      <div
        class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg"
        style="max-width: 500px"
      >
        <div>
          <ListHeader
            :addVisible="false"
            :mainContainer="true"
            bgColor="bg-primary"
            >Notas do Inventário
          </ListHeader>
          <div class="box-border q-pt-md">
            <q-input
              outlined
              v-model="inventoryType"
              label="Tipo de Inventário"
              disable
              dense
              class="col q-ma-sm"
            />
            <q-input
              dense
              outlined
              disable
              class="col q-ma-sm"
              v-model="startDate"
              ref="dateReceived"
              label="Data de Abertura"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="startDate" mask="DD-MM-YYYY">
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
            <div class="row q-pa-sm" v-if="currInventory !== null">
              <q-btn
                unelevated
                color="blue"
                class="col"
                label="Voltar"
                @click="goBack"
              />
              <q-space v-if="currInventory !== null" />
              <q-btn
                v-if="currInventory.open"
                unelevated
                color="orange"
                class="q-ml-md col"
                @click="initInventoryClosure()"
                label="Fechar Inventário"
              />

              <q-btn
                v-if="currInventory.open"
                unelevated
                color="red"
                class="q-ml-md col"
                @click="deleteInventory()"
                label="Remover"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col q-pt-md q-mr-lg">
        <q-scroll-area
          :thumb-style="thumbStyle"
          :content-style="contentStyle"
          :content-active-style="contentActiveStyle"
          style="height: 750px"
          class="q-pr-md"
        >
          <span v-for="drug in drugs" :key="drug.id">
            <AdjustmentTable
              :drugFromInventoryPanel="drug"
              :inventory="currInventory"
            />
          </span>
        </q-scroll-area>
      </div>
    </div>

    <div class="row" v-if="isMobile">
      <div class="col q-mx-md q-mt-md">
        <div>
          <ListHeader
            :addVisible="false"
            :mainContainer="true"
            bgColor="bg-primary"
            >Notas do Inventário
          </ListHeader>
          <div class="box-border row q-pt-md">
            <q-input
              outlined
              v-model="inventoryType"
              label="Tipo de Inventário"
              disable
              dense
              class="col q-ma-sm"
            />
            <q-input
              dense
              outlined
              disable
              class="col q-ma-sm"
              v-model="startDate"
              ref="dateReceived"
              label="Data de Abertura"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="startDate" mask="DD-MM-YYYY">
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
            <div class="row q-pa-sm">
              <q-btn
                unelevated
                color="blue"
                class="col"
                size="10px"
                label="Voltar"
                @click="goBack"
              />
              <q-space v-if="currInventory.open" />
              <q-btn
                v-if="currInventory.open"
                unelevated
                color="red"
                class="q-ml-md col"
                @click="initInventoryClosure()"
                size="10px"
                label="Fechar Inventário"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 q-px-md">
        <q-scroll-area
          :thumb-style="thumbStyle"
          :content-style="contentStyle"
          :content-active-style="contentActiveStyle"
          style="height: 750px"
        >
          <span v-for="drug in drugs" :key="drug.id">
            <AdjustmentTable :drug="drug" :inventory="currInventory" />
          </span>
        </q-scroll-area>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide, reactive } from 'vue';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import moment from 'moment';

import { useInventory } from 'src/composables/inventory/InvnetoryMethod';
import { useRouter } from 'vue-router';

import TitleBar from 'components/Shared/TitleBar.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import AdjustmentTable from 'components/Stock/Inventory/InventoryAdjustmentsContainer.vue';
import StockService from 'src/services/api/stockService/StockService';
import drugService from 'src/services/api/drugService/drugService';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import { useInventoryStockAdjustment } from 'src/composables/stockAdjustment/InventoryStockAdjustmentMethod';
import StockAlertService from 'src/services/api/stockAlertService/StockAlertService';
import { v4 as uuidv4 } from 'uuid';

const { isMobile, isOnline } = useSystemUtils();
const inventoryMethod = useInventory();
const router = useRouter();
const { closeLoading, showloading } = useLoading();
const { alertSucess, alertWarningAction } = useSwal();
const inventoryStockAdjMethod = useInventoryStockAdjustment();
const inventoryTemp = reactive(ref());

let step = 'display';

const title = ref('Detalhes do Inventário');
const processedAdjustments = [];
const contentStyle = {
  backgroundColor: '#ffffff',
  color: '#555',
};

const contentActiveStyle = {
  backgroundColor: '#eee',
  color: 'black',
};

const thumbStyle = {
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#0ba58b',
  width: '5px',
  opacity: 0.75,
};

const goBack = () => {
  router.go(-1);
};

const initInventoryClosure = () => {
  alertWarningAction(
    'Nota: Ao encerrar o presente inventário o stock será actualizado para os dados informados e está operação não poderá ser desfeita. Continuar?',
    'Não',
    'Sim'
  ).then((result) => {
    if (result) {
      showloading();
      doProcessAndClose();
    }
  });
};

const deleteInventory = () => {
  alertWarningAction('Nota: Deseja apagar o inventário?', 'Não', 'Sim').then(
    (result) => {
      if (result) {
        removeInventory();
      }
    }
  );
};

const removeInventory = () => {
  inventoryMethod;
  InventoryService.delete(currInventory.value.id).then(async (resp) => {
    alertSucess('Operação efectuada com sucesso.');
    router.go(-1);
  });
};

const closeInventory = () => {
  showloading();
  InventoryService.apiFetchById(currInventory.value.id).then(async (resp) => {
    await doProcessAndClose();
  });
};

const doProcessAndClose = async () => {
  const inventory = await InventoryService.apiFetchByIdWeb(
    currInventory.value.id
  );

  if (!isOnline.value) {
    adjustments =
      await InventoryStockAdjustmentService.apiGetAdjustmentsByInventoryIdMobile(
        inventory.id
      );
    inventory.adjustments = [];
    inventory.open = false;
  }
  inventory.adjustments = currInventory.value.adjustments;

  if (
    inventory.adjustments.length <= 0 ||
    inventory.adjustments === null ||
    inventory.adjustments === undefined
  ) {
    inventory.adjustments = inventoryTemp.value.adjustments;
  }else{
    if(inventory.adjustments.length !== inventoryTemp.value.adjustments.length){
      inventory.adjustments = inventoryTemp.value.adjustments;
    }
  }

  inventory.adjustments.forEach((adjustment) => {
    if (adjustment.id === null) {
      adjustment.id = uuidv4();
    }
  });

  saveAllAdjustments(inventory);
};

const doSaveAdjustment = (i) => {
  if (processAdjustment[i] !== undefined && processAdjustment[i] !== null) {
    InventoryStockAdjustmentService.patch(
      processAdjustment[i].id,
      processAdjustment[i]
    ).then((resp) => {
      i = i + 1;
      setTimeout(doSaveAdjustment(i), 2);
    });
  }
};

// acualiza os stock movement

const saveAllAdjustments = (inventory) => {
  showloading();
  Object.keys(inventory.adjustments).forEach(
    function (k) {
      const adjustment = inventory.adjustments[k];
      adjustment.adjustedStock = StockService.getStockById(
        adjustment.adjustedStock.id
      );
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
      adjustment.clinic = {};
      adjustment.clinic.id = clinicService.currClinic().id;
      adjustment.adjustedStock.clinic = {};
      adjustment.adjustedStock.clinic.id = clinicService.currClinic().id;
      adjustment.inventory.clinic = {};
      adjustment.inventory = {};
      adjustment.inventory.id = inventory.id;
      adjustment.clinic_id = clinicService.currClinic().id;
      adjustment.finalised = true;

      if (inventoryStockAdjMethod.isPosetiveAdjustment(adjustment)) {
        adjustment.adjustedValue = Number(
          adjustment.balance - adjustment.adjustedStock.stockMoviment
        );
        adjustment.adjustedStock.stockMoviment =
          adjustment.adjustedStock.stockMoviment + adjustment.adjustedValue;
      } else if (inventoryStockAdjMethod.isNegativeAdjustment(adjustment)) {
        adjustment.adjustedValue = Number(
          adjustment.adjustedStock.stockMoviment - adjustment.balance
        );
        adjustment.adjustedStock.stockMoviment =
          adjustment.adjustedStock.stockMoviment - adjustment.adjustedValue;
      } else {
        adjustment.adjustedValue = 0;
      }
    }.bind(this)
  );
  doSaveAll(0, inventory);
};
const doSaveAll = (i, inventory) => {
  const adjustments = inventory.adjustments;

  if (adjustments[i] !== undefined) {
    if (adjustments[i].balance.length <= 0 || isNaN(adjustments[i].balance)) {
      closeLoading();
      alertError(
        'error',
        'Por favor indicar um Numero Valido para o campo Quantidade Contada.'
      );
    } else {
      InventoryStockAdjustmentService.apiFetchById(adjustments[i].id).then(
        (resp1) => {
          if (resp1.data !== null && resp1.data !== '') {
            const adjustment = adjustments[i];
            adjustment.adjustedStock.adjustments = [];
            InventoryStockAdjustmentService.patch(
              adjustment.id,
              adjustment
            ).then((resp) => {
              i = i + 1;
              setTimeout(doSaveAll(i, inventory), 2);
            });
          } else {
            InventoryStockAdjustmentService.post(adjustments[i]).then(
              (resp) => {
                i = i + 1;
                setTimeout(doSaveAll(i, inventory), 2);
              }
            );
          }
          if (i === adjustments.length - 1) {
            inventory.open = false;
            inventory.endDate = new Date();
            InventoryService.patch(inventory.id, inventory).then((resp) => {
              step = 'display';
              InventoryService.closeInventoryPinia(inventory);
              StockAlertService.apiGetStockAlertAll(
                clinicService.currClinic().id
              );
              closeLoading();
              alertSucess('Operação efectuada com sucesso.');
            });
          }
        }
      );
    }
  } else {
    step = 'display';
  }
};

const doSaveAdjustmentMobile = (i) => {
  if (processAdjustment[i] !== undefined && processAdjustment[i] !== null) {
    InventoryStockAdjustment.localDbUpdate(processAdjustment[i]).then(
      (invStkAdj) => {
        i = i + 1;
        setTimeout(doSaveAdjustmentMobile(i), 2);
      }
    );
  }
};

const processAdjustment = (adjustment) => {
  adjustment.clinic_id = clinicService.currClinic().id;
  adjustment.finalised = true;
  adjustment.adjustedStock = StockService.getStockById(
    adjustment.adjustedStock.id
  );
  adjustment.adjustedStock.stockMoviment = adjustment.balance;
  processedAdjustments.push(adjustment);
};

const retriveRelatedDrug = (adjustment, drugList) => {
  let isNewDrug = true;
  if (adjustment.adjustedStock === null) {
    adjustment.adjustedStock = StockService.getStockById(
      adjustment.adjusted_stock_id
    );
  }
  const drug = drugService.getDrugById(adjustment.adjustedStock.drug_id);
  if (drugList.length <= 0 && StockService.getValidStockByDrug(drug)) {
    drugList.push(drug);
  } else {
    Object.keys(drugList).forEach(function (i) {
      if (drugList[i].id === drug.id) {
        isNewDrug = false;
      }
    });
    if (isNewDrug) drugList.push(drug);
  }
};

const startDate = computed(() => {
  return currInventory.value !== null
    ? moment.utc(currInventory.value.startDate).local().format('DD-MM-YYYY')
    : '';
});

const currInventory = computed(() => {
  return InventoryService.getInvnetoryById(
    localStorage.getItem('currInventory')
  );
});

onMounted(() => {
  closeLoading();
  inventoryTemp.value = currInventory.value;
});

const drugs = computed(() => {
  if (currInventory.value !== null) {
    if (currInventory.value.generic) {
      return drugService.getDrugsWithValidStockInList();
    } else {
      const selectedDrugs = localStorage.getItem('selectedDrugs').split(',');
      return drugService.getDrugsFromListId(selectedDrugs);
    }
  } else {
    return [];
  }
});

const inventoryType = computed(() => {
  return currInventory.value !== null
    ? inventoryMethod.getInventoryType(currInventory.value)
    : '';
});

provide('title', title);
provide('currInventory', currInventory);
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
