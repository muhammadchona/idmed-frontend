import { Model } from 'pinia-orm';
import ClinicalService from '../ClinicalService/ClinicalService';
import ClinicalServiceAttributeType from '../ClinicalServiceAttributeType/ClinicalServiceAttributeType';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class ClinicalServiceAttribute extends Model {
  static entity = 'clinicalServiceAttributes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      service_id: this.attr(null),
      service_attr_type_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      clinicalService: this.belongsTo(ClinicalService, 'service_id'),
      clinicalServiceAttributeType: this.belongsTo(
        ClinicalServiceAttributeType,
        'service_attr_type_id'
      ),
    };

  }
  static piniaOptions = {
    persist: true,
  };

  static piniaOptions = {
    persist: true,
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/clinicalServiceAttribute?offset=' + offset + '&max=' + max
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/clinicalServiceAttribute/${id}`);
  }

  static localDbAdd(clinicalServiceAttribute) {
    return db
      .newDb()
      .collection('clinicalServiceAttributes')
      .add(clinicalServiceAttribute);
  }

  static localDbGetById(id) {
    return db
      .newDb()
      .collection('clinicalServiceAttributes')
      .doc({ id: id })
      .get();
  }

  static localDbGetAll() {
    return db.newDb().collection('clinicalServiceAttributes').get();
  }

  static localDbUpdate(clinicalServiceAttribute) {
    return db
      .newDb()
      .collection('clinicalServiceAttributes')
      .doc({ id: clinicalServiceAttribute.id })
      .set(clinicalServiceAttribute);
  }

  static localDbUpdateAll(clinicalServiceAttributes) {
    return db
      .newDb()
      .collection('clinicalServiceAttributes')
      .set(clinicalServiceAttributes);
  }

  static localDbDelete(clinicalServiceAttribute) {
    return db
      .newDb()
      .collection('clinicalServiceAttributes')
      .doc({ id: clinicalServiceAttribute.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('clinicalServiceAttributes').delete();
  }
}
