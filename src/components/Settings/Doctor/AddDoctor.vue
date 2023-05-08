<template>
  <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="q-pa-none bg-green-2">
                <div class="q-pa-md">
                    <div class="row items-center">
                        <q-icon name="psychology" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Clínico</span>
                    </div>
                </div>
                <q-separator color="grey-13" size="1px"/>
            </q-card-section>
        <form @submit.prevent="validateDoctor" >
            <q-card-section class="q-px-md">
                <div class="q-mt-lg">
                    <div class="row items-center q-mb-md">
                        <q-icon name="person_outline" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Dados Pessoais</span>
                    </div>
                    <q-separator color="grey-13" size="1px"/>
                </div>
                <div class="q-mt-md">
                    <div class="row">
                        <nameInput v-model="doctor.firstnames" ref="nome"   :disable="onlyView"/>
                        <lastNameInput v-model="doctor.lastname" class="q-ml-md" ref="apelido"   :disable="onlyView"/>
                    </div>
                     <div class="row q-mt-md">
                        <q-select
                          class="col"
                          dense outlined
                          v-model="doctor.gender"
                          :options="genders"
                          ref="gender"
                          :rules="[ val => ( val != null ) || ' Por favor indique o genero']"
                          label="Género *"
                          :disable="onlyView" />
                     </div>
                      <div class="row q-mt-md">
                    <q-select
                     class="col" dense outlined
                      v-model="doctor.clinic"
                      use-input
                      disable
                      input-debounce="0"
                      :options="clinics"
                      option-value="id"
                      option-label="clinicName"
                      ref="clinic"
                      :rules="[ val => ( val != null ) || ' Por favor indique a Farmácia']"
                      label="Farmácias"/>
                      </div>
                </div>
                <div class="q-mt-lg">
                    <div class="row items-center q-mb-md">
                        <q-icon name="call" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Contacto</span>
                    </div>
                    <q-separator color="grey-13" size="1px"/>
                </div>
                <div class="row q-mt-md">
                  <PhoneField v-model="doctor.telephone" dense label="Principal"   :disable="onlyView"/>
                   <emailInput v-model="doctor.email" dense class="q-ml-md"    :disable="onlyView"/>
                </div>
            </q-card-section>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn type="submit" :loading="submitting"  @click.once="submitting = true" label="Submeter" color="primary" v-if="!onlyView"/>
            </q-card-actions>
             <q-dialog v-model="alert.visible" persistent>
          <Dialog :type="alert.type" @closeDialog="closeDialog" >
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
        </form>
    </q-card>
</template>

