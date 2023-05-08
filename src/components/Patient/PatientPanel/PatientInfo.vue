<template>
  <div>
      <div class="text-center q-mb-md">
            <q-icon class="profile" :name="selectedPatient.gender == 'Feminino' ? 'female' : 'male'" size="120px" color="primary"/>
        </div>
      <div class="">
          <div class="row items-center q-mb-sm">
              <q-icon name="person_outline" size="sm"/>
              <span class="q-pl-sm text-subtitle2">Dados Pessoais</span>
          </div>
          <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Nome</div>
        <div class="col text-grey-10">{{selectedPatient.fullName}}</div>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Idade</div>
        <div class="col text-grey-10">{{this.idadeCalculator(this.getDDMMYYYFromJSDate(selectedPatient.dateOfBirth))}} Anos </div>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Gênero</div>
        <div class="col text-grey-10">{{selectedPatient.gender}}</div>
      </div>

      <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
                        <q-icon name="house" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Endereço</span>
                    </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Província</div>
          <div class="col text-grey-10">{{selectedPatient.province.description}}</div>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Distrito</div>
          <div class="col text-grey-10">{{selectedPatient.district.description}}</div>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Posto Administrativo</div>
          <div class="col text-grey-10">{{selectedPatient.postoAdministrativoName()}}</div>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Bairro</div>
          <div class="col text-grey-10">{{selectedPatient.bairroName()}}</div>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Local Referência</div>
          <div class="col text-grey-10">{{selectedPatient.addressReference}}</div>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Morada</div>
          <div class="col text-grey-10">{{selectedPatient.address}}</div>
        </div>

        <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
                        <q-icon name="call" size="sm"/>
                        <span class="q-pl-sm text-subtitle2">Contacto</span>
                    </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Principal</div>
          <div class="col text-grey-10">{{selectedPatient.cellphone}}</div>
        </div>
        <div class="row q-mb-sm">
          <div class="col-5 text-grey-9">Alternativo</div>
          <div class="col text-grey-10">{{selectedPatient.alternativeCellphone}}</div>
        </div>
        <div class="row q-my-md">
          <q-btn unelevated color="orange-5" label="Editar" class="col" @click="editPatient()"/>
        </div>
        <div class="row">
          <q-btn unelevated color="primary" label="Unir Duplicados" class="col" />
        </div>
        <q-dialog persistent v-model="showPatientRegister">
          <patientRegister
            :selectedPatient="patient"
            :clinic="currClinic"
            :stepp="step"
            @close="showPatientRegister = false" />
        </q-dialog>
        <span >
        </span>
</div>
</template>

<script>
import { SessionStorage } from 'quasar'
import Patient from '../../../store/models/patient/Patient'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import Province from '../../../store/models/province/Province'
export default {
    mixins: [mixinplatform, mixinutils],
  data () {
    return {
      showPatientRegister: false,
      patient: {}
    }
  },
  props: ['selectedPatient'],
  methods: {
    init () {
      this.patient = this.selectedPatient
      this.changeToDisplayStep()
      if (this.selectedPatient === null && this.website) {
        Patient.apiFetchById(SessionStorage.getItem('selectedPatient').id)
      }
      if (this.mobile) {
        Province.localDbGetAll().then(idTypes => {
          Province.insertOrUpdate({ data: idTypes })
        })
      }
    },
    editPatient () {
      console.log(this.selectedPatient)
      this.patient = this.selectedPatient
      this.changeToEditStep()
      this.showPatientRegister = true
    }
  },
  created () {
    this.init()
  },
  mounted () {
    this.init()
  },
  computed: {
  },
  components: {
    patientRegister: require('components/Patient/Register/PatientRegister.vue').default
  }
}
</script>

<style lang="scss">
  .profile {
    border: 1px solid $grey-4;
    border-radius: 10px
  }
</style>
