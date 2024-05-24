<template>
  <div>
    <TitleBar />
    <div class="row" v-if="isMobile">
      <div class="col q-mx-md q-mt-md">
        <ListHeader
          :addVisible="false"
          :expandVisible="false"
          :mainContainer="true"
          bgColor="bg-primary"
          >Notas da Ordem
        </ListHeader>
        <div class="box-border row q-pt-sm">
          <q-input
            outlined
            v-model="orderNumber"
            ref="orderNumberRef"
            label="Número"
            :rules="[(val) => !!val || 'Por favor indicar o número da guia']"
            :disable="!isGuiaEditionStep"
            dense
            class="col q-mx-md"
          />
          <q-input
            dense
            outlined
            :disable="!isGuiaEditionStep"
            class="col q-mx-md"
            v-model="creationDate"
            label="Data de Distribuição"
          >
            <q-input
              outlined
              v-model="notes"
              label="Notas"
              ref="notesRef"
              :disable="!isGuiaEditionStep"
              dense
              class="col"
              type="textarea"
            />

            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="creationDate" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="row q-mx-sm items-center" v-if="isGuiaDisplayStep">
            <q-btn
              unelevated
              color="blue"
              class="col q-ma-sm"
              label="Voltar"
              @click="goBack"
              size="12px"
            />
          </div>
        </div>
      </div>
      <div class="col-12 q-px-md">
        <div>
          <ListHeader
            :addVisible="isGuiaDisplayStep"
            :expandVisible="false"
            :mainContainer="true"
            @showAdd="initNewStock"
            bgColor="bg-primary"
            :addButtonActions="initNewStock"
            >Medicamentos
          </ListHeader>
          <div class="box-border q-pb-md">
            <q-table
              class="col"
              dense
              flat
              :rows="stockObjectsList"
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
                <q-tr class="text-left bg-grey-3" :props="props">
                  <q-th style="width: 70px">{{ columns[0].label }}</q-th>
                  <q-th class="col">{{ columns[1].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[2].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[3].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[4].label }}</q-th>
                  <q-th style="width: 120px">{{ columns[5].label }}</q-th>
                  <q-th style="width: 150px; text-align: center">{{
                    columns[6].label
                  }}</q-th>
                </q-tr>
              </template>
              <template #body="props">
                <q-tr :props="props">
                  <q-td key="order" :props="props">
                    {{ index }}
                  </q-td>
                  <q-td key="drug" :props="props">
                    <q-select
                      class="col"
                      dense
                      outlined
                      :disable="!props.row.enabled"
                      ref="drug"
                      v-model="props.row.stock.drug"
                      :options="drugs"
                      @filter="filterFn"
                      option-value="id"
                      option-label="name"
                      label="Medicamento"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="batchNumber" :props="props">
                    <q-input
                      outlined
                      v-model="props.row.stock.batchNumber"
                      :disable="!props.row.enabled"
                      label="Lote"
                      dense
                      class="col"
                    />
                  </q-td>

                  <q-td key="quantity" :props="props">
                    <q-input
                      outlined
                      v-model="props.row.quantity"
                      :disable="!props.row.enabled"
                      label="Quantidade"
                      dense
                      class="col"
                    />
                  </q-td>
                  <q-td key="options" :props="props">
                    <div class="col">
                      <q-btn
                        v-if="props.row.enabled"
                        flat
                        dense
                        round
                        color="red"
                        icon="clear"
                        @click="cancel(props.row)"
                      />
                      <q-btn
                        v-if="!props.row.enabled"
                        flat
                        dense
                        round
                        color="orange-5"
                        icon="edit"
                        @click="initStockEdition(props.row)"
                      />
                    </div>
                    <div class="col">
                      <q-chip color="info" text-color="white"> Em Uso </q-chip>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
          <div class="row">
            <q-banner
              dense
              inline-actions
              style="padding-top: 2px; padding-bottom: 2px"
              class="col text-white q-pa-none bg-orange-4 q-pr-sm"
            >
              <template v-slot:action class="items-center">
                <q-btn
                  dense
                  unelevated
                  color="primary"
                  class="col"
                  label="Imprimir"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </div>
    </div>

    <div class="row" v-if="!isMobile">
      <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg">
        <div>
          <ListHeader
            :addVisible="false"
            :expandVisible="false"
            :mainContainer="true"
            bgColor="bg-primary"
            :statusVisible="true"
            :statusTitle="statusTitle"
            :statusColor="statusColor"
            :statusIcon="statusIcon"
            >Notas da Guia
          </ListHeader>
          <div class="box-border q-pt-md">
            <q-input
              outlined
              v-model="orderNumber"
              ref="orderNumberRef"
              label="Número"
              :rules="[(val) => !!val || 'Por favor indicar o número da guia']"
              :disable="!isGuiaEditionStep"
              dense
              class="col q-ma-sm"
            />
            <q-input
              dense
              outlined
              :disable="!isGuiaEditionStep"
              class="col q-ma-sm"
              v-model="creationDate"
              label="Data de Criação"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="creationDate" mask="DD-MM-YYYY">
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
            <q-input
              outlined
              v-model="notes"
              label="Notas"
              ref="notesRef"
              :disable="!isGuiaEditionStep"
              dense
              class="col q-ma-sm"
              type="textarea"
            />
            <q-separator class="q-mx-sm" />
            <div class="row q-pa-sm">
              <q-btn
                unelevated
                color="blue"
                class="col"
                label="Confirmar"
                @click="confirmOrder"
                v-if="status === 'P'"
              />

              <q-btn
                unelevated
                color="red"
                class="q-ml-md col"
                label="Rejeitar"
                @click="rejectOrder"
                v-if="status === 'P'"
              />

              <q-btn
                unelevated
                color="orange"
                class="q-ml-md col"
                label="Voltar"
                @click="goBack"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col q-pt-md q-mr-lg">
        <div>
          <ListHeader
            :addVisible="false"
            :expandVisible="false"
            :mainContainer="true"
            @showAdd="initNewStock"
            bgColor="bg-primary"
            :addButtonActions="initNewStock"
            >Medicamentos
          </ListHeader>
          <div class="box-border q-pb-md">
            <q-table
              class="col"
              dense
              flat
              :rows="stockObjectsList"
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
                <q-tr class="text-left bg-grey-3" :props="props">
                  <!-- <q-th style="width: 70px">{{ columns[0].label }}</q-th> -->
                  <q-th class="col">{{ columns[1].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[2].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[3].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[4].label }}</q-th>
                </q-tr>
              </template>
              <template #body="props">
                <q-tr :props="props">
                  <!-- <q-td key="order" :props="props">
                    {{ index }}
                  </q-td> -->
                  <q-td key="drug" :props="props">
                    <q-select
                      class="col"
                      dense
                      outlined
                      :disable="true"
                      ref="drug"
                      v-model="props.row.stock.drug"
                      :options="drugs"
                      option-value="id"
                      option-label="name"
                      label="Medicamento"
                      @filter="filterFn"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="clinic" :props="props">
                    <q-select
                      class="col"
                      dense
                      outlined
                      :disable="true"
                      ref="drug"
                      v-model="props.row.drugDistributor.clinic"
                      :options="clinicSectors"
                      option-value="id"
                      option-label="clinicName"
                      label="Sector Clinico"
                      @filter="filterClinicSectors"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="batchNumber" :props="props">
                    <q-input
                      outlined
                      v-model="props.row.stock.batchNumber"
                      :disable="true"
                      label="Lote"
                      dense
                      class="col"
                    />
                  </q-td>

                  <q-td key="quantity" :props="props">
                    <q-input
                      v-model="props.row.quantity"
                      :disable="true"
                      label="Quantidade"
                      type="number"
                      dense
                      outlined
                      class="col"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
          <div class="row">
            <q-banner
              dense
              inline-actions
              style="padding-top: 2px; padding-bottom: 2px"
              class="col text-white q-pa-none bg-orange-4 q-pr-sm"
            >
              <template v-slot:action class="items-center">
                <q-btn
                  dense
                  unelevated
                  color="primary"
                  class="col hidden"
                  label="Imprimir"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

