<template>
  <q-responsive :ratio="16 / 9">
    <q-layout v-cloak>
      <q-page-container>
        <!-- <q-responsive :ratio="16/9" class="col"> -->
        <q-page class="flex flex-center">
          <div
            id="particles-js"
            :class="$q.dark.isActive ? 'dark_gradient' : 'normal_gradient'"
          ></div>
          <q-btn
            color="white"
            class="absolute-top-right"
            flat
            round
            @click="$q.dark.toggle()"
            :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
          />
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <q-card
              v-bind:style="
                $q.screen.lt.sm
                  ? { width: '60%', height: '65%', 'border-radius': '50%' }
                  : { width: '50%', height: '65%', 'border-radius': '50%' }
              "
            >
              <q-card-section>
                <div
                  class="col-auto text-grey text-caption q-pt-sm row no-wrap items-center justify-center"
                >
                  <q-avatar size="100px">
                    <q-img src="~assets/LogoiDMED.png" />
                  </q-avatar>
                </div>
                <div class="row q-pa-sm text-center q-mt-md column">
                  <p
                    style="font-family: 'line-awesome'"
                    class="text-gray text-h5 ellipsis text-weight-bold"
                  >
                    Sistema Inteligente para Dispensa <br />
                    de Medicamentos
                  </p>
                </div>
              </q-card-section>
              <q-card-section align="center">
                <q-form
                  class="q-gutter-md"
                  @submit.prevent="authUser"
                  v-if="configs !== null"
                >
                  <div
                    class="q-pa-sm text-center justify-center"
                    style="max-width: 50%"
                  >
                    <div class="row q-mb-sm">
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
                    <div class="row q-mb-sm">
                      <q-input
                        v-model="password"
                        ref="passwordRef"
                        class="col"
                        label="Senha"
                        :rules="[
                          (val) =>
                            val.length >= 4 ||
                            'A senha deve ter um minimo de 4 caracteres',
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
                    <div class="row">
                      <q-btn
                        :loading="submitting"
                        class="full-width q-py-sm"
                        unelevated
                        rounded
                        color="primary"
                        type="submit"
                        label="Entrar"
                      />
                    </div>
                  </div>
                </q-form>
                <q-form
                  class="q-gutter-md q-pa-none"
                  @submit.prevent="doSave"
                  v-if="configs === null"
                >
                  <div
                    class="text-center justify-center"
                    style="max-width: 50%"
                  >
                    <div class="q-pa-sm">
                      <div class="q-gutter-sm q-pa-none">
                        <q-radio
                          v-model="instalation_type"
                          val="PROVINCIAL"
                          label="Provincial"
                        />
                        <q-radio
                          v-model="instalation_type"
                          val="LOCAL"
                          label="Local"
                        />
                      </div>
                    </div>
                    <div class="row q-mb-sm">
                      <q-select
                        dense
                        outlined
                        class="col"
                        v-model="province"
                        :options="provinces"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        option-value="id"
                        option-label="description"
                        :rules="[
                          (val) =>
                            val != null || ' Por favor indique a província',
                        ]"
                        lazy-rules
                        label="Província *"
                      />
                    </div>
                    <div
                      class="row q-mb-sm"
                      v-if="instalation_type === 'LOCAL'"
                    >
                      <q-select
                        class="col"
                        dense
                        outlined
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        v-model="district"
                        :options="districts"
                        option-value="id"
                        option-label="description"
                        :rules="[
                          (val) =>
                            val != null || ' Por favor indique o Distrito',
                        ]"
                        lazy-rules
                        label="Distrito"
                      />
                    </div>
                    <div
                      class="row q-mb-sm"
                      v-if="instalation_type === 'LOCAL'"
                    >
                      <q-select
                        dense
                        outlined
                        class="col"
                        v-model="clinic"
                        :options="clinics"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        option-value="id"
                        option-label="clinicName"
                        :rules="[
                          (val) =>
                            val != null || ' Por favor indique a clinica',
                        ]"
                        lazy-rules
                        label="Clinica"
                      />
                    </div>
                    <div class="row">
                      <q-btn
                        :loading="submitting"
                        class="full-width q-py-sm"
                        unelevated
                        rounded
                        color="primary"
                        type="submit"
                        label="Proximo"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
              <q-card-section align="center">
                <div class="row justify-center q-pt-md q-gutter-xl">
                  <div class="justify-left q-pt-lg">
                    <q-avatar
                      round
                      :size="!isMobile ? '130px' : '60px'"
                      style="opacity: 40%"
                    >
                      <q-img src="~assets/MoHLogo.png" />
                    </q-avatar>
                  </div>
                  <div class="q-pb-lg">
                    <q-avatar
                      square
                      :size="!isMobile ? '190px' : '90px'"
                      style="opacity: 40%"
                    >
                      <q-img src="~assets/pepfar-new-logo.jpeg" />
                    </q-avatar>
                  </div>
                </div>
                <div class="row justify-center">Versão v.1.3.0 SNAPSHOT</div>
              </q-card-section>
            </q-card>
          </transition>
          <q-dialog
            persistent
            v-model="notice"
            transition-show="slide-up"
            transition-hide="slide-down"
            v-if="LocalStorage.getItem('backend_url') !== null || isOnline"
          >
            <q-card class="bg-white text-red">
              <q-card-section>
                <div class="text-h6 text-weight-bold">
                  Aviso de Confidencialidade
                </div>
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pt-md">
                <div class="row">
                  <div class="col-2">
                    <q-icon name="warning" color="red" size="4.5rem" />
                  </div>
                  <div class="col text-justify">
                    Ao acessar este sistema, você está prestes a visualizar
                    informações altamente confidenciais de utentes. É sua
                    responsabilidade protegê-las adequadamente e usá-las somente
                    para os fins autorizados. A Privacidade dos utentes é
                    essencial para a nossa missão
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn color="red" label="Fechar" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-dialog
            persistent
            transition-show="slide-up"
            transition-hide="slide-down"
            v-model="popUpUrlMobile"
          >
            <UrlChanger />
          </q-dialog>
        </q-page>
        <!-- </q-responsive> -->
      </q-page-container>
    </q-layout>
  </q-responsive>
