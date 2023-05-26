import { Model } from 'pinia-orm';
import PostoAdministrativo from '../PostoAdministrativo/PostoAdministrativo';
import District from '../district/District';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Localidade extends Model {
  static entity = 'localidades';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      postoAdministrativo_id: this.attr(''),
      district_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      postoAdministrativo: this.belongsTo(
        PostoAdministrativo,
        'postoAdministrativo_id'
      ),
      district: this.belongsTo(District, 'district_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll(offset, max) {
    return await this.api().get('/localidade?offset=' + offset + '&max=' + max);
  }

  static async apiSave(localidade) {
    return await this.api().post('/localidade', localidade);
  }

  static localDbAdd(localidade) {
    return db.newDb().collection('localidades').add(localidade);
  }

  static localDbGetById(id) {
    return db.newDb().collection('localidades').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('localidades').get();
  }

  static localDbUpdate(localidade) {
    return db
      .newDb()
      .collection('localidades')
      .doc({ id: localidade.id })
      .set(localidade);
  }

  static localDbUpdateAll(localidades) {
    return db.newDb().collection('localidades').set(localidades);
  }

  static localDbDelete(localidade) {
    return db
      .newDb()
      .collection('localidades')
      .doc({ id: localidade.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('localidades').delete();
  }
}
