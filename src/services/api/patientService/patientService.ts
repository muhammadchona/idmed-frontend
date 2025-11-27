import { messages } from 'src/i18n';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Patient from 'src/stores/models/patient/Patient';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import db from '../../../stores/dexie';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import clinicService from '../clinicService/clinicService';
import useNotify from 'src/composables/shared/notify/UseNotify';
import patientVisitService from '../patientVisit/patientVisitService';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import episodeService from '../episode/episodeService';
import patientServiceIdentifierService from '../patientServiceIdentifier/patientServiceIdentifierService';
import { Notify } from 'quasar';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import Episode from 'src/stores/models/episode/Episode';
import { usePatientMobileStore } from 'src/stores/mobile/patientMobileStore';
import packService from '../pack/packService';
import prescriptionService from '../prescription/prescriptionService';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';

const patient = useRepo(Patient);
const patientDexie = db[Patient.entity];
const patientServiceIdentifierDexie = db[PatientServiceIdentifier.entity];
const episodeDexie = db[Episode.entity];
const patientVisitDexie = db[PatientVisit.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError, alertInfo } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const {
  isProvincialInstalation,
  isUserDCP,
  getUserClinics,
  getUserClinicsFromLocalStorage,
} = useSystemConfig();
const { notifySuccess, notifyInfo, notifyError } = useNotify();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const sortPatientsForSearch = (patients: any[] = []) => {
  const extractIdentifier = (patient: any) => {
    if (!patient || !patient.identifiers) {
      return '';
    }

    if (Array.isArray(patient.identifiers)) {
      const prefered = patient.identifiers.find(
        (identifier: any) => identifier && identifier.prefered
      );
      if (prefered?.value) {
        return String(prefered.value);
      }
      const firstIdentifier = patient.identifiers.find(
        (identifier: any) => identifier && identifier.value
      );
      return firstIdentifier?.value ? String(firstIdentifier.value) : '';
    }

    if (
      typeof patient.identifiers === 'object' &&
      patient.identifiers !== null &&
      patient.identifiers.value
    ) {
      return String(patient.identifiers.value);
    }

    return '';
  };

  return [...patients].sort((a, b) => {
    const firstNameCompare = String(a?.firstNames || '').localeCompare(
      String(b?.firstNames || '')
    );
    if (firstNameCompare !== 0) {
      return firstNameCompare;
    }
    const aIdentifier = extractIdentifier(a);
    const bIdentifier = extractIdentifier(b);
    return aIdentifier.localeCompare(bIdentifier);
  });
};

let cachedPatientMobileStore: ReturnType<typeof usePatientMobileStore> | null =
  null;

