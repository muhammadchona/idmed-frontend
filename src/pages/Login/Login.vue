<template>
  <q-layout v-cloak>
    <q-page-container>
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
                ? { width: '80%' }
                : { width: '50%', height: '65%', 'border-radius': '50%' }
            "
          >
            <q-card-section>
              <div
                class="col-auto text-grey text-caption q-pt-sm row no-wrap items-center justify-center"
              >
                <q-avatar :size="website ? '240px' : '100px'">
                  <q-img src="~assets/LogoiDMED.png" />
                </q-avatar>
              </div>
              <div class="row q-pa-sm text-center q-mt-md column">
                <p
                  style="font-family: 'line-awesome'"
                  class="text-gray ellipsis text-weight-bold"
                  :class="website ? 'text-h4' : 'text-h5'"
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
                <div class="text-center justify-center" style="max-width: 50%">
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
                  <div class="row q-mb-sm" v-if="instalation_type === 'LOCAL'">
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
                        (val) => val != null || ' Por favor indique o Distrito',
                      ]"
                      lazy-rules
                      label="Distrito"
                    />
                  </div>
                  <div class="row q-mb-sm" v-if="instalation_type === 'LOCAL'">
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
                        (val) => val != null || ' Por favor indique a clinica',
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
                    :size="website ? '130px' : '60px'"
                    style="opacity: 40%"
                  >
                    <q-img src="~assets/MoHLogo.png" />
                  </q-avatar>
                </div>
                <div class="q-pb-lg">
                  <q-avatar
                    square
                    :size="website ? '190px' : '90px'"
                    style="opacity: 40%"
                  >
                    <q-img src="~assets/pepfar-new-logo.jpeg" />
                  </q-avatar>
                </div>
              </div>
              <div class="row justify-center">Versão v.1.0.0 Beta</div>
            </q-card-section>
          </q-card>
        </transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useMediaQuery } from '@vueuse/core';
import { QSpinnerBall, useQuasar } from 'quasar';
import UsersService from 'src/services/UsersService';
import clinicService from 'src/services/api/clinicService/clinicService';
import districtService from 'src/services/api/districtService/districtService';
import menuService from 'src/services/api/menu/menuService';
import provinceService from 'src/services/api/provinceService/provinceService';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import userService from 'src/services/api/user/userService';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const instalation_type = ref(null);
const province = reactive(ref([]));
const district = reactive(ref([]));
const clinic = reactive(ref([]));
const systemConfigs = reactive(ref(new SystemConfigs()));
const username = reactive(ref(''));
const password = reactive(ref(''));
const usernameRef = ref(null);
const passwordRef = ref(null);
const isPwd = reactive(ref(true));
const submitting = reactive(ref(false));

const isWebScreen = useMediaQuery('(min-width: 1024px)');
const website = computed(() => (isWebScreen.value ? true : false));
/*
Hook
*/
onMounted(() => {
  console.log(website.value);
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
});
/*
Computed
*/
const configs = computed(() => {
  return systemConfigsService.getActiveDataMigration();
});
const provinces = computed(() => {
  return provinceService.apiGetAllWithDistricts();
});
const districts = computed(() => {
  return districtService.getAllDistrictByProvinceId(province.value.id);
});
const clinics = computed(() => {
  return clinicService.getClinicsByDistrictId(district.value.id);
});

/*
Methods
*/
const doSave = () => {
  systemConfigs.value = instalation_type.value;
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

const authUser = () => {
  const encodedStringBtoA = btoa(
    String(username.value).concat(':').concat(password.value)
  );
  console.log({ username: username.value, password: password.value });
  usernameRef.value.validate();
  passwordRef.value.validate();
  if (!passwordRef.value.hasError && !usernameRef.value.hasError) {
    submitting.value = true;
    if (website.value) {
      loginOnline(encodedStringBtoA);
    }
    // } else {
    //   User.localDbGetAll().then((users) => {
    //     if (users.length > 0) {
    //       console.log('users:' + users);
    //       const user = users.filter(
    //         (user) =>
    //           (user.username === this.username &&
    //             bcrypt.compareSync(
    //               this.password,
    //               user.password.substring(8)
    //             )) ||
    //           (user.username === this.username &&
    //             this.decryptPlainText(user.password) === this.password)
    //       );
    //       if (user.length > 0 && user[0].accountLocked === false) {
    //         const userLoged = user[0];
    //         localStorage.setItem('username', userLoged.username);
    //         localStorage.setItem('user', this.username);
    //         localStorage.setItem('encodeBase64', encodedStringBtoA);
    //         localStorage.setItem(
    //           'sync_pass',
    //           this.encryptPlainText('user.sync')
    //         );
    //         console.log(userLoged.authorities);
    //         var menus = userLoged.authorities.map((m) => m.menus).flat();
    //         var menusIds = menus.map((m) => m.id).flat();
    //         console.log(menus);
    //         console.log(menusIds);
    //         const menusVuex = Menu.findIn(menusIds);
    //         console.log(menusVuex);
    //         var menusDescription = menusVuex.map((m) => m.description).flat();
    //         localStorage.setItem('role_menus', menusDescription);
    //         localStorage.setItem('userLocalId', userLoged.id);
    //         this.$router.push({ path: '/' });
    //       } else {
    //         Notify.create({
    //           icon: 'announcement',
    //           message: 'Utilizador ou a senha inválida',
    //           type: 'negative',
    //           progress: true,
    //           timeout: 3000,
    //           position: 'top',
    //           color: 'negative',
    //           textColor: 'white',
    //           classes: 'glossy',
    //         });
    //         this.submitting = false;
    //       }
    //     } else {
    //       loginOnline(encodedStringBtoA);
    //     }
    //   });
    // }
  }
};

const loginOnline = (encodedStringBtoA) => {
  UsersService.login({
    username: username.value,
    password: password.value,
  })
    .then(() => {
      submitting.value = false;
      const localuser = UsersService.getUserByUserName(username.value);
      console.log('Login >>>>>>>>', localuser);

      localStorage.setItem('id_token', localuser.access_token);
      localStorage.setItem('refresh_token', localuser.refresh_token);
      localStorage.setItem('username', localuser.username);
      localStorage.setItem('user', username.value);
      localStorage.setItem('encodeBase64', encodedStringBtoA);
      localStorage.setItem('role_menus', localuser.menus);
      // localStorage.setItem('sync_pass', this.encryptPlainText('user.sync'));
      router.push({ path: '/' });
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
