import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import FacilityType from '../facilityType/FacilityType';
import Province from '../province/Province';
import { v4 as uuidv4 } from 'uuid';

export default class NationalClinic extends Model {
  static entity = 'nationalClinics';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      telephone: this.attr(''),
      facilityName: this.attr(''),
      province_id: this.attr(''),
      facilityType_id: this.attr(''),
      active: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      province: this.belongsTo(Province, 'province_id'),
      facilityType: this.belongsTo(FacilityType, 'facilityType_id'),
      clinics: this.hasMany(Clinic, 'nationalClinic_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll() {
    return await this.api().get('/nationalClinic');
  }

  static async apiFetchById(id) {
    return await this.api().get(`/nationalClinic/${id}`);
  }

  static async apiSave(nationalClinic) {
    return await this.api().post('/nationalClinic', nationalClinic);
  }
}
