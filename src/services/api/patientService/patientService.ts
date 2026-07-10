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
import prescriptionService from '../prescription/prescriptionService';
import packService from '../pack/packService';
import patientServiceIdentifierService from '../patientServiceIdentifier/patientServiceIdentifierService';
import prescribedDrugService from '../prescribedDrug/prescribedDrugService';
import prescriptionDetailsService from '../prescriptionDetails/prescriptionDetailsService';
import packagedDrugService from '../packagedDrug/packagedDrugService';
import vitalSignsScreeningService from '../vitalSignsScreening/vitalSignsScreeningService';
import rAMScreeningService from '../rAMScreening/rAMScreeningService';
import tBScreeningService from '../tBScreening/tBScreeningService';
import adherenceScreeningService from '../adherenceScreening/adherenceScreeningService';
import pregnancyScreeningService from '../pregnancyScreening/pregnancyScreeningService';
import { Notify } from 'quasar';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import Episode from 'src/stores/models/episode/Episode';

const patient = useRepo(Patient);
const patientDexie = db[Patient.entity];
const patientServiceIdentifierDexie = db[PatientServiceIdentifier.entity];
const episodeDexie = db[Episode.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError, alertInfo } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const {
  isProvincialInstalation,
  isUserDCP,
  getUserClinics,
  getUserClinicsFromLocalStorage,
} = useSystemConfig();
const { notifySuccess, notifyInfo } = useNotify();

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
    return patientDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      patient.save(JSON.parse(JSON.stringify(params)));
      return params;
    });
  },
  putMobile(params: string) {
    return patientDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      patient.save(JSON.parse(JSON.stringify(params)));
      return params;
    });
  },
  async getMobile() {
    try {
      const rows = await patientDexie.toArray();
      patient.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    return patientDexie
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
      return patientDexie
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
    patient.save(newPatient);
  },
  getAllFromStorage() {
    return patient.all();
  },
  getAllFromStorageToDexie() {
    return patient.makeHidden(['hisSyncStatus']).all();
  },
  getPatientByID(id: string) {
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
    const results = await patientDexie
      .filter((patient: Patient) => {
        const firstNamesMatch = patient.firstNames.includes(
          patientParam.firstNames
        );
        const lastNamesMatch = patient.lastNames.includes(
          patientParam.lastNames
        );
        const identifierMatch = patient.identifiers.some((identifier: any) =>
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

  async getPatientMobileWithAllByPatientId(patient: Patient) {
    try {
      const patientServices =
        await patientServiceIdentifierService.getAllMobileByPatientId(
          patient.id
        );
      const patientServicesIds = patientServices.map((pat: any) => {
        return pat?.id;
      });

      await episodeService.getAllMobileByPatientServiceIds(patientServicesIds);

      const patientVisits = await patientVisitService.apiGetAllByPatientId(
        patient.id
      );
      const ids = patientVisits.map((pat: any) => pat.id);

      const patientVisitDetails =
        await patientVisitDetailsService.getAllMobileByVisitId(ids);

      const prescriptionIds = patientVisitDetails.map((pat: any) => {
        return pat?.prescription?.id ? pat.prescription.id : '';
      });
      const packIds = patientVisitDetails.map((pat: any) => {
        return pat.pack.id;
      });
      const prescriptions = await prescriptionService.getAllMobileByIds(
        prescriptionIds
      );
      const packs = await packService.getAllMobileByIds(packIds);
      ids.forEach(async (id: any) => {
        try {
          await vitalSignsScreeningService.getVitalSignsScreeningByVisitIdMobile(
            id
          );
          await rAMScreeningService.getRAMScreeningByVisitIdMobile(id);
          await tBScreeningService.getTBScreeningsByVisitIdMobile(id);
          await adherenceScreeningService.getAdherenceScreeningByVisitIdMobile(
            id
          );
          await pregnancyScreeningService.getPregnancyScreeningsByVisitIdMobile(
            id
          );
        } catch (error) {
          console.error(error);
        }
      });
      prescriptions.forEach(async (prescription: any) => {
        try {
          await prescribedDrugService.getLastByPrescriprionIdFromDexie(
            prescription?.id
          );
          await prescriptionDetailsService.getLastByPrescriprionIdFromDexie(
            prescription?.id
          );
        } catch (error) {
          console.error(error);
        }
      });
      packs.forEach((pack: any) => {
        packagedDrugService.getAllByPackIdMobile(pack?.id);
      });
    } catch (error) {
      console.log(error);
    }
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
        (patientVisit: any) => patientVisit?.patient?.id === patient?.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier?.patient?.id === patient?.id
      );
    });

    return patients;
  },
  async getPatientWithAllFromDexie(id: string) {
    const patients = await patientDexie
      .where('id')
      .equalsIgnoreCase(id)
      .toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [patientVisitList, identifiers] = await Promise.all([
      patientVisitService.getAllByPatientIDsFromDexie(patientIds),
      patientServiceIdentifierService.getAllByPatientsIDsFromDexie(patientIds),
    ]);

    patients.map((patient: any) => {
      patient.patientVisits = patientVisitList.filter(
        (patientVisit: any) => patientVisit?.patient?.id === patient?.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier?.patient?.id === patient?.id
      );
    });
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
        (patientVisit: any) => patientVisit?.patient?.id === patient?.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier?.patient?.id === patient?.id
      );
    });

    patient.save(patients);

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
          patient.save(resp.data);
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
};
