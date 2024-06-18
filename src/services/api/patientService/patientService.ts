import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Patient from 'src/stores/models/patient/Patient';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import db from '../../../stores/dexie';
import clinicSectorService from '../clinicSectorService/clinicSectorService';

const patient = useRepo(Patient);
const patientDexie = Patient.entity;

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
    }
  },
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('patient', params)
      .then((resp) => {
        patient.save(resp.data);
      });
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
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('patient/' + uuid, params)
      .then((resp) => {
        patient.save(resp.data);
      });
  },

  updateUUID(params: string, base64: string) {
    return api()
      .patch(`patient/updateuuid/${base64}`, params)
      .then((resp) => {
        patient.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patient/' + uuid)
      .then((resp) => {
        patient.destroy(uuid);
      });
  },
  async mergePatients(patientToHoldId: string, patientToDeleteId: string) {
    return await api().post(
      `patient/mergeUnitePatients/${patientToHoldId}/${patientToDeleteId}`
    );
  },
  // Mobile
  addMobile(params: string) {
    return db[patientDexie].add(JSON.parse(JSON.stringify(params))).then(() => {
      patient.save(JSON.parse(JSON.stringify(params)));
    });
  },
  putMobile(params: string) {
    return db[patientDexie].add(JSON.parse(JSON.stringify(params))).then(() => {
      patient.save(JSON.parse(JSON.stringify(params)));
    });
  },
  async getMobile() {
    try {
      const rows = await db[patientDexie].toArray();
      patient.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    return db[patientDexie]
      .delete(paramsId)
      .then(() => {
        patient.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  apiFetchById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return db[patientDexie]
        .where('id')
        .equalsIgnoreCase(id)
        .first()
        .then((rows: any) => {
          patient.save(rows);
          return rows;
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

  async apiSearchExist(patienParam: any) {
    try {
      const resp = await api().post('/patient/search', patienParam);
      closeLoading();
      return resp.data.length > 0;
    } catch (error) {
      console.log(error);
      closeLoading();
      return false;
    }
  },

  async apisearchByParam(searchParam: string, clinicId: string) {
    const replacedString = searchParam.replace(/\//g, '-');
    console.log(replacedString);
    return await api()
      .get(`/patient/searchByParam/${replacedString}/${clinicId}`)
      .then((resp) => {
        patient.save(resp.data);
        closeLoading();
        return resp;
      })
      .catch((error) => {
        closeLoading();
      });
  },

  async apiopenmrsProgramSearch(hisId: string, nid: string, Btoa: string) {
    return await api().get(
      '/patient/openmrsProgramSearch/' + hisId + '/' + nid + '/' + Btoa
    );
  },

  async apiSearchPatientOnOpenMRS(hisId: string, nid: string, Btoa: string) {
    return await api().get(
      '/patient/openmrsSearch/' + hisId + '/' + nid + '/' + Btoa
    );
  },

  async apiCheckOpenmRSisOn(hisId: string, Btoa: string) {
    return await api().get('/patient/openmrsSession/' + hisId + '/' + Btoa);
  },
  async countPatientSearchResult(patient: any) {
    return await api().post('/patient/countSearch/', patient);
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
  async apiGetPatientsByClinicSectorId(clinicSectorId: string) {
    return await api().get('/patient/clinicSector/' + clinicSectorId);
  },
  async doPatientsBySectorGet() {
    const clinicSectorUser = clinicSectorService.getClinicSectorByCode(
      localStorage.getItem('clinic_sector_users')
    );
    if (clinicSectorUser === null || clinicSectorUser === undefined) {
      alertError(
        'O Utilizador logado nao pertence a nenhum sector clinico , não terá informação carregada do Servidor'
      );
    }

    console.log('sector' + clinicSectorUser);
    console.log('sectorId' + clinicSectorUser.id);
    const resp = await this.apiGetPatientsByClinicSectorId(clinicSectorUser.id);
    console.log('PacientesSector' + resp.data);
    // alertSucess(resp.data);
    this.addMobile(resp.data);
    return resp;
  },

  async apiSyncPatient(patient: any) {
    if (patient.syncStatus === 'R') await this.apiSave(patient, true);
    if (patient.syncStatus === 'U') await this.apiSave(patient, false);
  },
  async getLocalDbPatientsToSync() {
    return db[patientDexie]
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .then((result) => {
        return result;
      });
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
  async deleteAllExceptIdFromStorage(id: string) {
    patient
      .where((patient) => {
        return patient.id !== id;
      })
      .delete();
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
  async getPatientByParams(patientParam: any) {
    const results = await db[patientDexie]
      .filter((patient: Patient) => {
        const firstNamesMatch = patient.firstNames.includes(
          patientParam.firstNames
        );
        const lastNamesMatch = patient.lastNames.includes(
          patientParam.lastNames
        );
        const identifierMatch = patient.identifiers.some((identifier) =>
          identifier.value.includes(patientParam.identifiers[0].value)
        );

        return firstNamesMatch || lastNamesMatch || identifierMatch;
      })
      .toArray();

    return results;
  },

  getById(id: string) {
    return patient
      .query()
      .where((patient) => {
        return patient.id === id;
      })
      .first();
  },

  async getPatientByIdMobile(id: string) {
    return db[patientDexie]
      .where('id')
      .equalsIgnoreCase(id)
      .first()
      .then((row: any) => {
        console.log('PACIENTES: ', row);
        return row;
      });
  },
};
