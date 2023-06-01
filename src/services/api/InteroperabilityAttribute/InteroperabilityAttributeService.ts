import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const interoperabilityAttribute = useRepo(InteroperabilityAttribute);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('interoperabilityAttribute', params);
    interoperabilityAttribute.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('interoperabilityAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          interoperabilityAttribute.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  patch(id: string, params: string) {
    return api()
      .patch('interoperabilityAttribute/' + id, params)
      .then((resp) => {
        interoperabilityAttribute.save(resp.data);
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
          alertError('Erro no porcessamento', String(listErrors));
        } else if (error.request) {
          alertError('Erro no registo', error.request);
        } else {
          alertError('Erro no registo', error.message);
        }
      });
  },
  async delete(id: number) {
    await api().delete('interoperabilityAttribute/' + id);
    interoperabilityAttribute.destroy(id);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/interoperabilityAttribute?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityAttribute.getModel().$newInstance();
  },
  getAllFromStorage() {
    return interoperabilityAttribute.all();
  },
};
