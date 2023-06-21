import { useRepo } from 'pinia-orm';
import Localidade from 'src/stores/models/Localidade/Localidade';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const localidade = useRepo(Localidade);

export default {
  async post(params: string) {
    try {
      const resp = await api().post('localidade', params);
      localidade.save(resp.data);
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
        .get('localidade?offset=' + offset + '&max=100')
        .then((resp) => {
          localidade.save(resp.data);
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
      const resp = await api().patch('localidade/' + id, params);
      localidade.save(resp.data);
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
    await api().delete('localidade/' + id);
    localidade.destroy(id);
  },
  async apiFetchById(id) {
    return await api().get(`/localidade/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get('/localidade?offset=' + offset + '&max=' + max);
  },

  // Pinia LocalBase
  getAllLocalidade() {
    return localidade.orderBy('code', 'asc').get();
  },

  getAllDistrictById(districtId: string) {
    return localidade
      .withAllRecursive(1)
      .where('district_id', districtId)
      .orderBy('code', 'asc')
      .get();
  },
  getAllPostoAdministrativoById(postoAdministrativoId: string) {
    return localidade
      .withAllRecursive(1)
      .where('postoAdministrativo_id', postoAdministrativoId)
      .orderBy('code', 'asc')
      .get();
  },
};
