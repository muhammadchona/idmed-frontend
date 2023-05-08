<template>
<q-card style="width: 900px; max-width: 90vw;" class="q-pt-lg">
        <form @submit.prevent="validateNationalClinic" >
            <q-card-section class="q-px-md">
               <div class="row q-mt-md">
                <nameInput
                    ref="nome"
                    v-model="nationalClinic.facilityName"
                    :disable="onlyView"
                    label="Nome da Unidade Sanitária" />
            </div>
              <div class="row q-mt-md">
                <codeInput
                    ref="code"
                    v-model="nationalClinic.code"
                   :rules="[val => codeRules (val)]"
                   :disable="onlyView"
                    lazy-rules
                    label="Código" />
            </div>
              <div class="row q-mb-md">
                <q-select
                    class="col"
                    dense outlined
                     transition-show="flip-up"
                    transition-hide="flip-down"
                    :disable="onlyView"
                    v-model="nationalClinic.facilityType"
                    :options="facilityTypes"
                    ref="facilityType"
                    option-value="id"
                    option-label="description"
                    :rules="[ val => ( val != null) || ' Por favor indique o tipo de instalação']"
                    lazy-rules
                    label="Tipo de instalação" />
            </div>
             <div class="row q-mb-md">
                <q-select
                    dense outlined
                    class="col"
                    v-model="nationalClinic.province"
                    :options="provinces"
                    :disable="onlyView"
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    ref="province"
                    option-value="id"
                    option-label="description"
                    :rules="[ val => ( val != null ) || ' Por favor indique a província']"
                    lazy-rules
                    label="Província" />
            </div>
            <div class="row q-mt-md">
                  <PhoneField v-model="nationalClinic.telephone" dense label="Numero de Telefone" :disable="onlyView"/>
                </div>
            </q-card-section>
           <q-card-actions align="right" class="q-mb-md">
              <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn type="submit" label="Submeter" color="primary" v-if="!onlyView"/>
            </q-card-actions>
           <q-dialog v-model="alert.visible" persistent>
             <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
             </q-dialog>
        </form>
    </q-card>
</template>

<script>
import NationalClinic from '../../../store/models/nationalClinic/NationalClinic'
import Province from 'src/store/models/province/Province'
import FacilityType from '../../../store/models/facilityType/FacilityType'
import { ref } from 'vue'
export default {
      props: ['selectedNationalClinic', 'onlyView'],
    data () {
        return {
            databaseCodes: [],
           nationalClinic: new NationalClinic(),
             alert: ref({
              type: '',
              visible: false,
              msg: ''
            })
        }
    },
    created () {
       //  this.nationalClinic = Object.assign({}, this.nationalClinic)
        if (this.selectedNationalClinic !== '') {
          this.nationalClinic = Object.assign({}, this.selectedNationalClinic)
        } else {
          this.nationalClinic.facilityType = Object.assign({}, this.facilityType)
        }
    },
      mounted () {
        this.extractDatabaseCodes()
    },
    computed: {
         nationalClinics () {
            return NationalClinic.all()
        },
          provinces () {
             return Province.query().with('districts').has('code').get()
        },
        facilityTypes () {
          return FacilityType.all()
        }
    },
    methods: {
    validateNationalClinic () {
              this.$refs.nome.$refs.ref.validate()
             this.$refs.code.$refs.ref.validate()
              this.$refs.facilityType.validate()
               this.$refs.province.validate()
             if (!this.$refs.nome.$refs.ref.hasError && !this.$refs.code.$refs.ref.hasError &&
             !this.$refs.facilityType.hasError && !this.$refs.province.hasError) {
                this.submitNationalClinic()
            }
        },
        submitNationalClinic () {
            console.log(this.nationalClinic)
            this.nationalClinic.active = true
            this.nationalClinic.province.districts = []
            NationalClinic.apiSave(this.nationalClinic).then(resp => {
                console.log(resp.response.data)
             //  this.$emit('close')
                 this.displayAlert('info', this.nationalClinic.id === null ? 'Unidade Sanitária adicionada com sucesso.' : 'Unidade Sanitária actualizado com sucesso.')
            }).catch(error => {
                this.displayAlert('error', error)
            })
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
        this.nationalClinics.forEach(element => {
            this.databaseCodes.push(element.code)
    })
    },
    codeRules (val) {
      if (this.nationalClinic.code === '') {
        return 'o Código é obrigatorio'
      } else if (!this.nationalClinic.id && this.selectedNationalClinic.id === this.nationalClinic.id) {
      return !this.databaseCodes.includes(val) || 'o Código indicado já existe'
         }
    }
    },
    components: {
        nameInput: require('components/Shared/NameInput.vue').default,
        codeInput: require('components/Shared/CodeInput.vue').default,
         PhoneField: require('components/Shared/Input/PhoneField.vue').default,
          Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }

}
</script>

<style>
    .fild-radius {
        border-radius: 5px;
    }
</style>
