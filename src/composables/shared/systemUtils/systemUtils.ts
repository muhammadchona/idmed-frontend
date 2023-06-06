import { useMediaQuery } from '@vueuse/core';
import { Platform } from 'quasar';
import { computed } from 'vue';

export function useSystemUtils() {
  const isWebScreen = useMediaQuery('(min-width: 1024px)');
  const website = computed(() => (isWebScreen.value ? true : false));

  const isDeskTop = computed(() => (Platform.is.desktop ? true : false));
  const isMobile = computed(() => (Platform.is.mobile ? true : false));
  const isElectron = computed(() => (Platform.is.electron ? true : false));

  return { website, isDeskTop, isMobile, isElectron };
}
