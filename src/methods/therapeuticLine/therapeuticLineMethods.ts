import db from 'src/stores/localbase';

export default {
  localDbAdd(therapeuticLine) {
    return db.newDb().collection('therapeuticLines').add(therapeuticLine);
  },

  localDbGetById(id) {
    return db.newDb().collection('therapeuticLines').doc({ id: id }).get();
  },

  localDbGetAll() {
    return db.newDb().collection('therapeuticLines').get();
  },

  localDbUpdate(therapeuticLine) {
    return db
      .newDb()
      .collection('therapeuticLines')
      .doc({ id: therapeuticLine.id })
      .set(therapeuticLine);
  },

  localDbUpdateAll(therapeuticLines) {
    return db.newDb().collection('therapeuticLines').set(therapeuticLines);
  },

  localDbDelete(therapeuticLine) {
    return db
      .newDb()
      .collection('therapeuticLines')
      .doc({ id: therapeuticLine.id })
      .delete();
  },

  localDbDeleteAll() {
    return db.newDb().collection('therapeuticLines').delete();
  },
};
