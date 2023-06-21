import { useRepo } from 'pinia-orm';
import PostoAdministrativo from 'src/stores/models/PostoAdministrativo/PostoAdministrativo';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const postoAdministrativo = useRepo(PostoAdministrativo);

export default {
  async post(params: string) {
    try {
      const resp = await api().post('postoAdministrativo', params);
      postoAdministrativo.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error) {
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
    }
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('postoAdministrativo?offset=' + offset + '&max=100')
        .then((resp) => {
          postoAdministrativo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
          } else {
            closeLoading();
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
            alertError(String(listErrors));
          } else if (error.request) {
            alertError(error.request);
          } else {
            alertError(error.message);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    try {
      const resp = await api().patch('postoAdministrativo/' + id, params);
      postoAdministrativo.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error) {
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
    }
  },
  async delete(id: number) {
    await api().delete('postoAdministrativo/' + id);
    postoAdministrativo.destroy(id);
  },
  async apiFetchById(id) {
    return await api().get(`/postoAdministrativo/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/postoAdministrativo?offset=' + offset + '&max=' + max
    );
  },

  // Pinia LocalBase
  getAllPostAdministrativo() {
    return postoAdministrativo.withAllRecursive(1).orderBy('code', 'asc').get();
  },

  getAllDistrictById(districtId: string) {
    return postoAdministrativo
      .withAllRecursive(1)
      .where('district_id', districtId)
      .orderBy('code', 'asc')
      .get();
  },
};
