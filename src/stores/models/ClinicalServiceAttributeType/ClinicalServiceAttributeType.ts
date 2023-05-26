import { Model } from 'pinia-orm';
import ClinicalServiceAttribute from '../ClinicalServiceAttribute/ClinicalServiceAttribute';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class ClinicalServiceAttributeType extends Model {
  static entity = 'clinicalServiceAttributeTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),

      clinicalServiceAttributes: this.hasMany(
        ClinicalServiceAttribute,
        'service_attr_type_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/clinicalServiceAttributeType?offset=' + offset + '&max=' + max
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/clinicalServiceAttributeType/${id}`);
  }

  static localDbAdd(clinicalServiceAttributeType) {
    return db
      .newDb()
      .collection('clinicalServiceAttributeTypes')
      .add(clinicalServiceAttributeType);
  }

  static localDbGetById(id) {
    return db
      .newDb()
      .collection('clinicalServiceAttributeTypes')
      .doc({ id: id })
      .get();
  }

  static localDbGetAll() {
    return db.newDb().collection('clinicalServiceAttributeTypes').get();
  }

  static localDbUpdate(clinicalServiceAttributeType) {
    return db
      .newDb()
      .collection('clinicalServiceAttributeTypes')
      .doc({ id: clinicalServiceAttributeType.id })
      .set(clinicalServiceAttributeType);
  }

  static localDbUpdateAll(clinicalServiceAttributeTypes) {
    return db
      .newDb()
      .collection('clinicalServiceAttributeTypes')
      .set(clinicalServiceAttributeTypes);
  }

  static localDbDelete(clinicalServiceAttributeType) {
    return db
      .newDb()
      .collection('clinicalServiceAttributeTypes')
      .doc({ id: clinicalServiceAttributeType.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('clinicalServiceAttributeTypes').delete();
  }
}
