import axios, { Axios } from 'axios';
import UsersService from 'src/services/UsersService';
import { useRouter } from 'vue-router';

const router = useRouter();

const instance = axios.create({
  baseURL: process.env.API_URL,
});

let numTries = 0;
// Request interceptor for API calls
instance.interceptors.request.use(
  (request) => {
    const userloged = localStorage.getItem('user');
    request.headers = {
      Accept: 'application/json',
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
      const localuser = UsersService.getUserByUserName(String(userloged));
      request.headers['X-Auth-Token'] = ['', localuser.access_token].join(' ');
    } else {
      delete request.headers.Authorization;
    }
    return request;
  },
  (error) => {
    Promise.reject(error);
  }
);
// axios.interceptors.request.use(
//   (config) => {
//     config.headers = {
//       Accept: 'application/json',
//     };
//     console.log('Utilizador 2', userloged);
//     if (
//       config.url === '/province' ||
//       config.url === '/district' ||
//       config.url.includes('/clinic/district') ||
//       config.url === '/systemConfigs' ||
//       config.url === '/menu' ||
//       config.url.includes('/clinic/uuid')
//     ) {
//       delete config.headers.Authorization;
//     } else if (userloged != null) {
//       const localuser = UsersService.getUserByUserName(String(userloged));
//       config.headers['X-Auth-Token'] = [
//         '',
//         localuser.access_token,
//         // localStorage.getItem('id_token'),
//       ].join(' ');
//     } else {
//       delete config.headers.Authorization; // ["Authorization"]
//     }
//     return config;
//   },
//   (error) => {
//     console.log('Utilizador 3', userloged);
//     Promise.reject(error);
//   }
// );

// Response interceptor for API calls
axios.interceptors.response.use(
  (response) => {
    console.log('Utilizador 4', userloged);

    return response;
  },
  async function (error) {
    console.log('Utilizador 5', userloged);

    const originalRequest = error.config;
    // const rToken = localStorage.getItem('id_token')
    const rToken = localStorage.getItem('refresh_token');
    if (rToken != null && rToken.length > 10) {
      if (
        (error.response.status === 403 || error.response.status === 401) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        console.log(
          'http://idartzambezia.fgh.org.mz:3000/oauth/access_token?grant_type=refresh_token&refresh_token=' +
            rToken
        );
        numTries++;
        if (numTries > 5) {
          localStorage.removeItem('authUser');
          localStorage.removeItem('user');
          localStorage.removeItem('username');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('password');
          window.location.reload();
        }
        return axios
          .post(
            'http://idartzambezia.fgh.org.mz:3000/oauth/access_token?grant_type=refresh_token&refresh_token=' +
              rToken
          )
          .then(({ data }) => {
            console.log(
              '==got the following token back: ' +
                data.access_token +
                '___________________________________________'
            );
            localStorage.setItem('id_token', data.access_token);
            localStorage.setItem('refresh_token', data.access_token);
            //  axios.defaults.headers.common['X-Auth-Token'] = data.access_token
            originalRequest.headers['X-Auth-Token'] = [
              '',
              localStorage.getItem('id_token'),
            ].join(' ');
            return axios(originalRequest);
          });
      }
    }
    return Promise.reject(error);
  }
);

export default () => {
  return instance;
};
