import { useMediaQuery } from '@vueuse/core';
import { Platform } from 'quasar';
import { computed } from 'vue';
import { LocalStorage } from 'quasar';
//import mixinplatform from '../mixins/mixin-system-platform'

export function useSystemUtils() {
  const isWebScreen = useMediaQuery('(min-width: 1524px)');
  const website = computed(() => (isWebScreen.value ? true : false));

  const isDeskTop = computed(() => (Platform.is.desktop ? true : false));
  const isMobile = computed(() => (Platform.is.mobile ? true : false));
  const isElectron = computed(() => (Platform.is.electron ? true : false));
  const isOnline = computed(() => (website.value ? false : false));

  console.log('isMobile' + isMobile.value);
  console.log('isWebsite' + website.value);
  return { website, isDeskTop, isMobile, isElectron, isOnline };
}
