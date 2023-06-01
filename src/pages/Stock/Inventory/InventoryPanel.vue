<template>
  <div>
    <TitleBar>Detalhes do Inventário</TitleBar>
    <div class="row" v-if="!mobile.value">
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
            <TextInput
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
                label="Fechar Inventário"
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
            <AdjustmentTable :drug="drug" :inventory="currInventory" />
          </span>
        </q-scroll-area>
      </div>
    </div>

    <div class="row" v-if="mobile.value">
      <div class="col q-mx-md q-mt-md">
        <div>
          <ListHeader
            :addVisible="false"
            :mainContainer="true"
            bgColor="bg-primary"
            >Notas do Inventário
          </ListHeader>
          <div class="box-border row q-pt-md">
            <TextInput
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

    <q-dialog v-model="alert.visible" persistent>
      <Dialog
        :type="alert.type"
        @closeDialog="closeDialog"
        @commitOperation="closeInventory"
      >
        <template v-slot:title> {{ dialogTitle }}</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script setup>
import Drug from 'src/stores/models/drug/Drug';
import { ref, computed, onMounted, inject } from 'vue';
import Inventory from 'src/stores/models/stockinventory/Inventory';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import { useMediaQuery } from '@vueuse/core';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

import { useInventory } from 'src/composables/inventory/InvnetoryMethod';
import { useRouter } from 'vue-router';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';

import Dialog from 'components/Shared/Dialog/Dialog.vue';
import TitleBar from 'components/Shared/TitleBar.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import TextInput from 'components/Shared/Input/TextField.vue';
import AdjustmentTable from 'components/Stock/Inventory/InventoryAdjustmentsContainer.vue';
import StockService from 'src/services/api/stockService/StockService';
import drugService from 'src/services/api/drugService/drugService';
import InventoryService from 'src/services/api/inventoryService/InventoryService';

const isWebScreen = useMediaQuery('(min-width: 1024px)');
const mobile = computed(() => (isWebScreen.value ? false : true));
const inventoryMethod = useInventory();
const router = useRouter();
const dateUtils = useDateUtils();

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarningAction } = useSwal();

const currClinic = inject('currClinic');
const alert = ref({
  type: '',
  visible: false,
  msg: '',
});
const adjustments = ref([]);
let step = 'display';
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
    'Confirmação',
    'Nota: Ao encerrar o presente inventário o stock será actualizado para os dados informados e está operação não poderá ser desfeita. Continuar?',
    'Não',
    'Sim'
  ).then((result) => {
    if (result) {
      closeInventory();
    }
  });
};

const closeInventory = () => {
  showloading();
  setTimeout(() => {
    closeLoading();
  }, 800);
  if (!mobile.value) {
    InventoryService.apiFetchById(currInventory.value.id).then((resp) => {
      doProcessAndClose();
    });
  } else {
    const targetCopy = JSON.parse(JSON.stringify(currInventory));
    Inventory.insert({
      data: targetCopy,
    }).then((inv) => {
      doProcessAndCloseMobile();
    });
  }
};

const doProcessAndClose = () => {
  var doo = new Date(currInventory.value.startDate);
  currInventory.value.startDate = new Date(
    doo.getTime() + Math.abs(doo.getTimezoneOffset() * 60000)
  );

  const inventory = InventoryService.getInvnetoryById(currInventory.value.id);
  inventory.endDate = new Date();
  inventory.open = false;
  inventory.adjustments.forEach((adjustment) => {
    processAdjustment(adjustment, inventory);
  });
  doSaveAdjustment(0);
  // inventory.adjustments = [];
  const inv = JSON.parse(
    JSON.stringify(inventory, inventoryMethod.circularReferenceReplacer())
  );
  InventoryService.patch(inventory.id, inv).then((resp) => {
    step = 'display';
    currInventory.value.open = false;

    alertSucess('Sucesso', 'Operação efectuada com sucesso.');
  });
};

