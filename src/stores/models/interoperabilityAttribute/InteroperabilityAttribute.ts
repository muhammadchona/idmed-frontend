import { Model } from 'pinia-orm';
import HealthInformationSystem from '../healthInformationSystem/HealthInformationSystem';
import InteroperabilityType from '../interoperabilityType/InteroperabilityType';
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
  static piniaOptions = {
    persist: true,
  };
}
