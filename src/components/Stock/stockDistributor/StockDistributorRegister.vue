<template>
  <q-card style="width: 800px; max-width: 90vw" class="">
    <div class="q-pt-lg bg-green-2">
      <div class="row items-center q-mb-md q-ml-md">
        <q-icon name="subject" size="sm" />
        <span class="q-pl-sm text-subtitle1">Dados da Guia</span>
      </div>
      <q-separator color="grey-13" size="1px" />
    </div>
    <form @submit.prevent="submitForm">
      <q-card-section class="q-px-md">
        <div class="q-mt-md">
          <div class="row">
            <q-input
              outlined
              v-model="stockDistributor.orderNumber"
              label="Ordem de Distribuição *"
              ref="orderNumberRef"
              :rules="[(val) => !!val || 'Por favor indicar o número da guia']"
              dense
              class="col"
            />
            <q-input
              dense
              outlined
              class="col q-ml-md"
              v-model="creationDate"
              label="Data de Criação *"
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
          </div>
          <div class="row">
            <q-input
              outlined
              v-model="stockDistributor.notes"
              label="Notas"
              ref="notesRef"
              dense
              class="col"
              type="textarea"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="$emit('close')" />
        <q-btn type="submit" label="Avançar" color="primary" />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
import stockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import { reactive, provide, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { v4 as uuidv4 } from 'uuid';
import clinicService from 'src/services/api/clinicService/clinicService';
import StockDistributor from 'src/stores/models/stockDistributor/StockDistributor';

const dateUtils = useDateUtils();
/*
Declarations
*/
const { showloading, closeLoading } = useLoading();
let stockDistributor = reactive(
  new StockDistributor({ creationDate: new Date() })
);
const creationDate = ref(dateUtils.getDDMMYYYFromJSDate(new Date()));
const creationDateRef = ref(null);
const notesRef = ref(null);
const router = useRouter();
const { alertError } = useSwal();
const orderNumberRef = ref(null);

/*
  Methods
*/
const submitForm = () => {
  showloading();
  stockDistributor.creationDate = dateUtils.getJSDateFromDDMMYYY(
    creationDate.value
  );
  if (stockDistributor.creationDate > new Date()) {
    alertError(
      'A data de criação da guia não pode ser superior a data corrente.'
    );
    closeLoading();
  }
  if (stockDistributor.notes === null || stockDistributor.notes === '') {
    alertError('Por favor preencha o campo de Notas da Guia');
    closeLoading();
  } else {
    orderNumberRef.value.validate();
    if (!orderNumberRef.value.hasError) {
      stockDistributor.clinic = clinicService.currClinic();
      stockDistributor.clinic_id = clinicService.currClinic().id;
      stockDistributor.id = uuidv4();
      stockDistributor.status = 'P';
      stockDistributorService
        .post(stockDistributor)
        .then((resp) => {
          stockDistributor.clinic = null;
          localStorage.setItem(
            'currStockDistributor',
            JSON.stringify(stockDistributor.id)
          );
          closeLoading();
          router.push('/stock/stockDistributor');
          //$emit('close')
        })
        .catch((error) => {
          console.log('ERRO: ', error);
          closeLoading();
          alertError('Ocorreu um erro inesperado, contacte o administrador!');
        });
    } else {
      closeLoading();
    }
  }
};
provide('stockDistributor', stockDistributor);
</script>
