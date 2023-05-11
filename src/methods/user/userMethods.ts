import db from 'src/stores/localbase';
export default {
  localDbAdd(secUser) {
    return db.newDb().collection('users').add(secUser);
  },

  localDbUpdate(secUser) {
    return db.newDb().collection('users').doc({ id: secUser.id }).set(secUser);
  },

  localDbGetAll() {
    return db.newDb().collection('users').get();
  },

  localDbGetByUsername(username) {
    return db.newDb().collection('users').doc({ username: username }).get();
  },
};
