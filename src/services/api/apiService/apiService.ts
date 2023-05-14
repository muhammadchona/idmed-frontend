import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const instance = axios.create({
  baseURL: process.env.API_URL,
});

let numTries = 0;
// Request interceptor for API calls
axios.interceptors.request.use(
  async (config: any) => {
    config.headers = {
      Accept: 'application/json',
    };
    if (
      config.url === '/province' ||
      config.url === '/district' ||
      config.url.includes('/clinic/district') ||
      config.url === '/systemConfigs' ||
      config.url === '/menu' ||
      config.url.includes('/clinic/uuid')
    ) {
      delete config.headers.Authorization;
    } else if (localStorage.getItem('id_token') != null) {
      config.headers['X-Auth-Token'] = [
        '',
        localStorage.getItem('id_token'),
      ].join(' ');
    } else {
      delete config.headers.Authorization; // ["Authorization"]
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
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
