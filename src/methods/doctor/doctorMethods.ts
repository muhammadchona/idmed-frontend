import db from 'src/stores/localbase';
export default {
  localDbAdd(doctor) {
    return db.newDb().collection('doctors').add(doctor);
  },

  localDbGetById(id) {
    return db.newDb().collection('doctors').doc({ id: id }).get();
  },

  async localDbGetAll() {
    return await db.newDb().collection('doctors').get();
  },

  localDbUpdate(doctor) {
    return db.newDb().collection('doctors').doc({ id: doctor.id }).set(doctor);
  },

  localDbUpdateAll(doctors) {
    return db.newDb().collection('doctors').set(doctors);
  },

  localDbDelete(doctor) {
    return db.newDb().collection('doctors').doc({ id: doctor.id }).delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('doctors').delete();
  },
};
