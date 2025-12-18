import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Prescription from 'src/stores/models/prescription/Prescription';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import db from '../../../stores/dexie';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import ChunkArray from 'src/utils/ChunkArray';
import durationService from '../duration/durationService';
import doctorService from '../doctorService/doctorService';
import clinicService from '../clinicService/clinicService';
import prescriptionDetailsService from '../prescriptionDetails/prescriptionDetailsService';
import prescribedDrugService from '../prescribedDrug/prescribedDrugService';

const prescription = useRepo(Prescription);
const prescriptionDexie = db[Prescription.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const freezeDeep = (payload: any) => {
  if (payload === null || payload === undefined) return payload;
  if (Array.isArray(payload)) {
    payload.forEach((item) => freezeDeep(item));
    return Object.freeze(payload);
  }
  if (typeof payload === 'object') {
    Object.keys(payload).forEach((key) => freezeDeep(payload[key]));
    return Object.freeze(payload);
  }
  return payload;
};

const toPlainObject = (payload: any) => {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.log(error);
      return payload;
    }
  }
  return payload;
};

let prescriptionMobileCache: any[] = [];

const prepareCacheEntry = (row: any) => {
  const cloned = clone(row);
  return isMobile.value ? freezeDeep(cloned) : cloned;
};

const setPrescriptionMobileCache = (rows: any[]) => {
  prescriptionMobileCache = rows.map((row) => prepareCacheEntry(row));
};

const upsertPrescriptionMobileCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = prepareCacheEntry(entry);
    const index = prescriptionMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      prescriptionMobileCache.splice(index, 1, payload);
    } else {
      prescriptionMobileCache.push(payload);
    }
  });
};

