<template>
  <div>
    <TitleBar />
    <q-scroll-area
      :thumb-style="thumbStyle"
      :content-style="contentStyle"
      :content-active-style="contentActiveStyle"
      style="height: 780px"
      class="q-pr-md"
    >
      <div class="q-pa-lg">
        <ListHeader
          :addVisible="false"
          :doneVisible="false"
          :mainContainer="true"
          bgColor="bg-primary"
          >{{ drug.name }} ({{ drug.packSize }} {{ drug.form.description }})
        </ListHeader>
        <div class="box-border q-pb-md">
          <div class="row q-pa-md">
            <q-space />

            <q-btn unelevated color="blue" label="Voltar" @click="goBack" />

            <div class="q-ml-md relative-position">
              <q-btn
                class="q-fab"
                unelevated
                color="green-4"
                label="Imprimir"
                icon="print"
                @click="morphar(true)"
              />

              <q-menu ref="menu" :offset="[5, 5]" class="bg-grey-2">
                <q-list>
                  <q-item clickable @click="printFichaPDF()">
                    <q-item-section avatar>
                      <q-icon
                        name="picture_as_pdf"
                        class="text-red-10"
                      ></q-icon>
                      <!-- Ícone de PDF -->
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-red-10">PDF</q-item-label>
                    </q-item-section>
                  </q-item>
                  <hr />
                  <q-item clickable @click="printFichaXLS()">
                    <q-item-section avatar>
                      <q-icon
                        name="insert_drive_file"
                        class="text-green-10"
                      ></q-icon>
                      <!-- Ícone de Excel -->
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-green-10">XLS</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>

              <div ref="refFab" class="absolute-center bg-accent"></div>
            </div>
          </div>

          <q-table
            class="col"
            dense
            flat
            separator="cell"
            :rows="drugEventList"
            :columns="columns"
            row-key="id"
            :loading="loading"
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
              <q-tr
                class="text-left bg-grey-3"
                style="text-align: center"
                :props="props"
              >
                <q-th style="width: 70px">{{ columns[0].label }}</q-th>
                <q-th style="width: 190px">{{ columns[1].label }}</q-th>
                <q-th style="width: 190px">{{ columns[2].label }}</q-th>
                <q-th style="width: 190px">{{ columns[3].label }}</q-th>
                <q-th style="width: 190px">{{ columns[4].label }}</q-th>
                <q-th style="width: 190px">{{ columns[5].label }}</q-th>
                <q-th style="width: 190px">{{ columns[6].label }}</q-th>
                <q-th style="width: 190px">{{ columns[7].label }}</q-th>
                <q-th style="width: 190px">{{ columns[8].label }}</q-th>
              </q-tr>
            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td key="year" :props="props">
                  {{ String(props.row.year).replace('.0', '') }}
                </q-td>
                <q-td key="month" :props="props">
                  {{ props.row.month }}
                </q-td>
                <q-td key="moviment" :props="props">
                  {{ props.row.moviment }}
                </q-td>

                <q-td key="incomes" :props="props">
                  {{ props.row.incomes }}
                </q-td>
                <q-td key="outcomes" :props="props">
                  {{ props.row.outcomes }}
                </q-td>
                <q-td key="posetiveAdjustment" :props="props">
                  {{ props.row.posetiveAdjustment }}
                </q-td>
                <q-td key="negativeAdjustment" :props="props">
                  {{ props.row.negativeAdjustment }}
                </q-td>
                <q-td key="loses" :props="props">
                  {{ props.row.loses }}
                </q-td>
                <q-td key="balance" :props="props">
                  {{ props.row.balance }}
                </q-td>
              </q-tr>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </div>
        <div>
          <list-header
            :addVisible="false"
            :doneVisible="false"
            :mainContainer="false"
            bgColor="bg-primary"
            >Informação por Lote
          </list-header>
          <div class="q-pa-sm">
            <q-toggle
              v-model="loadingHiddenBatches"
              label="Exibir Lotes expirados"
              class="q-mb-sm"
            />
            <span
              v-for="lote in stocks(drug, loadingHiddenBatches)"
              :key="lote.id"
            >
              <lote-info-container
                :stockInfo="lote"
                @updateDrugFileAdjustment="updateDrugFileAdjustment"
              />
            </span>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { morph } from 'quasar';
import { ref, onMounted, onBeforeMount, computed, provide, watch } from 'vue';
import DrugFile from '../../../stores/models/drugFile/DrugFile';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useRouter } from 'vue-router';
import { useMediaQuery } from '@vueuse/core';
import { useLoading } from 'src/composables/shared/loading/loading';
// components

import TitleBar from 'components/Shared/TitleBar.vue';
import LoteInfoContainer from 'components/Stock/StockFile/LoteInfoContainer.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import drugService from 'src/services/api/drugService/drugService';
import clinicService from 'src/services/api/clinicService/clinicService';
import drugFileService from 'src/services/api/drugFile/drugFileService';
import StockService from 'src/services/api/stockService/StockService';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

import fichaStockReport from 'src/services/reports/stock/FichaStockReport';

const { isOnline, isMobile } = useSystemUtils();

const loading = ref(true);
const loadingHiddenBatches = ref(false);
const batchChanged = ref(false);

const toggle = ref(false);
const refFab = ref(null);
const refCard = ref(null);
const drug = ref(null);

