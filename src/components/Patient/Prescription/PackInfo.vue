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
            >
              <template #body="props">
                <q-tr no-hover :props="props">
                  <q-td key="drug" :props="props">
                    {{ props.row.drug.name }}
                  </q-td>
                  <q-td key="qty" :props="props">
                    {{ props.row.quantitySupplied }} Frasco(s)
                  </q-td>
                  <q-td auto-width key="nextPickUpDate" :props="props">
                    {{
                      props.row.toContinue
                        ? formatDate(pack.nextPickUpDate)
                        : 'Não continua'
                    }}
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

import { inject, provide, ref } from 'vue';

//Declaration

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
];
const canEdit = ref(true);
const title = ref('Prescrição');
const titleEmptyList = ref('Nenhuma Prescrição Adicionada');
const bgColor = ref('bg-grey-6');

//Inject
const pack = inject('lastPackOnPrescription');
const isClosed = inject('isClosed');

// Methods
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};
const editPack = () => {
  this.$emit('editPack');
};
const removePack = () => {
  this.$emit('removePack');
};

// provide('title', title);
provide('bgColor', bgColor);
// provide('expandLess', expandLess);
// provide('addVisible', showAddButton);
// provide('titleEmptyList', titleEmptyList);

// :addVisible="false"
//       :isClosed="isClosed"
//       @removePack="removePack"
//       @editPack="editPack"
</script>

<style></style>
