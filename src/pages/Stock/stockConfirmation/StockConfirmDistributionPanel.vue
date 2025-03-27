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
              :rows="drugDistributorList"
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
                  <q-th style="width: 70px">{{}}</q-th>
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

                  <q-td auto-width>
                    <q-btn
                      size="sm"
                      color="primary"
                      round
                      dense
                      @click="props.expand = !props.expand"
                      :icon="props.expand ? 'remove' : 'add'"
                    />
                  </q-td>

                  <q-td key="drug" :props="props">
                    {{ props.row.drug.name }}
                  </q-td>
                  <q-td key="clinic" :props="props">
                    {{ props.row.clinic.clinicName }}
                  </q-td>
                  <q-td key="quantity" :props="props">
                    {{ props.row.quantity }}
                  </q-td>

                  <q-td key="options" :props="props">
                    <div class="col" v-if="props.row.status === 'P'">
                      <q-btn
                        :loading="submitting"
                        flat
                        size="md"
                        dense
                        round
                        color="primary"
                        icon="done"
                        @click="confirmRecord(props.row)"
                      />

                      <q-btn
                        size="md"
                        flat
                        dense
                        round
                        color="orange-5"
                        icon="clear"
                        @click="rejectRecord(props.row)"
                      />
                    </div>
                    <div class="col" v-else-if="props.row.status === 'C'">
                      <q-chip color="green" text-color="white">
                        Confirmado
                      </q-chip>
                    </div>
                    <div class="col" v-else-if="props.row.status === 'R'">
                      <q-chip color="orange" text-color="white">
                        Rejeitado
                      </q-chip>
                    </div>
                    <div class="col" v-else-if="props.row.status === 'A'">
                      <q-chip color="red" text-color="white"> Anulado </q-chip>
                    </div>
                  </q-td>
                </q-tr>

                <tr v-show="props.expand">
                  <th></th>
                  <th align="left"><b>Fornecedor</b></th>
                  <th align="left"><b>Lote</b></th>
                  <th align="left"><b>Quantidade</b></th>
                  <th align="left"><b>Data de Validade</b></th>
                </tr>

                <q-tr
                  v-for="col in props.row.stockDistributorBatchs"
                  :key="col.id"
                  v-show="props.expand"
                >
                  <q-td> </q-td>
                  <q-td key="manufacture">{{ col.stock.manufacture }} </q-td>
                  <q-td key="batchNumber"> {{ col.stock.batchNumber }}</q-td>
                  <q-td key="quantity">
                    {{ col.quantity }}
                  </q-td>
                  <q-td key="expireDate">
                    {{ formatDate(col.stock.expireDate) }}
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

    <div class="row" v-if="!isMobile">
      <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg">
        <div>
          <ListHeader
            :addVisible="false"
            :expandVisible="false"
            :mainContainer="true"
            bgColor="bg-primary"
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
              :rows="drugDistributorList"
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
                  <q-th style="width: 70px">{{}}</q-th>
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

                  <q-td auto-width>
                    <q-btn
                      size="sm"
                      color="primary"
                      round
                      dense
                      @click="props.expand = !props.expand"
                      :icon="props.expand ? 'remove' : 'add'"
                    />
                  </q-td>

                  <q-td key="drug" :props="props">
                    {{ props.row.drug.name }}
                  </q-td>
                  <q-td key="clinic" :props="props">
                    {{ props.row.clinic.clinicName }}
                  </q-td>
                  <q-td key="quantity" :props="props">
                    {{ props.row.quantity }}
                  </q-td>

                  <q-td key="options" :props="props">
                    <div class="col" v-if="props.row.status === 'P'">
                      <q-btn
                        :loading="submitting"
                        flat
                        size="md"
                        dense
                        round
                        color="primary"
                        icon="done"
                        @click="confirmRecord(props.row)"
                      />

                      <q-btn
                        size="md"
                        flat
                        dense
                        round
                        color="orange-5"
                        icon="clear"
                        @click="rejectRecord(props.row)"
                      />
                    </div>
                    <div class="col" v-else-if="props.row.status === 'C'">
                      <q-chip color="green" text-color="white">
                        Confirmado
                      </q-chip>
                    </div>
                    <div class="col" v-else-if="props.row.status === 'R'">
                      <q-chip color="orange" text-color="white">
                        Rejeitado
                      </q-chip>
                    </div>
                    <div class="col" v-else-if="props.row.status === 'A'">
                      <q-chip color="red" text-color="white"> Anulado </q-chip>
                    </div>
                  </q-td>
                </q-tr>

                <tr v-show="props.expand">
                  <th></th>
                  <th align="left"><b>Fornecedor</b></th>
                  <th align="left"><b>Lote</b></th>
                  <th align="left"><b>Quantidade</b></th>
                  <th align="left"><b>Data de Validade</b></th>
                </tr>

                <q-tr
                  v-for="col in props.row.stockDistributorBatchs"
                  :key="col.id"
                  v-show="props.expand"
                >
                  <q-td> </q-td>
                  <q-td key="manufacture">{{ col.stock.manufacture }} </q-td>
                  <q-td key="batchNumber"> {{ col.stock.batchNumber }}</q-td>
                  <q-td key="quantity">
                    {{ col.quantity }}
                  </q-td>
                  <q-td key="expireDate">
                    {{ formatDate(col.stock.expireDate) }}
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
import { computed, inject, onMounted, provide, ref } from 'vue';
import StockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useRouter } from 'vue-router';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { date } from 'quasar';
// import { v4 as uuidv4 } from 'uuid'

