<template>
  <q-card style="width: 500px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="local_pharmacy" size="sm" />
          <span class="q-pl-sm text-subtitle2">Login</span>
          <span class="q-pl-sm text-subtitle"
            >A sua sessão Expirou , Por Favor volte a logar para poder
            sicronizar!</span
          >
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <q-card-section class="q-px-md">
      <q-form class="q-gutter-md" @submit.prevent="authUser">
        <div class="row q-mt-md">
          <q-input
            class="col"
            ref="usernameRef"
            v-model="username"
            type="text"
            :rules="[
              (val) =>
                val.length >= 3 ||
                'O nome do utilizador deve ter um minimo de 4 caracteres',
            ]"
            lazy-rules
            label="Utilizador"
          >
            <template v-slot:append>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>
        </div>
        <div class="row q-mt-md">
          <q-input
            v-model="password"
            ref="passwordRef"
            class="col"
            label="Senha"
            :rules="[
              (val) =>
                val.length >= 4 || 'A senha deve ter um minimo de 4 caracteres',
            ]"
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
                color="primary"
              />
            </template>
          </q-input>
        </div>
        <div class="row q-mb-md q-mt-md">
          <q-btn
            :loading="submitting"
            class="full-width q-py-sm"
            unelevated
            rounded
            color="primary"
            type="submit"
            label="Entrar"
          />
          <q-btn
            label="Cancelar"
            class="full-width q-py-sm q-mt-md"
            color="red"
            @click.once="$emit('close')"
            unelevated
            rounded
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { ref, inject } from 'vue';
import { sendData } from 'src/services/Mobile/SendInfo';
import UsersService from 'src/services/UsersService';
const username = ref('');
const password = ref('');
const usernameRef = ref(null);
const passwordRef = ref(null);
const isPwd = ref(true);
const submitting = ref(false);
const showLoginScreen = inject('showLoginScreen');
const { getPatientsToSend } = sendData();
const stockDistributionCount = inject('stockDistributionCount');
const getStockDistributionCount = inject('getStockDistributionCount');
const authUser = async () => {
  submitting.value = true;
  UsersService.login({
    username: username.value,
    password: password.value,
  }).then((response) => {
    console.log(showLoginScreen);
    submitting.value = false;
    sessionStorage.setItem('id_token', response.data.access_token);
    sessionStorage.setItem('refresh_token', response.data.refresh_token);
    showLoginScreen.value = false;
    getPatientsToSend();
    //  getStockDistributionCount();
  });
};
</script>
