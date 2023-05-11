import db from 'src/stores/localbase';
export default {
  localDbAdd(therapeuticRegimen) {
    return db.newDb().collection('therapeuticRegimens').add(therapeuticRegimen);
  },

  async localDbGetById(id) {
    return db
      .newDb()
      .collection('therapeuticRegimens')
      .doc({ id: id })
      .delete();
  },

  localDbGetAll() {
    return db.newDb().collection('therapeuticRegimens').get();
  },

  localDbUpdate(therapeuticRegimen) {
    return db
      .newDb()
      .collection('therapeuticRegimens')
      .doc({ id: therapeuticRegimen.id })
      .set(therapeuticRegimen);
  },

  localDbUpdateAll(therapeuticRegimens) {
    return db
      .newDb()
      .collection('therapeuticRegimens')
      .set(therapeuticRegimens);
  },

  localDbDelete(therapeuticRegimen) {
    return db
      .newDb()
      .collection('therapeuticRegimens')
      .doc({ id: therapeuticRegimen.id })
      .delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('therapeuticRegimens').delete();
  },
};
