import { Model } from 'pinia-orm';
import Prescription from '../prescription/Prescription';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Duration extends Model {
  static entity = 'durations';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      weeks: this.attr(''),
      description: this.attr(''),
      prescriptions: this.hasMany(Prescription, 'duration_id'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get('/duration?offset=0&max=100');
  }

  static async apiFetchById(id) {
    return await this.api().get(`/duration/${id}`);
  }

  static localDbAdd(duration) {
    return db.newDb().collection('durations').add(duration);
  }

  static localDbGetById(id) {
    return db.newDb().collection('durations').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('durations').get();
  }

  static localDbUpdate(duration) {
    return db
      .newDb()
      .collection('durations')
      .doc({ id: duration.id })
      .set(duration);
  }

  static localDbUpdateAll(durations) {
    return db.newDb().collection('durations').set(durations);
  }

  static localDbDelete(duration) {
    return db.newDb().collection('durations').doc({ id: duration.id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('durations').delete();
  }
}
