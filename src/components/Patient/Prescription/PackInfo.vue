<template>
  <div>
    <q-expansion-item
      v-if="pack !== null"
      dense
      header-class="bg-grey-6 text-white text-bold vertical-middle q-pl-md"
      expand-icon-class="text-white"
      default-opened
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="add_task" />
        </q-item-section>

        <q-item-section>
          Data de Levantamento: {{ formatDate(pack.pickupDate) }}
        </q-item-section>
      </template>
      <q-card flat v-if="pack !== null" bordered class="noRadius">
        <q-card-section class="row q-pa-sm">
          <div class="col-12">
            <q-table
              class="col"
              dense
              flat
              unelevated
              :rows="pack.packagedDrugs"
              :columns="columns"
              row-key="id"
              hide-bottom
            >
              <template #body="props">
                <q-tr no-hover :props="props">
                  <q-td key="drug" :props="props">
                    {{
                      props.row.drug !== null
                        ? props.row.drug.name.includes(
                            String(
                              getDrugFirstLevelById(props.row.drug.id).form
                                .description
                            ).substring(0, 4)
                          )
                          ? props.row.drug.name
                          : props.row.drug.name +
                            ' - (' +
                            props.row.drug.packSize +
                            ' ' +
                            String(
                              getDrugFirstLevelById(props.row.drug.id).form
                                .description
                            ).substring(0, 4) +
                            ')'
                        : ''
                    }}
                  </q-td>
                  <q-td key="qty" :props="props">
                    {{ props.row.quantitySupplied }}
                    <em
                      v-if="
                        getDrugFirstLevelById(props.row.drug.id).clinicalService
                          .code === 'TARV'
                      "
                    >
                      Frasco(s)</em
                    >
                    <em v-else
                      >{{
                        getDrugFirstLevelById(props.row.drug.id).form
                          .description
                      }}(s)</em
                    >
                  </q-td>
                  <q-td auto-width key="nextPickUpDate" :props="props">
                    {{
                      props.row.toContinue
                        ? formatDate(pack.nextPickUpDate)
                        : 'Não continua'
                    }}
                  </q-td>
                  <q-td key="quantityRemain" :props="props">
                    <em
                      v-if="
                        getDrugFirstLevelById(props.row.drug.id).clinicalService
                          .code === 'TARV'
                      "
                    >
                      {{ totalQuantityRemainFrascos(props.row.drug) }} Frasco(s)
                      e
                      {{
                        totalUnityRemains(props.row.drug) +
                        ' ' +
                        getDrugFirstLevelById(props.row.drug.id).form.unit
                      }}
                    </em>
                    <em v-else
                      >{{ totalQuantityRemainFrascos(props.row.drug) }}
                      {{
                        getDrugFirstLevelById(props.row.drug.id).form
                          .description
                      }}(s)</em
                    >
                  </q-td>
                  <q-td
                    :rowspan="pack.packagedDrugs"
                    auto-width
                    key="opts"
                    :props="props"
                  >
                    <div class="col">
                      <!-- <q-btn
                        flat
                        @click="editButtonActions(patientVisit)"
                        round
                        color="orange-5"
                        icon="edit"
                      >
                        <q-tooltip class="bg-amber-5">Refazer</q-tooltip>
                      </q-btn> -->
                      <q-btn
                        flat
                        @click.stop="removePack"
                        round
                        color="red"
                        icon="delete"
                      >
                        <q-tooltip class="bg-red">Remover</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-separator />
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { useDrug } from 'src/composables/drug/drugMethods';

import { inject, provide, ref } from 'vue';
//Declaration

const { getDrugFirstLevelById } = useDrug();

const columns = [
  {
    name: 'drug',
    required: true,
    field: 'name',
    label: 'Medicamento',
    align: 'left',
    sortable: true,
  },
  {
    name: 'qty',
    align: 'left',
    field: 'quantitySupplied',
    label: 'Quantidade',
    sortable: true,
  },
  {
    name: 'nextPickUpDate',
    align: 'left',
    field: 'nextPickUpDate',
    label: 'Próximo Levantamento',
    sortable: false,
  },
  {
    name: 'quantityRemain',
    align: 'center',
    field: 'quantityRemain',
    label: 'Sobra',
    sortable: false,
  },
  ,
  { name: 'opts', align: 'left', label: 'Opções', sortable: false },
];
const canEdit = ref(true);
const title = ref('Prescrição');
const titleEmptyList = ref('Nenhuma Prescrição Adicionada');
const bgColor = ref('bg-grey-6');

//Inject
const pack = inject('lastPackOnPrescription');
const curIdentifier = inject('curIdentifier');
const removePack = inject('removePack');

// Methods
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};

const totalRemainAcumulado = (drug) => {
  let totalAcumulado = 0;
  pack.value.packagedDrugs.find((itemLastPackagedDrug) => {
    if (drug.id === itemLastPackagedDrug.drug.id) {
      totalAcumulado = Number(itemLastPackagedDrug.quantityRemain);
    }
  });
  return totalAcumulado;
};
const totalQuantityRemainFrascos = (drug) => {
  return Math.floor(totalRemainAcumulado(drug) / drug.packSize);
};

const totalUnityRemains = (drug) => {
  return totalRemainAcumulado(drug) % drug.packSize;
};

provide('bgColor', bgColor);
</script>

<style></style>
