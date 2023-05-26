import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import TherapeuticRegimen from 'src/stores/models/therapeuticRegimen/TherapeuticRegimen';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const therapeuticRegimen = useRepo(TherapeuticRegimen);

export default {
  async post(params: string) {
    try {
      const resp = await api().post('therapeuticRegimen', params);
      therapeuticRegimen.save(resp.data);
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
        .get('therapeuticRegimen?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticRegimen.save(resp.data);
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
    }
  },
  async patch(id: string, params: string) {
    try {
      const resp = await api().patch('therapeuticRegimen/' + id, params);
      therapeuticRegimen.save(resp.data);
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
    await api().delete('therapeuticRegimen/' + id);
    therapeuticRegimen.destroy(id);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return therapeuticRegimen.getModel().$newInstance();
  },

  getAllTherapeuticalRegimens() {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .with('clinicalService')
      .with('prescriptionDetails')
      .get();
  },

  getAllActiveTherapeuticalRegimens() {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where('active', true)
      .get();
  },

  getAllActiveTherapeuticalRegimensByclinicalService(clinicalServiceId: any) {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where((therapeuticRegimen) => {
        return (
          (therapeuticRegimen.clinical_service_id === clinicalServiceId ||
            therapeuticRegimen.clinicalServiceId === '') &&
          therapeuticRegimen.active === true
        );
      })
      .get();
  },

  getAllTherapeuticalRegimensByclinicalService(clinicalServiceId: any) {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where('clinical_service_id', clinicalServiceId)
      .get();
  },

  getAllTherapeuticalByclinicalService(clinicalServiceId: any) {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where('clinical_service_id', clinicalServiceId)
      .get();
  },
  getAllActiveTherapeuticalHasNoClinicalService() {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
      })
      .where((therapeuticRegimen) => {
        return (
          therapeuticRegimen.active &&
          (therapeuticRegimen.clinical_service_id === null ||
            therapeuticRegimen.clinical_service_id === '')
        );
      })
      .get();
  },
};
