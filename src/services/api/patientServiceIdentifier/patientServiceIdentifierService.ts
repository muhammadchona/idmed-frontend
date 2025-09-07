import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import clinicService from '../clinicService/clinicService';
import clinicalServiceService from '../clinicalServiceService/clinicalServiceService';
import identifierTypeService from '../identifierTypeService/identifierTypeService';
import episodeService from '../episode/episodeService';
import Patient from 'src/pages/Patient/Patient.vue';
import Patient from 'src/stores/models/patient/Patient';

const patientServiceIdentifier = useRepo(PatientServiceIdentifier);
const patientServiceIdentifierDexie = db[PatientServiceIdentifier.entity];

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
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(uid, params);
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
      .post('patientServiceIdentifier', params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientServiceIdentifier?offset=' + offset + '&max=100')
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('patientServiceIdentifier/' + uuid, params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientServiceIdentifier/' + uuid)
      .then(() => {
        patientServiceIdentifier.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return patientServiceIdentifierDexie
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientServiceIdentifier.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return patientServiceIdentifierDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientServiceIdentifier.save(JSON.parse(JSON.stringify(params)));
      });
  },
  async getMobile() {
    try {
      const rows = await patientServiceIdentifierDexie.toArray();
      patientServiceIdentifier.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await patientServiceIdentifierDexie.delete(paramsId);
      patientServiceIdentifier.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile() {
    const patientServiceIdentifierFromPinia = this.getAllFromStorageForDexie();
    return patientServiceIdentifierDexie
      .bulkPut(patientServiceIdentifierFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getAllMobileByPatientId(patientId: string) {
    const collection = await patientServiceIdentifierDexie
      .orderBy('startDate')
      .filter(
        (identifier: PatientServiceIdentifier) =>
          identifier?.patient?.id === patientId
      );

    const resp = await collection.toArray();
    patientServiceIdentifier.save(resp);
    return resp;
  },

  async apiSave(identifier: any, isNew: boolean) {
    if (isNew) {
      return await this.post(identifier);
    } else {
      return await this.patch(identifier.id, identifier);
    }
  },

  async apiUpdate(identifier: any) {
    return await this.patch(identifier.id, identifier);
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/patientServiceIdentifier/${id}`)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
        return resp;
      });
  },

  async apiFetchByNidValue(nidValue: string) {
    const replacedString = nidValue.replace(/\//g, '-');
    return await api()
      .get(`/patientServiceIdentifier/value/${replacedString}`)
      .then((resp) => {
        if (resp.data !== '') patientServiceIdentifier.save(resp.data);
        return resp.data;
      });
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/patientServiceIdentifier/clinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },

  async apiGetAllByPatientId(patientId: string, offset: number, max: number) {
    if (isMobile.value && !isOnline.value) {
      return patientServiceIdentifierDexie
        .where('patient_id')
        .equalsIgnoreCase(patientId)
        .then((row: any) => {
          patientServiceIdentifier.save(row);
          return row;
        });
    } else {
      return await api()
        .get(
          '/patientServiceIdentifier/patient/' +
            patientId +
            '?offset=' +
            offset +
            '&max=' +
            max
        )
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
        });
    }
  },
  async syncPatientServiceIdentifier(identifier: any) {
    if (identifier.syncStatus === 'R') await this.postWeb(identifier);
    if (identifier.syncStatus === 'U')
      await this.patchWeb(identifier.id, identifier);
  },
  async getLocalDbPatientServiceIdentifierToSync() {
    return patientServiceIdentifierDexie
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .toArray()
      .then((result: any) => {
        return result;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientServiceIdentifier.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientServiceIdentifier.all();
  },
  getAllFromStorageForDexie() {
    return patientServiceIdentifier
      .makeHidden([
        'identifierType',
        'service',
        'patient',
        'episodes',
        'clinic',
      ])
      .all();
  },
  deleteAllFromStorage() {
    patientServiceIdentifier.flush();
  },
  async identifierCurr(id: any, serviceId: string) {
    console.log('Poooraa do ID', id);

    if (isMobile.value && !isOnline.value) {
      return await this.getAll3LastDataByIDFromDexie(id);
    } else {
      // const patientServiceIdentifiers = patientServiceIdentifier
      //   .withAllRecursive(2)
      //   .where('id', id)
      //   .first();

      const [patientServiceIdentifiers] = await Promise.all([
        patientServiceIdentifier.withAllRecursive(2).where('id', id).first(),
      ]);

      if (!patientServiceIdentifiers) {
        return null;
      }

      return patientServiceIdentifiers;
    }
  },
  getAllEpisodesByIdentifierId(id: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query: any) => {
        query.whereHas('episodeType', (query: any) => {
          query.where('code', 'INICIO');
        });
      })
      .where('id', id)
      .get();
  },

  getAllIdentifierWithInicialEpisodeByPatient(patientId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('episodeType', (query) => {
          query.where('code', 'INICIO');
        });
      })
      .where('patient_id', patientId)
      .get();
  },

  getAllIdentifierWithREferralEpisodeByPatient(patientId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query: any) => {
        query.whereHas('startStopReason', (query: any) => {
          query.where('code', 'REFERIDO_PARA').orWhere('code', 'REFERIDO_DC');
        });
      })
      .where('patient_id', patientId)
      .get();
  },

  curIdentifierById(id: string) {
    return patientServiceIdentifier.withAllRecursive(2).where('id', id).first();
  },
  localDbGetById(id: string) {
    return patientServiceIdentifierDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first()
      .then((result: any) => {
        return result;
      });
  },

  async localDbGetByPatientId(patientId: string) {
    const collection = patientServiceIdentifierDexie.filter(
      (identifier: PatientServiceIdentifier) =>
        patientId === identifier?.patient?.id
    );

    return await collection.toArray().then((result: any) => {
      return result;
    });
  },
  getLatestIdentifierSlimByPatientId(patientId: string) {
    return patientServiceIdentifier
      .withAll()
      .where((patientService: any) => {
        return patientService.patient_id === patientId;
      })
      .orderBy('startDate', 'desc')
      .first();
  },

  getPreferredIdentifierByPatientId(patientId: string) {
    return patientServiceIdentifier
      .withAll()
      .where((patientService: any) => {
        console.log(patientService);
        return (
          patientService.patient_id === patientId &&
          patientService.prefered === true
        );
      })
      .orderBy('startDate', 'desc')
      .first();
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    const patientServiceIdentifiers = await patientServiceIdentifierDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.identifierType?.id
          ? patientServiceIdentifier.identifierType.id
          : ''
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.service?.id
          ? patientServiceIdentifier.service.id
          : ''
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.clinic?.id
          ? patientServiceIdentifier.clinic.id
          : ''
    );

    const [identifierTypes, services, clinics] = await Promise.all([
      identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
      clinicalServiceService.getAllByIDsFromDexie(serviceIds),
      clinicService.getAllByIDsFromDexie(clinicIds),
    ]);

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic.id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifierType.id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service.id
      );
    });

    return patientServiceIdentifiers;
  },

  async getAllByPatientIDsFromDexie(id: string) {
    const collection = patientServiceIdentifierDexie.filter(
      (identifier: PatientServiceIdentifier) => id === identifier?.patient?.id
    );

    const patientServiceIdentifiers = await collection.toArray();

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.identifierType?.id
          ? patientServiceIdentifier.identifierType.id
          : ''
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.service?.id
          ? patientServiceIdentifier.service.id
          : ''
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.clinic?.id
          ? patientServiceIdentifier.clinic.id
          : ''
    );

    const [identifierTypes, services, clinics] = await Promise.all([
      identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
      clinicalServiceService.getAllByIDsFromDexie(serviceIds),
      clinicService.getAllByIDsFromDexie(clinicIds),
    ]);

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic.id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifierType.id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service.id
      );
    });

    return patientServiceIdentifiers;
  },
  async getAllByPatientsIDsFromDexie(ids: string[]) {
    const collection = patientServiceIdentifierDexie.filter(
      (identifier: PatientServiceIdentifier) =>
        ids.includes(identifier?.patient?.id)
    );

    const patientServiceIdentifiers = await collection.toArray();

    const identifierIds = patientServiceIdentifiers.map(
      (identifier: any) => identifier.id
    );

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.identifierType?.id
          ? patientServiceIdentifier.identifierType.id
          : ''
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.service?.id
          ? patientServiceIdentifier.service.id
          : ''
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.clinic?.id
          ? patientServiceIdentifier.clinic.id
          : ''
    );

    const [identifierTypes, services, clinics, episodeList] = await Promise.all(
      [
        identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
        clinicalServiceService.getAllByIDsFromDexie(serviceIds),
        clinicService.getAllByIDsFromDexie(clinicIds),
        episodeService.getAllByIdentifierIDsFromDexie(identifierIds),
      ]
    );

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic.id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifierType.id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service.id
      );
      patientServiceIdentifier.episodes = episodeList.filter(
        (episode: any) =>
          episode.patientServiceIdentifier.id === patientServiceIdentifier.id
      );
    });

    return patientServiceIdentifiers;
  },
  async getAll3LastDataByPatientsIDsFromDexie(ids: string[]) {
    const collection = patientServiceIdentifierDexie.filter(
      (identifier: PatientServiceIdentifier) =>
        ids.includes(identifier?.patient?.id)
    );

    const patientServiceIdentifiers = await collection.toArray();
    const identifierIds = patientServiceIdentifiers.map(
      (identifier: any) => identifier.id
    );

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.identifierType?.id
          ? patientServiceIdentifier.identifierType.id
          : ''
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.service?.id
          ? patientServiceIdentifier.service.id
          : ''
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.clinic?.id
          ? patientServiceIdentifier.clinic.id
          : ''
    );

    const [identifierTypes, services, clinics, episodeList] = await Promise.all(
      [
        identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
        clinicalServiceService.getAllByIDsFromDexie(serviceIds),
        clinicService.getAllByIDsFromDexie(clinicIds),
        episodeService.getAll3LastDataByIdentifierIDsFromDexie(identifierIds),
      ]
    );

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic.id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifierType.id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service.id
      );
      patientServiceIdentifier.episodes = episodeList.filter(
        (episode: any) =>
          episode.patientServiceIdentifier.id === patientServiceIdentifier.id
      );
    });

    return patientServiceIdentifiers;
  },

  async getAll3LastDataByIDFromDexie(id: string) {
    const patientServiceIdentifiers = await patientServiceIdentifierDexie
      .where('id')
      .equalsIgnoreCase(id)
      .toArray();

    const identifierIds = patientServiceIdentifiers.map(
      (identifier: any) => identifier.id
    );

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.identifierType?.id
          ? patientServiceIdentifier.identifierType.id
          : ''
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.service?.id
          ? patientServiceIdentifier.service.id
          : ''
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier?.clinic?.id
          ? patientServiceIdentifier.clinic.id
          : ''
    );

    const [identifierTypes, services, clinics, episodeList] = await Promise.all(
      [
        identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
        clinicalServiceService.getAllByIDsFromDexie(serviceIds),
        clinicService.getAllByIDsFromDexie(clinicIds),
        episodeService.getAll3LastDataByIdentifierIDsFromDexie(identifierIds),
      ]
    );
    console.log('episodeList', episodeList);

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic.id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifierType.id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service.id
      );
      patientServiceIdentifier.episodes = episodeList.filter(
        (episode: any) =>
          episode.patientServiceIdentifier.id === patientServiceIdentifier.id
      );
    });

    return patientServiceIdentifiers[0];
  },

  deleteAllFromDexie() {
    patientServiceIdentifierDexie.clear();
  },
};