const doProcessAndCloseMobile = () => {
  const inventory = Inventory.query()
    .with([
      'clinic.province',
      'clinic.district.province',
      'clinic.facilityType',
    ])
    .where('id', currInventory.value.id)
    .first();

  Inventory.localDbGetById(currInventory.value.id).then((it) => {
    inventory.syncStatus = it.syncStatus;
  });

  inventory.endDate = new Date();
  inventory.open = false;

  InventoryStockAdjustment.localDbGetAll().then((adjustments) => {
    const adjustmentsList = adjustments.filter(
      (adjustment) => adjustment.inventory_id === inventory.id
    );
    inventory.adjustments = [];
    adjustmentsList.forEach((adjustment) => {
      adjustment.clinic = currClinic;
      adjustment.adjustedStock.clinic = currClinic;
      adjustment.adjustedStock.stockMoviment = adjustment.balance;
      adjustment.inventory = null;
      processedAdjustments.push(adjustment);
      //  doSaveAdjustmentMobile(0)
      const targetCopyAdj = JSON.parse(JSON.stringify(adjustment));
      InventoryStockAdjustment.localDbUpdate(targetCopyAdj).then((item) => {
        InventoryStockAdjustment.update(targetCopyAdj);
      });
    });
    inventory.clinic = currClinic;
    inventory.adjustments = processedAdjustments;
    const targetCopy = JSON.parse(JSON.stringify(inventory));
    Inventory.localDbUpdate(targetCopy)
      .then((item) => {
        Inventory.update(targetCopy);
      })
      .then((item) => {
        step = 'display';
        currInventory.value.open = false;
        alertSucess('Sucesso', 'Operação efectuada com sucesso.');
      });
  });
  // SessionStorage.set('currInventory', inventory)
};

const doSaveAdjustment = (i) => {
  if (processAdjustment[i] !== undefined && processAdjustment[i] !== null) {
    InventoryStockAdjustment.apiUpdate(processAdjustment[i]).then((resp) => {
      i = i + 1;
      setTimeout(doSaveAdjustment(i), 2);
    });
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

const processAdjustment = (adjustment, inventory) => {
  const iv = Object.assign({}, inventory);
  iv.adjustments = [];
  //adjustment.inventory = iv;
  adjustment.clinic = currClinic;
  adjustment.finalised = true;
  adjustment.adjustedStock = StockService.getStockById(
    adjustment.adjusted_stock_id
  );
  adjustment.adjustedStock.stockMoviment = adjustment.balance;
  processedAdjustments.push(adjustment);
};

const doStockEntranceGet = (clinicId, offset, max) => {
  StockEntrance.apiGetAllByClinicId(clinicId, offset, max)
    .then((resp) => {
      if (resp.response.data.length > 0) {
        offset = offset + max;
        setTimeout(doStockEntranceGet(clinicId, offset, max), 2);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const getDrugs = () => {
  if (currInventory.value.generic) {
    return drugService.getActiveDrugs();
  } else {
    return currInventory.value.drugs;
  }
};

const closeDialog = () => {
  alert.value.visible = false;
};

const retriveRelatedDrug = (adjustment, drugList) => {
  let isNewDrug = true;
  console.log(adjustment);
  if (adjustment.adjustedStock === null) {
    adjustment.adjustedStock = StockService.getStockById(
      adjustment.adjusted_stock_id
    );
  }
  const drug = drugService.getDrugById(adjustment.adjustedStock.drug_id);

  if (drugList.length <= 0) {
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
  return dateUtils.getDDMMYYYFromJSDate(currInventory.value.startDate);
});

const isEditionStep = computed(() => {
  return step === 'edit';
});

const isCreationStep = computed(() => {
  return step === 'create';
});

const isDeletionStep = computed(() => {
  return step === 'delete';
});

const enableFields = computed(() => {
  return isEditionStep.value || isCreationStep;
});

const currInventory = computed(() => {
  const idInventory = localStorage.getItem('currInventory');
  const inventory = InventoryService.getInvnetoryById(idInventory);
  return inventory;
});

const drugs = computed(() => {
  if (currInventory.value.generic) {
    return drugService.getActiveDrugs();
  } else {
    const drugList = [];
    console.log(currInventory);
    Object.keys(currInventory.value.adjustments).forEach(
      function (i) {
        currInventory.value.adjustments[i].adjustedStock =
          StockService.getStockById(
            currInventory.value.adjustments[i].adjusted_stock_id
          );
        console.log(currInventory.value.adjustments[i]);
        retriveRelatedDrug(currInventory.value.adjustments[i], drugList);
      }.bind(this)
    );
    return drugList;
  }
});

const inventoryType = computed(() => {
  return inventoryMethod.getInventoryType(currInventory);
});

onMounted(() => {
  if (mobile.value) {
    Drug.localDbGetAll().then((drugs) => {
      Drug.insertOrUpdate({ data: drugs });
    });
  }
});
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