</template>

<script setup>
import { QSpinnerBall, SessionStorage, useQuasar } from 'quasar';
import UsersService from 'src/services/UsersService';
import clinicService from 'src/services/api/clinicService/clinicService';
import districtService from 'src/services/api/districtService/districtService';
import menuService from 'src/services/api/menu/menuService';
import provinceService from 'src/services/api/provinceService/provinceService';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import bcrypt from 'bcryptjs';
import { useLoading } from 'src/composables/shared/loading/loading';
import { LocalStorage } from 'quasar';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import UrlChanger from 'src/components/Shared/UrlChanger.vue';
import useNotify from 'src/composables/shared/notify/UseNotify';
import StockService from 'src/services/api/stockService/StockService';
import StockReferenceAdjustmentService from 'src/services/api/stockAdjustment/StockReferenceAdjustmentService';
import StockDestructionAdjustmentService from 'src/services/api/stockAdjustment/StockDestructionAdjustmentService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';
import InventoryService from 'src/services/api/inventoryService/InventoryService';

const { notifyError } = useNotify();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const $q = useQuasar();
const router = useRouter();
const instalation_type = ref(null);
const province = ref([]);
const district = ref([]);
const clinic = ref([]);
const systemConfigs = ref(new SystemConfigs());
const username = ref('');
const password = ref('');
const usernameRef = ref(null);
const passwordRef = ref(null);
const isPwd = ref(true);
const submitting = ref(false);
const notice = ref(true);
const popUpUrlMobile = ref(false);

/*
Hook
*/
onMounted(() => {
  const tokenExpiration = sessionStorage.getItem('tokenExpiration');
  if (tokenExpiration && tokenExpiration === '0') {
    notifyError('Sessão Expirada');
    sessionStorage.setItem('tokenExpiration', 1);
  }
  if (isMobile.value && localStorage.getItem('backend_url') === null) {
    popUpUrlMobile.value = true;
  }
  $q.loading.show({
    message: 'Carregando ...',
    spinnerColor: 'grey-4',
    spinner: QSpinnerBall,
  });
  loadSystemConfigs();
  loadProvinceAndDistrict();
  loadMenusFromLocalToVuex();
  setTimeout(() => {
    $q.loading.hide();
  }, 600);

  if (!isMobile.value) {
    UsersService.logout();
    StockService.deleteAllFromStorage();
    StockReferenceAdjustmentService.deleteAllFromStorage();
    StockDestructionAdjustmentService.deleteAllFromStorage();
    InventoryStockAdjustmentService.deleteAllFromStorage();
    InventoryService.deleteAllFromStorage();
    clinicService.deleteFromPinia();
    systemConfigsService.deleteAllFromStorage();
    SessionStorage.clear();
    sessionStorage.setItem('user', null);
    sessionStorage.setItem('id_token', null);
    sessionStorage.setItem('refresh_token', null);
    localStorage.setItem('activeTabStock', '');
    sessionStorage.setItem('Btoa', '');
    localStorage.setItem('currInventory', '');
    localStorage.setItem('Btoa', '');
  }
});

