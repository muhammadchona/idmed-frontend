<template>
  <q-card style="width: 900px; max-width: 90vw" class="q-pa-none q-ma-none">
    <div class="row items-center q-py-md q-pl-lg text-center bg-green-2">
      <q-icon name="inventory" size="md" />
      <div class="text-subtitle1 q-ml-sm">Inventário</div>
    </div>
    <q-separator color="grey-13" size="1px" />
    <form @submit.prevent="submitForm" class="q-pa-none q-ma-none">
      <q-card-section class="q-pb-md">
        <div class="q-mt-md">
          <div class="row">
            <q-input
              dense
              outlined
              class="col q-ml-md q-mb-md"
              v-model="currInventory.startDate"
              ref="startDateRef"
              lazy-rules
              label="Data do Inventário *"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="currInventory.startDate" mask="DD-MM-YYYY">
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
          </div>
        </div>
        <div class="row">
          <div class="col q-ml-md" tabindex="0">
            Tipo de Inventário:
            <q-radio
              keep-color
              color="primary"
              v-model="currInventory.generic"
              val="true"
              label="Geral"
            />
            <q-radio
              keep-color
              color="primary"
              v-model="currInventory.generic"
              val="false"
              label="Parcial"
            />
          </div>
        </div>
        <div v-if="isGeneric" class="row q-mt-md">
          <q-table
            class="col q-ml-md"
            dense
            title="Medicamentos"
            :rows="activeDrugs"
            :columns="columns"
            :filter="filter"
            row-key="id"
            :selected-rows-label="getSelectedString"
            selection="multiple"
            v-model:selected="selected"
          >
            <template v-slot:top-right class="bg-grey-3">
              <q-input
                outlined
                dense
                style="width: 400px"
                debounce="300"
                v-model="filter"
                placeholder="Pesquisar"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template #header="props">
              <q-tr class="text-left bg-grey-3" :props="props">
                <q-th style="width: 70px"></q-th>
                <q-th style="width: 120px">{{ columns[0].label }}</q-th>
                <q-th class="col">{{ columns[1].label }}</q-th>
              </q-tr>
            </template>
          </q-table>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="$emit('close')" />
        <q-btn type="submit" label="Avançar" color="primary" />
      </q-card-actions>
    </form>
    <!-- <q-dialog v-model="alert.visible" persistent>
      <Dialog :type="alert.type" @closeDialog="closeDialog">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog> -->
  </q-card>
</template>

<script setup>
import Inventory from 'src/stores/models/stockinventory/Inventory';
import { ref, computed, onMounted, inject } from 'vue';
import { InventoryStockAdjustment } from '../../../stores/models/stockadjustment/InventoryStockAdjustment';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

import StockService from 'src/services/api/stockService/StockService';
import inventoryService from 'src/services/api/inventoryService/InventoryService';
import drugService from 'src/services/api/drugService/drugService';

import { useMediaQuery } from '@vueuse/core';
import { useRouter } from 'vue-router';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import moment from 'moment';

const { showloading, closeLoading } = useLoading();

const router = useRouter();
const { alertError } = useSwal();

const activeDrugs = inject('activeDrugs');
const currClinic = inject('currClinic');

const columns = [
  {
    name: 'code',
    required: true,
    label: 'Código FNM',
    field: 'fnmCode',
    align: 'left',
    sortable: false,
  },
  {
    name: 'drug',
    align: 'left',
    label: 'Medicamento',
    field: 'name',
    sortable: true,
  },
];
const filter = ref('');
const currInventory = ref(new Inventory());

const selected = ref([]);
const dateUtils = useDateUtils();
const startDateRef = dateUtils.getDateFormatMMDDYYYY(new Date());

const getSelectedString = () => {
  return selected.value.length === 0
    ? ''
    : `${selected.value.length} registo${
        selected.value.length > 1 ? 's' : ''
      } selecionado de ${activeDrugs.value.length}`;
};

