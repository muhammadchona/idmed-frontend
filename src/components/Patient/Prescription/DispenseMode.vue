<template>
  <q-banner
    dense
    inline-actions
    :class="[bgColor, headerClass]"
    class="text-white q-pa-none"
  >
    <span class="text-bold text-subtitle1 vertical-middle q-pl-md"
      ><slot></slot
    ></span>
    <template v-slot:action>
      <div class="q-pa-md">
        <div class="q-gutter-sm">
          <q-radio
            v-model="mds"
            checked-icon="task_alt"
            unchecked-icon="panorama_fish_eye"
            val="US"
            label="Farmácia Pública"
          />
          <q-radio
            v-model="mds"
            checked-icon="task_alt"
            unchecked-icon="panorama_fish_eye"
            val="DD"
            label="Dipensa Descentralizada"
          />
          <q-radio
            v-model="mds"
            checked-icon="task_alt"
            unchecked-icon="panorama_fish_eye"
            val="DC"
            label="Dispensa Comunitária"
          />
          <q-select
            dense
            outlined
            v-model="dispenseMode"
            :options="dispenseModes"
            option-value="id"
            option-label="description"
            label="Modo de dispensa"
          />
        </div>
      </div>
    </template>
  </q-banner>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import DispenseMode from 'src/store/models/dispenseMode/DispenseMode';
const mds = ref('US');
const dispenseMode = ref([]);

// Hook
onMounted(() => {
  if (this.website) {
    this.doDispenseModeGetAll(0);
  }
});

// Computed
const dispenseModes = computed(() => {
  return DispenseMode.all();
});
// Methods
const submitForm = () => {
  this.$emit('proccedToDispense', this.dispenseMode);
};
const doDispenseModeGetAll = (offset) => {
  DispenseMode.api()
    .get('/dispenseMode?offset=' + offset + '&max=100')
    .then((resp) => {
      offset = offset + 100;
      if (resp.response.data.length > 0) {
        setTimeout(this.doDispenseModeGetAll(offset), 2);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>

<style></style>
