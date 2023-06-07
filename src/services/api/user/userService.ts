import SecUser from 'src/stores/models/userLogin/User';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const secuser = useRepo(SecUser);

export default {
  // Axios API call
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('secUser?offset=' + offset + '&max=100')
        .then((resp) => {
          secuser.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          closeLoading;
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
            alertError(String(listErrors));
          } else if (error.request) {
            alertError(error.request);
          } else {
            alertError(error.message);
          }
        });
    }
  },
  post(params: string) {
    return api()
      .post('secUser', params)
      .then((resp) => {
        secuser.save(resp.data);
        alertSucess('O Registo foi efectuado com sucesso');
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
          alertError(String(listErrors));
        } else if (error.request) {
          alertError(error.request);
        } else {
          alertError(error.message);
        }
      });
  },
  patch(id: string, params: string) {
    console.log(id);
    console.log(params);

    return api()
      .patch('secUser/' + id, params)
      .then((resp) => {
        secuser.save(resp.data);
        alertSucess('O Registo foi alterado com sucesso');
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
          alertError(String(listErrors));
        } else if (error.request) {
          alertError(error.request);
        } else {
          alertError(error.message);
        }
      });
  },
  async delete(id: number) {
    await api().delete('secUser/' + id);
    secuser.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/secUser?offset=' + offset + '&max=' + max);
  },
  async apiSave(userLogin: number) {
    return await api().post('/secUser', userLogin);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return secuser.getModel().$newInstance();
  },
  getAllFromStorage() {
    return secuser.all();
  },

  getAllUsers() {
    return secuser
      .query()
      .with('clinics', (query) => {
        query.with('province');
        query.with('facilityType');
        query.with('district', (query1) => {
          query1.with('province');
        });
      })
      .with('clinicSectors', (query) => {
        query.with('clinic', (query1) => {
          query1.with('province');
          query1.with('facilityType');
          query1.with('district', (query2) => {
            query2.with('province');
          });
        });
        query.with('clinicSectorType');
      })
      .get();
  },
};