<script>
import Clinic from '../../../store/models/clinic/Clinic'
import { ref } from 'vue'
import Doctor from '../../../store/models/doctor/Doctor'
import { SessionStorage } from 'quasar'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
const stringOptions = [
  'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
]
export default {
    props: ['clinic', 'selectedDoctor', 'onlyView', 'stepp'],
    mixins: [mixinplatform, mixinutils],
    data () {
        return {
          submitting: false,
           alert: ref({
              type: '',
              visible: false,
              msg: ''
            }),
            doctor: new Doctor(),
            createValue (val, done) {
              if (val.length > 2) {
                if (!stringOptions.includes(val)) {
                  done(val, 'add-unique')
                }
              }
            },
            genders: ['Masculino', 'Feminino']
        }
    },
    methods: {
        validateDoctor () {
             this.$refs.nome.$refs.ref.validate()
             this.$refs.apelido.$refs.ref.validate()
            this.$refs.gender.validate()
             this.$refs.clinic.validate()
          if (!this.$refs.nome.$refs.ref.hasError && !this.$refs.apelido.$refs.ref.hasError && !this.$refs.gender.hasError && !this.$refs.clinic.hasError) {
                this.submitDoctor()
            }
        },
        submitDoctor () {
          this.submitting = true
          this.doctor.active = true
          console.log(this.doctor)
          if (this.mobile) {
            console.log('Mobile')
            if (!this.isEditStep) {
              console.log('Create')
              this.doctor.syncStatus = 'R'
              console.log(this.doctor)
              Doctor.localDbAdd(JSON.parse(JSON.stringify(this.doctor)))
              Doctor.insert({ data: this.doctor })
              this.closeDialog()
              this.displayAlert('info', !this.isEditStep ? 'Clínico adicionado com sucesso.' : 'Clínico actualizado com sucesso.')
            } else {
                if (this.doctor.syncStatus !== 'R') this.doctor.syncStatus = 'U'
                const doctorUpdate = new Doctor(JSON.parse(JSON.stringify((this.doctor))))
                Doctor.localDbUpdate(doctorUpdate)
                this.closeDialog()
                this.displayAlert('info', !this.isEditStep ? 'Clínico adicionado com sucesso.' : 'Clínico actualizado com sucesso.')
            }
          } else {
            if (this.isCreateStep) {
              console.log('Create Step_Online_Mode')
              Doctor.apiSave(this.doctor).then(resp => {
                this.submitting = false
                  console.log(resp.response.data)
                  Doctor.apiFetchById(resp.response.data.id)
                  this.displayAlert('info', !this.isEditStep ? 'Clínico adicionado com sucesso.' : 'Clínico actualizado com sucesso.')
              }).catch(error => {
                this.submitting = false
                  this.listErrors = []
                if (error.request !== undefined && error.request.status !== 0) {
                  const arrayErrors = JSON.parse(error.request.response)
                  if (arrayErrors.total == null) {
                    this.listErrors.push(arrayErrors.message)
                  } else {
                    arrayErrors._embedded.errors.forEach(element => {
                      this.listErrors.push(element.message)
                    })
                  }
                }
                  this.displayAlert('error', this.listErrors)
              })
            } else {
              console.log('Edit Step_Online_Mode')
              Doctor.apiUpdate(this.doctor).then(resp => {
                this.submitting = false
                  console.log(resp.response.data)
                  Doctor.apiFetchById(resp.response.data.id)
                  this.displayAlert('info', !this.isEditStep ? 'Clínico adicionado com sucesso.' : 'Clínico actualizado com sucesso.')
              }).catch(error => {
                this.submitting = false
                  this.listErrors = []
                if (error.request !== undefined && error.request.status !== 0) {
                  const arrayErrors = JSON.parse(error.request.response)
                  if (arrayErrors.total == null) {
                    this.listErrors.push(arrayErrors.message)
                  } else {
                    arrayErrors._embedded.errors.forEach(element => {
                      this.listErrors.push(element.message)
                    })
                  }
                }
                  this.displayAlert('error', this.listErrors)
              })
            }
          }
        },
         displayAlert (type, msg) {
          this.alert.type = type
          this.alert.msg = msg
          this.alert.visible = true
        },
        closeDialog () {
          if (this.alert.type === 'info') {
            this.$emit('close')
          }
        }
    },
    created () {
        if (this.selectedDoctor !== '') {
          this.doctor = Object.assign({}, this.selectedDoctor)
        }
    },
    components: {
        PhoneField: require('components/Shared/Input/PhoneField.vue').default,
        nameInput: require('components/Shared/FirstNameInput.vue').default,
        lastNameInput: require('components/Shared/LastNameInput.vue').default,
        emailInput: require('components/Shared/EmailInput.vue').default,
        Dialog: require('components/Shared/Dialog/Dialog.vue').default
    },
    mounted () {
      this.setStep(this.stepp)
      this.doctor.clinic = this.currClinic
    },
    computed: {
        clinics () {
            return Clinic.query()
                           .with('nationalClinic')
                          .with('province')
                          .with('district.province')
                          .with('facilityType')
                           .has('code')
                          .get()
        },
         currClinic () {
        return Clinic.query()
                    .with('province')
                    .with('district.province')
                    .with('facilityType')
                    .where('id', SessionStorage.getItem('currClinic').id)
                    .first()
      }
    }
}
</script>

<style>

</style>
