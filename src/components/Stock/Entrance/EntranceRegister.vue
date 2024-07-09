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
              v-model="stockEntrance.orderNumber"
              label="Número *"
              ref="orderNumberRef"
              :rules="[(val) => !!val || 'Por favor indicar o número da guia']"
              dense
              class="col"
            />
            <q-input
              dense
              outlined
              class="col q-ml-md"
              v-model="dateReceived"
              label="Data de Criação *"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="dateReceived" mask="DD-MM-YYYY">
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
              v-model="stockEntrance.notes"
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
import StockEntrance from '../../../stores/models/stockentrance/StockEntrance';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import { reactive, provide, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { v4 as uuidv4 } from 'uuid';
import clinicService from 'src/services/api/clinicService/clinicService';

const dateUtils = useDateUtils();
/*
Declarations
*/
const { showloading, closeLoading } = useLoading();
let stockEntrance = reactive(new StockEntrance({ dateReceived: new Date() }));
const dateReceived = ref(dateUtils.getDDMMYYYFromJSDate(new Date()));
const creationDate = ref(dateUtils.getDDMMYYYFromJSDate(new Date()));
const orderNumberRef = ref(null);
const notesRef = ref(null);
const router = useRouter();
const { alertError } = useSwal();

/*
  Methods
*/

const verifyStockNumber = (orderNumber) => {
  return StockEntranceService.getStockEntranceByNumber(
    String(orderNumber).trim()
  );
};

const submitForm = () => {
  showloading();
  stockEntrance.dateReceived = dateUtils.getDateFromHyphenDDMMYYYYWithTime(
    dateReceived.value
  );

  stockEntrance.creationDate = dateUtils.getDateFromHyphenDDMMYYYYWithTime(
    creationDate.value
  );
  if (
    verifyStockNumber(stockEntrance.orderNumber) !== null &&
    verifyStockNumber(stockEntrance.orderNumber) !== undefined
  ) {
    alertError('O número da Guia não pode ser vazio e deve ser único.');
    closeLoading();
  } else if (stockEntrance.dateReceived > new Date()) {
    alertError(
      'A data de criação da guia não pode ser superior a data corrente.'
    );
    closeLoading();
  } else {
    orderNumberRef.value.validate();
    if (!orderNumberRef.value.hasError) {
      stockEntrance.clinic = clinicService.currClinic();
      stockEntrance.clinic_id = clinicService.currClinic().id;
      stockEntrance.id = uuidv4();
      StockEntranceService.post(stockEntrance)
        .then((resp) => {
          stockEntrance.clinic = null;
          localStorage.setItem(
            'currStockEntrance',
            JSON.stringify(stockEntrance.id)
          );
          closeLoading();
          router.push('/stock/entrance');
          //$emit('close')
        })
        .catch((error) => {
          console.log('ERRO: ', error);
          closeLoading();
          alertError('Ocorreu um erro inesperado, contacte o administrador!');
        });
    }
  }
};
provide('stockEntrance', stockEntrance);
</script>
