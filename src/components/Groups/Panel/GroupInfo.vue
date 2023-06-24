<template>
  <div>
    <div class="text-center">
      <q-icon
        class="profile iconColor"
        name="groups"
        size="190px"
      />
    </div>
    <div class="q-mt-md">
      <div class="row items-center q-mb-sm">
        <span class="text-subtitle2">Detalhes do Grupo</span>
      </div>
      <q-separator
        color="grey-13"
        size="1px"
        class="q-mb-sm"
      />
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
      <div class="col text-grey-10">{{getDDMMYYYFromJSDate(group.startDate)}}</div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-5 text-grey-9">Data Fim:</div>
      <div class="col text-grey-10">{{(group.endDate !== null && group.endDate !== '') ? getDDMMYYYFromJSDate(group.endDate): '-'}}</div>
    </div>
    <q-separator
      color="grey-13"
      size="1px"
      class="q-mb-sm"
    />
    <div class="row q-my-md">
      <q-btn
        unelevated
        color="orange-5"
        label="Editar"
        class="col"
        @click="$emit('editGroup')"
        :disable="useGroup().isDesintegrated(group)"
      />
    </div>
    <div class="row">
      <q-btn
        unelevated
        color="primary"
        label="Desintegrar"
        class="col"
        @click="$emit('desintagrateGroup')"
        :disable="useGroup().isDesintegrated(group)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, provide, ref, watch } from 'vue';
import { SessionStorage } from 'quasar'
import groupService from 'src/services/api/group/groupService';
import moment from 'moment'
import {  useGroup } from 'src/composables/group/groupMethods';
//falta botao EDITgROUp

const getDDMMYYYFromJSDate = (jsDate) => {
  return moment(jsDate).format('DD-MM-YYYY')
}
const group = inject('group')
console.log(group)
const emit = defineEmits([
  'editGroup',
  'desintagrateGroup'
]);
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
