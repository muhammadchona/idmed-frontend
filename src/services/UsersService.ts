import UserRole from 'src/stores/models/userLogin/UserRole';
import { Notify } from 'quasar';
import UserLogin from 'src/stores/models/userLogin/User';
import api from 'src/services/api/apiService/apiService';
import { useRepo } from 'pinia-orm';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import encryption from 'src/services/Encryption';
import { useOnline } from 'src/composables/shared/loadParams/online';
import patientService from './api/patientService/patientService';

const userLogin = useRepo(UserLogin);
const userRoles = useRepo(UserRole);
const { isMobile, isOnline } = useSystemUtils();
const { deleteStorageInfo } = useOnline();

export default {
  logout() {
    deleteStorageInfo();
  },
  fetchUsers() {
    return api()
      .get('secUser')
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          alert(error.response.data);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      });
  },
  signup(params) {
    return api()
      .post('user/signup', params)
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          alert(error.response.data);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      });
  },
  login(params) {
    return api()
      .post('/login', params)
      .then((resp) => {
        if (isMobile.value) {
          this.putMobile(resp.data);
          localStorage.setItem(
            'sync_pass',
            encryption.encryptPlainText('user.sync')
          );
        }
        userLogin.save(resp.data);
        return resp;
      })
      .catch((error) => {
        if (error.response) {
          Notify.create({
            icon: 'announcement',
            message: error.response.data.message,
            type: 'negative',
            progress: true,
            position: 'top',
            color: 'negative',
            textColor: 'white',
            classes: 'glossy',
          });
          console.log('O erro: ', error.response);
        } else {
          Notify.create({
            icon: 'announcement',
            message: 'Problemas ao conectar-se com o Servidor. ',
            type: 'negative',
            progress: true,
            timeout: 3000,
            position: 'top',
            color: 'negative',
            textColor: 'white',
            classes: 'glossy',
          });
          console.log('Error', error.message);
        }
        //return error;
      });
  },
  updateUser(params) {
    return api()
      .put('secUser/' + params.id, params)
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      });
  },
  getUser(params) {
    return api()
      .get('secUser/' + params.id)
      .then((resp) => {
        console.log(resp);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      });
  },
  deleteUser(id) {
    return api()
      .delete('user/' + id)
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      });
  },

  getUserByUserName(username: string) {
    return userLogin.query().where('username', username).first();
  },

  // Mobile
  putMobile(params: string) {
    return nSQL(UserLogin.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        userLogin.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
    0;
  },
  getMobile() {
    return nSQL(UserLogin.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        userLogin.save(rows);
        return rows;
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
};
