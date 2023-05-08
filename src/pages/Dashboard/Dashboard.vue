<template>
<div>
   <Charts :dataLoaded=dataLoaded> </Charts>
</div>
</template>

<script>
  import { ref } from 'vue'
export default {
   data () {
     return {
       dataLoaded: ref(false)
     }
   },
    components: {
        Charts: require('components/Dashboard/ApexCharts/Charts.vue').default
    },
    mounted () {
      this.dataLoaded = true
    }
}
</script>

<style>

</style>
