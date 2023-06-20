import { useRepo } from 'pinia-orm';
import ClinicalService from 'src/stores/models/ClinicalService/ClinicalService';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const clinicalservice = useRepo(ClinicalService);

export default {
  async post(params: string) {
    try {
      const resp = await api().post('clinicalService', params);
      clinicalservice.save(resp.data);
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
        .get('clinicalService?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalservice.save(resp.data);
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
  async patch(id: number, params: string) {
    try {
      const resp = await api().patch('clinicalService/' + id, params);
      clinicalservice.save(resp.data);
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
    await api().delete('clinicalService/' + id);
    clinicalservice.destroy(id);
  },

  getByIdentifierTypeCode(identifierTypeCode: string) {
    clinicalservice
      .query()
      .with('identifierType')
      .where('code', identifierTypeCode)
      .first();
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return clinicalservice.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicalServices() {
    return clinicalservice.query().withAllRecursive(2).orderBy('code', 'desc').get()
    // .with('attributes', (query) => {
    //   query.with('clinicalServiceAttributeType');
    // })
    // .with('clinicSectors', (query) => {
    //   query.with('clinicSectorType');
    //   query.with('clinic');
    // })
    // .with('identifierType')
    // .get();
  },

  getbyIdWithSectors(clinicalServiceId: string) {
    return clinicalservice
      .query()
      .where('id', clinicalServiceId)
      .with('clinicSectors')
      .first();
  },

  getAllClinicalServicesPersonalized() {
    return clinicalservice
      .query()
      .with('attributes', (query) => {
        query.with('clinicalServiceAttributeType');
      })
      .with('clinicSectors')
      .with('identifierType')
      .get();
  },

  getClinicalServicePersonalizedById(clinicalServiceId: string) {
    return clinicalservice
      .query()
      .with('attributes', (query) => {
        query.with('clinicalServiceAttributeType');
      })
      .with('clinicSectors')
      .with('identifierType')
      .whereId(clinicalServiceId)
      .get();
  }

};
