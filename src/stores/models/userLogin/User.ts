import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import ClinicSector from '../clinicSector/ClinicSector';
import UserClinics from './UserClinic';
import UserClinicSectors from './UserClinicSector';
// import Role from './Role'
// import UserRole from './UserRole'
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';
export default class User extends Model {
  static entity = 'users';

  static state() {
    return {
      fetching: false,
    };
  }

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
      clinics: this.belongsToMany(Clinic, UserClinics, 'user_id', 'clinic_id'),
      clinicSectors: this.belongsToMany(
        ClinicSector,
        UserClinicSectors,
        'user_id',
        'clinic_sector_id'
      ),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get('/secUser?offset=' + offset + '&max=' + max);
  }

  static async apiSave(userLogin) {
    return await this.api().post('/secUser', userLogin);
  }

  static localDbAdd(secUser) {
    return db.newDb().collection('secUsers').add(secUser);
  }

  static localDbGetById(id) {
    return db.newDb().collection('secUsers').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('secUsers').get();
  }

  static localDbUpdate(secUser) {
    return db
      .newDb()
      .collection('secUsers')
      .doc({ id: secUser.id })
      .set(secUser);
  }

  static localDbUpdateAll(secUsers) {
    return db.newDb().collection('secUsers').set(secUsers);
  }

  static localDbDelete(secUserId) {
    return db.newDb().collection('secUsers').doc({ id: secUserId }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('secUsers').delete();
  }

  static localDbAddOrUpdate(user) {
    if (user.id === null) {
      user.id = uuidv4();
      return this.localDbAdd(user);
    } else {
      user.syncStatus = 'U';
      return this.localDbUpdate(user);
    }
  }
}
