import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Patient from 'src/stores/models/patient/Patient';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const patient = useRepo(Patient);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('patient', params);
    patient.save(resp.data);
    return resp;
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patient?offset=' + offset + '&max=100')
        .then((resp) => {
          patient.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          closeLoading();
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('patient/' + id, params);
    patient.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('patient/' + id);
    patient.destroy(id);
  },

  async apiFetchById(id: string) {
    return api()
      .get(`/patient/${id}`)
      .then((resp) => {
        patient.save(resp.data);
        return resp;
      });
  },

  async apiSearch(patienParam: any) {
    patient.flush();
    try {
      const resp = await api().post('/patient/search', patienParam);
      patient.save(resp.data);
      closeLoading();
      return resp;
    } catch (error) {
      console.log(error);
      closeLoading();
      return null;
    }
  },

  async apisearchByParam(searchParam: string, clinicId: string) {
    return await api()
      .get(`/patient/searchByParam/${searchParam}/${clinicId}`)
      .then((resp) => {
        patient.save(resp.data);
        closeLoading();
        return resp;
      })
      .catch((error) => {
        closeLoading();
      });
  },

  async apiopenmrsProgramSearch(
    hisId: string,
    nid: string,
    encodeBase64: string
  ) {
    return await api().get(
      '/patient/openmrsProgramSearch/' + hisId + '/' + nid + '/' + encodeBase64
    );
  },

  async apiSearchPatientOnOpenMRS(
    hisId: string,
    nid: string,
    encodeBase64: string
  ) {
    return await api().get(
      '/patient/openmrsSearch/' + hisId + '/' + nid + '/' + encodeBase64
    );
  },

  async apiCheckOpenmRSisOn(hisId: string, encodeBase64: string) {
    return await api().get(
      '/patient/openmrsSession/' + hisId + '/' + encodeBase64
    );
  },

  async apiSave(patient: any, isNew: boolean) {
    if (isNew) {
      return await api().post('/patient', patient);
    } else {
      return await api().patch('/patient/' + patient.id, patient);
    }
  },

  async apiUpdate(patient: any) {
    return await api().patch('/patient/' + patient.id, patient);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patient/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },
  async syncPatient(patient: any) {
    if (patient.syncStatus === 'R') await this.apiSave(patient, true);
    if (patient.syncStatus === 'U') await this.apiUpdate(patient);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patient.getModel().$newInstance();
  },
  savePatientStorage(newPatient: any) {
    patient.save(newPatient);
  },
  getAllFromStorage() {
    return patient.all();
  },
  getPatientByID(id: string) {
    return patient.withAllRecursive(3).whereId(id).first();
  },
  deleteAllFromStorage() {
    patient.flush();
  },
  getPatientSearchList() {
    return patient
      .query()
      .withAllRecursive(2)
      .orderBy('firstNames')
      .orderBy('identifiers.value', 'asc')
      .get();
  },
  getPatientByClinicId(clinicId: string) {
    return patient
      .query()
      .has('identifiers')
      .has('patientVisits')
      .withAll()
      .where((patients) => {
        return patients.clinic_id === clinicId;
      })
      .get();
  },
  getPatienWithstByID(id: string) {
    // return patient.withAllRecursive(3).whereId(id).first();
    return patient
      .query()
      .has('identifiers')
      .with('identifiers', (query) => {
        query
          .with('identifierType')
          .with('service', (query) => {
            query.withAllRecursive(1);
          })
          .with('clinic', (query) => {
            query.withAllRecursive(1);
          })
          .with('episodes', (query) => {
            query.withAllRecursive(1);
          });
      })
      .with('province')
      .with('clinic', (query) => {
        query.withAllRecursive(1);
      })
      .where('id', id)
      .first();
  },
};
