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
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="$emit('close')" />
        <q-btn type="submit" label="Avançar" color="primary" />
      </q-card-actions>
    </form>
    <!--q-dialog v-model="alert.visible" persistent>
          <Dialog :type="alert.type" @closeDialog="closeDialog" @commitOperation="doRemove">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog-->
  </q-card>
</template>

<script setup>
import { SessionStorage } from 'quasar';
import StockEntrance from '../../../stores/models/stockentrance/StockEntrance';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import StockEntranceMethod from 'src/methods/stockEntrance/StockEntranceMethod';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useMediaQuery } from '@vueuse/core';
import { useLoading } from 'src/composables/shared/loading/loading';
import { computed, reactive, provide, ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const isWebScreen = useMediaQuery('(min-width: 1024px)');
const mobile = computed(() => (isWebScreen.value ? false : true));
const dateUtils = useDateUtils();
/*
Declarations
*/
const { showloading, closeLoading } = useLoading();
let stockEntrance = reactive(new StockEntrance({ dateReceived: new Date() }));
const dateReceived = ref(dateUtils.getDDMMYYYFromJSDate(new Date()));
const orderNumberRef = ref(null);
const router = useRouter();
const { alertSucess, alertError, alertWarningAction } = useSwal();

const currClinic = inject('currClinic');
/*
  Methods
*/
const submitForm = () => {
  // submitting = true
  stockEntrance.dateReceived = dateUtils.getJSDateFromDDMMYYY(
    dateReceived.value
  );
  if (stockEntrance.dateReceived > new Date()) {
    alertError(
      'error',
      'A data de criação da guia não pode ser superior a data corrente.'
    );
  } else {
    orderNumberRef.value.validate();
    if (!orderNumberRef.value.hasError) {
      showloading();
      if (!mobile.value) {
        stockEntrance.clinic = currClinic;
        stockEntrance.id = null;
        StockEntranceService.post(stockEntrance)
          .then((resp) => {
            stockEntrance = resp;
            localStorage.setItem(
              'currStockEntrance',
              JSON.stringify(stockEntrance)
            );
            closeLoading();
            router.push('/stock/entrance');
            //$emit('close')
          })
          .catch((error) => {
            console.log('ERRO: ', error);
            closeLoading();
            alertError(
              'Erro',
              'Ocorreu um erro inesperado, contacte o administrador!'
            );
          });
      } else {
        stockEntrance.clinic = currClinic;
        stockEntrance.syncStatus = 'R';
        const targetCopy = new StockEntrance(
          JSON.parse(JSON.stringify(this.stockEntrance))
        );
        console.log('STOCK ENTRANCE WEB: ', targetCopy);
        StockEntranceMethod.localDbAdd(targetCopy)
          .then((item) => {
            SessionStorage.set('currStockEntrance', targetCopy);
            closeLoading();
            router.push('/stock/entrance');
            $emit('close');
          })
          .catch((error) => {
            alertError('error', error);
          });
      }
    }
  }
};
provide('stockEntrance', stockEntrance);
</script>

