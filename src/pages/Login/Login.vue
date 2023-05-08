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
              this.$q.screen.lt.sm
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
                <div class="q-pa-sm text-center justify-center" style="max-width: 50%">
                  <div class="row q-mb-sm">
                    <q-input
                      class="col"
                      ref="user"
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
                      class="col"
                      label="Senha"
                      :rules="[
                        (val) =>
                          val.length >= 4 || 'A senha deve ter um minimo de 4 caracteres',
                      ]"
                      ref="password"
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
                      <q-radio v-model="instalation_type" val="LOCAL" label="Local" />
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
                      ref="province"
                      option-value="id"
                      option-label="description"
                      :rules="[(val) => val != null || ' Por favor indique a província']"
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
                      ref="district"
                      option-value="id"
                      option-label="description"
                      :rules="[(val) => val != null || ' Por favor indique o Distrito']"
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
                      ref="clinic"
                      option-value="id"
                      option-label="clinicName"
                      :rules="[(val) => val != null || ' Por favor indique a clinica']"
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
                  <q-avatar round :size="website ? '130px' : '60px'" style="opacity: 40%">
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

<script>
import { QSpinnerBall, SessionStorage, useQuasar, Notify } from 'quasar'
import Province from '../../store/models/province/Province'
import District from '../../store/models/district/District'
import Clinic from 'src/store/models/clinic/Clinic'
import { ref } from 'vue'
import SystemConfigs from 'src/store/models/systemConfigs/SystemConfigs'
import UsersService from '../../services/UsersService'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import User from 'src/store/models/userLogin/User'
import mixinEncryption from 'src/mixins/mixin-encryption'
import bcrypt from 'bcryptjs'
import Menu from 'src/store/models/userLogin/Menu'
export default {
  mixins: [mixinplatform, mixinutils, mixinEncryption],
  data () {
    const $q = useQuasar()
    return {
      instalation_type: ref(null),
      province: null,
      district: null,
      clinic: null,
      clinicAux: {},
      systemConfigs: new SystemConfigs(),
      instalationConfig: null,
      context: 'login context',
      $q,
      username: '',
      password: '',
      isPwd: true,
      submitting: false,
      data: {
        rememberMe: false,
        fetchUser: true
      },
      error: null,
      initialDistrict: 0,
      hasInstalationTypeConfigured: false,
      hasProvinciesOnLocalDB: false
    }
  },
  mounted () {
    this.$q.loading.show({
      message: 'Carregando ...',
      spinnerColor: 'grey-4',
      spinner: QSpinnerBall
      // delay: 400 // ms
    })
    this.loadClinics()
    this.loadProvinceAndDistrict()
    this.loadSystemConfigs()
    this.loadMenusFromLocalToVuex()
    setTimeout(() => {
      this.$q.loading.hide()
    }, 600)
  },
  computed: {
    provinces () {
      return Province.query().with('districts').has('code').get()
    },
    districts () {
      if (this.province !== null) {
        return District.query()
          .with('province')
          .where('province_id', this.province.id)
          .get()
      } else {
        return null
      }
    },
    clinics () {
      if (this.district !== null) {
        return this.getClinicsByDistrictId()
      } else {
        return null
      }
    },
    configs () {
      return SystemConfigs.query().where('key', 'INSTALATION_TYPE').first()
    }
  },
  methods: {
    async loadProvinceAndDistrict () {
      const offset = 0
      const max = 100
      Province.localDbGetAll().then((provinces) => {
        if (provinces !== null && provinces.length > 0) {
          this.hasProvinciesOnLocalDB = true
          Province.insert({ data: provinces })
        } else {
          Province.apiGetAll(offset, max).then((resp) => {
            resp.response.data.forEach((province) => {
              Province.localDbAdd(province)
            })
          })
        }
      })
      District.localDbGetAll().then((districts) => {
        if (districts !== null && districts.length > 0) {
          District.insert({ data: districts })
        } else {
          District.apiGetAll(offset, max).then((resp) => {
            resp.response.data.forEach((district) => {
              District.localDbAdd(district)
            })
          })
        }
      })
    },
    async loadSystemConfigs () {
      await SystemConfigs.localDbGetAll().then((systemConfigs) => {
        if (systemConfigs !== null && systemConfigs.length > 0) {
          this.hasInstalationTypeConfigured = true
          SystemConfigs.insert({ data: systemConfigs })
        } else {
       SystemConfigs.apiGetAll().then((resp) => {
            resp.response.data.forEach((sysConfig) => {
              SystemConfigs.localDbAdd(sysConfig)
            })
          })
        }
      })
    },
    loadMenusFromLocalToVuex () {
      Menu.localDbGetAll().then((menus) => {
        if (menus.length > 0) {
          Menu.insert({ data: menus })
        } else {
          Menu.apiGetAll().then((resp) => {
            Menu.localDbUpdateAll(resp.response.data)
          })
        }
      })
    },
    async loadClinics () {
      Clinic.localDbGetAll().then((clinics) => {
        console.log('CLINICAS:' + clinics.length)
        if (clinics !== null && clinics.length > 0) {
          Clinic.insert({ data: clinics })
          this.saveCurrClinic(
            Clinic.query()
              .with('province')
              .with('facilityType')
              .with('district.province')
              .where('mainClinic', true)
              .first()
          )
        }
      })
      if (SessionStorage.getItem('currClinic') === null || SessionStorage.getItem('currClinic') === 'null') {
        await this.loadSystemConfigs()
        setTimeout(() => {
          const sysconfig = SystemConfigs.query().where('key', 'INSTALATION_TYPE').first()
          if (sysconfig !== null && sysconfig !== undefined) {
            Clinic.apiGetByUUID(sysconfig.description).then((resp) => {
            Clinic.localDbAdd(resp.response.data)
             this.saveCurrClinic(resp.response.data)
            console.log('CURR CLINICas :' + resp.response.data.uuid + 'sysConfig:' + sysconfig)
            })
        }
           }, 900)
      }
    },
    async getAllClinicsByDistrictId (districtId) {
      await Clinic.api()
        .get('/clinic/district/' + districtId)
        .then((resp) => {})
        .catch((error) => {
          console.log(error)
        })
    },
    getClinicsByDistrictId () {
      if (this.initialDistrict !== this.district.id) {
        this.$q.loading.show({
          spinner: QSpinnerBall,
          message: 'Carregando Unidades Sanitarias. Por favor, aguarde...'
        })
        this.initialDistrict = this.district.id
        this.getAllClinicsByDistrictId(this.district.id).then((resp) => {
          this.clinic = null
          this.$q.loading.hide()
        })
      }
      return Clinic.query()
        .with('province')
        .with('district')
        .with('district.province')
        .where('district_id', this.district.id)
        .get()
    },
    async doSave () {
      this.systemConfigs.value = this.instalation_type
      this.systemConfigs.key = 'INSTALATION_TYPE'
      this.systemConfigs.description = this.instalation_type === 'LOCAL' ? this.clinic.uuid : this.province.code
      await SystemConfigs.apiSave(this.systemConfigs)
        .then((resp) => {
          SystemConfigs.localDbAdd(resp.response.data)
          this.$saveCurrClinic(this.clinic)
        })
        .catch((error) => {
          this.listErrors = []
          if (error.request.status !== 0) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total == null) {
              this.listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                this.listErrors.push(element.message)
              })
            }
          }
        })
    },
    saveCurrClinic (clinic) {
      if (clinic !== null) SessionStorage.set('currClinic', clinic)
    },
    authUser () {
      const encodedStringBtoA = btoa(
        String(this.username).concat(':').concat(this.password)
      )
      console.log({ username: this.username, password: this.password })
      this.$refs.user.validate()
      this.$refs.password.validate()
      if (!this.$refs.user.hasError && !this.$refs.password.hasError) {
        this.submitting = true
        if (this.website) {
          this.loginOnline(encodedStringBtoA)
        } else {
          User.localDbGetAll().then((users) => {
            if (users.length > 0) {
              console.log('users:' + users)
              const user = users.filter(
                (user) =>
                  (user.username === this.username &&
                    bcrypt.compareSync(this.password, user.password.substring(8))) ||
                  (user.username === this.username &&
                    this.decryptPlainText(user.password) === this.password)
              )
              if (user.length > 0 && user[0].accountLocked === false) {
                const userLoged = user[0]
                localStorage.setItem('username', userLoged.username)
                localStorage.setItem('user', this.username)
                localStorage.setItem('encodeBase64', encodedStringBtoA)
                localStorage.setItem('sync_pass', this.encryptPlainText('user.sync'))
                console.log(userLoged.authorities)
                var menus = userLoged.authorities.map((m) => m.menus).flat()
                var menusIds = menus.map((m) => m.id).flat()
                console.log(menus)
                console.log(menusIds)
                const menusVuex = Menu.findIn(menusIds)
                console.log(menusVuex)
                var menusDescription = menusVuex.map((m) => m.description).flat()
                localStorage.setItem('role_menus', menusDescription)
                localStorage.setItem('userLocalId', userLoged.id)
                this.$router.push({ path: '/' })
              } else {
                Notify.create({
                  icon: 'announcement',
                  message: 'Utilizador ou a senha inválida',
                  type: 'negative',
                  progress: true,
                  timeout: 3000,
                  position: 'top',
                  color: 'negative',
                  textColor: 'white',
                  classes: 'glossy'
                })
                this.submitting = false
              }
            } else {
              this.loginOnline(encodedStringBtoA)
            }
          })
        }
      }
    },
    loginOnline (encodedStringBtoA) {
      UsersService.login({
        username: this.username,
        password: this.password
      })
        .then((response) => {
          this.submitting = false
          console.log('Login >>>>>>>>', response)
          localStorage.setItem('id_token', response.response.data.access_token)
          localStorage.setItem('refresh_token', response.response.data.refresh_token)
          localStorage.setItem('username', response.response.data.username)
          localStorage.setItem('user', this.username)
          localStorage.setItem('encodeBase64', encodedStringBtoA)
          localStorage.setItem('role_menus', response.response.data.menus)
          localStorage.setItem('sync_pass', this.encryptPlainText('user.sync'))
          this.$router.push({ path: '/' })
        })
        .catch((error) => {
          console.log(error)
          this.submitting = false
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total == null) {
              this.listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                this.listErrors.push(element.message)
              })
            }
            console.log(this.listErrors)
          }
        })
    }
  }
}
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
