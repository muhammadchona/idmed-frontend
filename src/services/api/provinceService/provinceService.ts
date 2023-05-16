import { useRepo } from 'pinia-orm';
import Province from 'src/stores/models/province/Province';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();

const province = useRepo(Province);

export default {
  post(params: string) {
    return api()
      .post('province', params)
      .then((resp) => {
        province.save(resp.data);
        alertSucess('Sucesso!', 'O Registo foi efectuado com sucesso');
      })
      .catch((error) => {
        if (error.request != null) {
          const arrayErrors = JSON.parse(error.request.response);
          const listErrors = [];
          if (arrayErrors.total == null) {
            listErrors.push(arrayErrors.message);
          } else {
            arrayErrors._embedded.errors.forEach((element) => {
              listErrors.push(element.message);
            });
          }
          alertError('Erro no registo', listErrors);
        } else if (error.request) {
          alertError('Erro no registo', error.request);
        } else {
          alertError('Erro no registo', error.message);
        }
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('province?offset=' + offset + '&limit=100')
        .then((resp) => {
          province.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
          }
        })
        .catch((error) => {
          if (error.request != null) {
            const arrayErrors = JSON.parse(error.request.response);
            const listErrors = {};
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
            alertError('Erro no registo', listErrors);
          } else if (error.request) {
            alertError('Erro no registo', error.request);
          } else {
            alertError('Erro no registo', error.message);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('province/' + id, params)
      .then((resp) => {
        province.save(resp.data);
        alertSucess('Sucesso!', 'O Registo foi alterado com sucesso');
      })
      .catch((error) => {
        if (error.request != null) {
          const arrayErrors = JSON.parse(error.request.response);
          const listErrors = {};
          if (arrayErrors.total == null) {
            listErrors.push(arrayErrors.message);
          } else {
            arrayErrors._embedded.errors.forEach((element) => {
              listErrors.push(element.message);
            });
          }
          alertError('Erro no registo', listErrors);
        } else if (error.request) {
          alertError('Erro no registo', error.request);
        } else {
          alertError('Erro no registo', error.message);
        }
      });
  },
  delete(id: number) {
    return api()
      .delete('province/' + id)
      .then(() => {
        province.destroy(id);
      });
  },
  async apiFetchById(id) {
    return await api().get(`/province/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get('/province?offset=' + offset + '&max=' + max);
  },

  // Pinia LocalBase
  async apiGetAllWithDistricts() {
    // return province.query().with('districts').has('code').get();
    return province.query().with('districts').get();
  },

  getAllProvinces() {
    return province.query().with('districts').get();
  },
};
