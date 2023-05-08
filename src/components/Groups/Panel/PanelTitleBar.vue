<template>
  <div class="row q-mb-sm">
    <div class="col">
      <div class="row q-ml-lg">
        <div class="col-3 q-mt-sm">
          <q-btn
            outline
            round
            color="primary"
            size="xl"
            icon="groups"
            @click="$emit('showGroupDetails')"/>
        </div>
        <div class="col q-pt-md">
          <div class="row q-mb-sm text-weight-bold text-h6 text-orange-7">{{name}}</div>
          <div class="row text-subtitle2 text-grey-9">Tipo: <span class=" text-subtitle2 text-primary">  {{groupType}}</span></div>
        </div>
      </div>
    </div>
    <div class="col-5 text-center">
      <div class="q-mt-md q-pt-md text-subtitle1 text-grey-14"><slot></slot></div>
    </div>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  props: ['name', 'groupType']
}
</script>

<style>

</style>
