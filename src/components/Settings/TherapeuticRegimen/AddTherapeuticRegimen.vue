<template>
  <q-card style="width: 900px; max-width: 90vw;" class="q-pt-lg">
     <q-card-section>
            <div class="text-h6">Regime Terapêutico</div>
        </q-card-section>
        <form @submit.prevent="validateTherapeuticRegimen" >
            <q-card-section class="q-px-md">
                <div class="q-mt-md">
                    <div class="row">
                        <nameInput v-model="therapeuticRegimen.regimenScheme" :disable="onlyView" label="Esquema do Regime*" ref="esquema" />
                    </div>
                     <div class="row q-mt-md">
                       <nameInput v-model="therapeuticRegimen.description" :disable="onlyView"  ref="nome" />
                    </div>
                    <div class="row q-mt-md">
                        <codeInput v-model="therapeuticRegimen.code"
                        :disable="onlyView"
                        ref="code"
                        :rules="[val => codeRules (val)]"
                        lazy-rules />
                    </div>
                     <div class="row q-mt-md">
       <q-table
          style="height: 500px"
          class="col"
          title="Medicamentos"
          :rows="drugs"
          :columns="columnsDrug"
          :filter="filter"
          row-key="fnmCode"
          selection="multiple"
          v-model:selected="therapeuticRegimen.drugs"
          v-if="!onlyView"
        >
         <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
                </q-input>
        </template>
       </q-table>
             <q-table
      class="col"
      title="Medicamentos"
      :rows="drugs"
      :columns="columnsDrug"
      row-key="fnmCode"
      v-if="onlyView"
        />
                    </div>
                </div>
            </q-card-section>
           <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn label="Cancelar" color="red" @click="$emit('close')" />
                <q-btn type="submit" :loading="submitting" label="Submeter" color="primary" v-if="!onlyView"/>
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
import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'
import { ref } from 'vue'
import Drug from '../../../store/models/drug/Drug'
// import TherapeuticRegimensDrug from '../../../store/models/therapeuticRegimen/TherapeuticRegimensDrug'
const stringOptions = [
  'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
]
const columnsDrug = [
  { name: 'fnmCode', required: true, label: 'Código FNM', align: 'left', field: row => row.fnmCode, format: val => `${val}`, sortable: true },
  { name: 'name', required: true, label: 'Nome', align: 'left', field: row => row.name, format: val => `${val}`, sortable: true }
]
export default {
    props: ['selectedTherapeuticRegimen', 'onlyView'],
    data () {
      const formOptions = ref(this.forms)
        return {
          submitting: false,
          columnsDrug,
          filter: ref(''),
           alert: ref({
              type: '',
              visible: false,
              msg: ''
            }),
            therapeuticRegimen: new TherapeuticRegimen(),
            formOptions,
            selectedDrugs: [],
            databaseCodes: [],
            periodsTime: ['Ano', 'Mes', 'Semana', 'Dia'],
            createValue (val, done) {
              if (val.length > 2) {
                if (!stringOptions.includes(val)) {
                  done(val, 'add-unique')
                }
              }
            }
        }
    },
    methods: {
          validateTherapeuticRegimen () {
              this.$refs.esquema.$refs.ref.validate()
            this.$refs.nome.$refs.ref.validate()
             // this.$refs.code.$refs.ref.validate()
            if (!this.$refs.esquema.$refs.ref.hasError && !this.$refs.nome.$refs.ref.hasError) {
                this.submitTherapeuticRegimen()
            }
        },
     async   submitTherapeuticRegimen () {
       this.submitting = true
        this.therapeuticRegimen.active = true
            console.log(this.therapeuticRegimen)
       await TherapeuticRegimen.apiSave(this.therapeuticRegimen).then(resp => {
         this.submitting = false
                console.log(resp.response.data.id)
              TherapeuticRegimen.apiFetchById(resp.response.data.id)
                this.displayAlert('info', 'Regime Terapêutico gravado com sucesso.')
            }).catch(error => {
              this.submitting = false
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
        this.therapeuticRegimens.forEach(element => {
            this.databaseCodes.push(element.code)
    })
    },
        codeRules (val) {
       if (!this.therapeuticRegimen.id && this.selectedTherapeuticRegimen.id === this.therapeuticRegimen.id) {
      return !this.databaseCodes.includes(val) || 'o Código indicado ja existe'
         }
    }
    },
    created () {
        if (this.therapeuticRegimen !== '') {
          this.therapeuticRegimen = Object.assign({}, this.selectedTherapeuticRegimen)
         // console.log(this.therapeuticRegimensDrug.id)
        }
          this.extractDatabaseCodes()
    },
    components: {
        nameInput: require('components/Shared/NameInput.vue').default,
         codeInput: require('components/Shared/CodeInput.vue').default,
        Dialog: require('components/Shared/Dialog/Dialog.vue').default
        //   details1: require('components/Settings/TherapeuticRegimen/details.vue').default
    },
    mounted () {
    },
    computed: {
        drugs () {
           if (this.onlyView) {
          return this.therapeuticRegimen.drugs
        } else {
             return Drug.query().with('form').where('active', true).get()
        }
      },
      therapeuticRegimens () {
             return TherapeuticRegimen.query().with('drugs.form').get()
      }
    }
}
</script>

<style>

</style>
