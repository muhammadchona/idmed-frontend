import { Model } from 'pinia-orm';
import District from '../district/District';
import Localidade from '../Localidade/Localidade';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PostoAdministrativo extends Model {
  static entity = 'postoAdministrativos';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      district_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      district: this.belongsTo(District, 'district_id'),
      localidades: this.hasMany(Localidade, 'postoAdministrativo_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/postoAdministrativo?offset=' + offset + '&max=' + max
    );
  }

  static async apiSave(postoAdministrativo) {
    return await this.api().post('/postoAdministrativo', postoAdministrativo);
  }

  static localDbAdd(postoAdministrativo) {
    return db
      .newDb()
      .collection('postoAdministrativos')
      .add(postoAdministrativo);
  }

  static localDbGetById(id) {
    return db.newDb().collection('postoAdministrativos').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('postoAdministrativos').get();
  }

  static localDbUpdate(postoAdministrativo) {
    return db
      .newDb()
      .collection('postoAdministrativos')
      .doc({ id: postoAdministrativo.id })
      .set(postoAdministrativo);
  }

  static localDbUpdateAll(postoAdministrativos) {
    return db
      .newDb()
      .collection('postoAdministrativos')
      .set(postoAdministrativos);
  }

  static localDbDelete(postoAdministrativos) {
    return db
      .newDb()
      .collection('postoAdministrativos')
      .doc({ id: postoAdministrativos.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('postoAdministrativos').delete();
  }
}
