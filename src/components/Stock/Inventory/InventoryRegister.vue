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
                    <q-date
                      v-model="currInventory.startDate"
                      mask="DD-MM-YYYY"
                      :options="blockStartDate"
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
        <div v-if="isGeneric !== true" class="row q-mt-md">
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
        <q-btn
          type="submit"
          label="Avançar"
          :loading="loadingIventory"
          color="primary"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
import Inventory from 'src/stores/models/stockinventory/Inventory';
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

import inventoryService from 'src/services/api/inventoryService/InventoryService';

import { useRouter } from 'vue-router';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import moment from 'moment';
import drugService from 'src/services/api/drugService/drugService';
import InventoryService from 'src/services/api/inventoryService/InventoryService';

const { showloading, closeLoading } = useLoading();

const router = useRouter();
const { alertError } = useSwal();

const loadingIventory = ref(false);

const { getPreviousStatisticMonthsDateFromDate } = useDateUtils();

const loading = ref(false);

const currClinic = inject('currClinic');
const readyToRoute = ref(null);
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
  loadingIventory.value = true;
  showloading();
  const inventory = inventoryService.getLastInventory();

  if (
    dateUtils
      .getDateFromHyphenDDMMYYYY(currInventory.value.startDate)
      .setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)
  ) {
    closeLoading();
    loadingIventory.value = false;
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
    loadingIventory.value = false;
    alertError(
      'A data de inicio do inventário não pode ser anterior a data de fecho do útimo inventário registado [' +
        endDateLast +
        ']'
    );
  } else if (
    currInventory.value.generic &&
    String(currInventory.value.generic) === 'true'
  ) {
    if (
      verifyGeneralInventoryExist(
        dateUtils.getYYYYMMDDFromJSDate(
          dateUtils.getDateFromHyphenDDMMYYYY(currInventory.value.startDate)
        )
      )
    ) {
      closeLoading();
      loadingIventory.value = false;
      alertError('Ja existe um inventário na data seleccionada.');
    } else {
      initInventory();
    }
  } else {
    if (selected.value.length <= 0) {
      closeLoading();
      loadingIventory.value = false;
      alertError(
        'Por favor, selecione pelo menos um medicamento para o inventário.'
      );
    } else {
      if (
        verifyGeneralInventoryExist(
          dateUtils.getYYYYMMDDFromJSDate(
            dateUtils.getDateFromHyphenDDMMYYYY(currInventory.value.startDate)
          )
        )
      ) {
        closeLoading();
        loadingIventory.value = false;
        alertError('Ja existe um inventário geral na data seleccionada.');
      } else {
        initInventory();
      }
    }
  }
};

const verifyGeneralInventoryExist = (inventoryDate) => {
  return inventoryService.getGeneralInventoryByDate(inventoryDate) !== null &&
    inventoryService.getGeneralInventoryByDate(inventoryDate) !== undefined
    ? true
    : false;
};

const initInventory = () => {
  const selectedLocalDrugsId = [];
  currInventory.value.id = uuidv4();
  currInventory.value.clinic = {};
  currInventory.value.clinic.id = currClinic.value.id;

  currInventory.value.startDate = dateUtils.getYYYYMMDDFromJSDate(
    dateUtils.getDateFromHyphenDDMMYYYY(currInventory.value.startDate)
  );

  if (selected.value != null)
    selected.value.forEach((drug) => {
      selectedLocalDrugsId.push(drug.id);
    });
  if (!isGeneric.value) {
    localStorage.setItem('selectedDrugs', selectedLocalDrugsId);
  }
  currInventory.value.generic = isGeneric.value;
  inventoryService.post(currInventory.value).then((resp) => {
    readyToRoute.value = resp;
    localStorage.setItem('currInventory', currInventory.value.id);
    router.push('/stock/inventory');
  });
};

const isGeneric = computed(() => {
  return String(currInventory.value.generic).includes('true');
});

const activeDrugs = computed(() => {
  return drugService.getDrugsWithValidStockInList();
});

const blockStartDate = (date) => {
  const currentDate = new Date();

  const startDate = new Date(
    getPreviousStatisticMonthsDateFromDate(currentDate)[0].startDate
  );

  const endDate = new Date(
    getPreviousStatisticMonthsDateFromDate(currentDate)[0].endDate
  );

  const lastInventoryBeforeCurrentDate =
    InventoryService.lastInventoryBeforeDate(currentDate);

  if (lastInventoryBeforeCurrentDate) {
    const inventory = InventoryService.getInventoryInPreviousMonth(
      startDate,
      endDate
    );

    if (inventory) {
      return (
        date >=
          moment(lastInventoryBeforeCurrentDate.endDate).format('YYYY/MM/DD') &&
        date <= moment(currentDate).format('YYYY/MM/DD')
      );
    } else {
      currInventory.value.startDate = moment(endDate).format('DD-MM-YYYY');
      return date === moment(endDate).format('YYYY/MM/DD');
    }
  } else {
    currInventory.value.startDate = moment(endDate).format('DD-MM-YYYY');
    return date === moment(endDate).format('YYYY/MM/DD');
  }
};

onMounted(() => {
  currInventory.value.generic = 'true';
  if (
    currInventory.value.startDate === null ||
    currInventory.value.startDate === undefined
  ) {
    currInventory.value.startDate = moment().format('DD-MM-YYYY');
  }
  blockStartDate(currInventory.value.startDate);
});
</script>

<style></style>
