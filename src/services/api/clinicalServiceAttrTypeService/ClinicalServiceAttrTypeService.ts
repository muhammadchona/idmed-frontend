import ClinicalServiceAttributeType from 'src/stores/models/ClinicalServiceAttributeType/ClinicalServiceAttributeType';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const clinicalserviceAttrType = useRepo(ClinicalServiceAttributeType);

export default {
  post(params: string) {
    return api()
      .post('clinicalServiceAttributeType', params)
      .then((resp) => {
        clinicalserviceAttrType.save(resp.data);
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
          alertError('Erro no porcessamento', String(listErrors));
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
        .get('clinicalServiceAttributeType?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalserviceAttrType.save(resp.data);
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
            alertError('Erro no porcessamento', String(listErrors));
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
      .patch('clinicalServiceAttributeType/' + id, params)
      .then((resp) => {
        clinicalserviceAttrType.save(resp.data);
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
  delete(id: number) {
    return api()
      .delete('clinicalServiceAttributeType/' + id)
      .then(() => {
        clinicalserviceAttrType.destroy(id);
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return clinicalserviceAttrType.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicalServiceAttrTypes() {
    return clinicalserviceAttrType.query().withAll().get();
  },
};
