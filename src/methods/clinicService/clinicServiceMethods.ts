import db from 'src/stores/localbase';
export default {
  localDbAdd(clinicalService) {
    return db.newDb().collection('clinicalServices').add(clinicalService);
  },

  localDbGetAll() {
    return db.newDb().collection('clinicalServices').get();
  },

  async localDbGetById(id) {
    return db.newDb().collection('clinicalServices').doc({ id: id }).get();
  },
};
