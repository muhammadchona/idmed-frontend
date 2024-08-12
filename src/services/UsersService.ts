import UserRole from 'src/stores/models/userLogin/UserRole';
import { Notify } from 'quasar';
import UserLogin from 'src/stores/models/userLogin/User';
import api from 'src/services/api/apiService/apiService';
import { useRepo } from 'pinia-orm';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import encryption from 'src/services/Encryption';
import { useOnline } from 'src/composables/shared/loadParams/online';
import db from 'src/stores/dexie';
import axios, { Axios } from 'axios';

const userLogin = useRepo(UserLogin);
const userRoles = useRepo(UserRole);
const { isMobile, isOnline } = useSystemUtils();
const { deleteStorageInfo } = useOnline();
const userLoginDexie = UserLogin.entity;

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
          this.addMobile(resp.data);
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

  refreshToken() {
    const rToken = sessionStorage.getItem('refresh_token');
    const url = localStorage.getItem('backend_url')?.replace('/api', '');
    return axios
      .post(
        url +
          '/oauth/access_token?grant_type=refresh_token&refresh_token=' +
          rToken
      )
      .then((data) => {
        return data;
      });
  },

  getUserByUserName(username: string) {
    return userLogin.query().where('username', username).first();
  },

  // Mobile

  addMobile(params: string) {
    return db[userLoginDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        userLogin.save(JSON.parse(JSON.stringify(params)));
      });
  },

  putMobile(params: string) {
    return db[userLoginDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        userLogin.save(JSON.parse(JSON.stringify(params)));
      });
  },
  async getMobile() {
    try {
      const rows = await db[userLoginDexie].toArray();
      userLogin.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
};
