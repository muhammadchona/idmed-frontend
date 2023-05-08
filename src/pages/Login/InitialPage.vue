
<template>
 <q-layout v-cloak >
    <q-page-container>
      <q-page class="flex flex-center">
       <div id="particles-js" :class="$q.dark.isActive ? 'dark_gradient' : 'normal_gradient'"></div>
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
          <q-card v-bind:style="this.$q.screen.lt.sm?{'width': '80%'}:{'width':'50%','height':'950px','border-radius': '50%'}">
            <q-card-section>
           <div class="col-auto text-grey text-caption q-pt-sm row no-wrap items-center justify-center">
            <q-avatar size="250px">
            <q-img src="~assets/LogoiDMED.png"/>
            </q-avatar>
            </div>
              <div class="row q-pa-sm text-center q-mt-md column">
                  <div style="font-family: 'line-awesome';font-size: 40px;" class="row text-center column q-pa-md text-gray text-subtitle1 ellipsis">Sistema Inteligente para Dispensa</div>
                  <div style="font-family: 'line-awesome';font-size: 40px;" class="row text-center column text-gray text-subtitle1 ellipsis"> de Medicamentos </div>
              </div>
            </q-card-section>
            <q-card-section align="center">
              <q-form class="q-gutter-md" @submit.prevent="doSave">
            <div class="q-pa-sm text-center justify-center" style="max-width: 50%">
            <div class="q-pa-md">
    <div class="q-gutter-sm">
      <q-radio v-model="instalation_type" val="PROVINCIAL" label="Provincial" />
      <q-radio v-model="instalation_type" val="LOCAL" label="Local" />
    </div>
            </div>
            <div class="row q-mb-sm">
                         <q-select
                    dense outlined
                    class="col"
                    v-model="province"
                    :options="provinces"
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    ref="province"
                    option-value="id"
                    option-label="description"
                    :rules="[ val => ( val != null ) || ' Por favor indique a província']"
                    lazy-rules
                    label="Província *" />
            </div>
            <div class="row q-mb-sm" v-if= "instalation_type === 'LOCAL'">
                  <q-select
                    class="col"
                    dense outlined
                     transition-show="flip-up"
                    transition-hide="flip-down"
                    v-model="district"
                    :options="districts"
                    ref="district"
                    option-value="id"
                    option-label="description"
                    :rules="[ val => ( val != null) || ' Por favor indique o Distrito']"
                    lazy-rules
                    label="Distrito" />
            </div>
             <div class="row q-mb-sm" v-if= "instalation_type === 'LOCAL'">
                <q-select
                    dense outlined
                    class="col"
                    v-model="clinic"
                    :options="clinics"
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    ref="clinic"
                    option-value="id"
                    option-label="clinicName"
                    :rules="[ val => ( val != null ) || ' Por favor indique a clinica']"
                    lazy-rules
                    label="Clinica" />
            </div>
            <div class="row">
                <q-btn
                    :loading="submitting"
                    class="full-width q-py-sm"
                    unelevated rounded
                    color="primary"
                    type="submit"
                    label="Proximo" />
            </div>
            </div>
              </q-form>
            </q-card-section>
            <q-card-section align="center">
              <div class="row justify-center q-pt-xl q-py-xl q-gutter-xl">
              <div class="justify-left q-pt-md q-py-md">
                <q-avatar round size="130px" style="opacity: 40%">
                  <q-img src="~assets/MoHLogo.png"/>
                </q-avatar>
              </div>
               <div class="q-pb-md">
                <q-avatar square size="190px" style="opacity: 40%">
                  <q-img src="~assets/pepfar-new-logo.jpeg"/>
                </q-avatar>
              </div>
              </div>
            </q-card-section>
          </q-card>
        </transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { QSpinnerBall, useQuasar } from 'quasar'
import Province from '../../store/models/province/Province'
import District from '../../store/models/district/District'
import Clinic from 'src/store/models/clinic/Clinic'
import { ref } from 'vue'
import SystemConfigs from 'src/store/models/systemConfigs/SystemConfigs'

export default ({
  data () {
     const $q = useQuasar()
    return {
      instalation_type: ref(null),
      context: 'login context',
      $q,
      province: null,
      district: null,
      clinic: null,
      systemConfigs: new SystemConfigs(),
      instalationConfig: null
    }
  },
  created () {
    this.$q.loading.show({
      message: 'Carregando ...',
      spinnerColor: 'grey-4',
      spinner: QSpinnerBall
      // delay: 400 // ms
    })
 this.loadProvinceAndDistrict()
    setTimeout(() => {
      this.$q.loading.hide()
    }, 1500)
  },
   mounted () {
   this.instalationConfig = SystemConfigs.query().where('key', 'INSTALATION_TYPE').first()
    if (this.instalationConfig !== null) {
    this.$router.push({ path: '/Login' })
    }
},
  computed: {
     provinces () {
            return Province.query().with('districts').has('code').get()
        },
        districts () {
        if (this.province !== null) {
            return District.query().with('province').where('province_id', this.province.id).get()
        } else {
            return null
        }
  },
   clinics () {
        if (this.district !== null) {
            return Clinic.query().with('province.district').where('district_id', this.district.id).get()
        } else {
            return null
        }
  }
  },
  methods: {
    loadProvinceAndDistrict () {
         const offset = 0
        const max = 100
         SystemConfigs.apiGetAll()
        Province.apiGetAll(offset, max)
        District.apiGetAll(offset, max)
        Clinic.apiGetAll(offset, max)
    },
       async doSave () {
       this.systemConfigs.value = this.instalation_type
       this.systemConfigs.key = 'INSTALATION_TYPE'
       this.systemConfigs.description = this.instalation_type === 'LOCAL' ? this.clinic.uuid : this.province.code
        await SystemConfigs.apiSave(this.systemConfigs).then(resp => {
       // this.displayAlert('info', 'Dados do paciente gravados com sucesso.')
          this.$router.push({ path: '/Login' })
           }).catch(error => {
            this.listErrors = []
          if (error.request.status !== 0) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total == null) {
              this.listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach(element => {
                this.listErrors.push(element.message)
              })
            }
          }
         //   this.displayAlert('error', this.listErrors)
          })
      }
  }
})
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
  background: linear-gradient(145deg, #00AFDB 30%, #00BEA4 70%);
}
.dark_gradient {
  background: linear-gradient(145deg, #014758 15%, #014b41 70%);
}
.login-form {
  position: absolute;
}
</style>
