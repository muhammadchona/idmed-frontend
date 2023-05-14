import UserRole from 'src/stores/models/userLogin/UserRole';
import { Notify } from 'quasar';
import UserLogin from 'src/stores/models/userLogin/User';
import api from 'src/services/api/apiService/apiService';
import { useRepo } from 'pinia-orm';

const userLogin = useRepo(UserLogin);
const userRoles = useRepo(UserRole);

export default {
  logout() {
    return api()
      .get('logout')
      .catch((error) => {
        if (error.response) {
          console.log(JSON.stringify(error.response));
          alert(JSON.stringify(error.response.data));
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      });
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
        userLogin.save(resp.data);
      })
      .catch((error) => {
        if (error.response) {
          Notify.create({
            icon: 'announcement',
            message: 'Utilizador ou a senha inválida',
            type: 'negative',
            progress: true,
            timeout: 3000,
            position: 'top',
            color: 'negative',
            textColor: 'white',
            classes: 'glossy',
          });
          console.log('O erro: ', error.response);
        } else if (error.request) {
          console.log(error.request);
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
};
