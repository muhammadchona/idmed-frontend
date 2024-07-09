<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="local_hospital" size="sm" />
          <span class="q-pl-sm text-subtitle2">Medicamentos Inventariados</span>
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>

    <q-scroll-area style="height: 600px">
      <q-card-section class="q-px-md">
        <div class="row q-mt-md">
          <q-table
            class="col"
            title="Medicamentos"
            :rows="drugs"
            :columns="columnsDrug"
            :filter="filter"
            row-key="fnmCode"
            v-model:selected="drugs"
          >
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="filter"
                placeholder="Procurar"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
        </div>
      </q-card-section>
      <q-scroll-observer />
    </q-scroll-area>

    <q-card-actions align="right" class="q-mb-md">
      <q-btn label="Fechar" color="red" @click="$emit('close')" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import StockService from 'src/services/api/stockService/StockService';
import drugService from 'src/services/api/drugService/drugService';
import { useLoading } from 'src/composables/shared/loading/loading';
import clinicService from 'src/services/api/clinicService/clinicService';

const { closeLoading, showloading } = useLoading();
const inventoryDetail = inject('inventoryDetail');

const filter = ref('');

const drugs = ref([]);

/*Declarations*/
const columnsDrug = [
  {
    name: 'fnmCode',
    required: true,
    label: 'Código FNM',
    align: 'left',
    field: (row) => row.fnmCode,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
];

onMounted(() => {
  showloading();

  const currInventory = inventoryDetail.value;
  var isGeneric = JSON.parse(currInventory.generic);
  var isOpen = JSON.parse(currInventory.open);
  if (isOpen) {
    const drugList = [];
    if (isGeneric) {
      Object.keys(StockService.getValidStock()).forEach((drugId) => {
        let drugExist = drugService.getDrugById(drugId);
        if (drugExist !== null && drugExist !== undefined)
          drugs.value.push(drugExist);
      });
      closeLoading();
    } else {
      Object.keys(currInventory.adjustments).forEach(
        function (i) {
          currInventory.adjustments[i].adjustedStock =
            StockService.getStockById(
              currInventory.adjustments[i].adjusted_stock_id
            );
          retriveRelatedDrug(currInventory.adjustments[i], drugList);
        }.bind(this)
      );
      drugs.value = drugList;
      closeLoading();
    }
  } else {
    drugService.getInventoryDrugs(currInventory.id).then((resp) => {
      drugs.value = resp;
      closeLoading();
    });
  }
});

const retriveRelatedDrug = (adjustment, drugList) => {
  let isNewDrug = true;
  if (adjustment.adjustedStock === null) {
    adjustment.adjustedStock = StockService.getStockById(
      adjustment.adjusted_stock_id
    );
  }
  const drug = drugService.getDrugById(adjustment.adjustedStock.drug_id);
  if (
    drugList.length <= 0 &&
    StockService.getValidStockByDrug(drug, clinicService.currClinic().id)
  ) {
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
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
