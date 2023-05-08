<template>
  <div>
      <div>
              <StockTable :isCharts="isCharts" :dataLoaded=dataLoaded :serviceCode=serviceCode />
      </div>
  </div>
</template>

<script>

export default {
     props: ['isCharts', 'dataLoaded', 'serviceCode'],
  data () {
    return {
    }
  },
  methods: {
  },
  components: {
    StockTable: require('components/Stock/StockTable.vue').default
  }

}
</script>

<style>

</style>
