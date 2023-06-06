<template>
  <div>
    <TitleBar>Ficha do Medicamento</TitleBar>
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
          >{{ drug.name }}
        </ListHeader>
        <div class="box-border q-pb-md">
          <div class="row q-pa-md">
            <q-space />
            <q-btn unelevated color="blue" label="Voltar" @click="goBack" />
            <q-btn
              unelevated
              color="green-4"
              class="q-ml-md"
              :disable="true"
              label="Imprimir"
            />
          </div>
          <q-table
            class="col"
            dense
            flat
            separator="cell"
            :rows="drugEventList"
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
                <q-th class="col">{{ columns[9].label }}</q-th>
              </q-tr>
            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td key="eventDate" :props="props">
                  {{ dateUtils.formatDate(props.row.eventDate) }}
                </q-td>
                <q-td key="moviment" :props="props">
                  {{ props.row.moviment }}
                </q-td>
                <q-td key="orderNumber" :props="props">
                  {{ props.row.orderNumber }}
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
                <q-td key="notes" :props="props">
                  {{ props.row.notes }}
                </q-td>
              </q-tr>
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
          <div v-if="mobile.value">
            <span v-for="batchS in drugEventListBatch" :key="batchS.id">
              <lote-info-container
                :batchS="batchS"
                @updateDrugFileAdjustment="updateDrugFileAdjustment"
              />
            </span>
          </div>
          <div v-else-if="!mobile.value">
            <span v-for="lote in drug.stocks" :key="lote.id">
              <lote-info-container :stockInfo="lote" />
            </span>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue';
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

const columns = [
  {
    name: 'eventDate',
    required: true,
    label: 'Data Movimento',
    field: 'eventDate',
    align: 'center',
    sortable: true,
  },
  { name: 'moviment', align: 'center', label: 'Movimento', sortable: true },
  { name: 'orderNumber', align: 'center', label: 'Nr. Guia', sortable: false },
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
  {
    name: 'notes',
    align: 'center',
    label: 'Resumo das Notas',
    sortable: false,
  },
];

const dateUtils = useDateUtils();
const router = useRouter();
const isWebScreen = useMediaQuery('(min-width: 1024px)');
const mobile = computed(() => (isWebScreen.value ? false : true));
const { closeLoading, showloading } = useLoading();

const drugEventList = ref([]);
const drugEventListBatch = ref([]);

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

const generateDrugEventSummary = () => {
  if (mobile.value) {
    drugFile = DrugFile.query().where('drugId', drug.value.id).first();
    // busca do local base e faz insert no VueX ORM
    db.newDb()
      .collection('drugFile')
      .get()
      .then((drugFile) => {
        DrugFile.insert({
          data: drugFile,
        });
      })
      .then((drugFile) => {
        // query().where('id', batchS.stockId).first()
        console.log('Drug ID: ', drug.value.id);
        console.log('VueX ORM: ', DrugFile.all());
        drugEventList.value = drugFile.drugFileSummary;
        drugEventListBatch.value = drugFile.drugFileSummaryBatch; // DrugFile.all()[1].drugFileSummaryBatch
      });
  } else {
    showloading();
    drugFileService
      .apiGetDrugSummary(clinicService.currClinic().id, drug.value.id)
      .then((resp) => {
        console.log(resp.data);
        const t = resp.data;
        /* t.sort((a, b) => {
                  const d1 = new Date(a.eventDate)
                  const d2 = new Date(b.eventDate)
                  return d2 - d1
                }) */
        drugEventList.value = t;
        closeLoading();
      });
  }
};

const updateDrugFileAdjustment = (adjustment) => {
  console.log(' drugFile.drugFileSummary[0]::', drugFile.drugFileSummary[0]);
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
        drugFile.drugFileSummaryBatch[i].posetiveAdjustment +=
          adjustment.adjustedValue;
        drugFile.drugFileSummaryBatch[i].balance += adjustment.adjustedValue;
        console.log('AJUSTE_POSETIVO: ');
      } else if (
        adjustment.constructor.name === 'StockReferenceAdjustment' &&
        adjustment.operation.code === 'AJUSTE_NEGATIVO'
      ) {
        drugFile.drugFileSummaryBatch[i].posetiveAdjustment -=
          adjustment.adjustedValue;
        drugFile.drugFileSummaryBatch[i].balance -= adjustment.adjustedValue;
        console.log('AJUSTE_NEGATIVO: ');
      } else if (adjustment.constructor.name === 'StockDestructionAdjustment') {
        drugFile.drugFileSummaryBatch[i].posetiveAdjustment -=
          adjustment.adjustedValue;
        drugFile.drugFileSummaryBatch[i].balance -= adjustment.adjustedValue;
        console.log('DESTRUCTION: ');
      }
    }
  }
};

onMounted(() => {
  generateDrugEventSummary();
});

const drug = computed(() => {
  const selectedDrug = localStorage.getItem('selectedDrug');
  const dru = drugService.getDrugById(selectedDrug);
  return dru;
});

const drugFile = () => {
  return DrugFile.query().where('drugId', drug.value.id).first();
};
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
