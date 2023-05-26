import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import ClinicSectorType from '../clinicSectorType/ClinicSectorType';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class ClinicSector extends Model {
  static entity = 'clinicSectors';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      active: this.attr(''),
      uuid: this.attr(null),
      clinic_id: this.attr(''),
      clinic_sector_type_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      clinicSectorType: this.belongsTo(
        ClinicSectorType,
        'clinic_sector_type_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/clinicSector?offset=' + offset + '&max=' + max
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/clinicSector/${id}`);
  }

  static async apiSave(clinicSector) {
    return await this.api().post('/clinicSector', clinicSector);
  }

  static async apiUpdate(clinicSector) {
    return await this.api().patch(
      '/clinicSector/' + clinicSector.id,
      clinicSector
    );
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/clinicSector/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(clinicSector) {
    return db.newDb().collection('clinicSectors').add(clinicSector);
  }

  static localDbGetById(id) {
    return db.newDb().collection('clinicSectors').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('clinicSectors').get();
  }

  static localDbUpdate(clinicSector) {
    return db
      .newDb()
      .collection('clinicSectors')
      .doc({ id: clinicSector.id })
      .set(clinicSector);
  }

  static localDbUpdateAll(clinicSectors) {
    return db.newDb().collection('clinicSectors').set(clinicSectors);
  }

  static localDbDelete(clinicSector) {
    return db
      .newDb()
      .collection('clinicSectors')
      .doc({ id: clinicSector.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('clinicSectors').delete();
  }
}