const getPatientMobileStore = () => {
  if (cachedPatientMobileStore) {
    return cachedPatientMobileStore;
  }

  try {
    cachedPatientMobileStore = usePatientMobileStore();
    return cachedPatientMobileStore;
  } catch (error) {
    return null;
  }
};

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    /*
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
    */
    this.getMobile();
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
      return this.deleteMobile(uuid);
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
            this.getWeb(offset);
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
    const payload = clone(params);
    return patientDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        const store = getPatientMobileStore();
        store?.upsertPatient(payload);
      } else {
        patient.save(payload);
      }
      return params;
    });
  },
  putMobile(params: string) {
    const payload = clone(params);
    return patientDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        const store = getPatientMobileStore();
        store?.upsertPatient(payload);
      } else {
        patient.save(payload);
      }
      return params;
    });
  },
  async getMobile() {
    try {
      const rows = await patientDexie.toArray();
      if (isMobile.value && !isOnline.value) {
        const store = getPatientMobileStore();
        store?.setPatients(rows);
      }
      return clone(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    return patientDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          const store = getPatientMobileStore();
          store?.removeById(paramsId);
        } else {
          patient.destroy(paramsId);
        }
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  apiFetchById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return patientDexie
        .where('id')
        .equalsIgnoreCase(id)
        .first()
        .then((rows: any) => {
          if (rows) {
            const store = getPatientMobileStore();
            store?.upsertPatient(rows);
          }
          return clone(rows);
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
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.clear();
      try {
        return await this.getPatientByParams(patienParam);
      } catch (error) {
        console.log(error);
        return null;
      }
    }
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

  async addBulkMobile() {
    const patientsFromPinia = this.getAllFromStorageToDexie();
    patientDexie.bulkPut(patientsFromPinia).catch((error: any) => {
      console.log(error);
    });
  },
  async apiUpdate(patient: any) {
    return await this.patch(patient.id, patient);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patient/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },
  async apiGetPatientsByClinicSectorId(
    clinicSectorId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/patient/clinicSector/' +
        clinicSectorId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllPatientsIsAbandonmentForDCP(
    offset: number,
    max: number,
    clinicId: string
  ) {
    return await api().get(
      '/patient/ape/getAllPatientsIsAbandonment?clinicId=' +
        clinicId +
        '&offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async doPatientsBySectorGet() {
    notifyInfo('Carregamento de Pacientes Iniciado');
    const clinicSectorUser = clinicService.currClinic();
    if (clinicSectorUser === null || clinicSectorUser === undefined) {
      alertError(
        'O Utilizador logado não tem nenhum sector clínico associado , não terá informação carregada do Servidor'
      );
      notifyError('Não foi possível identificar o sector clínico actual.');
      return;
    }

    let resp;
    if (isUserDCP()) {
      // Verificar se é DCP e carregar as clinica ligadas a ele
      const clinicsId =
        clinicSectorUser.parentClinic_id === null
          ? clinicSectorUser.id
          : clinicSectorUser.parentClinic_id;

      if (clinicsId === null) {
        notifyInfo(
          'O Utilizador logado não tem nenhuma clínica associada, não terá informação carregada do Servidor'
        );
        return;
      }
      notifyInfo(
        'O Utilizador logado é DCP, carregando pacientes de todas as clínicas associadas'
      );
      resp = await this.fetchAllPatientsForDCP(clinicsId);
    } else {
      resp = await this.fetchAllPatientsByClinicSectorId(clinicSectorUser.id);
    }
    notifySuccess('Carregamento de Pacientes Terminado');
    return resp;
  },

  async fetchAllPatientsByClinicSectorId(clinicSectorId: any) {
    let offset = 0;
    const max = 100; // You can adjust this number based on your API's limits
    const allPatients: Patient[] = [];
    const allEpisodes: Episode[] = [];
    let hasMorePatients = true;

    let percentage = 0;

    const notif = Notify.create({
      group: false, // required to be updatable
      timeout: 0, // we want to be in control when it gets dismissed
      spinner: true,
      message: 'Carregando dados de pacientes ...',
      caption: '1%',
      color: 'white',
      textColor: 'primary',
    });

    while (hasMorePatients) {
      percentage = Math.min(100, percentage + Math.floor(Math.random() * 22));
      const response = await this.apiGetPatientsByClinicSectorId(
        clinicSectorId,
        offset,
        max
      );
      const identifiers = response.data;

      if (identifiers.length > 0) {
        identifiers.forEach((identifier: PatientServiceIdentifier) => {
          allPatients.push(identifier.patient);
          identifier?.episodes?.forEach((episode: Episode) => {
            allEpisodes.push(episode);
          });
        });

        if (allPatients.length > 0) {
          patientDexie.bulkPut(allPatients).catch((e: any) => {
            if (e.name === 'BulkError') {
              console.error(
                'Patient: Some raindrops did not succeed. However, ' +
                  (100000 - e.failures.length) +
                  ' raindrops was added successfully'
              );
            } else {
              throw e; // We're only handling BulkError here.
            }
          });
        }

        patientServiceIdentifierDexie
          .bulkPut(identifiers)
          .catch((error: any) => {
            console.log(error);
          });

        if (allEpisodes.length > 0) {
          episodeDexie.bulkPut(allEpisodes).catch((e: any) => {
            if (e.name === 'BulkError') {
              console.error(
                'Episode: Some raindrops did not succeed. However, ' +
                  (100000 - e.failures.length) +
                  ' raindrops was added successfully'
              );
            } else {
              throw e; // We're only handling BulkError here.
            }
          });
        }

        notif({
          caption: `${percentage}%`,
        });
        offset += identifiers.length;
      } else {
        percentage = 100;
        hasMorePatients = false;
      }
    }
    percentage = 100;
    notif({
      icon: 'done', // we add an icon
      spinner: false, // we reset the spinner setting so the icon can be displayed
      message: 'Terminado!',
      timeout: 2500, // we will timeout it in 2.5s
      caption: `${percentage}%`,
    });
    return hasMorePatients;
  },

  async fetchAllPatientsForDCP(clinicId: string) {
    let offset = 0;
    const max = 100; // You can adjust this number based on your API's limits
    // const allPatients = [];
    let hasMorePatients = true;

    while (hasMorePatients) {
      const response = await this.apiGetAllPatientsIsAbandonmentForDCP(
        offset,
        max,
        clinicId
      );
      const patients = response.data;
      if (patients.length > 0) {
        patient.save(patients);
        // allPatients.push(...patients);
        offset += patients.length;
      } else {
        hasMorePatients = false;
      }
    }

    return hasMorePatients;
  },

  /*
  async doPatientsForAPIGetDCP() {
    const resp = await this.fetchAllPatientsForDCP();

    this.addBulkMobile(resp);
    notifySuccess('Carregamento de Pacientes Terminado');
    return resp;
  },
*/
  async apiSyncPatient(patient: any) {
    if (patient.syncStatus === 'R') await this.apiSave(patient, true);
    if (patient.syncStatus === 'U') await this.apiSave(patient, false);
  },
  async getLocalDbPatientsToSync() {
    return patientDexie
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
  async syncPatient(patient: any) {
    if (patient.syncStatus === 'R') await this.postWeb(patient);
    if (patient.syncStatus === 'U') await this.patchWeb(patient.id, patient);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patient.getModel().$newInstance();
  },
  savePatientStorage(newPatient: any) {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.upsertPatient(newPatient);
    } else {
      patient.save(newPatient);
    }
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      return store ? store.all : [];
    }
    return patient.all();
  },
  getAllFromStorageToDexie() {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      const patients = store ? store.all : [];
      return patients.map((item: any) => {
        const cloned = clone(item);
        delete cloned.hisSyncStatus;
        return cloned;
      });
    }
    return patient.makeHidden(['hisSyncStatus']).all();
  },
  getPatientByID(id: string) {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      const cachedPatient = store?.getById(id);
      if (!cachedPatient) {
        patientDexie
          .where('id')
          .equalsIgnoreCase(id)
          .first()
          .then((rows: any) => {
            if (rows) {
              const innerStore = getPatientMobileStore();
              innerStore?.upsertPatient(rows);
            }
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
      return cachedPatient;
    }
    return patient.withAllRecursive(2).whereId(id).first();
  },
  async deleteAllExceptIdFromStorage(id: string) {
    patient
      .where((patient: Patient) => {
        return patient.id !== id;
      })
      .delete();
  },
  deleteAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.clear();
    } else {
      patient.flush();
    }
  },
  deletePatientStorage(patientParam: any) {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.removeById(patientParam.id);
    } else {
      patient.destroy(patientParam.id);
    }
  },
  async getPatientSearchList() {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      let patients = store ? store.all : [];

      const hasIdentifiersWithValue = patients.some((patient: any) => {
        if (!patient) return false;
        const identifiers = patient.identifiers;
        if (!Array.isArray(identifiers)) return false;
        return identifiers.some(
          (identifier: any) =>
            identifier &&
            typeof identifier.value === 'string' &&
            identifier.value.trim().length > 0
        );
      });

      if (!store || patients.length === 0 || !hasIdentifiersWithValue) {
        try {
          /*
                    const refreshedStore = getPatientMobileStore();
          if (refreshedStore) {
            patients = refreshedStore.all;
            const store = getPatientMobileStore();
            store?.setPatients(patients);
            console.log(patients);
          }
            */
        } catch (error) {
          console.log('Failed to hydrate patients from Dexie', error);
          return [];
        }
      }
      const hydratedPatients =
        await this.getAllPatientstWithIdentifierFromDexie();
      console.log(hydratedPatients);
      const store1 = getPatientMobileStore();
      store1?.setPatients(hydratedPatients);
      console.log(patients);
      return hydratedPatients;
    }
    return patient
      .query()
      .withAllRecursive(2)
      .orderBy('firstNames')
      .orderBy('identifiers.value', 'asc')
      .get();
  },
  getPatientByClinicId(clinicId: string) {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      const patients = store ? store.all : [];
      return patients.filter((item: any) => {
        return item.clinic_id === clinicId || item.clinicId === clinicId;
      });
    }
    return (
      patient
        .query()
        .has('identifiers')
        //  .has('patientVisits')
        .with('identifiers', (query: any) => {
          query
            .with('identifierType')
            .with('service', (query: any) => {
              query.withAllRecursive(1);
            })
            .with('clinic', (query: any) => {
              query.withAll();
            });
        })
        .with('province')
        .with('district')
        .with('clinic', (query: any) => {
          query.withAll();
        })
        .where((patients: any) => {
          return (
            patients.clinic_id === clinicId || patients.clinicId === clinicId
          );
        })
        .get()
    );
  },
  getPatienWithstByID(id: string) {
    // return patient.withAllRecursive(3).whereId(id).first();
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      const patient = store?.getById(id);
      return patient ?? null;
    }
    return patient
      .query()
      .has('identifiers')
      .with('identifiers', (query: any) => {
        query
          .with('identifierType')
          .with('service', (query: any) => {
            query.withAllRecursive(1);
          })
          .with('clinic', (query: any) => {
            query.withAllRecursive(1);
          })
          .with('episodes', (query: any) => {
            query
              .with('episodeType')
              .with('clinicSector')
              .with('startStopReason');
          });
      })
      .with('province')
      .with('district')
      .with('clinic', (query: any) => {
        query.withAllRecursive(1);
      })
      .where('id', id)
      .first();
  },
  async getPatientByParams(patientParam: any) {
    const searchFirstName = String(patientParam.firstNames || '').trim();
    const searchLastName = String(patientParam.lastNames || '').trim();
    const searchIdentifier = String(
      patientParam?.identifiers?.[0]?.value || ''
    ).trim();

    const [patientMatches, identifierMatches] = await Promise.all([
      patientDexie
        .filter((patient: Patient) => {
          const firstNamesMatch =
            searchFirstName.length > 0 &&
            String(patient.firstNames || '')
              .toLowerCase()
              .includes(searchFirstName.toLowerCase());

          const lastNamesMatch =
            searchLastName.length > 0 &&
            String(patient.lastNames || '')
              .toLowerCase()
              .includes(searchLastName.toLowerCase());

          if (
            searchIdentifier.length === 0 &&
            searchFirstName.length === 0 &&
            searchLastName.length === 0
          ) {
            return true;
          }

          if (searchIdentifier.length === 0) {
            return firstNamesMatch || lastNamesMatch;
          }

          return (
            firstNamesMatch || lastNamesMatch || patient.id === searchIdentifier
          );
        })
        .toArray(),
      searchIdentifier.length > 0
        ? patientServiceIdentifierDexie
            .filter((identifier: any) => {
              const identifierValue = String(identifier?.value || '').trim();
              if (!identifierValue) {
                return false;
              }
              return identifierValue
                .toLowerCase()
                .includes(searchIdentifier.toLowerCase());
            })
            .toArray()
        : Promise.resolve([]),
    ]);

    let results = patientMatches;

    if (identifierMatches.length > 0) {
      const identifierPatientIds = identifierMatches
        .map((identifier: any) => identifier.patient_id || identifier.patientId)
        .filter(Boolean);

      if (identifierPatientIds.length > 0) {
        const patientsFromIdentifiers = await patientDexie
          .where('id')
          .anyOf(identifierPatientIds)
          .toArray();

        const combinedMap = new Map<string, any>();
        [...results, ...patientsFromIdentifiers].forEach((patient: any) => {
          const id = String(patient.id);
          if (!combinedMap.has(id)) {
            combinedMap.set(id, patient);
          }
        });

        results = Array.from(combinedMap.values());
      }
    }

    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.setPatients(results);
    }

    return results;
  },

  getById(id: string) {
    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      const patient = store?.getById(id);
      return patient ?? null;
    }
    return patient
      .query()
      .where((patient: any) => {
        return patient.id === id;
      })
      .first();
  },

  async getPatientByIdMobile(id: string) {
    const patient = await patientDexie.where('id').equalsIgnoreCase(id).first();

    const [identifiers] = await Promise.all([
      patientServiceIdentifierService.getAllByPatientIDsFromDexie(patient.id),
    ]);

    patient.identifiers = identifiers;

    return patient;
  },

  async getAllPatientFromDexie() {
    return await patientDexie.toArray();
  },

  async getCountPatientFromDexie() {
    return await patientDexie.count();
  },

  async getPatientMobileWithAllByPatientId(patient: Patient | string) {
    if (!isMobile.value) {
      return null;
    }

    const patientId = typeof patient === 'string' ? patient : patient.id;
    const patientRecord = await patientDexie.get(patientId);

    if (!patientRecord) {
      return null;
    }

    const patientClone = clone(patientRecord);
    patientClone.identifiers = [];
    patientClone.patientVisits = [];

    const [identifierRecords, visitRecords] = await Promise.all([
      patientServiceIdentifierService.getAllByPatientsIDsFromDexie([patientId]),
      patientVisitService.getAllByPatientIDsFromDexie([patientId]),
    ]);

    const identifiers = identifierRecords
      .filter((identifier: any) => {
        const id =
          identifier?.patient?.id ??
          identifier?.patient_id ??
          identifier?.patientId ??
          '';
        return String(id).toLowerCase() === String(patientId).toLowerCase();
      })
      .map((identifier: any) => clone(identifier));

    const patientVisits = visitRecords
      .filter((visit: any) => {
        const id =
          visit?.patient?.id ?? visit?.patient_id ?? visit?.patientId ?? '';
        return String(id).toLowerCase() === String(patientId).toLowerCase();
      })
      .map((visit: any) => {
        const visitClone = clone(visit);
        visitClone.patientVisitDetails = (
          visitClone.patientVisitDetails ?? []
        ).map((detail: any) => clone(detail));
        return visitClone;
      });

    const identifierIds = identifiers
      .map((identifier: any) => identifier?.id)
      .filter(Boolean);

    let enrichedEpisodes: any[] = [];

    if (identifierIds.length > 0) {
      const rawEpisodes = await episodeDexie
        .filter((episode: any) => {
          const identifierId =
            episode?.patientServiceIdentifier_id ??
            episode?.patientServiceIdentifier?.id ??
            episode?.patientServiceIdentifierId;
          return (
            identifierId &&
            identifierIds
              .map((entry: any) => String(entry).toLowerCase())
              .includes(String(identifierId).toLowerCase())
          );
        })
        .toArray();

      const episodeIds = rawEpisodes.map((episode: any) => episode.id);
      enrichedEpisodes =
        episodeIds.length > 0
          ? await episodeService.getAllByIDsFromDexie(episodeIds)
          : [];
    }

    const episodesByIdentifier = new Map<string, any[]>();
    const baseEpisodeMap = new Map<string, any>();
    enrichedEpisodes.forEach((episode: any) => {
      const episodeClone = clone(episode);
      delete episodeClone.patientVisitDetails;
      baseEpisodeMap.set(String(episode.id), episodeClone);

      const identifierId =
        episode?.patientServiceIdentifier?.id ??
        episode?.patientServiceIdentifier_id ??
        episode?.patientServiceIdentifierId ??
        null;

      if (!identifierId) {
        return;
      }

      const key = String(identifierId);
      if (!episodesByIdentifier.has(key)) {
        episodesByIdentifier.set(key, []);
      }
      const list = episodesByIdentifier.get(key)!;
      if (!list.some((entry: any) => entry.id === episode.id)) {
        list.push(clone(episodeClone));
      }
    });

    patientClone.identifiers = identifiers.map((identifier: any) => {
      const episodesForIdentifier =
        episodesByIdentifier.get(String(identifier.id)) ?? [];
      return {
        ...identifier,
        episodes: episodesForIdentifier.map((episode: any) => clone(episode)),
      };
    });

    const packIds = new Set<string>();
    const prescriptionIds = new Set<string>();

    patientVisits.forEach((visit: any) => {
      (visit?.patientVisitDetails ?? []).forEach((detail: any) => {
        const packId =
          detail?.pack?.id ?? detail?.pack_id ?? detail?.packId ?? null;
        if (packId) {
          packIds.add(String(packId));
        }
        const prescriptionId =
          detail?.prescription?.id ??
          detail?.prescription_id ??
          detail?.prescriptionId ??
          null;
        if (prescriptionId) {
          prescriptionIds.add(String(prescriptionId));
        }
      });
    });

    const packMap = new Map<string, any>();
    if (packIds.size > 0) {
      const hydratedPacks = await Promise.all(
        Array.from(packIds).map(async (id) => {
          const packRecord = await packService.getPackWithsByID(id);
          return packRecord ? [String(id), clone(packRecord)] : null;
        })
      );
      hydratedPacks.forEach((entry) => {
        if (entry) {
          packMap.set(entry[0], entry[1]);
        }
      });
    }

    const prescriptionMap = new Map<string, any>();
    if (prescriptionIds.size > 0) {
      const prescriptions = await prescriptionService.getAllByIDsFromDexie(
        Array.from(prescriptionIds)
      );
      prescriptions.forEach((prescription: any) => {
        prescriptionMap.set(String(prescription.id), clone(prescription));
      });
    }

    patientClone.patientVisits = patientVisits.map((visit: any) => {
      visit.patientVisitDetails = (visit.patientVisitDetails ?? []).map(
        (detail: any) => {
          const detailClone = clone(detail);
          delete detailClone.patientVisit;

          const packId =
            detailClone?.pack?.id ??
            detailClone?.pack_id ??
            detailClone?.packId ??
            null;
          if (packId && packMap.has(String(packId))) {
            detailClone.pack = packMap.get(String(packId));
          }

          const prescriptionId =
            detailClone?.prescription?.id ??
            detailClone?.prescription_id ??
            detailClone?.prescriptionId ??
            null;
          if (prescriptionId && prescriptionMap.has(String(prescriptionId))) {
            detailClone.prescription = prescriptionMap.get(
              String(prescriptionId)
            );
          }

          const episodeId =
            detailClone?.episode?.id ??
            detailClone?.episode_id ??
            detailClone?.episodeId ??
            null;
          if (episodeId && baseEpisodeMap.has(String(episodeId))) {
            detailClone.episode = clone(baseEpisodeMap.get(String(episodeId)));
          }
          return detailClone;
        }
      );
      delete visit.patient;
      return visit;
    });

    const store = getPatientMobileStore();
    store?.upsertPatient(patientClone);

    return patientClone;
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await patientDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },

  async getAllPatientstWithAllFromDexie() {
    const patients = await patientDexie.toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [patientVisitList, identifiers] = await Promise.all([
      patientVisitService.getAllByPatientIDsFromDexie(patientIds),
      patientServiceIdentifierService.getAllByPatientsIDsFromDexie(patientIds),
    ]);

    patients.map((patient: any) => {
      patient.patientVisits = patientVisitList.filter(
        (patientVisit: any) => patientVisit.patient.id === patient.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier.patient.id === patient.id
      );
    });

    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.setPatients(patients);
    }

    return patients;
  },

  async getAllPatientstWithIdentifierFromDexie() {
    const patients = await patientDexie.toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [identifiers] = await Promise.all([
      patientServiceIdentifierService.getAllByPatientsIDsFromDexie(patientIds),
    ]);

    patients.map((patient: any) => {
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier.patient.id === patient.id
      );
    });

    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.setPatients(patients);
    }

    return patients;
  },
  async getPatientWithAllFromDexie(id: string) {
    const patients = await patientDexie
      .where('id')
      .equalsIgnoreCase(id)
      .toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [identifiers, patientVisitList] = await Promise.all([
      patientServiceIdentifierService.getAllByPatientsIDsFromDexie(patientIds),
      patientVisitService.getAllByPatientIDsFromDexie(patientIds),
    ]);

    patients.map((patient: any) => {
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier.patient.id === patient.id
      );
    });
    patient.patientVisits = patientVisitList.filter(
      (patientVisit: any) => patientVisit.patient.id === patient.id
    );
    return patients;
  },

  async getPatient3LastDataWithAllFromDexie(id: string) {
    const patients = await patientDexie
      .where('id')
      .equalsIgnoreCase(id)
      .toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [patientVisitList, identifiers] = await Promise.all([
      patientVisitService.getAll3LastDataByPatientIDsFromDexie(patientIds),
      patientServiceIdentifierService.getAll3LastDataByPatientsIDsFromDexie(
        patientIds
      ),
    ]);

    patients.map((patient: any) => {
      patient.patientVisits = patientVisitList.filter(
        (patientVisit: any) => patientVisit.patient.id === patient.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier.patient.id === patient.id
      );
    });

    if (isMobile.value && !isOnline.value) {
      const store = getPatientMobileStore();
      store?.setPatients(patients);
    } else {
      patient.save(patients);
    }

    return patients;
  },

  async apisearchInProvincialServer(clinicId: string, searchParam: string) {
    const nid = searchParam;
    const replacedString = searchParam.replace(/\//g, '-');
    return await api()
      .get(
        `/patient/getPatientFromProvincialServer/${clinicId}/${replacedString}`
      )
      .then((resp) => {
        if (resp.data.length > 0) {
          if (isMobile.value && !isOnline.value) {
            const store = getPatientMobileStore();
            store?.setPatients(resp.data);
          } else {
            patient.save(resp.data);
          }
        } else {
          alertInfo(
            'Nenhum resultado encontrado para o identificador ' + nid + ''
          );
        }
        closeLoading();
        return resp;
      })
      .catch((error) => {
        if (
          String(error?.response?.statusText).includes('Network Error') ||
          String(error?.response?.statusText).includes('Server Error')
        ) {
          alertError(
            'O Servidor Provincial encontra-se desligado ou existe um problema de conexão'
          );
          closeLoading();
        } else {
          console.log(error);
          alertError('Falha inesperada, por favor contacte o administrador.');
          closeLoading();
        }
      });
  },

  deleteAllFromDexie() {
    patientDexie.clear();
  },

  /**
   * Returns a fully hydrated patient graph intended for mobile/offline use:
   * patient
   *   └─ identifiers
   *        └─ episodes …
   *   └─ patientVisits
   *        └─ patientVisitDetails
   *             ├─ pack (with packagedDrugs → drug)
   *             └─ prescription (with prescribedDrugs)
   */

  /**
   * Returns a fully hydrated patient graph intended for mobile/offline use:
   * patient
   *   └─ identifiers
   *        └─ episodes …
   *   └─ patientVisits
   *        └─ patientVisitDetails
   *             ├─ pack (with packagedDrugs → drug)
   *             └─ prescription (with prescribedDrugs)
   */
  async getPatientGraphFromDexie(patientId: string) {
    const lowerPatientId = patientId.toLowerCase();

    const patientRow = await patientDexie.get(lowerPatientId);
    if (!patientRow) {
      return null;
    }

    const patientClone = clone(patientRow);

    const [identifierRows, visitRows] = await Promise.all([
      patientServiceIdentifierDexie
        .where('patientId')
        .equalsIgnoreCase(lowerPatientId)
        .toArray(),
      patientVisitDexie
        .where('patientId')
        .equalsIgnoreCase(lowerPatientId)
        .sortBy('visitDate'),
    ]);

    /* identifiers + episodes */
    const identifierIds = identifierRows.map((row) => row.id).filter(Boolean);

    const episodeRows =
      identifierIds.length > 0
        ? await episodeDexie
            .filter((episode: any) =>
              identifierIds
                .map((id) => String(id).toLowerCase())
                .includes(
                  String(
                    episode?.patientServiceIdentifier_id ??
                      episode?.patientServiceIdentifier?.id ??
                      ''
                  ).toLowerCase()
                )
            )
            .toArray()
        : [];

    const fullEpisodes =
      episodeRows.length > 0
        ? await episodeService.getAllByIDsFromDexie(
            episodeRows.map((episode: any) => episode.id)
          )
        : [];

    const episodesByIdentifier = new Map<string, any[]>();
    fullEpisodes.forEach((episode: any) => {
      const identifierId =
        episode?.patientServiceIdentifier?.id ??
        episode?.patientServiceIdentifier_id ??
        null;
      if (!identifierId) {
        return;
      }
      const key = String(identifierId);
      if (!episodesByIdentifier.has(key)) {
        episodesByIdentifier.set(key, []);
      }
      episodesByIdentifier.get(key)!.push(clone(episode));
    });

    patientClone.identifiers = identifierRows.map((identifier: any) => {
      const key = String(identifier.id).toLowerCase();
      return {
        ...clone(identifier),
        episodes: (episodesByIdentifier.get(key) ?? []).map((episode: any) =>
          clone(episode)
        ),
      };
    });

    /* visits + visit details */
    const visitIds = visitRows.map((row: any) => row.id);
    const visitDetails =
      visitIds.length > 0
        ? await patientVisitDetailsService.getAllByPatientVisitIdsFromDexie(
            visitIds
          )
        : [];

    const detailsByVisit = new Map<string, any[]>();
    visitDetails.forEach((detail: any) => {
      const visitId =
        detail?.patientVisit?.id ??
        detail?.patient_visit_id ??
        detail?.patientVisitId ??
        '';
      if (!visitId) {
        return;
      }
      const key = String(visitId).toLowerCase();
      if (!detailsByVisit.has(key)) {
        detailsByVisit.set(key, []);
      }
      detailsByVisit.get(key)!.push(clone(detail));
    });

    const prescriptionIds: string[] = [];
    const packIds: string[] = [];

    const patientVisits = visitRows.map((visit: any) => {
      const visitClone = clone(visit);
      const key = String(visitClone.id).toLowerCase();
      const details = (detailsByVisit.get(key) ?? []).map((detail) => {
        const detailClone = clone(detail);

        const prescriptionId =
          detailClone?.prescription?.id ??
          detailClone?.prescription_id ??
          detailClone?.prescriptionId ??
          null;
        if (prescriptionId) {
          prescriptionIds.push(String(prescriptionId));
        }

        const packId =
          detailClone?.pack?.id ??
          detailClone?.pack_id ??
          detailClone?.packId ??
          null;
        if (packId) {
          packIds.push(String(packId));
        }

        return detailClone;
      });

      visitClone.patientVisitDetails = details;
      return visitClone;
    });

    /* hydrate packs + prescriptions */
    const packMap = new Map<string, any>();
    if (packIds.length > 0) {
      const packs = await packService.getAllByIDsFromDexie(
        Array.from(new Set(packIds))
      );
      packs.forEach((pack: any) => {
        packMap.set(String(pack.id), clone(pack));
      });
    }

    const prescriptionMap = new Map<string, any>();
    if (prescriptionIds.length > 0) {
      const prescriptions = await prescriptionService.getAllByIDsFromDexie(
        Array.from(new Set(prescriptionIds))
      );
      prescriptions.forEach((prescription: any) => {
        prescriptionMap.set(String(prescription.id), clone(prescription));
      });
    }

    patientVisits.forEach((visit: any) => {
      visit.patientVisitDetails = (visit.patientVisitDetails ?? []).map(
        (detail: any) => {
          const detailClone = clone(detail);

          const packId =
            detailClone?.pack?.id ??
            detailClone?.pack_id ??
            detailClone?.packId ??
            null;
          if (packId && packMap.has(String(packId))) {
            detailClone.pack = packMap.get(String(packId));
          }

          const prescriptionId =
            detailClone?.prescription?.id ??
            detailClone?.prescription_id ??
            detailClone?.prescriptionId ??
            null;
          if (prescriptionId && prescriptionMap.has(String(prescriptionId))) {
            detailClone.prescription = prescriptionMap.get(
              String(prescriptionId)
            );
          }

          return detailClone;
        }
      );
    });

    patientClone.patientVisits = patientVisits;
    console.log(patientClone);
    const store = getPatientMobileStore();
    store?.upsertPatient(patientClone);
    return patientClone;
  },
};