/*
Computed
*/
const configs = computed(() => {
  return systemConfigsService.getInstallationType();
});
const provinces = computed(() => {
  return provinceService.apiGetAllWithDistricts();
});
const districts = computed(() => {
  return districtService.getAllDistrictByProvinceId(province.value.id);
});
const clinics = computed(() => {
  if (district.value.id) {
    showloading();
    clinicService.getAllClinicsByDistrictId(district.value.id);
    closeLoading();
    return clinicService.getClinicsByDistrictId(district.value.id);
    // closeLoading()
  }
  return null;
});

/*
Methods
*/
const doSave = () => {
  systemConfigs.value.value = instalation_type.value;
  systemConfigs.value.key = 'INSTALATION_TYPE';
  systemConfigs.value.description =
    instalation_type.value === 'LOCAL'
      ? clinic.value.uuid
      : province.value.code;
  systemConfigsService.apiSave(systemConfigs.value);
};
const loadSystemConfigs = async () => {
  systemConfigsService.get(0);
};
const loadProvinceAndDistrict = async () => {
  provinceService.get(0);
  districtService.get(0);
};
const loadMenusFromLocalToVuex = async () => {
  menuService.get(0);
};

const authUser = async () => {
  const encodedStringBtoA = btoa(
    String(username.value).concat(':').concat(password.value)
  );
  usernameRef.value.validate();
  passwordRef.value.validate();
  if (!passwordRef.value.hasError && !usernameRef.value.hasError) {
    submitting.value = true;
    if (isOnline.value) {
      loginOnline(encodedStringBtoA);
    } else {
      const users = await UsersService.getMobile();
      if (users.length === 0 && isMobile.value) {
        loginOnline(encodedStringBtoA);
      } else {
        loginOffline(encodedStringBtoA);
      }
    }
  }
};

const loginOnline = (encodedStringBtoA) => {
  UsersService.login({
    username: username.value,
    password: password.value,
  })
    .then((response) => {
      sessionStorage.setItem('tokenExpiration', String(Date.now() + 600000)); // 10min
      submitting.value = false;
      // userLogin.save(resp.data);
      if (response !== undefined && response.status === 200) {
        const localuser = UsersService.getUserByUserName(username.value);
        sessionStorage.setItem('id_token', localuser.access_token);
        sessionStorage.setItem('refresh_token', localuser.refresh_token);
        sessionStorage.setItem('username', localuser.username);
        sessionStorage.setItem('user', localuser.username);
        sessionStorage.setItem('Btoa', encodedStringBtoA);
        localStorage.setItem('Btoa', encodedStringBtoA);
        sessionStorage.setItem('role_menus', localuser.menus);
        sessionStorage.setItem(
          'clinic_sector_users',
          localuser.clinicSectorUsers
        );
        router.push({ path: '/' });
      }
    })
    .catch((error) => {
      console.log(error);
      submitting.value = false;
      if (error.request.response != null) {
        const arrayErrors = JSON.parse(error.request.response);
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element) => {
            listErrors.push(element.message);
          });
        }
        console.log(listErrors);
      }
    });
};

const loginOffline = (encodedStringBtoA) => {
  const userLoged = UsersService.getUserByUserName(username.value);
  if (
    userLoged.username === username.value &&
    bcrypt.compareSync(password.value, userLoged.password.substring(8))
  ) {
    sessionStorage.setItem('username', userLoged.username);
    sessionStorage.setItem('user', userLoged.username);
    sessionStorage.setItem('Btoa', encodedStringBtoA);
    router.push({ path: '/' });
  } else {
    Notify.create({
      icon: 'announcement',
      message: 'Utilizador bloqueado ou a senha inválida',
      type: 'negative',
      progress: true,
      timeout: 3000,
      position: 'top',
      color: 'negative',
      textColor: 'white',
      classes: 'glossy',
    });
    submitting.value = false;
  }
};
</script>

<style>
.bg-image {
  background-repeat: no-repeat;
  background-size: cover;
}

[v-cloak] {
  display: none !important;
}

#particles-js {
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
}

.normal_gradient {
  background: linear-gradient(145deg, #00afdb 30%, #00bea4 70%);
}

.dark_gradient {
  background: linear-gradient(145deg, #014758 15%, #014b41 70%);
}

.login-form {
  position: absolute;
}
</style>
