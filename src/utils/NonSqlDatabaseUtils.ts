import { nSQL } from 'nano-sql';
import { getMode } from 'cordova-plugin-nano-sqlite/lib/sqlite-adapter';

export default {
  createModel(fields: any, entity: any) {
    const listaFields = [];
    for (const key in fields) {
      let dataType = 'date';
      const valor = Object.getPrototypeOf(fields[key]).constructor.name;
      if (key === 'weeks') {
        console.log(Object.getPrototypeOf(fields[key]).constructor.name);
      }
      switch (valor) {
        case 'BelongsTo':
          dataType = 'object';
          break;
        case 'HasMany':
          dataType = 'array';
          break;
        case 'BelongsToMany':
          dataType = 'array';
          break;
        case 'Attr':
          dataType = 'string';
          break;
        case 'Boolean':
          dataType = 'boolean';
          break;
        case 'Number':
          dataType = 'int';
          break;
        default:
          dataType = 'string';
          break;
      }
      let obj = {};
      if (key === 'id') {
        obj = { key: key, type: 'uuid', props: ['pk'] };
      } else if (
        (key === 'drug_id' && entity === 'therapeuticRegimensDrug') ||
        (key === 'therapeutic_regimen_id' &&
          entity === 'therapeuticRegimensDrug')
      ) {
        obj = { key: key, type: 'uuid', props: ['pk'] };
      } else {
        obj = { key: key, type: dataType };
      }
      listaFields.push(obj);
    }
    return listaFields;
  },
  async initDatabase(entityList: any) {
    try {
      const MyDb = nSQL();
      for (let i = 0; i < entityList.length; i++) {
        const model = this.createModel(
          entityList[i].fields(),
          entityList[i].entity
        );
        MyDb.table(entityList[i].entity)
          .config({
            mode: getMode(),
          })
          .model(model);
      }
      await Promise.all([MyDb.connect()]);
    } catch (error) {
      console.error(error);
    }
  },
};
