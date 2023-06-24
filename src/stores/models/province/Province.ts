import { Model } from 'pinia-orm';
import Country from 'src/stores/models/country/Country';
import City from '../city/City';
import Clinic from '../clinic/Clinic';
import District from '../district/District';
import { v4 as uuidv4 } from 'uuid';

export default class Province extends Model {
  static entity = 'provinces';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      description: this.attr(''),
      code: this.attr(''),
      country_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      country: this.belongsTo(Country, 'country_id'),
      districts: this.hasMany(District, 'province_id'),
      clinics: this.hasMany(Clinic, 'province_id'),
      cities: this.hasMany(City, 'province_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
