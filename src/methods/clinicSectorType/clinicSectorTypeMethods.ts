import db from 'src/stores/localbase';
export default {
  localDbAdd(clinicSectorType) {
    return db.newDb().collection('clinicSectorTypes').add(clinicSectorType);
  },

  localDbGetById(id) {
    return db.newDb().collection('clinicSectorTypes').doc({ id: id }).get();
  },

  localDbGetAll() {
    return db.newDb().collection('clinicSectorTypes').get();
  },

  localDbUpdate(clinicSectorType) {
    return db
      .newDb()
      .collection('clinicSectorTypes')
      .doc({ id: clinicSectorType.id })
      .set(clinicSectorType);
  },

  localDbUpdateAll(clinicSectorTypes) {
    return db.newDb().collection('clinicSectorTypes').set(clinicSectorTypes);
  },

  localDbDelete(clinicSectorType) {
    return db
      .newDb()
      .collection('clinicSectorTypes')
      .doc({ id: clinicSectorType.id })
      .delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('clinicSectorTypes').delete();
  },
};
