import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Patient from 'src/stores/models/patient/Patient';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { nSQL } from 'nano-sql';

const patient = useRepo(Patient);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('patient', params);
      patient.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
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
          alertError('Aconteceu um erro inexperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('patient/' + uuid, params);
      patient.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('patient/' + uuid);
      patient.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  async putMobile(params: string) {
    try {
      await nSQL(Patient.entity).query('upsert', params).exec();
      patient.save(params);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  async getMobile() {
    try {
      const rows = await nSQL(Patient.entity).query('select').exec();
      if (rows.length === 0) {
        api()
          .get('patient?offset=0&max=400')
          .then((resp) => {
            console.log(resp);
            this.putMobile(resp.data);
          });
      } else {
        patient.save(rows);
      }
    } catch (error) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await nSQL(patient.use?.entity)
        .query('delete')
        .where(['id', '=', paramsId])
        .exec();
      patient.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  async apiFetchById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return nSQL(patient.use?.entity)
        .query('select')
        .where(['id', '=', id])
        .exec()
        .then((rows) => {
          patient.save(rows);
        });
    } else {
      return api()
        .get(`/patient/${id}`)
        .then((resp) => {
          patient.save(resp.data);
          return resp;
        });
    }
  },

  async apiSearch(patienParam: any) {
    patient.flush();
    if (isMobile.value && !isOnline.value) {
      return this.getPatientByParams(patienParam)
        .then((rows) => {
          patient.save(rows);
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
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
      return this.post(patient);
    } else {
      return this.patch(patient.id, patient);
    }
  },

  async apiUpdate(patient: any) {
    return await this.patch(patient.id, patient);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patient/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },
  async syncPatient(patient: any) {
    if (patient.syncStatus === 'R') await this.apiSave(patient, true);
    if (patient.syncStatus === 'U') await this.apiSave(patient, false);
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
    return patient.withAllRecursive(2).whereId(id).first();
  },
  deleteAllFromStorage() {
    patient.flush();
  },
  deletePatientStorage(patientParam: any) {
    patient.destroy(patientParam.id);
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
    return (
      patient
        .query()
        .has('identifiers')
        //  .has('patientVisits')
        .with('identifiers', (query) => {
          query
            .with('identifierType')
            .with('service', (query) => {
              query.withAllRecursive(1);
            })
            .with('clinic', (query) => {
              query.withAll();
            });
        })
        .with('province')
        .with('district')
        .with('clinic', (query) => {
          query.withAll();
        })
        .where((patients) => {
          return (
            patients.clinic_id === clinicId || patients.clinicId === clinicId
          );
        })
        .get()
    );
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
            query
              .with('episodeType')
              .with('clinicSector')
              .with('startStopReason');
          });
      })
      .with('province')
      .with('district')
      .with('clinic', (query) => {
        query.withAllRecursive(1);
      })
      .where('id', id)
      .first();
  },
  getPatientByParams(patientParam: any) {
    return nSQL(patient.use?.entity)
      .query('select')
      .where([
        ['firstNames', 'LIKE', '%' + patientParam.firstNames + '%'],
        'OR',
        ['lastNames', 'LIKE', '%' + patientParam.lastNames + '%'],
        'OR',
        [
          'identifiers.value',
          'LIKE',
          '%' + patientParam.identifiers[0].value + '%',
        ],
      ])
      .exec();
  },
};
