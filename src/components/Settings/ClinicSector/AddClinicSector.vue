<template>
<q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="q-pa-none bg-green-2">
                <div class="q-pa-md">
                    <div class="row items-center">
                        <q-icon name="local_pharmacy" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Sector Clínico</span>
                    </div>
                </div>
                <q-separator color="grey-13" size="1px"/>
            </q-card-section>
        <form @submit.prevent="validateClinicSector" >
            <q-card-section class="q-px-md">
               <div class="row q-mt-md">
                <nameInput
                    v-model="clinicSector.description"
                    label="Nome do Sector Clínico *"
                    ref="nome"
                     :disable="onlyView" />
            </div>
              <div class="row q-mt-md">
                <codeInput
                    ref="code"
                    v-model="clinicSector.code"
                   :rules="[val => codeRules (val)]"
                    lazy-rules
                     :disable="onlyView"
                    label="Código *" />
            </div>
               <div class="row q-mb-md">
                <q-select
                    dense outlined
                    class="col"
                    :disable="onlyView"
                    v-model="clinicSector.clinicSectorType"
                    :options="clinicSectorTypes"
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    ref="clinicSectorRef"
                    option-value="id"
                    option-label="description"
                    :rules="[ val => ( val != null ) || ' Por favor indique o tipo de Sector']"
                    lazy-rules
                    label="Tipo de Sector Clinico" />
            </div>
             <div class="row q-mb-md">
                <q-select
                    dense outlined
                    class="col"
                    v-model="clinicSector.clinic"
                    :options="clinics"
                    disable
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    ref="clinic"
                    option-value="id"
                    option-label="clinicName"
                    :rules="[ val => ( val != null ) || ' Por favor indique a clinica']"
                    lazy-rules
                    label="Clinica" />
            </div>
            </q-card-section>
           <q-card-actions align="right" class="q-mb-md">
              <q-btn label="Cancelar" color="red" @click.once="$emit('close')"/>
                <q-btn type="submit" :loading="submitting" @click.once="submitting = true"  label="Submeter"  color="primary" v-if="!onlyView"/>
            </q-card-actions>
             <q-dialog v-model="alert.visible" persistent>
             <Dialog :type="alert.type"  @closeDialog="closeDialog">
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
import ClinicSector from '../../../store/models/clinicSector/ClinicSector'
import ClinicSectorType from '../../../store/models/clinicSectorType/ClinicSectorType'
import { SessionStorage } from 'quasar'
import { v4 as uuidv4 } from 'uuid'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
export default {
      props: ['selectedClinicSector', 'onlyView', 'stepp'],
      mixins: [mixinplatform, mixinutils],
    data () {
        return {
            databaseCodes: [],
            submitting: false,
           clinicSector: new ClinicSector(),
            alert: ref({
              type: '',
              visible: false,
              msg: ''
            })
        }
    },
    created () {
       // this.currClinicSector = Object.assign({}, this.newClinicSector)
          if (this.clinicSector !== '') {
          this.clinicSector = Object.assign({}, this.selectedClinicSector)
          }
    },
      mounted () {
        this.setStep(this.stepp)
        const offset = 0
        this.getAllClinics(offset)
        this.extractDatabaseCodes()
     this.clinicSector.clinic = this.currClinic
    },
    computed: {
         clinics () {
            return Clinic.query()
                        .with('province')
                        .with('district.province')
                        .with('facilityType')
                        .has('code')
                        .get()
        },
          clinicSectors () {
            return ClinicSector.query().withAll().where('clinic_id', this.currClinic.id).get()
        },
        currClinic () {
        return Clinic.query()
                    .with('province')
                    .with('district.province')
                    .with('facilityType')
                    .where('id', SessionStorage.getItem('currClinic').id)
                    .first()
      },
        clinicSectorTypes () {
            return ClinicSectorType.all()
        }
    },
    methods: {
    validateClinicSector () {
            this.$refs.nome.$refs.ref.validate()
             this.$refs.code.$refs.ref.validate()
             this.$refs.clinicSectorRef.validate()
              this.$refs.clinic.validate()
               if (!this.$refs.nome.$refs.ref.hasError && !this.$refs.code.$refs.ref.hasError &&
             !this.$refs.clinic.hasError && !this.$refs.clinicSectorRef.hasError) {
                this.submitClinicSector()
            }
        },
         submitClinicSector () {
          this.clinicSector.active = true
          if (this.clinicSector.uuid === null) this.clinicSector.uuid = uuidv4()
          console.log(this.clinicSector)
          if (this.mobile) {
            console.log('Mobile')
            this.clinicSector.clinic_id = this.currClinic.id
            this.clinicSector.clinic_sector_type_id = this.clinicSector.clinicSectorType.id
            if (!this.isEditStep) {
              console.log('Create Step')
              this.clinicSector.syncStatus = 'R'
              console.log(this.clinicSector)
              ClinicSector.localDbAdd(JSON.parse(JSON.stringify(this.clinicSector))).then(item => {
                ClinicSector.insert({ data: this.clinicSector })
              })
            } else {
              console.log('Edit Step')
                if (this.clinicSector.syncStatus !== 'R') this.clinicSector.syncStatus = 'U'
                const clinicSecUpdate = new ClinicSector(JSON.parse(JSON.stringify((this.clinicSector))))
                  ClinicSector.localDbUpdate(clinicSecUpdate).then(groupRes => {
                  ClinicSector.update({ data: clinicSecUpdate })
                })
            }
            this.displayAlert('info', !this.isEditStep ? 'Sector Clínico adicionado com sucesso.' : 'Sector Clínico actualizado com sucesso.')
          } else {
            if (this.isCreateStep) {
              console.log('Create Step_Online_Mode')
              ClinicSector.apiSave(this.clinicSector).then(resp => {
                 this.submitting = false
                this.displayAlert('info', !this.isEditStep ? 'Sector Clínico adicionado com sucesso.' : 'Sector Clínico actualizado com sucesso.')
              }).catch(error => {
                  this.displayAlert('error', error)
                  this.submitting = false
              })
            } else {
              console.log('Edit Step_Online_Mode')
              ClinicSector.apiUpdate(this.clinicSector).then(resp => {
                console.log(resp.response.data)
                this.displayAlert('info', !this.isEditStep ? 'Sector Clínico adicionado com sucesso.' : 'Sector Clínico actualizado com sucesso.')
              }).catch(error => {
                  this.displayAlert('error', error)
              })
            }
        }
        },
        getAllClinics (offset) {
        if (this.clinics.length <= 0) {
                Clinic.api().get('/clinic?offset=' + offset + '&max=100').then(resp => {
                    offset = offset + 100
                    if (resp.response.data.length > 0) { setTimeout(this.getAllClinics(offset), 2) }
                }).catch(error => {
                    console.log(error)
                })
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
        },
    extractDatabaseCodes () {
        this.clinicSectors.forEach(element => {
            this.databaseCodes.push(element.code)
    })
    },
    codeRules (val) {
      if (this.clinicSector.code === '') {
        return 'o Código é obrigatorio'
      } else if ((this.databaseCodes.includes(val) && this.selectedClinicSector.id === this.clinicSector.id && !this.isEditStep) ||
      ((this.databaseCodes.includes(val) && this.clinicSectors.filter(x => x.code === val)[0].id !== this.clinicSector.id && this.isEditStep))) {
      return !this.databaseCodes.includes(val) || 'o Código indicado já existe'
         }
    }
    },
    components: {
        nameInput: require('components/Shared/NameInput.vue').default,
        codeInput: require('components/Shared/CodeInput.vue').default,
        Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }

}
</script>

<style>
    .fild-radius {
        border-radius: 5px;
    }
</style>
