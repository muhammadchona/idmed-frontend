<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
    <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Página Inicial"
        no-caps
      />
      <div>
      <q-avatar square size="800px" align="center">
       <q-img src="~assets/emManuntecao.png"/>
      </q-avatar>
      </div>

      <div class="text-h2" style="opacity:.4">
        Oops!!! <q-icon name="mood_bad"/>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Error404'
})
</script>
