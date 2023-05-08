<template>

     <div class="row q-mb-md">

                    <q-input
                        dense
                        outlined
                        :disable="false"
                        class="col q-mr-md"
                        v-model="startDate"
                        @input="$emit('update:startDate', $event.target.value)"
                        label="Data Início">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="startDate"  mask="DD-MM-YYYY" @input="updateDate($event)">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input
                            dense
                            outlined
                            :disable="false"
                            class="col q-mr-md"
                            v-model="thruDate"
                            label="Data Fim">
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                    <q-date v-model="thruDate" mask="DD-MM-YYYY" @input="$emit('update:thruDate', $event.target.value)">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                    </q-date>
                                </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
       </div>
  </template>

<script>
    import { ref } from 'vue'
    import { date } from 'quasar'
    import moment from 'moment'

    export default {
      props: ['value', 'label','initProcessing'],
      data () {
        return {
          startDate: '',
          thruDate: '',
          model: ref(new Date().getFullYear()),
          semestres: [
            { id: 1, description: 'Semestre 1' },
            { id: 2, description: 'Semestre 2' }
          ]
        }
      },
      methods: {
          getJSDateFromDDMMYYY (dateString) {
              const dateParts = dateString.split('-')
              return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
          },
          getDDMMYYYFromJSDate (jsDate) {
              return moment(jsDate).format('DD-MM-YYYY')
          },
          formatDate (dateString) {
              return date.formatDate(dateString, 'YYYY-MM-DD')
          },
          displayAlert (type, msg) {
              this.alert.type = type
              this.alert.msg = msg
              this.alert.visible = true
          },
          closeDialog () {
              this.alert.visible = false
          }
      }
            }
</script>
