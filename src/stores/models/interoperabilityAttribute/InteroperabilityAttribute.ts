import { Model } from 'pinia-orm';
import HealthInformationSystem from '../healthInformationSystem/HealthInformationSystem';
import InteroperabilityType from '../interoperabilityType/InteroperabilityType';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class InteroperabilityAttribute extends Model {
  static entity = 'interoperabilityAttributes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      value: this.attr(''),
      interoperabilityType_id: this.attr(''),
      healthInformationSystem_id: this.attr(''),

      // Relationships
      healthInformationSystem: this.belongsTo(
        HealthInformationSystem,
        'healthInformationSystem_id'
      ),
      interoperabilityType: this.belongsTo(
        InteroperabilityType,
        'interoperabilityType_id'
      ),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/interoperabilityAttribute?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(interoperabilityAttribute) {
    return db
      .newDb()
      .collection('interoperabilityAttributes')
      .add(interoperabilityAttribute);
  }

  static localDbGetById(id) {
    return db
      .newDb()
      .collection('interoperabilityAttributes')
      .doc({ id: id })
      .get();
  }

  static localDbGetAll() {
    return db.newDb().collection('interoperabilityAttributes').get();
  }

  static localDbUpdate(interoperabilityAttribute) {
    return db
      .newDb()
      .collection('interoperabilityAttributes')
      .doc({ id: interoperabilityAttribute.id })
      .set(interoperabilityAttribute);
  }

  static localDbUpdateAll(interoperabilityAttributes) {
    return db
      .newDb()
      .collection('interoperabilityAttributes')
      .set(interoperabilityAttributes);
  }

  static localDbDelete(interoperabilityAttribute) {
    return db
      .newDb()
      .collection('interoperabilityAttributes')
      .doc({ id: interoperabilityAttribute.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('interoperabilityAttributes').delete();
  }
}
