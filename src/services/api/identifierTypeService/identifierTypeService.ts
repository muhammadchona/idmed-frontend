import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import IdentifierType from 'src/stores/models/identifierType/IdentifierType';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const identifiertypeRepo = useRepo(IdentifierType);

export default {
  post(params: string) {
    return api()
      .post('identifierType', params)
      .then((resp) => {
        identifiertypeRepo.save(resp.data);
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
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('identifierType?offset=' + offset + '&max=100')
        .then((resp) => {
          identifiertypeRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          closeLoading();
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
  patch(id: string, params: string) {
    return api()
      .patch('identifierType/' + id, params)
      .then((resp) => {
        identifiertypeRepo.save(resp.data);
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
  delete(id: number) {
    return api()
      .delete('identifierType/' + id)
      .then(() => {
        identifiertypeRepo.destroy(id);
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return identifiertypeRepo.getModel().$newInstance();
  },

  getAllIdentifierTypes() {
    return identifiertypeRepo.query().withAll().get();
  },
};
