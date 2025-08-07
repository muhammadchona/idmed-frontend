<template>
  <div>
    <div class="q-mb-md text-weight-bold text-subtitle1">
      <q-bar style="background-color: #9e9e9e2e">
        <div class="cursor-pointer non-selectable">Configurações</div>
      </q-bar>
      <q-separator class="q-my-md max-width" color="primary"></q-separator>
    </div>
    <div class="">
      <q-table
        :loading="loading"
        :rows="allConfigs"
        :columns="columns"
        :filter="filter"
        :pagination="initialPagination"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
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
        <template v-slot:no-data="{ icon, filter }">
          <div
            class="full-width row flex-center text-primary q-gutter-sm text-body2"
          >
            <span> Sem resultados para visualizar </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="description" :props="props">
              {{ props.row.description }}
            </q-td>
            <q-td key="value" :props="props">
              <span v-if="Number(props.row.value)">{{ props.row.value }}</span>
              <q-popup-edit
                v-model="props.row.value"
                v-slot="scope"
                v-if="Number(props.row.value)"
                buttons
                @save="promptToConfirmUpdateConfig(props.row)"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  type="number"
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
              <q-btn
                v-else
                flat
                round
                class="q-ml-md"
                :color="getColorActive(props.row)"
                :icon="getIconActive(props.row)"
                @click.stop="promptToConfirm(props.row)"
              >
                <q-tooltip :class="getTooltipClass(props.row)">{{
                  JSON.parse(props.row.value) ? 'Inactivar' : 'Activar'
                }}</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>
<script setup>
/*imports*/
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, computed, provide } from 'vue';
import sysConfigsService from 'src/services/api/systemConfigs/systemConfigsService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

/*Variables*/
const { closeLoading } = useLoading();
const { alertWarningAction, alertSucess, alertError } = useSwal();
const { website } = useSystemUtils();
const columns = [
  {
    name: 'description',
    required: true,
    label: 'Descrição',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'value',
    required: true,
    label: 'Valor',
    align: 'left',
    field: (row) => row.value,
    format: (val) => `${val}`,
    sortable: true,
  },
];
const submitting = ref(false);
const loading = ref(true);
const initialPagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  // rowsNumber: xx if getting data from a server
});
/*Injects*/
const filter = inject('filter');

/*Hooks*/
const allConfigs = computed(() => {
  const configutations = ref([]);
  configutations.value = sysConfigsService.getAllFromStorageWithoutMigration();

  if (configutations.value && configutations.value.length >= 0) stopLoading();

  return configutations.value;
});

const stopLoading = () => {
  loading.value = false;
};

const configs = computed(() => {
  return sysConfigsService.getInstallationType();
});

/*Methods*/

const getIconActive = (config) => {
  if (!JSON.parse(config.value)) {
    return 'play_circle';
  } else if (JSON.parse(config.value)) {
    return 'stop_circle';
  }
};
const getColorActive = (config) => {
  if (!JSON.parse(config.value)) {
    return 'green';
  } else if (JSON.parse(config.value)) {
    return 'red';
  }
};
const getTooltipClass = (config) => {
  if (JSON.parse(config.value)) {
    return 'bg-green-5';
  } else if (!JSON.parse(config.value)) {
    return 'bg-red-5';
  }
};

const promptToConfirm = (config) => {
  const question = !JSON.parse(config.value)
    ? 'Deseja Activar a Rotina?'
    : 'Deseja Inactivar a Rotina?';

  alertWarningAction(question).then(async (response) => {
    if (response) {
      if (JSON.parse(config.value)) {
        config.value = 'false';
      } else {
        config.value = 'true';
      }
      await sysConfigsService.patch(config.id, config);
      closeLoading();
      submitting.value = false;
    }
  });
};

const promptToConfirmUpdateConfig = (config) => {
  const question = 'Deseja Actualizar a configuração?';

  alertWarningAction(question).then(async (response) => {
    if (response) {
      await sysConfigsService.patch(config.id, config);

      submitting.value = false;
      // alertSucess('Configuração actualizada com sucesso.');
      closeLoading();
      submitting.value = false;
    }
  });
};

/*Provides*/
provide('configs', configs);
</script>
