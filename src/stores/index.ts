import { store } from 'quasar/wrappers';
import { createPinia, setActivePinia } from 'pinia';
import { Router } from 'vue-router';
import nanosSqlDatabase from 'src/stores/nanosSqlDatabase';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

/* When adding new properties to stores, you should also
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
  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  pinia.use(piniaPluginPersistedstate);

  // pinia.use(persistedStateDexiePlugin());

  setActivePinia(pinia);

  return pinia;
});

export function generateSchemaFromModels() {
  const schema = {};

  const models = nanosSqlDatabase.getEntities();

  models.forEach((model) => {
    const modelName = model.entity;
    const fields = model.fields();

    const fieldNames = Object.keys(fields).map((fieldName) => {
      const field = fields[fieldName];
      // Assuming each field has a name and type, you may need to adjust this
      return field.primaryKey ? `++${fieldName}` : `${fieldName}`;
    });

    schema[modelName] = fieldNames.join(', ');
    console.log(`Schema for ${modelName}: ${schema[modelName]}`);
    console.log('-------------------------');
  });
  return schema;
}

export const schema = generateSchemaFromModels();
