import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import ClinicSector from '../clinicSector/ClinicSector';
import UserClinics from './UserClinic';
import ClinicSectorUsers from './ClinicSectorUsers';
export default class User extends Model {
  static entity = 'users';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      username: this.attr(''),
      password: this.attr(''),
      role: this.attr(null),
      fullName: this.attr(''),
      access_token: this.attr(''),
      refresh_token: this.attr(''),
      firstNames: this.attr(''),
      lastNames: this.attr(''),
      accountLocked: this.attr(''),
      contact: this.attr(''),
      email: this.attr(''),
      roles: this.attr(null),
      syncStatus: this.attr(''),
      authorities: this.attr(null),
      menus: this.attr(null),
      clinics: this.belongsToMany(Clinic, UserClinics, 'user_id', 'clinic_id'),
      clinicSectorUsers: this.attr(''),
      clinicSectors: this.belongsToMany(
        ClinicSector,
        ClinicSectorUsers,
        'user_id',
        'clinic_sector_id'
      ),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
