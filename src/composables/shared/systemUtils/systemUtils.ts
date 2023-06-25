import { useMediaQuery } from '@vueuse/core';
import { Platform } from 'quasar';
import { computed } from 'vue';
import { LocalStorage } from 'quasar';
//import mixinplatform from '../mixins/mixin-system-platform'

export function useSystemUtils() {
  const isWebScreen = useMediaQuery('(min-width: 1024px)');
  const website = computed(() => (isWebScreen.value ? true : false));

  const isDeskTop = computed(() => (Platform.is.desktop ? true : false));
  const isMobile = computed(() => (Platform.is.mobile ? true : false));
  const isElectron = computed(() => (Platform.is.electron ? true : false));
  const isOnline = computed(() =>
    website.value
      ? true
      : LocalStorage.getItem('user_clinic_sectors') !== null &&
        LocalStorage.getItem('user_clinic_sectors').includes('NORMAL')
  );

  return { website, isDeskTop, isMobile, isElectron, isOnline };
}
