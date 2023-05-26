import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class FacilityType extends Model {
  static entity = 'facilityTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/facilityType?offset=' + offset + '&max=' + max
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/facilityType/${id}`);
  }

  static localDbAdd(facilityType) {
    return db.newDb().collection('facilityTypes').add(facilityType);
  }

  static localDbGetById(id) {
    return db.newDb().collection('facilityTypes').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('facilityTypes').get();
  }

  static localDbUpdate(facilityType) {
    return db
      .newDb()
      .collection('facilityTypes')
      .doc({ id: facilityType.id })
      .set(facilityType);
  }

  static localDbUpdateAll(facilityTypes) {
    return db.newDb().collection('facilityTypes').set(facilityTypes);
  }

  static localDbDelete(facilityType) {
    return db
      .newDb()
      .collection('facilityTypes')
      .doc({ id: facilityType.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('facilityTypes').delete();
  }
}