import Drug from '../../../stores/models/drug/Drug';
import Clinic from '../../../stores/models/clinic/Clinic';
import { computed, onMounted, provide, ref } from 'vue';
import StockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useRouter } from 'vue-router';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

// import { v4 as uuidv4 } from 'uuid'

// components
import TitleBar from 'components/Shared/TitleBar.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import drugService from 'src/services/api/drugService/drugService';
import clinicService from 'src/services/api/clinicService/clinicService';
import DrugDistributor from '../../../stores/models/drugDistributor/DrugDistributor';
import StockDistributorBatchService from 'src/services/api/stockDistributorBatchService/StockDistributorBatchService';

const router = useRouter();
const dateUtils = useDateUtils();
const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarningAction } = useSwal();
const { isMobile } = useSystemUtils();
const title = ref('Detalhe da Guia');
const statusTitle = ref('Pendente');
const statusColor = ref('orange');
const statusIcon = ref('pending');
const columns = [
  {
    name: 'order',
    required: true,
    label: 'Ordem',
    field: 'index',
    align: 'left',
    sortable: false,
  },
  { name: 'drug', align: 'left', label: 'Medicamento', sortable: true },
  { name: 'clinic', align: 'left', label: 'Sector Clinico', sortable: true },
  { name: 'batchNumber', align: 'left', label: 'Lote', sortable: true },
  { name: 'quantity', align: 'left', label: 'Quantidade', sortable: true },
];

