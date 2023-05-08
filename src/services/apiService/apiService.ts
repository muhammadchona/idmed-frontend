import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const instance = axios.create({
  baseURL: 'http://dev.fgh.org.mz:3910/',
  // baseURL: 'http://dev.fgh.org.mz:3110',
  // baseURL: 'http://idartmaputo-cid.fgh.org.mz:3011',
  // baseURL: 'http://idartmaputo-prov.fgh.org.mz:3010',
  // baseURL: 'http://idartgaza.fgh.org.mz:3009',
  // baseURL: 'http://idartinhambane.fgh.org.mz:3008',
  // baseURL: 'http://idartsofala.fgh.org.mz:3007',
  // baseURL: 'http://idartmanica.fgh.org.mz:3006',
  // baseURL: 'http://idarttete.fgh.org.mz:3005',
  // baseURL: 'http://idartzambezia.fgh.org.mz:3004',
  // baseURL: 'http://idartnampula.fgh.org.mz:3003',
  // baseURL: 'http://idartcabodelegado.fgh.org.mz:3002',
  // baseURL: 'http://idartniassa.fgh.org.mz:3001',
});

// Request interceptor for API calls
instance.interceptors.request.use(
  async (config) => {
    config.headers = {
      Accept: 'application/json',
    };
    if (
      config.url?.startsWith('province') ||
      config.url?.startsWith('/district') ||
      config.url === '/rpc/login'
    ) {
      delete config.headers.Authorization;
    } else if (localStorage.getItem('token') != null) {
      config.headers.Authorization = [
        'Bearer',
        localStorage.getItem('token'),
      ].join(' ');
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 403 || error.response.status === 401) {
      originalRequest._retry = true;
      // return axios
      //   .post('http://dev.fgh.org.mz:3110/rpc/login', {
      //     username: 'postgres',
      //     pass: 'postgres',
      //   })
      //   .then(({ data }) => {
      //     localStorage.setItem('token', data[0].token);
      //     originalRequest.headers['Bearer'] = [
      //       '',
      //       localStorage.getItem('token'),
      //     ].join(' ');
      //     return axios(originalRequest);
      //   });
    }
    return Promise.reject(error);
  }
);

export default () => {
  return instance;
};
