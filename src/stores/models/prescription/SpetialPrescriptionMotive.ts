import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class SpetialPrescriptionMotive extends Model {
  static entity = 'spetialPrescriptionMotives';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      syncStatus: this.attr(''),
      description: this.attr(''),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/spetialPrescriptionMotive?offset=' + offset + '&max=' + max
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/spetialPrescriptionMotive/${id}`);
  }

  static localDbAdd(spetialPrescriptionMotive) {
    return db
      .newDb()
      .collection('spetialPrescriptionMotives')
      .add(spetialPrescriptionMotive);
  }

  static localDbGetById(id) {
    return db
      .newDb()
      .collection('spetialPrescriptionMotives')
      .doc({ id: id })
      .get();
  }

  static localDbGetAll() {
    return db.newDb().collection('spetialPrescriptionMotives').get();
  }

  static localDbUpdate(spetialPrescriptionMotive) {
    return db
      .newDb()
      .collection('spetialPrescriptionMotives')
      .doc({ id: spetialPrescriptionMotive.id })
      .set(spetialPrescriptionMotive);
  }

  static localDbUpdateAll(spetialPrescriptionMotives) {
    return db
      .newDb()
      .collection('spetialPrescriptionMotives')
      .set(spetialPrescriptionMotives);
  }

  static localDbDelete(spetialPrescriptionMotive) {
    return db
      .newDb()
      .collection('spetialPrescriptionMotives')
      .doc({ id: spetialPrescriptionMotive.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('spetialPrescriptionMotives').delete();
  }
}
