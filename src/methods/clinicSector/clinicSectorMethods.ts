import db from 'src/stores/localbase';

export default {
  localDbAdd(clinicSector) {
    return db.newDb().collection('clinicSectors').add(clinicSector);
  },

  localDbGetById(id) {
    return db.newDb().collection('clinicSectors').doc({ id: id }).get();
  },

  async localDbGetAll() {
    return await db.newDb().collection('clinicSectors').get();
  },

  localDbUpdate(clinicSector) {
    return db
      .newDb()
      .collection('clinicSectors')
      .doc({ id: clinicSector.id })
      .set(clinicSector);
  },

  localDbUpdateAll(clinicSectors) {
    return db.newDb().collection('clinicSectors').set(clinicSectors);
  },

  localDbDelete(clinicSector) {
    return db
      .newDb()
      .collection('clinicSectors')
      .doc({ id: clinicSector.id })
      .delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('clinicSectors').delete();
  },
};
