<template>
  <q-card style="width: 900px; max-width: 90vw;" class="q-pt-lg">
        <form @submit.prevent="submitMobilizer" >
            <q-card-section class="q-px-md">
                <div class="q-mt-lg">
                    <div class="row items-center q-mb-md">
                        <span class="q-pl-sm text-subtitle2">Cadastro Sector Clinico(Paragem Unica)</span>
                    </div>
                    <q-separator color="grey-13" size="1px"/>
                </div>
                <div class="q-mt-md">
                    <div class="row">
                        <nameInput v-model="clinicSector.description"/>
                    </div>
                    <div class="row">
                     <codeInput
                    ref="code"
                    v-model="clinicSector.code"
                    :rules="[ val => !this.databaseCodes.includes(val) || 'o Código indicado ja existe']"
                    lazy-rules
                    label="Código" />
                    </div>
                      <div class="row q-mt-md">
                    <q-select
                     class="col" dense outlined
                      v-model="selectedClinic"
                      use-input
                      input-debounce="0"
                      hide-selected
                      :options="clinics"
                      option-value="id"
                      option-label="description"
                      label="Clinica"
                      @filter="filterClinic"/>
                      </div>
                </div>
            </q-card-section>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')"/>
                <q-btn type="submit" label="Submeter" color="primary" />
            </q-card-actions>
        </form>
    </q-card>
</template>

<script>
import Clinic from '../../store/models/clinic/Clinic'
import { ref } from 'vue'
import ClinicSector from '../../store/models/clinicSector/ClinicSector'
const stringOptions = [
  'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
]
export default {
    props: ['clinic', 'selectedClinicSector'],
    data () {
      const clinicOptions = ref(this.clinics)
        return {
            currClinic: {},
            clinicSector: new ClinicSector(),
            clinicOptions,
             clinico: '',
            createValue (val, done) {
              if (val.length > 2) {
                if (!stringOptions.includes(val)) {
                  done(val, 'add-unique')
                }
              }
            },
              filterClinic (val, update, abort) {
                const stringOptions = this.clinics
                if (val === '') {
                  update(() => {
                    this.clinicOptions = stringOptions.map(clinica => clinica)
                  })
                } else if (stringOptions.length === 0) {
                  update(() => {
                    this.clinicOptions = []
                  })
                } else {
                  update(() => {
                    this.clinicOptions = stringOptions
                      .map(clinica => clinica)
                      .filter(clinica => {
                        return clinica &&
                            clinica.designacao.toLowerCase().indexOf(val.toLowerCase()) !== -1
                      })
                  })
                }
              }
        }
    },
    methods: {
        getAllClinics (offset) {
            if (this.clinics.length <= 0) {
                    ClinicSector.api().get('/clinic?offset=' + offset + '&max=100').then(resp => {
                        offset = offset + 100
                        if (resp.response.data.length > 0) { setTimeout(this.getAllClinics(offset), 2) }
                    }).catch(error => {
                        console.log(error)
                    })
            }
        },
          extractDatabaseCodes () {
        this.clinicos.forEach(element => {
            this.databaseCodes.push(element.code)
    })
    }
    },
    created () {
        this.currClinic = Object.assign({}, this.clinic)
        if (this.selectedClinicSector !== '') {
          this.clinicSector = Object.assign({}, this.selectedClinicSector)
        } else {
          this.clinicSector.clinic = Object.assign({}, this.clinic)
        }
    },
    components: {
        nameInput: require('components/Shared/NameInput.vue').default,
        codeInput: require('components/Shared/CodeInput.vue').default
    },
    mounted () {
        const offset = 0
        this.clinicOptions = this.getAllClinics(offset)
    },
    computed: {
        clinics () {
            return Clinic.all()
        },
        clinicsSector () {
            return ClinicSector.all()
        }
    }
}
</script>

<style>

</style>
