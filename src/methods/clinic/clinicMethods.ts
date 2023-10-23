import db from 'src/stores/localbase';

export default {
  localDbAdd(clinic) {
    return db.newDb().collection('clinics').add(clinic);
  },

  localDbGetById(id) {
    return db.newDb().collection('clinics').doc({ id: id }).get();
  },

  async localDbGetAll() {
    return await db.newDb().collection('clinics').get();
  },

  localDbUpdate(clinic) {
    return db.newDb().collection('clinics').doc({ id: clinic.id }).set(clinic);
  },

  localDbUpdateAll(clinics) {
    return db.newDb().collection('clinics').set(clinics);
  },

  localDbDelete(clinic) {
    return db.newDb().collection('clinics').doc({ id: clinic.id }).delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('clinics').delete();
  },
};
