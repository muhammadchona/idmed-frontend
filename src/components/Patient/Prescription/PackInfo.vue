<template>
  <div>
    <ListHeader
      v-if="
        currPack !== null && packagedDrugs !== null && packagedDrugs.length > 0
      "
      :addVisible="false"
      :isClosed="isClosed"
      @removePack="removePack"
      @editPack="editPack"
      bgColor="bg-grey-6"
      >Data de Levantamento: {{ formatDate(currPack.pickupDate) }}
    </ListHeader>
    <q-card
      flat
      v-if="
        currPack !== null && packagedDrugs !== null && packagedDrugs.length > 0
      "
      bordered
      class="noRadius"
    >
      <q-card-section class="row q-pa-sm">
        <div class="col-12">
          <q-table
            class="col"
            dense
            flat
            unelevated
            :rows="packagedDrugs"
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
                      ? formatDate(currPack.nextPickUpDate)
                      : 'Não continua'
                  }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import Pack from '../../../store/models/packaging/Pack';
import Drug from '../../../store/models/drug/Drug';
import ListHeader from 'components/Patient/Prescription/DispenseListHeader.vue';

import { inject } from 'vue';
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

//Inject
const pack = inject('pack');
const isClosed = inject('isClosed');

onMounted(() => {
  reloadDrugs();
});

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
const reloadDrugs = () => {
  const offset = 0;
  const max = 100;
  Drug.apiGetAll(offset, max);
};

// Computed
const currPack = () => {
  return Pack.query()
    .with('packagedDrugs.drug')
    .where('id', this.pack.id)
    .first();
};
const packagedDrugs = () => {
  return this.currPack.packagedDrugs;
};
</script>

<style></style>