const removePrescriptionFromCache = (id: string) => {
  prescriptionMobileCache = prescriptionMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const getPrescriptionMobileCache = () =>
  isMobile.value
    ? prescriptionMobileCache
    : prescriptionMobileCache.map((row) => clone(row));

const refreshPrescriptionMobileCache = async () => {
  const rows = await prescriptionDexie.toArray();
  setPrescriptionMobileCache(rows);
  return getPrescriptionMobileCache();
};

const findPrescriptionInCache = (predicate: (entry: any) => boolean) =>
  getPrescriptionMobileCache().find(predicate) ?? null;

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
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
      .post('prescription', params)
      .then((resp) => {
        if (!isMobile.value) {
          prescription.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          prescriptionDexie
            .put(payload)
            .then(() => {
              upsertPrescriptionMobileCache(payload);
            })
            .catch((error) => console.log(error));
        }
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescription?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            prescription.save(resp.data);
          }
          if (isMobile.value && !isOnline.value) {
            const payload = Array.isArray(resp.data)
              ? resp.data.map((entry: any) => clone(entry))
              : [clone(resp.data)];
            prescriptionDexie
              .bulkPut(payload)
              .then(() => {
                upsertPrescriptionMobileCache(payload);
              })
              .catch((error) => console.log(error));
          }
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
      .patch('prescription/' + uuid, params)
      .then((resp) => {
        if (!isMobile.value) {
          prescription.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          prescriptionDexie
            .put(payload)
            .then(() => {
              upsertPrescriptionMobileCache(payload);
            })
            .catch((error) => console.log(error));
        }
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('prescription/' + uuid)
      .then(() => {
        prescription.destroy(uuid);
        if (isMobile.value && !isOnline.value) {
          prescriptionDexie
            .delete(uuid)
            .then(() => {
              removePrescriptionFromCache(uuid);
            })
            .catch((error) => console.log(error));
        }
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return prescriptionDexie.put(payload).then(async () => {
      if (isMobile.value && !isOnline.value) {
        upsertPrescriptionMobileCache(payload);
        return payload;
      }
      prescription.save(payload);
      return payload;
    });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return prescriptionDexie.put(payload).then(async () => {
      if (isMobile.value && !isOnline.value) {
        upsertPrescriptionMobileCache(payload);
        return payload;
      }
      prescription.save(payload);
      return payload;
    });
  },
  async getMobile() {
    try {
      const rows = await prescriptionDexie.toArray();
      if (isMobile.value && !isOnline.value) {
        setPrescriptionMobileCache(rows);
        return getPrescriptionMobileCache();
      }
      prescription.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await prescriptionDexie.delete(paramsId);
      if (isMobile.value && !isOnline.value) {
        removePrescriptionFromCache(paramsId);
      } else {
        prescription.destroy(paramsId);
      }
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile(payload?: any[]) {
    const prescriptionFromPinia = payload
      ? payload.map((entry) => clone(entry))
      : this.getAllFromStorageForDexie();

    return prescriptionDexie
      .bulkPut(prescriptionFromPinia)
      .then(async () => {
        if (isMobile.value && !isOnline.value) {
          await refreshPrescriptionMobileCache();
        } else {
          prescription.save(prescriptionFromPinia);
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async apiSave(prescriptionObject: any) {
    return await this.post(prescriptionObject);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/prescription/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/prescription/AllLastOfClinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        this.addBulkMobile(resp.data);
      });
  },

  async apiGetLastPrecriptionFromPoc(
    patientId: string,
    clinicalServiceId: string
  ) {
    return await api().get(
      '/prescription/lastPrescriptionFromPoc/' +
        patientId +
        '/' +
        clinicalServiceId
    );
  },

  async apiGetAllPrescriptionFromPocByPatientId(patientId: string) {
    return await api().get(
      '/prescription/getAllPrescriptionFromPoc/' + patientId
    );
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/prescription/${id}`)
      .then((resp) => {
        if (!isMobile.value) {
          prescription.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          prescriptionDexie
            .put(payload)
            .then(() => {
              upsertPrescriptionMobileCache(payload);
            })
            .catch((error) => console.log(error));
        }
        return resp;
      });
  },

  async getPrescriptionMobileById(id: string) {
    const resp = await prescriptionDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first();
    return resp ? clone(resp) : null;
  },

  async apiFetchLastByIdentifierId(id: string) {
    return await api().get(`/prescription/identifier/${id}`);
  },
  async apiGetByPatientId(patientid: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api()
        .get('prescription/patient/' + patientid)
        .then((resp) => {
          if (!isMobile.value) {
            prescription.save(resp.data);
          }
          if (isMobile.value && !isOnline.value) {
            const payload = Array.isArray(resp.data)
              ? resp.data.map((entry: any) => clone(entry))
              : [clone(resp.data)];
            prescriptionDexie
              .bulkPut(payload)
              .then(() => {
                upsertPrescriptionMobileCache(payload);
              })
              .catch((error) => console.log(error));
          }
        });
    }
  },
  async apiFetchByPatientVisitDetailsId(
    pvdsId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/prescription/visits/' + pvdsId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetByClinicId(clinicId: string) {
    return await api().get('/prescription/clinic/' + clinicId);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescription.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getPrescriptionMobileCache();
    }
    return prescription.all();
  },
  getAllFromStorageForDexie() {
    if (isMobile.value && !isOnline.value) {
      return getPrescriptionMobileCache();
    }
    return prescription
      .makeHidden([
        'clinic',
        'doctor',
        'patientVisitDetails',
        'prescriptionDetails',
        'duration',
        'prescribedDrugs',
        'groupMemberPrescription',
      ])
      .all();
  },
  deleteAllFromStorage() {
    prescription.flush();
  },
  getPrescriptionByID(Id: string) {
    if (isMobile.value && !isOnline.value) {
      return findPrescriptionInCache((entry) => entry.id === Id);
    }
    return prescription
      .query()
      .with('doctor')
      .with('duration')
      .with('prescriptionDetails')
      .whereId(Id)
      .first();
  },
  getLocalPrescriptionById(Id: string) {
    if (isMobile.value && !isOnline.value) {
      return findPrescriptionInCache((entry) => entry.id === Id);
    }
    return prescription.withAllRecursive(2).where('id', Id).first();
  },
  getLastPrescriptionFromPatientVisit(patientVisitId: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getPrescriptionMobileCache()
          .filter((entry) => entry.id === patientVisitId)
          .sort((a, b) =>
            String(b.prescriptionDate || '').localeCompare(
              String(a.prescriptionDate || '')
            )
          )
          .shift() ?? null
      );
    }
    return prescription
      .withAllRecursive(2)
      .where('id', patientVisitId)
      .orderBy('prescriptionDate', 'desc')
      .first();
  },

  getLastPrescriptionFromPatientVisitDetails(prescriptionId: string) {
    if (isMobile.value && !isOnline.value) {
      console.log(getPrescriptionMobileCache());
      return (
        getPrescriptionMobileCache()
          .filter((entry) => entry.id === prescriptionId)
          .sort((a, b) =>
            String(b.prescriptionDate || '').localeCompare(
              String(a.prescriptionDate || '')
            )
          )
          .shift() ?? null
      );
    }
    return prescription
      .withAllRecursive(2)
      .where('id', prescriptionId)
      .orderBy('prescriptionDate', 'desc')
      .first();
  },

  removeFromStorage(prescriptionId: string) {
    if (isMobile.value && !isOnline.value) {
      removePrescriptionFromCache(prescriptionId);
      return prescriptionDexie.delete(prescriptionId);
    }
    return prescription.destroy(prescriptionId);
  },

  async getAllMobileByIds(prescriptionIds: any) {
    const resp = await prescriptionDexie
      .where('id')
      .anyOf(prescriptionIds)
      .toArray();

    if (isMobile.value && !isOnline.value) {
      upsertPrescriptionMobileCache(resp);
      return resp.map((entry) => clone(entry));
    }
    prescription.save(resp);
    return resp;
  },

  async getPrescriptionsByIds(prescriptionIds: any) {
    const limit = 100; // Define your limit
    const offset = 0;

    const chunks = ChunkArray.chunkArrayWithOffset(
      prescriptionIds,
      limit,
      offset
    );

    const allPrescriptions = [];

    for (const chunk of chunks) {
      const prescriptions = await api().post(
        '/prescription/getAllByPrescriptionIds/',
        chunk
      );
      allPrescriptions.push(...prescriptions.data);
    }
    this.addBulkMobile(allPrescriptions);
  },

  // Dexie Block
  async getByIdFromDexie(id: string) {
    return prescriptionDexie.get(id);
  },

  async getAllAndPrescriptionDetailsByIDsFromDexie(ids: []) {
    const prescriptions = await prescriptionDexie
      .where('id')
      .anyOf(ids)
      // .reverse()
      .sortBy('prescriptionDate');

    const prescriptionsIds = prescriptions.map(
      (prescription: any) => prescription.id
    );
    const [prescriptionDetails] = await Promise.all([
      prescriptionDetailsService.getLastByPrescriprionIdListFromDexie(
        prescriptionsIds
      ),
    ]);

    prescriptions.forEach((prescription: any) => {
      prescription.prescriptionDetails = prescriptionDetails.filter(
        (prescriptionDetail: any) =>
          prescriptionDetail?.prescription?.id === prescription.id ||
          prescriptionDetail?.prescription_id === prescription.id
      );
    });

    upsertPrescriptionMobileCache(prescriptions);
    return prescriptions.map((entry: any) => clone(entry));
  },

  async getAllByIDsFromDexie(ids: []) {
    const prescriptions = await prescriptionDexie
      .where('id')
      .anyOf(ids)
      // .reverse()
      .sortBy('prescriptionDate');

    const prescriptionsIds = prescriptions.map(
      (prescription: any) => prescription.id
    );
    const durationIds = prescriptions.map((prescription: any) =>
      prescription?.duration?.id ? prescription.duration.id : ''
    );
    const doctorIds = prescriptions.map((prescription: any) =>
      prescription?.doctor?.id ? prescription.doctor.id : ''
    );
    const clinicIds = prescriptions.map((prescription: any) =>
      prescription?.clinic?.id ? prescription.clinic.id : ''
    );
    const [clinics, durations, doctors, prescriptionDetails, prescribedDrugs] =
      await Promise.all([
        clinicService.getAllByIDsFromDexie(clinicIds),
        durationService.getAllByIDsFromDexie(durationIds),
        doctorService.getAllByIDsFromDexie(doctorIds),
        prescriptionDetailsService.getLastByPrescriprionIdListFromDexie(
          prescriptionsIds
        ),
        prescribedDrugService.getAllByPrescriprionIdListFromDexie(
          prescriptionsIds
        ),
      ]);

    prescriptions.forEach((prescription: any) => {
      prescription.clinic = clinics.find(
        (clinic: any) => clinic.id === prescription.clinic.id
      );
      prescription.duration = durations.find(
        (duration: any) => duration.id === prescription.duration.id
      );
      prescription.doctor = doctors.find(
        (doctor: any) => doctor.id === prescription.doctor.id
      );
      prescription.prescriptionDetails = prescriptionDetails.filter(
        (prescriptionDetail: any) =>
          prescriptionDetail?.prescription?.id === prescription.id ||
          prescriptionDetail?.prescription_id === prescription.id
      );
      prescription.prescribedDrugs = prescribedDrugs.filter(
        (prescribedDrug: any) =>
          prescribedDrug?.prescription?.id === prescription.id ||
          prescribedDrug?.prescription_id === prescription.id
      );
    });

    if (isMobile.value && !isOnline.value) {
      upsertPrescriptionMobileCache(prescriptions);
      return prescriptions.map((entry) => clone(entry));
    }
    prescription.save(prescriptions);
    return prescriptions;
  },

  deleteAllFromDexie() {
    prescriptionMobileCache = [];
    return prescriptionDexie.clear();
  },
};
