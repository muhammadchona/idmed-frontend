import { useMediaQuery } from '@vueuse/core';
import { useQuasar } from 'quasar';
import { computed } from 'vue';

const $q = useQuasar();

export function useSystemUtils() {
  const isWebScreen = useMediaQuery('(min-width: 1024px)');
  const website = computed(() => (isWebScreen.value ? true : false));

  const isDeskTop = computed(() => ($q.platform.is.desktop ? true : false));
  const isMobile = computed(() => ($q.platform.is.mobile ? true : false));
  const isElectron = computed(() => ($q.platform.is.electron ? true : false));

  return { website, isDeskTop, isMobile, isElectron };
}