// components
import TitleBar from 'components/Shared/TitleBar.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import drugService from 'src/services/api/drugService/drugService';
import clinicService from 'src/services/api/clinicService/clinicService';
import DrugDistributor from '../../../stores/models/drugDistributor/DrugDistributor';
import DrugDistributorService from 'src/services/api/drugDistributorService/DrugDistributorService';

const router = useRouter();
const dateUtils = useDateUtils();
const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarningAction } = useSwal();
const { isMobile } = useSystemUtils();
const title = ref('Detalhe da Guia');
const stockDistributionCount = inject('stockDistributionCount');

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
  // { name: 'batchNumber', align: 'left', label: 'Lote', sortable: true },
  { name: 'quantity', align: 'left', label: 'Quantidade', sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

let submitting = false;
const creationDate = ref('');
const orderNumber = ref('');
const notes = ref('');

const step = ref('display');
const guiaStep = ref('display');
const selectedStock = ref([]);
const drugs = ref([]);
const drugDistributorList = ref([]);
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

const init = () => {
  creationDate.value = dateUtils.getDDMMYYYFromJSDate(
    currStockDistributor.value.creationDate
  );
  orderNumber.value = currStockDistributor.value.orderNumber;
  notes.value = currStockDistributor.value.notes;
};

const confirmRecord = (record) => {
  // alert(record);
  console.log(record);
  alertWarningAction(
    'Deseja Cofirmar a presente distribuicao de Stock?',
    'Não',
    'Sim'
  ).then((result) => {
    if (result) {
      guiaStep.value = 'delete';
      doConfirmRecord(record);
    }
  });
};

const rejectRecord = (record) => {
  alertWarningAction(
    'Deseja rejeitar a presente distribuicao de Stock?',
    'Não',
    'Sim'
  ).then((result) => {
    if (result) {
      doRejectRecord(record);
    }
  });
};

const doConfirmRecord = (record) => {
  showloading();
  record.enabled = false;
  record.status = 'C'; //confirmed
  DrugDistributorService.updateDrugDistributorStatus(record, 'C')
    .then((resp) => {
      loadstockObjectsList();
      closeLoading();
      getStockDistributionCount(currClinic.value);
      alertSucess('Operação efectuada com sucesso.');
    })
    .catch((error) => {
      alertError('Ocorreu um erro inesperado, contacte o administrador!');
    });
};

const doRejectRecord = (record) => {
  showloading();
  record.enabled = false;
  record.status = 'R'; //rejected
  DrugDistributorService.updateDrugDistributorStatus(record, 'R')
    .then((resp) => {
      loadstockObjectsList();
      closeLoading();
      getStockDistributionCount(currClinic.value);
      alertSucess('Operação efectuada com sucesso.');
    })
    .catch((error) => {
      alertError('Ocorreu um erro inesperado, contacte o administrador!');
    });
};

const getStockDistributionCount = (clinic) => {
  DrugDistributorService.getDistributionsByStatus(clinic.id, 'P').then(
    (list) => {
      stockDistributionCount.value = list.length;
      localStorage.setItem(
        'stockDistributionCount',
        stockDistributionCount.value
      );
    }
  );
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
    drugDistributorList.value.push(newStock);
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
  const i = drugDistributorList.value
    .map((toRemove) => toRemove.id)
    .indexOf(stock.id); // find index of your object
  drugDistributorList.value.splice(i, 1);
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
  const stocks = DrugDistributorService.getDrugDistributorList(
    currStockDistributor.value.id,
    currClinic.value.id
  );
  console.log(stocks);
  drugDistributorList.value = [];
  Object.keys(stocks).forEach(
    function (k) {
      drugDistributorList.value.push(stocks[k]);
    }.bind(this)
  );
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

const isEditionStep = computed(() => {
  return step.value === 'edit';
});

const isCreationStep = computed(() => {
  return step.value === 'create';
});

const isGuiaEditionStep = computed(() => {
  return guiaStep.value === 'edit';
});

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};

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