const columns = [
  {
    name: 'year',
    required: true,
    label: 'Ano',
    field: 'year',
    align: 'center',
    sortable: true,
  },

  {
    name: 'month',
    required: true,
    label: 'Mes',
    field: 'month',
    align: 'center',
    sortable: true,
  },
  { name: 'moviment', align: 'center', label: 'Movimento', sortable: true },
  { name: 'incomes', align: 'center', label: 'Entradas', sortable: true },
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

const dateUtils = useDateUtils();
const router = useRouter();
const { closeLoading, showloading } = useLoading();
const title = ref('Ficha do Medicamento');
const drugEventList = ref([]);
const drugEventListBatch = ref([]);

const contentStyle = {
  backgroundColor: '#ffffff',
  color: '#555',
};

const morphar = (state) => {
  if (state !== toggle.value) {
    const getFab = () => refFab.value;
    const getCard = () => (refCard.value ? refCard.value.$el : void 0);

    morph({
      from: toggle.value === true ? getCard : getFab,
      to: toggle.value === true ? getFab : getCard,
      onToggle: () => {
        toggle.value = state;
      },
      duration: 500,
    });
  }
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

const printFichaPDF = () => {
  fichaStockReport.downloadPDF(
    'PDF',
    drugEventList,
    drug,
    stocks(drug.value, loadingHiddenBatches)
  );
};

const printFichaXLS = () => {
  fichaStockReport.downloadExcel(
    'XLS',
    drugEventList,
    drug,
    stocks(drug.value, loadingHiddenBatches)
  );
};

const generateDrugEventSummary = async () => {
  const clinic = clinicService.currClinic();
  if (!isOnline.value) {
    drugEventList.value = await drugFileService.getDrugFileSummary(drug.value);
    loading.value = false;
  } else {
    drugFileService
      .apiGetDrugSummary(clinic.id, localStorage.getItem('selectedDrug'))
      .then((resp) => {
        const t = resp.data;
        drugEventList.value = t;
        loading.value = false;
      });
  }
};

const updateDrugFileAdjustment = (adjustment) => {
  // Actualiza o resumo por Drug
  if (
    adjustment.constructor.name === 'StockReferenceAdjustment' &&
    adjustment.operation.code === 'AJUSTE_POSETIVO'
  ) {
    drugFile.drugFileSummary[0].posetiveAdjustment += adjustment.adjustedValue;
    drugFile.drugFileSummary[0].balance += adjustment.adjustedValue;
  } else if (
    adjustment.constructor.name === 'StockReferenceAdjustment' &&
    adjustment.operation.code === 'AJUSTE_NEGATIVO'
  ) {
    drugFile.drugFileSummary[0].posetiveAdjustment -= adjustment.adjustedValue;
    drugFile.drugFileSummary[0].balance -= adjustment.adjustedValue;
  } else if (adjustment.constructor.name === 'StockDestructionAdjustment') {
    drugFile.drugFileSummary[0].posetiveAdjustment -= adjustment.adjustedValue;
    drugFile.drugFileSummary[0].balance -= adjustment.adjustedValue;
  }
  // Actualiza o resumo por lote
  for (let i = 0; i < drugFile.drugFileSummaryBatch.length; i++) {
    if (
      drugFile.drugFileSummaryBatch[i].stockId === adjustment.adjustedStock.id
    ) {
      if (
        adjustment.constructor.name === 'StockReferenceAdjustment' &&
        adjustment.operation.code === 'AJUSTE_POSETIVO'
      ) {
        drugFile.drugFileSummaryBatch[i].posetiveAdjustment =
          drugFile.drugFileSummaryBatch[i].posetiveAdjustment +
          adjustment.adjustedValue;
        drugFile.drugFileSummaryBatch[i].balance =
          drugFile.drugFileSummaryBatch[i].balance + adjustment.adjustedValue;
      } else if (
        adjustment.constructor.name === 'StockReferenceAdjustment' &&
        adjustment.operation.code === 'AJUSTE_NEGATIVO'
      ) {
        drugFile.drugFileSummaryBatch[i].posetiveAdjustment -=
          adjustment.adjustedValue;
        drugFile.drugFileSummaryBatch[i].balance -= adjustment.adjustedValue;
      } else if (adjustment.constructor.name === 'StockDestructionAdjustment') {
        drugFile.drugFileSummaryBatch[i].posetiveAdjustment -=
          adjustment.adjustedValue;
        drugFile.drugFileSummaryBatch[i].balance -= adjustment.adjustedValue;
      }
    }
  }
};

watch((batchChanged) => {
  if (drug.value !== undefined && drug.value !== null) {
    generateDrugEventSummary();
  }
});

onBeforeMount(() => {
  const selectedDrug = localStorage.getItem('selectedDrug');
  drug.value = drugService.getDrugById(selectedDrug);
});

onMounted(() => {
  generateDrugEventSummary();
});

const stocks = (drug, hideExpiredBatches) => {
  const clinic = clinicService.currClinic();
  let stockList = [];

  if (hideExpiredBatches) {
    stockList = StockService.getStockByDrug(drug.id, clinic.id);
  } else {
    stockList = StockService.getValidStockByDrug(drug, clinic.id);
  }

  return stockList;
};

const drugFile = () => {
  return DrugFile.query().where('drugId', drug.value.id).first();
};

provide('title', title);
provide('batchChanged', batchChanged);
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
