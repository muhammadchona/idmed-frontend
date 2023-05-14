import { Model } from 'pinia-orm';
import InteroperabilityAttribute from '../interoperabilityAttribute/InteroperabilityAttribute';
import { v4 as uuidv4 } from 'uuid';

export default class HealthInformationSystem extends Model {
  static entity = 'healthInformationSystems';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      abbreviation: this.attr(''),
      syncStatus: this.attr(''),
      description: this.attr(''),
      active: this.attr(''),

      // Relationships
      interoperabilityAttributes: this.hasMany(
        InteroperabilityAttribute,
        'healthInformationSystem_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
