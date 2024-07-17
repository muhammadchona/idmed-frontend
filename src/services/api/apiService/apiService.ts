import axios, { Axios } from 'axios';
import UsersService from 'src/services/UsersService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import useNotify from 'src/composables/shared/notify/UseNotify';
import { Notify } from 'quasar';
import { useLoading } from 'src/composables/shared/loading/loading';
import eventBus from '../../../utils/eventbus';
const { website } = useSystemUtils();
const { notifyError } = useNotify();
const { closeLoading } = useLoading();

const instance = axios.create({
  baseURL: website.value
    ? process.env.API_URL
    : localStorage.getItem('backend_url'),
});
const numTries = 0;

// Função para fazer o logout

function logout() {
  sessionStorage.removeItem('authUser');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('password');
  // localStorage.removeItem('tokenExpiration');
  window.location.reload();
}

// Função para iniciar o temporizador
function fixNextTokenExpirationTime() {
  // localStorage.setItem('tokenExpiration', String(Date.now() + 1200000)); // 20 minutos sem request
  // localStorage.setItem('tokenExpiration', String(Date.now() + 30000)); // 30 segundos sem request para teste
}

// Request interceptor for API calls
instance.interceptors.request.use(
  (request) => {
    const userloged = sessionStorage.getItem('user');
    request.headers = {
      Accept: 'application/json',
      'Cache-Control': 'no-store, no-cache',
      'content-encoding': 'gzip',
    };
    if (
      request.url === '/province' ||
      request.url === '/district' ||
      request.url.includes('/clinic/district') ||
      request.url === '/systemConfigs' ||
      request.url === '/menu' ||
      request.url.includes('/clinic/uuid')
    ) {
      delete request.headers.Authorization;
    } else if (userloged != null && userloged != 'null') {
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      const currentTime = Date.now();

      if (tokenExpiration && currentTime < Number(tokenExpiration)) {
        // O token ainda é válido, reiniciar o temporizador
        // fixNextTokenExpirationTime();
      } else {
        // O token expirou, fazer o logout
        // localStorage.setItem('tokenExpiration', 0);
        // logout();
        // return; // Interromper a solicitação
      }
      const localuser = UsersService.getUserByUserName(String(userloged));
      request.headers['X-Auth-Token'] = [
        '',
        sessionStorage.getItem('id_token'),
      ].join(' ');
    } else {
      delete request.headers.Authorization;
    }
    return request;
  },
  (error) => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const originalRequest = error.config;
    // const rToken = localStorage.getItem('id_token')
    const rToken = sessionStorage.getItem('refresh_token');
    if (rToken != null && rToken.length > 10) {
      if (error.response !== undefined) {
        if (
          (error.response.status === 403 || error.response.status === 401) &&
          !originalRequest._retry
        ) {
          // originalRequest._retry = true;

          // return axios
          //   .post(
          //     process.env.API_URL +
          //       '/oauth/access_token?grant_type=refresh_token&refresh_token=' +
          //       rToken
          //   )
          //   .then(({ data }) => {
          //     console.log(
          //       '==got the following token back: ' +
          //         data.access_token +
          //         '___________________________________________'
          //     );
          //     sessionStorage.setItem('id_token', data.access_token);
          //     sessionStorage.setItem('refresh_token', data.access_token);
          //     //  axios.defaults.headers.common['X-Auth-Token'] = data.access_token
          //     originalRequest.headers['X-Auth-Token'] = [
          //       '',
          //       sessionStorage.getItem('id_token'),
          //     ].join(' ');
          //     return axios(originalRequest);
          //   })
          //   .catch((error) => {
          //     window.location.href = '/logout';
          //   });
          closeLoading();
          Notify.create({
            icon: 'announcement',
            message: 'Terminou a sessão. ',
            type: 'negative',
            progress: true,
            timeout: 0,
            position: 'top',
            color: 'negative',
            textColor: 'white',
            classes: 'glossy',
            actions: [
              {
                label: 'Fechar',
                color: 'yellow',
                handler: () => {
                  window.location.href = '/#/Logout';
                },
              },
            ],
          });
        }
      } else {
        closeLoading();
        Notify.create({
          icon: 'announcement',
          message: 'Problemas ao conectar-se com o Servidor. ',
          type: 'negative',
          progress: true,
          timeout: 0,
          position: 'top',
          color: 'negative',
          textColor: 'white',
          classes: 'glossy',
          actions: [
            {
              label: 'Tentar novamente',
              color: 'yellow',
              handler: () => {
                location.reload();
              },
            },
          ],
        });
      }
    } else {
      if (String(error.message).includes('Network Error')) {
        eventBus.emit('notification', true);
        Notify.create({
          icon: 'announcement',
          message: 'Problemas ao conectar-se com o Servidor. ',
          type: 'negative',
          progress: true,
          timeout: 0,
          position: 'top',
          color: 'negative',
          textColor: 'white',
          classes: 'glossy',
          actions: [
            {
              label: 'Tentar novamente',
              color: 'yellow',
              handler: () => {
                location.reload();
              },
            },
          ],
        });
      }
    }
    return Promise.reject(error);
  }
);

export default () => {
  return instance;
};