let submitting = false;
const creationDate = ref('');
const orderNumber = ref('');
const notes = ref('');
const status = ref('');

const step = ref('display');
const guiaStep = ref('display');
const selectedStock = ref([]);
const drugs = ref([]);
const clinicSectors = ref([]);
const stockObjectsList = ref([]);
let stockDistributorBatch = '';
const orderNumberRef = ref('');
const notesRef = ref('');

const goBack = () => {
  router.go(-1);
};

const filterFn = (val, update, abort) => {
  const stringOptions = activeDrugs.value;
  if (val === '') {
    update(() => {
      return (drugs.value = stringOptions.map((drug) => drug));
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      drugs.value = [];
    });
  } else {
    update(() => {
      drugs.value = stringOptions
        .map((drug) => drug)
        .filter((drug) => {
          return (
            drug && drug.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const filterClinicSectors = (val, update, abort) => {
  const stringOptions = clinicSectorsList.value;
  if (val === '') {
    update(() => {
      return (clinicSectors.value = stringOptions.map((drug) => drug));
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      clinicSectors.value = [];
    });
  } else {
    update(() => {
      clinicSectors.value = stringOptions
        .map((sector) => sector)
        .filter((sector) => {
          return (
            sector &&
            sector.clinicName.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const init = () => {
  creationDate.value = dateUtils.getDDMMYYYFromJSDate(
    currStockDistributor.value.creationDate
  );
  orderNumber.value = currStockDistributor.value.orderNumber;
  notes.value = currStockDistributor.value.notes;
  status.value = currStockDistributor.value.status;
  if (status.value === 'C') {
    statusTitle.value = 'Confirmado';
    statusColor.value = 'info';
    statusIcon.value = 'check';
  } else if (status.value === 'R') {
    statusTitle.value = 'Rejeitado';
    statusColor.value = 'red';
    statusIcon.value = 'warning';
  } else {
    statusTitle.value = 'Pendente';
    statusColor.value = 'orange';
    statusIcon.value = 'pending';
  }
};

const confirmOrder = () => {
  alertWarningAction(
    'Deseja Cofirmar a presente Ordem de distribuicao de Stock?',
    'Não',
    'Sim'
  ).then((result) => {
    if (result) {
      guiaStep.value = 'delete';
      doConfirmOrder(currStockDistributor);
    }
  });
};

const rejectOrder = () => {
  alertWarningAction(
    'Deseja rejeitar a presente Ordem de distribuicao de Stock?',
    'Não',
    'Sim'
  ).then((result) => {
    if (result) {
      doRejectOrder(currStockDistributor);
    }
  });
};

const doConfirmOrder = (order) => {
  showloading();
  StockDistributorService.updateStockDistributorStatus(order.value.id, 'C')
    .then((resp) => {
      status.value = 'C';
      statusTitle.value = 'Confirmado';
      statusColor.value = 'blue';
      statusIcon.value = 'check';
      closeLoading();
      alertSucess('Operação efectuada com sucesso.');
    })
    .catch((error) => {
      alertError('Ocorreu um erro inesperado, contacte o administrador!');
    });
};

const doRejectOrder = (order) => {
  showloading();
  StockDistributorService.updateStockDistributorStatus(order.value.id, 'R')
    .then((resp) => {
      status.value = 'R';
      statusTitle.value = 'Rejeitado';
      statusColor.value = 'red';
      statusIcon.value = 'warning';
      closeLoading();
      alertSucess('Operação efectuada com sucesso.');
    })
    .catch((error) => {
      alertError('Ocorreu um erro inesperado, contacte o administrador!');
    });
};

const initNewStock = () => {
  showloading();
  if (step.value === 'create' || step.value === 'edit') {
    alertError(
      'Por favor concluir ou cancelar a operação em curso antes de iniciar a adição de novo registo.'
    );
    closeLoading();
  } else {
    step.value = 'create';
    const newStock = new DrugDistributor({
      drug: new Drug(),
      enabled: true,
      clinic: new Clinic(),
      stockDistributor: currStockDistributor,
    });
    stockObjectsList.value.push(newStock);
    closeLoading();
  }
};

const cancel = (stock) => {
  if (isEditionStep.value) {
    stock.drug = selectedStock.value.drug;
    stock.expireDate = selectedStock.value.expireDate;
    stock.batchNumber = selectedStock.value.batchNumber;
    stock.quantity = selectedStock.value.unitsReceived;
  } else if (isCreationStep.value) {
    removeFromList(stock);
  }
  step.value = 'display';
};

const removeFromList = (stock) => {
  const i = stockObjectsList.value
    .map((toRemove) => toRemove.id)
    .indexOf(stock.id); // find index of your object
  stockObjectsList.value.splice(i, 1);
};

const initStockEdition = (stock) => {
  selectedStock.value = Object.assign({}, stock);
  if (step.value === 'edit' || step.value === 'create') {
    alertError(
      'Por favor concluir ou cancelar a operação em curso antes de iniciar a edição deste registo.'
    );
  } else {
    stock.enabled = true;
    step.value = 'edit';
  }
};

const getCurrStockDistributor = () => {
  const distributorId = JSON.parse(
    localStorage.getItem('currStockConfirmDistributor')
  );
  const it = StockDistributorService.getStockDistributorById(distributorId);
  return it;
};

const loadstockObjectsList = () => {
  const stocks =
    StockDistributorBatchService.getStockDistributorBatchByStockDistributorId(
      currStockDistributor.value.id
    );
  Object.keys(stocks).forEach(
    function (k) {
      stockObjectsList.value.push(stocks[k]);
    }.bind(this)
  );

  console.log('Finished loading stock');
};

onMounted(() => {
  init();
  loadstockObjectsList();
  //drugs.value = activeDrugs;
});

const currStockDistributor = computed(() => {
  return getCurrStockDistributor();
});

const activeDrugs = computed(() => {
  return drugService.getActiveDrugs();
});

const clinicSectorsList = computed(() => {
  return clinicService.getAllClinicSectors();
});

const isEditionStep = computed(() => {
  return step.value === 'edit';
});

const isCreationStep = computed(() => {
  return step.value === 'create';
});

const isGuiaEditionStep = computed(() => {
  return guiaStep.value === 'edit';
});

const isGuiaDisplayStep = computed(() => {
  return guiaStep.value === 'display';
});
const currClinic = computed(() => {
  return clinicService.currClinic();
});
provide('title', title);
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
