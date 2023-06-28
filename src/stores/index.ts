import { store } from 'quasar/wrappers';
import { createPinia } from 'pinia';
import { Router } from 'vue-router';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import NonSqlDatabaseUtils from 'src/utils/NonSqlDatabaseUtils';
import nanosSqlDatabase from 'src/stores/nanosSqlDatabase';
/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module 'pinia' {
  export interface PiniaCustomProperties {
    readonly router: Router;
  }
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia();
  const list = nanosSqlDatabase.getEntities();
  NonSqlDatabaseUtils.initDatabase(list);
  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)
  pinia.use(piniaPluginPersistedstate);

  return pinia;
});