const submitForm = () => {
  showloading();
  const inventory = inventoryService.getLastInventory();

  if (
    dateUtils
      .getDateFromHyphenDDMMYYYY(currInventory.value.startDate)
      .setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)
  ) {
    closeLoading();
    alertError(
      'A data de inicio do inventário não pode ser superior a data corrente.'
    );
  } else if (
    inventory !== null &&
    dateUtils
      .getDateFromHyphenDDMMYYYY(currInventory.value.startDate)
      .setHours(0, 0, 0, 0) < new Date(inventory.endDate).setHours(0, 0, 0, 0)
  ) {
    const endDateLast = dateUtils.getDDMMYYYFromJSDate(inventory.endDate);
    closeLoading();
    alertError(
      'A data de inicio do inventário não pode ser anterior a data de fecho do útimo inventário registado [' +
        dateUtils.getDDMMYYYFromJSDate(endDateLast) +
        ']'
    );
  } else if (currInventory.value.generic) {
    initInventory();
  } else {
    if (selected.value.length <= 0) {
      closeLoading();
      alertError(
        'Por favor selecionar os medicamentos a inventariar uma vez seleccionada a opção para inventário parcial.'
      );
    } else {
      initInventory();
    }
  }
};

const initInventory = () => {
  if (currInventory.value.generic !== 'true') {
    doBeforeSave();
  } else {
    doBeforeSaveGeneric();
  }
  currInventory.value.id = uuidv4();
  currInventory.value.clinic = {};
  currInventory.value.clinic.id = currClinic.value.id;
  currInventory.value.startDate = dateUtils.getYYYYMMDDFromJSDate(
    dateUtils.getDateFromHyphenDDMMYYYY(currInventory.value.startDate)
  );

  inventoryService.post(currInventory.value).then((resp) => {
    localStorage.setItem('currInventory', currInventory.value.id);
    // console.log(resp.response);
    closeLoading();
    router.push('/stock/inventory');
  });
};

const doBeforeSave = () => {
  Object.keys(selected.value).forEach(
    function (k) {
      const drug = selected.value[k];
      const validStocks = StockService.getValidStockByDrug(drug);
      Object.keys(validStocks).forEach(
        function (i) {
          initNewAdjustment(validStocks[i], drug);
        }.bind(this)
      );
    }.bind(this)
  );
};

const doBeforeSaveGeneric = () => {
  Object.keys(StockService.getValidStock()).forEach((drugId) => {
    let drugExist = drugService.getDrugById(drugId);
    if (drugExist !== null && drugExist !== undefined) {
      // drugs.value.push(drugExist);

      const stockList = StockService.getValidStockByDrug(drugExist);

      Object.keys(stockList).forEach(
        function (k) {
          initNewAdjustment(stockList[k], drugExist);
        }.bind(this)
      );
    }

    console.log(currInventory.value);
  });
};

const initNewAdjustment = (stock, drug) => {
  const newAdjustment = new InventoryStockAdjustment({
    adjustedStock: stock,
    clinic: currClinic.value,
    captureDate: new Date(),
    operation:
      StockOperationTypeService.getStockOperatinTypeByCode('AJUSTE_NEGATIVO'),
  });
  newAdjustment.adjustedStock.drug = null;
  newAdjustment.inventory_id = currInventory.value.id;
  newAdjustment.adjusted_stock_id = stock.id;
  newAdjustment.adjustedStock.clinic = {};
  newAdjustment.adjustedStock.clinic.id = currClinic.value.id;
  newAdjustment.clinic = {};
  newAdjustment.clinic.id = currClinic.value.id;
  newAdjustment.id = uuidv4();
  currInventory.value.adjustments.push(newAdjustment);
};

const isGeneric = computed(() => {
  return currInventory.value.generic !== 'true';
});

onMounted(() => {
  currInventory.value.generic = 'true';
  if (
    currInventory.value.startDate === null ||
    currInventory.value.startDate === undefined
  ) {
    currInventory.value.startDate = moment().format('DD-MM-YYYY');
  }
});
</script>

<style></style>
