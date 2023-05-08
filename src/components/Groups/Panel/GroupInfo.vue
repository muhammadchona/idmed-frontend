<template>
  <div>
      <div class="text-center">
            <q-icon class="profile iconColor" name="groups" size="190px" />
        </div>
      <div class="q-mt-md">
          <div class="row items-center q-mb-sm">
              <span class="text-subtitle2">Detalhes do Grupo</span>
          </div>
          <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Serviço Clínico:</div>
        <div class="col text-grey-10">{{group.service.code}}</div>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Número:</div>
        <div class="col text-grey-10">{{group.code}}</div>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Nome:</div>
        <div class="col text-grey-10">{{group.name}}</div>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Tipo:</div>
        <div class="col text-grey-10">{{group.groupType.description}}</div>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Data Início:</div>
        <div class="col text-grey-10">{{this.getDDMMYYYFromJSDate(group.startDate)}}</div>
      </div>
      <div class="row q-mb-sm">
        <div class="col-5 text-grey-9">Data Fim:</div>
        <div class="col text-grey-10">{{(group.endDate !== null && group.endDate !== '') ? this.getDDMMYYYFromJSDate(group.endDate): '-'}}</div>
      </div>
      <q-separator color="grey-13" size="1px" class="q-mb-sm"/>
      <div class="row q-my-md">
        <q-btn unelevated color="orange-5" label="Editar" class="col" @click="editGroup()" :disable="group.isDesintegrated()"/>
      </div>
      <div class="row">
        <q-btn unelevated color="primary" label="Desintegrar" class="col" @click="$emit('desintagrateGroup')" :disable="group.isDesintegrated()"/>
      </div>
</div>
</template>

<script>
import { SessionStorage } from 'quasar'
import Group from '../../../store/models/group/Group'
import moment from 'moment'
export default {
  data () {
    return {
    }
  },
  props: ['selectedPatient'],
  methods: {
    init () {

    },
    editGroup () {
      this.$emit('editGroup')
    },
    getJSDateFromDDMMYYY (dateString) {
      const dateParts = dateString.split('-')
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    },
    getDDMMYYYFromJSDate (jsDate) {
      return moment(jsDate).format('DD-MM-YYYY')
    }
  },
  created () {
    this.init()
  },
  computed: {
    group: {
      get () {
        return Group.query()
                    .with('service')
                    .with('groupType')
                    .where('id', SessionStorage.getItem('selectedGroup').id)
                    .first()
      }
    }
  },
  components: {
  }

}
</script>

<style lang="scss">
  .profile {
    border: 1px solid $grey-4;
    border-radius: 10px
  }
  .iconColor {
    color: #47161c;
  }
</style>
